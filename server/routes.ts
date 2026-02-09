import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { type User } from "@shared/schema";
import { z } from "zod";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
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
      await storage.createNotification({ userId: user.id, text: `Completed: ${task.text} (+5 XP)`, type: "info" });
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
    await storage.createNotification({ userId: user.id, text: "Check-in submitted successfully", type: "info" });

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
    await storage.createNotification({ userId: user.id, text: `New Dare: ${text}`, type: "info" });
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
    await storage.createNotification({ userId: user.id, text: `Punishment assigned: ${name.trim()}`, type: "alert" });
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
    await storage.createNotification({ userId: user.id, text: `You are now bonded with ${codeOwner.username}`, type: "info" });
    await storage.createNotification({ userId: pairCode.userId, text: `You are now bonded with ${user.username}`, type: "info" });

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
      await storage.createNotification({ userId: partner.id, text: `${user.username} has ended the bond`, type: "alert" });
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
    await storage.createNotification({ userId: partner.id, text: `New task from ${user.username}: ${text.trim()}`, type: "info" });
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
    await storage.createNotification({ userId: partner.id, text: `Check-in ${status} by ${user.username}${xpAwarded > 0 ? ` (+${xpAwarded} XP)` : ''}`, type: "info" });
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
    await storage.createNotification({ userId: partner.id, text: `Punishment from ${user.username}: ${name.trim()}`, type: "alert" });
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
    await storage.createNotification({ userId: partner.id, text: `Reward from ${user.username}: ${name.trim()}`, type: "info" });
    res.status(201).json(reward);
  });

  app.get("/api/partner/activity", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner linked" });
    const list = await storage.getActivityLog(partner.id);
    res.json(list);
  });

  return httpServer;
}
