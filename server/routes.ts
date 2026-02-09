import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { sendPushToUser, getVapidPublicKey } from "./push";
import { type User } from "@shared/schema";
import { z } from "zod";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

async function notifyUser(userId: string, text: string, type: string = "info") {
  await storage.createNotification({ userId, text, type });
  const title = type === "alert" ? "BondedAscent Alert" : "BondedAscent";
  sendPushToUser(userId, title, text, type).catch(() => {});
}

const checkInBodySchema = z.object({
  mood: z.number().int().min(1).max(10),
  obedience: z.number().int().min(1).max(10),
  notes: z.string().optional(),
});

const reviewBodySchema = z.object({
  status: z.enum(["approved", "rejected"]),
  xpAwarded: z.number().int().min(0).max(100).optional().default(0),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  setupAuth(app);

  // --- TASKS ---
  app.get("/api/tasks", requireAuth, async (req, res) => {
    const user = req.user as User;
    const taskList = await storage.getTasks(user.id);
    res.json(taskList);
  });

  app.post("/api/tasks", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "Task text required" });
    }

    const task = await storage.createTask({
      text: text.trim(),
      userId: user.id,
      assignedBy: user.id,
    });

    await storage.logActivity(user.id, "task_created", text.trim());
    res.status(201).json(task);
  });

  app.patch("/api/tasks/:id/toggle", requireAuth, async (req, res) => {
    const user = req.user as User;
    const tasks = await storage.getTasks(user.id);
    const owned = tasks.find(t => t.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Task not found" });

    const task = await storage.toggleTask(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.done) {
      const freshUser = await storage.getUser(user.id);
      if (freshUser) {
        const newXp = Math.min((freshUser.xp || 0) + 5, 100 * (freshUser.level || 1));
        await storage.updateUserXp(user.id, newXp);
      }
      await storage.logActivity(user.id, "task_completed", task.text);
      await notifyUser(user.id, `Completed: ${task.text} (+5 XP)`, "info");
    }

    res.json(task);
  });

  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const tasks = await storage.getTasks(user.id);
    const owned = tasks.find(t => t.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Task not found" });

    await storage.deleteTask(req.params.id);
    res.json({ message: "Deleted" });
  });

  // --- CHECK-INS ---
  app.get("/api/checkins", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getCheckIns(user.id);
    res.json(list);
  });

  app.post("/api/checkins", requireAuth, async (req, res) => {
    const user = req.user as User;
    const parsed = checkInBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid check-in data. Mood and obedience must be 1-10." });
    }

    const { mood, obedience, notes } = parsed.data;
    const checkIn = await storage.createCheckIn({ userId: user.id, mood, obedience, notes });
    await storage.logActivity(user.id, "checkin_submitted", `Mood: ${mood}, Obedience: ${obedience}`);
    await notifyUser(user.id, "Check-in submitted successfully", "info");

    const freshUser = await storage.getUser(user.id);
    if (freshUser) {
      const newXp = Math.min((freshUser.xp || 0) + 15, 100 * (freshUser.level || 1));
      await storage.updateUserXp(user.id, newXp);
    }

    res.status(201).json(checkIn);
  });

  app.patch("/api/checkins/:id/review", requireAuth, async (req, res) => {
    const user = req.user as User;
    const parsed = reviewBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid review data" });
    }

    const checkIns = await storage.getCheckIns(user.id);
    const owned = checkIns.find(c => c.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Check-in not found" });

    const { status, xpAwarded } = parsed.data;
    const checkIn = await storage.reviewCheckIn(req.params.id, status, xpAwarded);
    if (!checkIn) return res.status(404).json({ message: "Check-in not found" });

    if (status === "approved" && xpAwarded > 0) {
      const targetUser = await storage.getUser(checkIn.userId);
      if (targetUser) {
        const newXp = Math.min((targetUser.xp || 0) + xpAwarded, 100 * (targetUser.level || 1));
        await storage.updateUserXp(targetUser.id, newXp);
      }
    }

    res.json(checkIn);
  });

  // --- DARES ---
  app.get("/api/dares", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getDares(user.id);
    res.json(list);
  });

  app.post("/api/dares/spin", requireAuth, async (req, res) => {
    const user = req.user as User;
    const dareOptions = [
      "Send a photo holding your breath",
      "Write a poem about obedience",
      "30 min plank",
      "No speaking for 1 hour",
      "Wear the collar for 2 hours",
      "Cold shower",
      "Request permission to speak",
      "10 minutes of meditation",
      "Write 100 lines",
      "No electronics for 2 hours",
    ];
    const text = dareOptions[Math.floor(Math.random() * dareOptions.length)];
    const dare = await storage.createDare(user.id, text);
    await storage.logActivity(user.id, "dare_spun", text);
    await notifyUser(user.id, `New Dare: ${text}`, "info");
    res.status(201).json(dare);
  });

  app.patch("/api/dares/:id/complete", requireAuth, async (req, res) => {
    const user = req.user as User;
    const dares = await storage.getDares(user.id);
    const owned = dares.find(d => d.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Dare not found" });

    const dare = await storage.completeDare(req.params.id);
    if (!dare) return res.status(404).json({ message: "Dare not found" });

    const freshUser = await storage.getUser(user.id);
    if (freshUser) {
      const newXp = Math.min((freshUser.xp || 0) + 10, 100 * (freshUser.level || 1));
      await storage.updateUserXp(user.id, newXp);
    }
    await storage.logActivity(user.id, "dare_completed", dare.text);
    res.json(dare);
  });

  // --- REWARDS ---
  app.get("/api/rewards", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getRewards(user.id);
    res.json(list);
  });

  app.post("/api/rewards", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { name, unlockLevel } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Reward name required" });
    }
    const lvl = typeof unlockLevel === "number" && unlockLevel > 0 ? unlockLevel : 1;
    const reward = await storage.createReward({ userId: user.id, name: name.trim(), unlockLevel: lvl });
    res.status(201).json(reward);
  });

  app.patch("/api/rewards/:id/toggle", requireAuth, async (req, res) => {
    const user = req.user as User;
    const rewards = await storage.getRewards(user.id);
    const owned = rewards.find(r => r.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Reward not found" });

    const reward = await storage.toggleReward(req.params.id);
    if (!reward) return res.status(404).json({ message: "Reward not found" });
    res.json(reward);
  });

  // --- PUNISHMENTS ---
  app.get("/api/punishments", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getPunishments(user.id);
    res.json(list);
  });

  app.post("/api/punishments", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Punishment name required" });
    }
    const punishment = await storage.createPunishment({
      userId: user.id,
      assignedBy: user.id,
      name: name.trim(),
    });
    await storage.logActivity(user.id, "punishment_assigned", name.trim());
    await notifyUser(user.id, `Punishment assigned: ${name.trim()}`, "alert");
    res.status(201).json(punishment);
  });

  app.patch("/api/punishments/:id/status", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { status } = req.body;
    if (!status || !["active", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const punishments = await storage.getPunishments(user.id);
    const owned = punishments.find(p => p.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Punishment not found" });

    const punishment = await storage.updatePunishmentStatus(req.params.id, status);
    if (!punishment) return res.status(404).json({ message: "Punishment not found" });
    res.json(punishment);
  });

  // --- JOURNAL ---
  app.get("/api/journal", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getJournalEntries(user.id);
    res.json(list);
  });

  app.post("/api/journal", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { content } = req.body;
    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: "Journal content required" });
    }
    const entry = await storage.createJournalEntry({ userId: user.id, content: content.trim() });
    await storage.logActivity(user.id, "journal_entry", "New journal entry");
    res.status(201).json(entry);
  });

  // --- NOTIFICATIONS ---
  app.get("/api/notifications", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getNotifications(user.id);
    res.json(list);
  });

  app.delete("/api/notifications/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const notifications = await storage.getNotifications(user.id);
    const owned = notifications.find(n => n.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Notification not found" });

    await storage.dismissNotification(req.params.id);
    res.json({ message: "Dismissed" });
  });

  // --- ACTIVITY LOG ---
  app.get("/api/activity", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getActivityLog(user.id);
    res.json(list);
  });

  app.post("/api/activity", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { action, detail } = req.body;
    if (!action || typeof action !== "string") return res.status(400).json({ message: "Action is required" });
    const entry = await storage.logActivity(user.id, action, detail || undefined);
    res.status(201).json(entry);
  });

  // --- USER / XP ---
  app.get("/api/user/stats", requireAuth, async (req, res) => {
    const user = req.user as User;
    const freshUser = await storage.getUser(user.id);
    const taskList = await storage.getTasks(user.id);
    const completedTasks = taskList.filter(t => t.done).length;
    const totalTasks = taskList.length;
    const checkInList = await storage.getCheckIns(user.id);
    const journalList = await storage.getJournalEntries(user.id);
    const dareList = await storage.getDares(user.id);
    const completedDares = dareList.filter(d => d.completed).length;

    res.json({
      xp: freshUser?.xp ?? 0,
      level: freshUser?.level ?? 1,
      completedTasks,
      totalTasks,
      totalCheckIns: checkInList.length,
      totalJournalEntries: journalList.length,
      totalDares: dareList.length,
      completedDares,
      complianceRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    });
  });

  app.patch("/api/user/role", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { role } = req.body;
    if (!role || !["sub", "dom"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const updated = await storage.updateUserRole(user.id, role);
    if (!updated) return res.status(404).json({ message: "User not found" });
    const { password: _, ...safeUser } = updated;
    res.json(safeUser);
  });

  // --- PARTNER PAIRING ---
  app.post("/api/pair/generate", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (user.partnerId) {
      return res.status(400).json({ message: "Already paired. Unlink first." });
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const pairCode = await storage.createPairCode(user.id, code, expiresAt);
    res.status(201).json({ code: pairCode.code, expiresAt: pairCode.expiresAt });
  });

  app.post("/api/pair/join", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { code } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ message: "Invite code required" });
    }
    if (user.partnerId) {
      return res.status(400).json({ message: "Already paired. Unlink first." });
    }

    const pairCode = await storage.getPairCodeByCode(code.toUpperCase().trim());
    if (!pairCode) {
      return res.status(404).json({ message: "Invalid or expired code" });
    }
    if (new Date(pairCode.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Code has expired. Ask your partner to generate a new one." });
    }
    if (pairCode.userId === user.id) {
      return res.status(400).json({ message: "You can't pair with yourself" });
    }

    const codeOwner = await storage.getUser(pairCode.userId);
    if (!codeOwner) {
      return res.status(404).json({ message: "Code owner not found" });
    }
    if (codeOwner.partnerId) {
      return res.status(400).json({ message: "That user is already paired with someone else" });
    }

    await storage.usePairCode(pairCode.id, user.id);
    await storage.linkPartners(user.id, pairCode.userId);

    await storage.logActivity(user.id, "partner_linked", `Paired with ${codeOwner.username}`);
    await storage.logActivity(pairCode.userId, "partner_linked", `Paired with ${user.username}`);
    await notifyUser(user.id, `You are now bonded with ${codeOwner.username}`, "info");
    await notifyUser(pairCode.userId, `You are now bonded with ${user.username}`, "info");

    res.json({ message: "Successfully paired!", partnerUsername: codeOwner.username });
  });

  app.delete("/api/pair", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) {
      return res.status(400).json({ message: "Not currently paired" });
    }
    const partner = await storage.getPartner(user.id);
    await storage.unlinkPartner(user.id);
    await storage.logActivity(user.id, "partner_unlinked", partner ? `Unlinked from ${partner.username}` : "Partner unlinked");
    if (partner) {
      await storage.logActivity(partner.id, "partner_unlinked", `${user.username} ended the bond`);
      await notifyUser(partner.id, `${user.username} has ended the bond`, "alert");
    }
    res.json({ message: "Bond dissolved" });
  });

  app.get("/api/pair/partner", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) {
      return res.json(null);
    }
    const { password: _, ...safePartner } = partner;
    res.json(safePartner);
  });

  app.get("/api/pair/partner/stats", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) {
      return res.status(404).json({ message: "No partner linked" });
    }

    const taskList = await storage.getTasks(partner.id);
    const completedTasks = taskList.filter(t => t.done).length;
    const checkInList = await storage.getCheckIns(partner.id);
    const dareList = await storage.getDares(partner.id);
    const journalList = await storage.getJournalEntries(partner.id);

    res.json({
      username: partner.username,
      role: partner.role,
      xp: partner.xp,
      level: partner.level,
      completedTasks,
      totalTasks: taskList.length,
      totalCheckIns: checkInList.length,
      totalDares: dareList.length,
      completedDares: dareList.filter(d => d.completed).length,
      totalJournalEntries: journalList.length,
      complianceRate: taskList.length > 0 ? Math.round((completedTasks / taskList.length) * 100) : 0,
      pendingCheckIns: checkInList.filter(c => c.status === "pending").length,
    });
  });

  // --- DOM: PARTNER MANAGEMENT (cross-user operations for paired partners) ---
  app.get("/api/partner/tasks", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner linked" });
    const taskList = await storage.getTasks(partner.id);
    res.json(taskList);
  });

  app.post("/api/partner/tasks", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner linked" });
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ message: "Task text required" });
    }
    const task = await storage.createTask({ text: text.trim(), userId: partner.id, assignedBy: user.id });
    await storage.logActivity(user.id, "task_assigned", `Assigned "${text.trim()}" to ${partner.username}`);
    await notifyUser(partner.id, `New task from ${user.username}: ${text.trim()}`, "info");
    res.status(201).json(task);
  });

  app.get("/api/partner/checkins", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner linked" });
    const list = await storage.getCheckIns(partner.id);
    res.json(list);
  });

  app.patch("/api/partner/checkins/:id/review", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner linked" });

    const parsed = reviewBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid review data" });
    }

    const checkIns = await storage.getCheckIns(partner.id);
    const target = checkIns.find(c => c.id === req.params.id);
    if (!target) return res.status(404).json({ message: "Check-in not found" });

    const { status, xpAwarded } = parsed.data;
    const checkIn = await storage.reviewCheckIn(req.params.id, status, xpAwarded);
    if (!checkIn) return res.status(404).json({ message: "Check-in not found" });

    if (status === "approved" && xpAwarded > 0) {
      const newXp = Math.min((partner.xp || 0) + xpAwarded, 100 * (partner.level || 1));
      await storage.updateUserXp(partner.id, newXp);
    }

    await storage.logActivity(user.id, "checkin_reviewed", `${status} check-in for ${partner.username}`);
    await notifyUser(partner.id, `Check-in ${status} by ${user.username}${xpAwarded > 0 ? ` (+${xpAwarded} XP)` : ''}`, "info");
    res.json(checkIn);
  });

  app.post("/api/partner/punishments", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner linked" });
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Punishment name required" });
    }
    const punishment = await storage.createPunishment({ userId: partner.id, assignedBy: user.id, name: name.trim() });
    await storage.logActivity(user.id, "punishment_assigned", `Assigned "${name.trim()}" to ${partner.username}`);
    await notifyUser(partner.id, `Punishment from ${user.username}: ${name.trim()}`, "alert");
    res.status(201).json(punishment);
  });

  app.post("/api/partner/rewards", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner linked" });
    const { name, unlockLevel } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Reward name required" });
    }
    const lvl = typeof unlockLevel === "number" && unlockLevel > 0 ? unlockLevel : 1;
    const reward = await storage.createReward({ userId: partner.id, name: name.trim(), unlockLevel: lvl });
    await storage.logActivity(user.id, "reward_granted", `Granted "${name.trim()}" to ${partner.username}`);
    await notifyUser(partner.id, `Reward from ${user.username}: ${name.trim()}`, "info");
    res.status(201).json(reward);
  });

  app.get("/api/partner/activity", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner linked" });
    const list = await storage.getActivityLog(partner.id);
    res.json(list);
  });

  // --- RITUALS ---
  app.get("/api/rituals", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getRituals(user.id));
  });

  app.post("/api/rituals", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description, frequency, timeOfDay } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const ritual = await storage.createRitual({ userId: user.id, assignedBy: user.id, title: title.trim(), description, frequency, timeOfDay });
    await storage.logActivity(user.id, "ritual_created", title.trim());
    res.status(201).json(ritual);
  });

  app.patch("/api/rituals/:id", requireAuth, async (req, res) => {
    const ritual = await storage.updateRitual(req.params.id, req.body);
    if (!ritual) return res.status(404).json({ message: "Not found" });
    res.json(ritual);
  });

  app.delete("/api/rituals/:id", requireAuth, async (req, res) => {
    await storage.deleteRitual(req.params.id);
    res.json({ message: "Deleted" });
  });

  app.get("/api/partner/rituals", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner" });
    res.json(await storage.getRituals(partner.id));
  });

  app.post("/api/partner/rituals", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner" });
    const { title, description, frequency, timeOfDay } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const ritual = await storage.createRitual({ userId: partner.id, assignedBy: user.id, title: title.trim(), description, frequency, timeOfDay });
    await storage.logActivity(user.id, "ritual_assigned", `Assigned "${title.trim()}" to ${partner.username}`);
    await notifyUser(partner.id, `New ritual from ${user.username}: ${title.trim()}`, "info");
    res.status(201).json(ritual);
  });

  // --- LIMITS ---
  app.get("/api/limits", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getLimits(user.id));
  });

  app.post("/api/limits", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { name, category, level, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name required" });
    const limit = await storage.createLimit({ userId: user.id, name: name.trim(), category, level, description });
    await storage.logActivity(user.id, "limit_set", name.trim());
    res.status(201).json(limit);
  });

  app.patch("/api/limits/:id", requireAuth, async (req, res) => {
    const limit = await storage.updateLimit(req.params.id, req.body);
    if (!limit) return res.status(404).json({ message: "Not found" });
    res.json(limit);
  });

  app.delete("/api/limits/:id", requireAuth, async (req, res) => {
    await storage.deleteLimit(req.params.id);
    res.json({ message: "Deleted" });
  });

  app.get("/api/partner/limits", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner" });
    res.json(await storage.getLimits(partner.id));
  });

  // --- SECRETS ---
  app.get("/api/secrets", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getSecrets(user.id));
  });

  app.get("/api/secrets/for-me", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getSecretsForUser(user.id));
  });

  app.post("/api/secrets", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, content, tier, forUserId } = req.body;
    if (!title?.trim() || !content?.trim()) return res.status(400).json({ message: "Title and content required" });
    const secret = await storage.createSecret({ userId: user.id, forUserId, title: title.trim(), content: content.trim(), tier });
    await storage.logActivity(user.id, "secret_created", title.trim());
    if (forUserId) {
      await notifyUser(forUserId, `${user.username} shared a secret with you`, "info");
    }
    res.status(201).json(secret);
  });

  app.patch("/api/secrets/:id/reveal", requireAuth, async (req, res) => {
    const secret = await storage.revealSecret(req.params.id);
    if (!secret) return res.status(404).json({ message: "Not found" });
    res.json(secret);
  });

  // --- WAGERS ---
  app.get("/api/wagers", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getWagers(user.id));
  });

  app.post("/api/wagers", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description, stakes, partnerId } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const wager = await storage.createWager({ userId: user.id, partnerId, title: title.trim(), description, stakes });
    await storage.logActivity(user.id, "wager_created", title.trim());
    if (partnerId) {
      await notifyUser(partnerId, `${user.username} proposed a wager: ${title.trim()}`, "info");
    }
    res.status(201).json(wager);
  });

  app.patch("/api/wagers/:id", requireAuth, async (req, res) => {
    const wager = await storage.updateWager(req.params.id, req.body);
    if (!wager) return res.status(404).json({ message: "Not found" });
    res.json(wager);
  });

  // --- RATINGS ---
  app.get("/api/ratings", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getRatings(user.id));
  });

  app.get("/api/ratings/received", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getRatingsForUser(user.id));
  });

  app.post("/api/ratings", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { ratedUserId, overall, communication, obedience, effort, notes } = req.body;
    if (!ratedUserId || typeof overall !== "number") return res.status(400).json({ message: "Rated user and overall score required" });
    const rating = await storage.createRating({ userId: user.id, ratedUserId, overall, communication, obedience, effort, notes });
    await storage.logActivity(user.id, "rating_given", `Rated partner ${overall}/10`);
    await notifyUser(ratedUserId, `${user.username} rated you ${overall}/10`, "info");
    res.status(201).json(rating);
  });

  // --- COUNTDOWN EVENTS ---
  app.get("/api/countdown-events", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getCountdownEvents(user.id));
  });

  app.post("/api/countdown-events", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description, targetDate, category } = req.body;
    if (!title?.trim() || !targetDate) return res.status(400).json({ message: "Title and target date required" });
    const event = await storage.createCountdownEvent({ userId: user.id, title: title.trim(), description, targetDate: new Date(targetDate), category });
    await storage.logActivity(user.id, "countdown_created", title.trim());
    res.status(201).json(event);
  });

  app.delete("/api/countdown-events/:id", requireAuth, async (req, res) => {
    await storage.deleteCountdownEvent(req.params.id);
    res.json({ message: "Deleted" });
  });

  // --- STANDING ORDERS ---
  app.get("/api/standing-orders", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getStandingOrders(user.id));
  });

  app.post("/api/standing-orders", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description, priority } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const order = await storage.createStandingOrder({ userId: user.id, assignedBy: user.id, title: title.trim(), description, priority });
    await storage.logActivity(user.id, "standing_order_created", title.trim());
    res.status(201).json(order);
  });

  app.patch("/api/standing-orders/:id", requireAuth, async (req, res) => {
    const order = await storage.updateStandingOrder(req.params.id, req.body);
    if (!order) return res.status(404).json({ message: "Not found" });
    res.json(order);
  });

  app.delete("/api/standing-orders/:id", requireAuth, async (req, res) => {
    await storage.deleteStandingOrder(req.params.id);
    res.json({ message: "Deleted" });
  });

  app.post("/api/partner/standing-orders", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner" });
    const { title, description, priority } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const order = await storage.createStandingOrder({ userId: partner.id, assignedBy: user.id, title: title.trim(), description, priority });
    await storage.logActivity(user.id, "standing_order_assigned", `Assigned "${title.trim()}" to ${partner.username}`);
    await notifyUser(partner.id, `New standing order from ${user.username}: ${title.trim()}`, "info");
    res.status(201).json(order);
  });

  // --- PERMISSION REQUESTS ---
  app.get("/api/permission-requests", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getPermissionRequests(user.id));
  });

  app.post("/api/permission-requests", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const request = await storage.createPermissionRequest({ userId: user.id, title: title.trim(), description });
    await storage.logActivity(user.id, "permission_requested", title.trim());
    const partner = await storage.getPartner(user.id);
    if (partner) {
      await notifyUser(partner.id, `${user.username} is requesting permission: ${title.trim()}`, "info");
    }
    res.status(201).json(request);
  });

  app.patch("/api/permission-requests/:id", requireAuth, async (req, res) => {
    const request = await storage.updatePermissionRequest(req.params.id, req.body);
    if (!request) return res.status(404).json({ message: "Not found" });
    res.json(request);
  });

  app.get("/api/partner/permission-requests", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner" });
    res.json(await storage.getPermissionRequests(partner.id));
  });

  // --- DEVOTIONS ---
  app.get("/api/devotions", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getDevotions(user.id));
  });

  app.post("/api/devotions", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { type, content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Content required" });
    const devotion = await storage.createDevotion({ userId: user.id, type: type || "affirmation", content: content.trim() });
    await storage.logActivity(user.id, "devotion_created", content.trim().substring(0, 50));
    res.status(201).json(devotion);
  });

  app.patch("/api/devotions/:id", requireAuth, async (req, res) => {
    const devotion = await storage.updateDevotion(req.params.id, req.body);
    if (!devotion) return res.status(404).json({ message: "Not found" });
    res.json(devotion);
  });

  // --- CONFLICTS ---
  app.get("/api/conflicts", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getConflicts(user.id));
  });

  app.post("/api/conflicts", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description, partnerId } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const conflict = await storage.createConflict({ userId: user.id, partnerId, title: title.trim(), description });
    await storage.logActivity(user.id, "conflict_opened", title.trim());
    res.status(201).json(conflict);
  });

  app.patch("/api/conflicts/:id", requireAuth, async (req, res) => {
    const conflict = await storage.updateConflict(req.params.id, req.body);
    if (!conflict) return res.status(404).json({ message: "Not found" });
    res.json(conflict);
  });

  // --- DESIRED CHANGES ---
  app.get("/api/desired-changes", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getDesiredChanges(user.id));
  });

  app.post("/api/desired-changes", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description, category, targetUserId } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const change = await storage.createDesiredChange({ userId: user.id, targetUserId, title: title.trim(), description, category });
    await storage.logActivity(user.id, "desired_change_created", title.trim());
    res.status(201).json(change);
  });

  app.patch("/api/desired-changes/:id", requireAuth, async (req, res) => {
    const change = await storage.updateDesiredChange(req.params.id, req.body);
    if (!change) return res.status(404).json({ message: "Not found" });
    res.json(change);
  });

  // --- ACHIEVEMENTS ---
  app.get("/api/achievements", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getAchievements(user.id));
  });

  app.post("/api/achievements", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { name, description, icon, tier } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name required" });
    const achievement = await storage.createAchievement({ userId: user.id, name: name.trim(), description, icon, tier });
    await storage.logActivity(user.id, "achievement_unlocked", name.trim());
    res.status(201).json(achievement);
  });

  // --- PLAY SESSIONS ---
  app.get("/api/play-sessions", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getPlaySessions(user.id));
  });

  app.post("/api/play-sessions", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, notes, mood, intensity, activities, scheduledFor, partnerId } = req.body;
    const session = await storage.createPlaySession({
      userId: user.id, partnerId, title, notes, mood,
      intensity, activities, status: "planned", scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
    });
    await storage.logActivity(user.id, "play_session_created", title || "New session");
    res.status(201).json(session);
  });

  app.patch("/api/play-sessions/:id", requireAuth, async (req, res) => {
    const data = { ...req.body };
    if (data.completedAt) data.completedAt = new Date(data.completedAt);
    if (data.scheduledFor) data.scheduledFor = new Date(data.scheduledFor);
    const session = await storage.updatePlaySession(req.params.id, data);
    if (!session) return res.status(404).json({ message: "Not found" });
    res.json(session);
  });

  app.get("/api/push/vapid-public-key", (_req, res) => {
    res.json({ publicKey: getVapidPublicKey() });
  });

  app.post("/api/push/subscribe", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ message: "Invalid subscription" });
    }
    const sub = await storage.createPushSubscription({
      userId: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    });
    res.status(201).json(sub);
  });

  app.post("/api/push/unsubscribe", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ message: "Endpoint required" });
    await storage.deletePushSubscriptionForUser(user.id, endpoint);
    res.json({ message: "Unsubscribed" });
  });

  app.post("/api/push/test", requireAuth, async (req, res) => {
    const user = req.user as User;
    await sendPushToUser(user.id, "BondedAscent", "Push notifications are working!", "test");
    res.json({ message: "Test notification sent" });
  });

  app.get("/api/demand-timers", requireAuth, async (req, res) => {
    const user = req.user as User;
    const timers = await storage.getDemandTimers(user.id);
    res.json(timers);
  });

  app.post("/api/demand-timers", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) return res.status(404).json({ message: "No partner linked" });
    const { message, durationSeconds } = req.body;
    if (!message || !durationSeconds) return res.status(400).json({ message: "Message and duration required" });
    const expiresAt = new Date(Date.now() + durationSeconds * 1000);
    const timer = await storage.createDemandTimer({
      fromUserId: user.id,
      toUserId: user.partnerId,
      message,
      durationSeconds,
      expiresAt,
    });
    await notifyUser(user.partnerId, `DEMAND: ${message} — Respond within ${Math.ceil(durationSeconds / 60)} min`, "alert");
    res.status(201).json(timer);
  });

  app.post("/api/demand-timers/:id/respond", requireAuth, async (req, res) => {
    const user = req.user as User;
    const timers = await storage.getDemandTimers(user.id);
    const target = timers.find(t => t.id === req.params.id);
    if (!target) return res.status(404).json({ message: "Timer not found or not yours" });
    const timer = await storage.respondDemandTimer(req.params.id);
    if (!timer) return res.status(404).json({ message: "Timer not found" });
    res.json(timer);
  });

  app.get("/api/quick-commands", requireAuth, async (req, res) => {
    const user = req.user as User;
    const commands = await storage.getQuickCommands(user.id);
    res.json(commands);
  });

  app.post("/api/quick-commands", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) return res.status(404).json({ message: "No partner linked" });
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message required" });
    const cmd = await storage.createQuickCommand({
      fromUserId: user.id,
      toUserId: user.partnerId,
      message,
    });
    await notifyUser(user.partnerId, `ORDER: ${message}`, "alert");
    res.status(201).json(cmd);
  });

  app.post("/api/quick-commands/:id/acknowledge", requireAuth, async (req, res) => {
    const user = req.user as User;
    const commands = await storage.getQuickCommands(user.id);
    const target = commands.find(c => c.id === req.params.id);
    if (!target) return res.status(404).json({ message: "Command not found or not yours" });
    const cmd = await storage.acknowledgeQuickCommand(req.params.id);
    if (!cmd) return res.status(404).json({ message: "Command not found" });
    res.json(cmd);
  });

  app.post("/api/presence/heartbeat", requireAuth, async (req, res) => {
    const user = req.user as User;
    await storage.updatePresence(user.id);
    res.json({ ok: true });
  });

  app.get("/api/presence/:userId", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (req.params.userId !== user.id && req.params.userId !== user.partnerId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const presence = await storage.getPresence(req.params.userId);
    if (!presence) return res.json({ online: false, lastSeen: null });
    const isOnline = Date.now() - new Date(presence.lastSeen).getTime() < 60000;
    res.json({ online: isOnline, lastSeen: presence.lastSeen });
  });

  app.post("/api/partner/lockdown", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) return res.status(404).json({ message: "No partner linked" });
    const { locked } = req.body;
    const updated = await storage.updateUserLockdown(user.partnerId, !!locked);
    if (!updated) return res.status(404).json({ message: "Partner not found" });
    if (locked) {
      await notifyUser(user.partnerId, "Your dashboard has been locked down. Focus on your protocols.", "alert");
    } else {
      await notifyUser(user.partnerId, "Lockdown lifted. Full access restored.", "info");
    }
    res.json({ lockedDown: updated.lockedDown });
  });

  app.get("/api/partner/lockdown", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (user.partnerId) {
      const partnerUser = await storage.getUser(user.partnerId);
      res.json({ lockedDown: partnerUser?.lockedDown ?? false });
    } else {
      res.json({ lockedDown: false });
    }
  });

  return httpServer;
}
