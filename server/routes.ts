import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { sendPushToUser, getVapidPublicKey } from "./push";
import { addSSEClient, sendToUser, sendToUsers } from "./sse";
import { type User, type InterrogationSession } from "@shared/schema";
import { generateSimulation } from "./simulation-engine";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /^(image|video)\//;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"));
    }
  },
});

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

async function notifyUser(userId: string, text: string, type: string = "info", createdAsRole?: string) {
  await storage.createNotification({ userId, text, type, ...(createdAsRole ? { createdAsRole } : {}) });
  const title = type === "alert" ? "BondedAscent Alert" : "BondedAscent";
  sendPushToUser(userId, title, text, type).catch(() => {});
  sendToUser(userId, "notification", { text, type });
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

  app.get("/api/sse", requireAuth, (req, res) => {
    const user = req.user as User;
    addSSEClient(user.id, res);
  });

  app.get("/api/dashboard-init", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];

    const [
      tasks, checkIns, dares, rewardsList, punishmentsList,
      journalList, notifications, activityLog,
      standingOrders, rituals, wagers, desiredChanges,
      obedienceTrials, enduranceChallenges, sealedOrders,
      secrets, limits, permissionRequests, devotions,
      conflicts, ratings, intensitySessions, countdownEvents,
      playSessions, stickers, featureSettings, bodyMapZones,
      accusations,
    ] = await Promise.all([
      storage.getTasksForPair(userIds),
      storage.getCheckInsForPair(userIds),
      storage.getDaresForPair(userIds),
      storage.getRewardsForPair(userIds),
      storage.getPunishmentsForPair(userIds),
      storage.getJournalEntries(user.id),
      storage.getNotifications(user.id),
      storage.getActivityLog(user.id),
      storage.getStandingOrdersForPair(userIds),
      storage.getRitualsForPair(userIds),
      storage.getWagersForPair(userIds),
      storage.getDesiredChangesForPair(userIds),
      storage.getObedienceTrialsForPair(userIds),
      storage.getEnduranceChallenges(user.id),
      storage.getSealedOrders(user.id),
      storage.getSecretsForPair(userIds),
      storage.getLimitsForPair(userIds),
      storage.getPermissionRequestsForPair(userIds),
      storage.getDevotionsForPair(userIds),
      storage.getConflictsForPair(userIds),
      storage.getRatingsForPair(userIds),
      storage.getIntensitySessionsForPair(userIds),
      storage.getCountdownEventsForPair(userIds),
      storage.getPlaySessionsForPair(userIds),
      storage.getStickersForPair(userIds),
      storage.getFeatureSettings(user.id),
      storage.getBodyMapZones(user.id),
      storage.getAccusations(user.id),
    ]);

    let partnerData = null;
    let partnerStats = null;
    let partnerTasks: any[] = [];
    let partnerCheckIns: any[] = [];
    let partnerActivityLog: any[] = [];
    let partnerAccusations: any[] = [];
    if (partner) {
      const pTasks = await storage.getTasks(partner.id);
      const pCheckIns = await storage.getCheckIns(partner.id);
      const pActivity = await storage.getActivityLog(partner.id, partner.role as string);
      const pAccusations = await storage.getAccusations(partner.id, partner.role as string);
      const completedTasks = pTasks.filter((t: any) => t.done).length;
      const pDares = await storage.getDares(partner.id);
      const completedDares2 = pDares.filter((d: any) => d.completed).length;
      const totalDares2 = pDares.length;
      const totalCheckIns2 = pCheckIns.length;
      const totalJournalEntries2 = (await storage.getJournalEntries(partner.id, partner.role as string)).length;
      partnerData = { id: partner.id, username: partner.username, email: partner.email, role: partner.role, originalRole: partner.originalRole, xp: partner.xp, level: partner.level, partnerId: partner.partnerId, lockedDown: partner.lockedDown, enforcementLevel: partner.enforcementLevel, stickerBalance: partner.stickerBalance, profilePic: partner.profilePic, createdAt: partner.createdAt };
      partnerStats = { username: partner.username, role: partner.role, xp: partner.xp, level: partner.level, completedTasks, totalTasks: pTasks.length, totalCheckIns: totalCheckIns2, totalDares: totalDares2, completedDares: completedDares2, totalJournalEntries: totalJournalEntries2, complianceRate: pTasks.length > 0 ? Math.round((completedTasks / pTasks.length) * 100) : 0, pendingCheckIns: pCheckIns.filter((c: any) => c.status === "pending").length };
      partnerTasks = pTasks;
      partnerCheckIns = pCheckIns;
      partnerActivityLog = pActivity;
      partnerAccusations = pAccusations;
    }

    const completedTasks = tasks.filter((t: any) => t.done).length;
    const totalCheckIns3 = checkIns.length;
    const completedDares3 = dares.filter((d: any) => d.completed).length;
    const userStats = {
      xp: user.xp, level: user.level, completedTasks, totalTasks: tasks.length,
      totalCheckIns: totalCheckIns3, totalDares: dares.length, completedDares: completedDares3,
      totalJournalEntries: journalList.length,
      complianceRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
    };

    res.json({
      tasks, checkIns, dares, rewards: rewardsList, punishments: punishmentsList,
      journal: journalList, notifications, activityLog,
      partner: partnerData, partnerStats, partnerTasks, partnerCheckIns, partnerActivity: partnerActivityLog,
      partnerAccusations,
      stats: userStats,
      standingOrders, rituals, wagers, desiredChanges,
      obedienceTrials, enduranceChallenges, sealedOrders,
      secrets, limits, permissionRequests, devotions,
      conflicts, ratings, intensitySessions, countdownEvents,
      playSessions, stickers, featureSettings, bodyMapZones,
      accusations,
    });
  });

  // --- TASKS ---
  app.get("/api/tasks", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const taskList = await storage.getTasksForPair(userIds);
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
      createdAsRole: user.role,
    });

    await storage.logActivity(user.id, "task_created", text.trim(), user.role);
    res.status(201).json(task);
  });

  app.patch("/api/tasks/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const allTasks = await storage.getTasksForPair(userIds);
    const owned = allTasks.find(t => t.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Task not found" });
    const { text, completionNotes } = req.body;
    const data: any = {};
    if (text !== undefined) data.text = text;
    if (completionNotes !== undefined) data.completionNotes = completionNotes;
    const task = await storage.updateTask(req.params.id, data);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  });

  app.patch("/api/tasks/:id/toggle", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const allTasks = await storage.getTasksForPair(userIds);
    const owned = allTasks.find(t => t.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Task not found" });

    const { completionNotes } = req.body || {};
    const task = await storage.toggleTask(req.params.id, completionNotes);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.done) {
      const freshUser = await storage.getUser(user.id);
      if (freshUser) {
        const newXp = Math.min((freshUser.xp || 0) + 5, 100 * (freshUser.level || 1));
        await storage.updateUserXp(user.id, newXp);
      }
      await storage.logActivity(user.id, "task_completed", task.text, user.role);
      await notifyUser(user.id, `Completed: ${task.text} (+5 XP)`, "info", user.role);
    }

    res.json(task);
  });

  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const allTasks = await storage.getTasksForPair(userIds);
    const owned = allTasks.find(t => t.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Task not found" });

    await storage.deleteTask(req.params.id);
    res.json({ message: "Deleted" });
  });

  // --- CHECK-INS ---
  app.get("/api/checkins", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const list = await storage.getCheckInsForPair(userIds);
    res.json(list);
  });

  app.post("/api/checkins", requireAuth, async (req, res) => {
    const user = req.user as User;
    const parsed = checkInBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid check-in data. Mood and obedience must be 1-10." });
    }

    const { mood, obedience, notes } = parsed.data;
    const checkIn = await storage.createCheckIn({ userId: user.id, mood, obedience, notes, createdAsRole: user.role });
    await storage.logActivity(user.id, "checkin_submitted", `Mood: ${mood}, Obedience: ${obedience}`, user.role);
    await notifyUser(user.id, "Check-in submitted successfully", "info", user.role);

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

    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const checkIns = await storage.getCheckInsForPair(userIds);
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
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const list = await storage.getDaresForPair(userIds);
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
    const dare = await storage.createDare(user.id, text, user.role);
    await storage.logActivity(user.id, "dare_spun", text, user.role);
    await notifyUser(user.id, `New Dare: ${text}`, "info", user.role);
    res.status(201).json(dare);
  });

  app.patch("/api/dares/:id/complete", requireAuth, async (req, res) => {
    const user = req.user as User;
    const dares = await storage.getDares(user.id);
    const owned = dares.find(d => d.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Dare not found" });

    const { completionNotes } = req.body || {};
    const dare = await storage.completeDare(req.params.id, completionNotes);
    if (!dare) return res.status(404).json({ message: "Dare not found" });

    const freshUser = await storage.getUser(user.id);
    if (freshUser) {
      const newXp = Math.min((freshUser.xp || 0) + 10, 100 * (freshUser.level || 1));
      await storage.updateUserXp(user.id, newXp);
    }
    await storage.logActivity(user.id, "dare_completed", dare.text, user.role);
    res.json(dare);
  });

  // --- REWARDS ---
  app.get("/api/rewards", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const list = await storage.getRewardsForPair(userIds);
    res.json(list);
  });

  app.post("/api/rewards", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { name, unlockLevel, category, duration } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Reward name required" });
    }
    const lvl = typeof unlockLevel === "number" && unlockLevel > 0 ? unlockLevel : 1;
    const reward = await storage.createReward({ userId: user.id, name: name.trim(), unlockLevel: lvl, category: category || null, duration: duration || null, createdAsRole: user.role });
    res.status(201).json(reward);
  });

  app.patch("/api/rewards/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const allRewards = await storage.getRewardsForPair(userIds);
    const owned = allRewards.find(r => r.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Reward not found" });
    if (owned.userId !== user.id) return res.status(403).json({ message: "Only the reward owner can edit" });
    const { name, description } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    const reward = await storage.updateReward(req.params.id, data);
    if (!reward) return res.status(404).json({ message: "Reward not found" });
    res.json(reward);
  });

  app.patch("/api/rewards/:id/toggle", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const allRewards = await storage.getRewardsForPair(userIds);
    const owned = allRewards.find(r => r.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Reward not found" });

    const reward = await storage.toggleReward(req.params.id);
    if (!reward) return res.status(404).json({ message: "Reward not found" });
    const action = reward.unlocked ? "redeemed" : "locked";
    await storage.logActivity(user.id, `reward_${action}`, reward.name, user.role);
    if (partner) {
      await notifyUser(partner.id, `${user.username} ${action} reward: ${reward.name}`, "info", user.role);
    }
    res.json(reward);
  });

  app.delete("/api/rewards/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const allRewards = await storage.getRewardsForPair(userIds);
    const owned = allRewards.find(r => r.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Reward not found" });
    await storage.deleteReward(req.params.id);
    res.json({ message: "Reward deleted" });
  });

  app.get("/api/rewards/chest", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getRewardChest(user.id);
    res.json(list);
  });

  app.patch("/api/rewards/:id/claim", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const allRewards = await storage.getRewardsForPair(userIds);
    const owned = allRewards.find(r => r.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Reward not found" });
    const reward = await storage.claimReward(req.params.id);
    if (!reward) return res.status(404).json({ message: "Reward not found" });
    await storage.logActivity(user.id, "reward_claimed", reward.name, user.role);
    if (partner) {
      await notifyUser(partner.id, `${user.username} claimed reward "${reward.name}" into their chest`, "info", user.role);
    }
    res.json(reward);
  });

  app.patch("/api/rewards/:id/redeem", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const allRewards = await storage.getRewardsForPair(userIds);
    const owned = allRewards.find(r => r.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Reward not found" });
    const reward = await storage.redeemReward(req.params.id);
    if (!reward) return res.status(404).json({ message: "Reward not found" });
    await storage.logActivity(user.id, "reward_redeemed", reward.name, user.role);
    if (partner) {
      await notifyUser(partner.id, `${user.username} is redeeming reward: "${reward.name}"`, "alert", user.role);
    }
    res.json(reward);
  });

  // --- PUNISHMENTS ---
  app.get("/api/punishments", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const list = await storage.getPunishmentsForPair(userIds);
    res.json(list);
  });

  app.post("/api/punishments", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { name, category, duration } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Punishment name required" });
    }
    const punishment = await storage.createPunishment({
      userId: user.id,
      assignedBy: user.id,
      name: name.trim(),
      category: category || null,
      duration: duration || null,
      createdAsRole: user.role,
    });
    await storage.logActivity(user.id, "punishment_assigned", name.trim(), user.role);
    await notifyUser(user.id, `Punishment assigned: ${name.trim()}`, "alert", user.role);
    res.status(201).json(punishment);
  });

  app.patch("/api/punishments/:id/status", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { status, completionNotes } = req.body;
    if (!status || !["active", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const allPunishments = await storage.getPunishmentsForPair(userIds);
    const owned = allPunishments.find(p => p.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Punishment not found" });

    const punishment = await storage.updatePunishmentStatus(req.params.id, status, completionNotes);
    if (!punishment) return res.status(404).json({ message: "Punishment not found" });
    await storage.logActivity(user.id, `punishment_${status}`, punishment.name, user.role);
    if (partner) {
      await notifyUser(partner.id, `${user.username} marked punishment "${punishment.name}" as ${status}`, "info", user.role);
    }
    res.json(punishment);
  });

  app.delete("/api/punishments/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const allPunishments = await storage.getPunishmentsForPair(userIds);
    const owned = allPunishments.find(p => p.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Punishment not found" });
    await storage.deletePunishment(req.params.id);
    res.json({ message: "Punishment deleted" });
  });

  app.get("/api/punishments/chest", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getPunishmentChest(user.id);
    res.json(list);
  });

  app.post("/api/punishments/stockpile", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const { name, category, duration } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Punishment name required" });
    }
    const punishment = await storage.createPunishment({
      userId: partner ? partner.id : user.id,
      assignedBy: user.id,
      name: name.trim(),
      category: category || null,
      duration: duration || null,
      status: "stockpiled",
      createdAsRole: user.role,
    });
    await storage.stockpilePunishment(punishment.id);
    await storage.logActivity(user.id, "punishment_stockpiled", name.trim(), user.role);
    res.status(201).json(punishment);
  });

  app.patch("/api/punishments/:id/deploy", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const chest = await storage.getPunishmentChest(user.id);
    const owned = chest.find(p => p.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Punishment not found in your chest" });
    const punishment = await storage.deployPunishment(req.params.id);
    if (!punishment) return res.status(404).json({ message: "Punishment not found" });
    await storage.logActivity(user.id, "punishment_deployed", punishment.name, user.role);
    if (partner) {
      await notifyUser(partner.id, `${user.username} deployed punishment: "${punishment.name}"`, "alert", user.role);
    }
    res.json(punishment);
  });

  app.get("/api/sticker-board/:userId", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const targetId = req.params.userId;
    if (targetId !== user.id && (!partner || targetId !== partner.id)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const stickers = await storage.getStickers(targetId);
    const withMessages = stickers.filter(s => s.message && s.message.trim());
    res.json(withMessages);
  });

  // --- JOURNAL ---
  app.get("/api/journal", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getJournalEntries(user.id);
    res.json(list);
  });

  app.post("/api/journal", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { content, isShared, unlockCost } = req.body;
    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: "Journal content required" });
    }
    const entry = await storage.createJournalEntry({
      userId: user.id,
      content: content.trim(),
      isShared: isShared || false,
      unlockCost: unlockCost || 50,
      createdAsRole: user.role,
    });
    await storage.logActivity(user.id, "journal_entry", "New journal entry", user.role);
    if (isShared) {
      const partner = await storage.getPartner(user.id);
      if (partner) {
        await notifyUser(partner.id, `${user.username} shared a journal entry (locked — ${unlockCost || 50} XP to read)`, "info", user.role);
      }
    }
    res.status(201).json(entry);
  });

  app.get("/api/journal/shared", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.json([]);
    const entries = await storage.getJournalEntriesForPair([user.id, partner.id]);
    const shared = entries.filter(e => e.isShared);
    res.json(shared.map(e => ({
      ...e,
      content: e.unlockedBy || e.userId === user.id ? e.content : "🔒 Locked — purchase to read",
      isUnlocked: !!e.unlockedBy || e.userId === user.id,
    })));
  });

  app.post("/api/journal/:id/unlock", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(400).json({ message: "No partner linked" });
    const entries = await storage.getJournalEntriesForPair([user.id, partner.id]);
    const entry = entries.find(e => e.id === req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    if (entry.userId === user.id) return res.status(400).json({ message: "You own this entry" });
    if (entry.unlockedBy) return res.status(400).json({ message: "Already unlocked" });
    const cost = entry.unlockCost || 50;
    if (user.xp < cost) {
      return res.status(400).json({ message: `Not enough XP. Need ${cost} XP.` });
    }
    await storage.updateUserXp(user.id, user.xp - cost);
    const unlocked = await storage.unlockJournalEntry(req.params.id, user.id);
    await storage.logActivity(user.id, "journal_unlocked", `Spent ${cost} XP to read partner's journal`, user.role);
    await notifyUser(entry.userId, `${user.username} unlocked one of your journal entries!`, "info", user.role);
    res.json(unlocked);
  });

  // --- NOTIFICATIONS ---
  app.get("/api/notifications", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getNotifications(user.id);
    res.json(list);
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    const user = req.user as User;
    const allNotifications = await storage.getNotifications(user.id);
    const owned = allNotifications.find(n => n.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Notification not found" });
    const updated = await storage.markNotificationRead(req.params.id);
    res.json(updated);
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
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const list = await storage.getActivityLogForPair(userIds);
    res.json(list);
  });

  app.post("/api/activity", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { action, detail } = req.body;
    if (!action || typeof action !== "string") return res.status(400).json({ message: "Action is required" });
    const entry = await storage.logActivity(user.id, action, detail || undefined, user.role);
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
    if (user.originalRole !== "dom") {
      const partner = await storage.getPartner(user.id);
      if (partner && partner.originalRole === "dom") {
        const settings = await storage.getFeatureSettings(partner.id);
        const roleSwitchSetting = settings.find(s => s.featureKey === "role_switch");
        if (roleSwitchSetting && !roleSwitchSetting.enabled) {
          return res.status(403).json({ message: "Role switching has been disabled by your Dom" });
        }
      }
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

    await storage.logActivity(user.id, "partner_linked", `Paired with ${codeOwner.username}`, user.role);
    await storage.logActivity(pairCode.userId, "partner_linked", `Paired with ${user.username}`, codeOwner.role);
    await notifyUser(user.id, `You are now bonded with ${codeOwner.username}`, "info", user.role);
    await notifyUser(pairCode.userId, `You are now bonded with ${user.username}`, "info", codeOwner.role);

    res.json({ message: "Successfully paired!", partnerUsername: codeOwner.username });
  });

  app.delete("/api/pair", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) {
      return res.status(400).json({ message: "Not currently paired" });
    }
    const partner = await storage.getPartner(user.id);
    await storage.unlinkPartner(user.id);
    await storage.logActivity(user.id, "partner_unlinked", partner ? `Unlinked from ${partner.username}` : "Partner unlinked", user.role);
    if (partner) {
      await storage.logActivity(partner.id, "partner_unlinked", `${user.username} ended the bond`, partner.role);
      await notifyUser(partner.id, `${user.username} has ended the bond`, "alert", partner.role);
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
    const journalList = await storage.getJournalEntries(partner.id, partner.role);

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
    const task = await storage.createTask({ text: text.trim(), userId: partner.id, assignedBy: user.id, createdAsRole: user.role });
    await storage.logActivity(user.id, "task_assigned", `Assigned "${text.trim()}" to ${partner.username}`, user.role);
    await notifyUser(partner.id, `New task from ${user.username}: ${text.trim()}`, "info", user.role);
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

    await storage.logActivity(user.id, "checkin_reviewed", `${status} check-in for ${partner.username}`, user.role);
    await notifyUser(partner.id, `Check-in ${status} by ${user.username}${xpAwarded > 0 ? ` (+${xpAwarded} XP)` : ''}`, "info", user.role);
    res.json(checkIn);
  });

  app.post("/api/partner/punishments", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner linked" });
    const { name, category, duration } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Punishment name required" });
    }
    const punishment = await storage.createPunishment({ userId: partner.id, assignedBy: user.id, name: name.trim(), category: category || null, duration: duration || null, createdAsRole: user.role });
    await storage.logActivity(user.id, "punishment_assigned", `Assigned "${name.trim()}" to ${partner.username}`, user.role);
    await notifyUser(partner.id, `Punishment from ${user.username}: ${name.trim()}`, "alert", user.role);
    res.status(201).json(punishment);
  });

  app.post("/api/partner/rewards", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner linked" });
    const { name, unlockLevel, category, duration } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Reward name required" });
    }
    const lvl = typeof unlockLevel === "number" && unlockLevel > 0 ? unlockLevel : 1;
    const reward = await storage.createReward({ userId: partner.id, name: name.trim(), unlockLevel: lvl, category: category || null, duration: duration || null, createdAsRole: user.role });
    await storage.logActivity(user.id, "reward_granted", `Granted "${name.trim()}" to ${partner.username}`, user.role);
    await notifyUser(partner.id, `Reward from ${user.username}: ${name.trim()}`, "info", user.role);
    res.status(201).json(reward);
  });

  app.get("/api/partner/activity", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner linked" });
    const list = await storage.getActivityLog(partner.id, partner.role);
    res.json(list);
  });

  // --- RITUALS ---
  app.get("/api/rituals", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    res.json(await storage.getRitualsForPair(userIds));
  });

  app.post("/api/rituals", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description, frequency, timeOfDay } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const ritual = await storage.createRitual({ userId: user.id, assignedBy: user.id, title: title.trim(), description, frequency, timeOfDay, createdAsRole: user.role });
    await storage.logActivity(user.id, "ritual_created", title.trim(), user.role);
    res.status(201).json(ritual);
  });

  app.patch("/api/rituals/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getRitualById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== user.id && existing.userId !== user.partnerId) return res.status(403).json({ message: "Forbidden" });
    const ritual = await storage.updateRitual(req.params.id, req.body);
    if (!ritual) return res.status(404).json({ message: "Not found" });
    res.json(ritual);
  });

  app.delete("/api/rituals/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getRitualById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== user.id && existing.userId !== user.partnerId) return res.status(403).json({ message: "Forbidden" });
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
    const ritual = await storage.createRitual({ userId: partner.id, assignedBy: user.id, title: title.trim(), description, frequency, timeOfDay, createdAsRole: user.role });
    await storage.logActivity(user.id, "ritual_assigned", `Assigned "${title.trim()}" to ${partner.username}`, user.role);
    await notifyUser(partner.id, `New ritual from ${user.username}: ${title.trim()}`, "info", user.role);
    res.status(201).json(ritual);
  });

  // --- LIMITS ---
  app.get("/api/limits", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    res.json(await storage.getLimitsForPair(userIds));
  });

  app.post("/api/limits", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { name, category, level, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name required" });
    const limit = await storage.createLimit({ userId: user.id, name: name.trim(), category, level, description, createdAsRole: user.role });
    await storage.logActivity(user.id, "limit_set", name.trim(), user.role);
    res.status(201).json(limit);
  });

  app.patch("/api/limits/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getLimitById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== user.id && existing.userId !== user.partnerId) return res.status(403).json({ message: "Forbidden" });
    const limit = await storage.updateLimit(req.params.id, req.body);
    if (!limit) return res.status(404).json({ message: "Not found" });
    res.json(limit);
  });

  app.delete("/api/limits/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getLimitById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== user.id && existing.userId !== user.partnerId) return res.status(403).json({ message: "Forbidden" });
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
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    res.json(await storage.getSecretsForPair(userIds));
  });

  app.get("/api/secrets/for-me", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getSecretsForUser(user.id));
  });

  app.post("/api/secrets", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, content, tier, forUserId } = req.body;
    if (!title?.trim() || !content?.trim()) return res.status(400).json({ message: "Title and content required" });
    const secret = await storage.createSecret({ userId: user.id, forUserId, title: title.trim(), content: content.trim(), tier, createdAsRole: user.role });
    await storage.logActivity(user.id, "secret_created", title.trim(), user.role);
    if (forUserId) {
      await notifyUser(forUserId, `${user.username} shared a secret with you`, "info", user.role);
    }
    res.status(201).json(secret);
  });

  app.patch("/api/secrets/:id/reveal", requireAuth, async (req, res) => {
    const user = req.user as User;
    const allSecrets = await storage.getSecrets(user.id);
    const partnerSecrets = await storage.getSecretsForUser(user.id);
    const allOwned = [...allSecrets, ...partnerSecrets];
    const targetSecret = allOwned.find(s => s.id === req.params.id);
    if (!targetSecret) return res.status(404).json({ message: "Not found" });

    const isOwner = targetSecret.userId === user.id;
    const isDom = user.role === "dom";

    if (!isOwner && !isDom) {
      const cost = targetSecret.xpCost || 25;
      if (user.xp < cost) {
        return res.status(400).json({ message: `Not enough XP. Need ${cost} XP to reveal.` });
      }
      await storage.updateUserXp(user.id, user.xp - cost);
      await storage.logActivity(user.id, "secret_purchased", `Spent ${cost} XP to reveal: ${targetSecret.title}`, user.role);
    }

    const secret = await storage.revealSecret(req.params.id);
    if (!secret) return res.status(404).json({ message: "Not found" });
    res.json(secret);
  });

  // --- WAGERS ---
  app.get("/api/wagers", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    res.json(await storage.getWagersForPair(userIds));
  });

  app.post("/api/wagers", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description, stakes, partnerId } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const wager = await storage.createWager({ userId: user.id, partnerId, title: title.trim(), description, stakes, createdAsRole: user.role });
    await storage.logActivity(user.id, "wager_created", title.trim(), user.role);
    if (partnerId) {
      await notifyUser(partnerId, `${user.username} proposed a wager: ${title.trim()}`, "info", user.role);
    }
    res.status(201).json(wager);
  });

  app.patch("/api/wagers/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (user.role !== "dom") return res.status(403).json({ message: "Only Dom can resolve wagers" });
    const existing = await storage.getWagerById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== user.id && existing.userId !== user.partnerId) return res.status(403).json({ message: "Forbidden" });
    const wager = await storage.updateWager(req.params.id, req.body);
    if (!wager) return res.status(404).json({ message: "Not found" });

    if (wager.status === "won" && wager.winnerId && existing.status !== "won") {
      const existingVoucher = await storage.getRewardByWagerSourceId(wager.id);
      if (!existingVoucher) {
        await storage.createReward({
          userId: wager.winnerId,
          name: `Wager Voucher: ${wager.title}`,
          description: "Won wager — fill in your prize",
          category: "Wager Prize",
          unlockLevel: 1,
          wagerSourceId: wager.id,
          isVoucher: true,
          createdAsRole: user.role,
        });
        await storage.logActivity(wager.winnerId, "reward_voucher_created", `Wager Voucher: ${wager.title}`, user.role);
        await notifyUser(wager.winnerId, `You won the wager "${wager.title}"! A reward voucher has been added — fill in your prize.`, "info", user.role);
      }
    }

    res.json(wager);
  });

  // --- RATINGS ---
  app.get("/api/ratings", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    res.json(await storage.getRatingsForPair(userIds));
  });

  app.get("/api/ratings/received", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json(await storage.getRatingsForUser(user.id));
  });

  app.post("/api/ratings", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { ratedUserId, overall, communication, obedience, effort, notes } = req.body;
    if (!ratedUserId || typeof overall !== "number") return res.status(400).json({ message: "Rated user and overall score required" });
    const rating = await storage.createRating({ userId: user.id, ratedUserId, overall, communication, obedience, effort, notes, createdAsRole: user.role });
    await storage.logActivity(user.id, "rating_given", `Rated partner ${overall}/10`, user.role);
    await notifyUser(ratedUserId, `${user.username} rated you ${overall}/10`, "info", user.role);
    res.status(201).json(rating);
  });

  // --- COUNTDOWN EVENTS ---
  app.get("/api/countdown-events", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    res.json(await storage.getCountdownEventsForPair(userIds));
  });

  app.post("/api/countdown-events", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description, targetDate, category } = req.body;
    if (!title?.trim() || !targetDate) return res.status(400).json({ message: "Title and target date required" });
    const event = await storage.createCountdownEvent({ userId: user.id, title: title.trim(), description, targetDate: new Date(targetDate), category, createdAsRole: user.role });
    await storage.logActivity(user.id, "countdown_created", title.trim(), user.role);
    res.status(201).json(event);
  });

  app.delete("/api/countdown-events/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getCountdownEventById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== user.id && existing.userId !== user.partnerId) return res.status(403).json({ message: "Forbidden" });
    await storage.deleteCountdownEvent(req.params.id);
    res.json({ message: "Deleted" });
  });

  // --- STANDING ORDERS ---
  app.get("/api/standing-orders", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    res.json(await storage.getStandingOrdersForPair(userIds));
  });

  app.post("/api/standing-orders", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description, priority } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const order = await storage.createStandingOrder({ userId: user.id, assignedBy: user.id, title: title.trim(), description, priority, createdAsRole: user.role });
    await storage.logActivity(user.id, "standing_order_created", title.trim(), user.role);
    res.status(201).json(order);
  });

  app.patch("/api/standing-orders/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getStandingOrderById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    const partner = user.partnerId ? await storage.getUser(user.partnerId) : null;
    if (existing.userId !== user.id && (!partner || existing.userId !== partner.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const order = await storage.updateStandingOrder(req.params.id, req.body);
    if (!order) return res.status(404).json({ message: "Not found" });
    res.json(order);
  });

  app.delete("/api/standing-orders/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getStandingOrderById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    const partner = user.partnerId ? await storage.getUser(user.partnerId) : null;
    if (existing.userId !== user.id && (!partner || existing.userId !== partner.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await storage.deleteStandingOrder(req.params.id);
    res.json({ message: "Deleted" });
  });

  app.post("/api/partner/standing-orders", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner" });
    const { title, description, priority } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const order = await storage.createStandingOrder({ userId: partner.id, assignedBy: user.id, title: title.trim(), description, priority, createdAsRole: user.role });
    await storage.logActivity(user.id, "standing_order_assigned", `Assigned "${title.trim()}" to ${partner.username}`, user.role);
    await notifyUser(partner.id, `New standing order from ${user.username}: ${title.trim()}`, "info", user.role);
    res.status(201).json(order);
  });

  // --- PERMISSION REQUESTS ---
  app.get("/api/permission-requests", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    res.json(await storage.getPermissionRequestsForPair(userIds));
  });

  app.post("/api/permission-requests", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const request = await storage.createPermissionRequest({ userId: user.id, title: title.trim(), description, createdAsRole: user.role });
    await storage.logActivity(user.id, "permission_requested", title.trim(), user.role);
    const partner = await storage.getPartner(user.id);
    if (partner) {
      await notifyUser(partner.id, `${user.username} is requesting permission: ${title.trim()}`, "info", user.role);
    }
    res.status(201).json(request);
  });

  app.patch("/api/permission-requests/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getPermissionRequestById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    const partner = user.partnerId ? await storage.getUser(user.partnerId) : null;
    if (existing.userId !== user.id && (!partner || existing.userId !== partner.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }
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
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    res.json(await storage.getDevotionsForPair(userIds));
  });

  app.post("/api/devotions", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { type, content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Content required" });
    const devotion = await storage.createDevotion({ userId: user.id, type: type || "affirmation", content: content.trim(), createdAsRole: user.role });
    await storage.logActivity(user.id, "devotion_created", content.trim().substring(0, 50), user.role);
    res.status(201).json(devotion);
  });

  app.patch("/api/devotions/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getDevotionById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const devotion = await storage.updateDevotion(req.params.id, req.body);
    if (!devotion) return res.status(404).json({ message: "Not found" });
    res.json(devotion);
  });

  // --- CONFLICTS ---
  app.get("/api/conflicts", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    res.json(await storage.getConflictsForPair(userIds));
  });

  app.post("/api/conflicts", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description, partnerId } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const conflict = await storage.createConflict({ userId: user.id, partnerId, title: title.trim(), description, createdAsRole: user.role });
    await storage.logActivity(user.id, "conflict_opened", title.trim(), user.role);
    res.status(201).json(conflict);
  });

  app.patch("/api/conflicts/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getConflictById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    const partner = user.partnerId ? await storage.getUser(user.partnerId) : null;
    if (existing.userId !== user.id && (!partner || existing.userId !== partner.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const conflict = await storage.updateConflict(req.params.id, req.body);
    if (!conflict) return res.status(404).json({ message: "Not found" });
    res.json(conflict);
  });

  // --- DESIRED CHANGES ---
  app.get("/api/desired-changes", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    res.json(await storage.getDesiredChangesForPair(userIds));
  });

  app.post("/api/desired-changes", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description, category, targetUserId } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const change = await storage.createDesiredChange({ userId: user.id, targetUserId, title: title.trim(), description, category, createdAsRole: user.role });
    await storage.logActivity(user.id, "desired_change_created", title.trim(), user.role);
    res.status(201).json(change);
  });

  app.patch("/api/desired-changes/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getDesiredChangeById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    const partner = user.partnerId ? await storage.getUser(user.partnerId) : null;
    if (existing.userId !== user.id && (!partner || existing.userId !== partner.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const change = await storage.updateDesiredChange(req.params.id, req.body);
    if (!change) return res.status(404).json({ message: "Not found" });
    res.json(change);
  });

  // --- ACHIEVEMENTS ---
  app.get("/api/achievements", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    res.json(await storage.getAchievementsForPair(userIds));
  });

  app.post("/api/achievements", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { name, description, icon, tier } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name required" });
    const achievement = await storage.createAchievement({ userId: user.id, name: name.trim(), description, icon, tier, createdAsRole: user.role });
    await storage.logActivity(user.id, "achievement_unlocked", name.trim(), user.role);
    res.status(201).json(achievement);
  });

  // --- PLAY SESSIONS ---
  app.get("/api/play-sessions", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    res.json(await storage.getPlaySessionsForPair(userIds));
  });

  app.post("/api/play-sessions", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, notes, mood, intensity, activities, scheduledFor, partnerId } = req.body;
    const session = await storage.createPlaySession({
      userId: user.id, partnerId, title, notes, mood,
      intensity, activities, status: "planned", scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      createdAsRole: user.role,
    });
    await storage.logActivity(user.id, "play_session_created", title || "New session", user.role);
    res.status(201).json(session);
  });

  app.patch("/api/play-sessions/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getPlaySessionById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== user.id && existing.partnerId !== user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const data = { ...req.body };
    if (data.completedAt) data.completedAt = new Date(data.completedAt);
    if (data.scheduledFor) data.scheduledFor = new Date(data.scheduledFor);
    const session = await storage.updatePlaySession(req.params.id, data);
    if (!session) return res.status(404).json({ message: "Not found" });
    res.json(session);
  });

  app.delete("/api/secrets/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const allSecrets = await storage.getSecrets(user.id);
    const owned = allSecrets.find(s => s.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Not found" });
    await storage.deleteSecret(req.params.id);
    res.json({ message: "Deleted" });
  });

  app.delete("/api/wagers/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getWagerById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== user.id) return res.status(403).json({ message: "Forbidden" });
    await storage.deleteWager(req.params.id);
    res.json({ message: "Deleted" });
  });

  app.delete("/api/ratings/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const allRatings = await storage.getRatings(user.id);
    const owned = allRatings.find(r => r.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Not found" });
    await storage.deleteRating(req.params.id);
    res.json({ message: "Deleted" });
  });

  app.delete("/api/permission-requests/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const allReqs = await storage.getPermissionRequests(user.id);
    const owned = allReqs.find(r => r.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Not found" });
    await storage.deletePermissionRequest(req.params.id);
    res.json({ message: "Deleted" });
  });

  app.delete("/api/devotions/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const allDevotions = await storage.getDevotions(user.id);
    const owned = allDevotions.find(d => d.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Not found" });
    await storage.deleteDevotion(req.params.id);
    res.json({ message: "Deleted" });
  });

  app.delete("/api/conflicts/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const allConflicts = await storage.getConflicts(user.id);
    const owned = allConflicts.find(c => c.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Not found" });
    await storage.deleteConflict(req.params.id);
    res.json({ message: "Deleted" });
  });

  app.delete("/api/desired-changes/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const allChanges = await storage.getDesiredChanges(user.id);
    const owned = allChanges.find(c => c.id === req.params.id);
    if (!owned) return res.status(404).json({ message: "Not found" });
    await storage.deleteDesiredChange(req.params.id);
    res.json({ message: "Deleted" });
  });

  app.delete("/api/play-sessions/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getPlaySessionById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== user.id && existing.partnerId !== user.id) return res.status(403).json({ message: "Forbidden" });
    await storage.deletePlaySession(req.params.id);
    res.json({ message: "Deleted" });
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
    const timers = await storage.getDemandTimers(user.id, user.role);
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
      createdAsRole: user.role,
    });
    await notifyUser(user.partnerId, `DEMAND: ${message} — Respond within ${Math.ceil(durationSeconds / 60)} min`, "alert", user.role);
    res.status(201).json(timer);
  });

  app.post("/api/demand-timers/:id/respond", requireAuth, async (req, res) => {
    const user = req.user as User;
    const timers = await storage.getDemandTimers(user.id, user.role);
    const target = timers.find(t => t.id === req.params.id);
    if (!target) return res.status(404).json({ message: "Timer not found or not yours" });
    const timer = await storage.respondDemandTimer(req.params.id);
    if (!timer) return res.status(404).json({ message: "Timer not found" });
    res.json(timer);
  });

  app.get("/api/quick-commands", requireAuth, async (req, res) => {
    const user = req.user as User;
    const commands = await storage.getQuickCommands(user.id, user.role);
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
      createdAsRole: user.role,
    });
    await notifyUser(user.partnerId, `ORDER: ${message}`, "alert", user.role);
    res.status(201).json(cmd);
  });

  app.post("/api/quick-commands/:id/acknowledge", requireAuth, async (req, res) => {
    const user = req.user as User;
    const commands = await storage.getQuickCommands(user.id, user.role);
    const target = commands.find(c => c.id === req.params.id);
    if (!target) return res.status(404).json({ message: "Command not found or not yours" });
    const cmd = await storage.acknowledgeQuickCommand(req.params.id);
    if (!cmd) return res.status(404).json({ message: "Command not found" });
    res.json(cmd);
  });

  app.post("/api/presence/heartbeat", requireAuth, async (req, res) => {
    const user = req.user as User;
    await storage.updatePresence(user.id);
    if (user.partnerId) {
      sendToUser(user.partnerId, "presence", { userId: user.id, online: true });
    }
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

  // --- ENFORCEMENT LEVEL ---
  app.post("/api/partner/enforcement", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) return res.status(404).json({ message: "No partner linked" });
    const { level } = req.body;
    if (typeof level !== "number" || level < 1 || level > 5) {
      return res.status(400).json({ message: "Level must be between 1 and 5" });
    }
    const updated = await storage.updateUserEnforcementLevel(user.partnerId, level);
    if (!updated) return res.status(404).json({ message: "Partner not found" });

    const levelNames: Record<number, string> = {
      1: "Gentle", 2: "Moderate", 3: "Intense", 4: "Advanced", 5: "Absolute"
    };

    const intensityTasks: Record<number, string[]> = {
      1: [],
      2: ["Write a 50-word reflection on your day", "Complete one devotion exercise"],
      3: ["Write a 100-word reflection on your behavior today", "Complete two devotion exercises", "Submit a check-in within 1 hour"],
      4: ["Write a 200-word detailed confession", "Complete three devotion exercises", "Submit check-ins every 4 hours", "Complete all standing orders before end of day"],
      5: ["Write a 300-word detailed confession and self-assessment", "Complete all devotion exercises twice", "Submit check-ins every 2 hours", "Complete all standing orders immediately", "Request permission for any leisure activity"],
    };

    const tasksToCreate = intensityTasks[level] || [];
    for (const taskText of tasksToCreate) {
      await storage.createTask({ text: taskText, userId: user.partnerId, assignedBy: user.id, createdAsRole: user.role });
    }

    if (level >= 3) {
      await storage.updateUserLockdown(user.partnerId, false);
    }

    await notifyUser(user.partnerId, `Enforcement level changed to Level ${level} — ${levelNames[level]}. ${tasksToCreate.length > 0 ? `${tasksToCreate.length} new tasks assigned.` : ''}`, "alert", user.role);
    await storage.logActivity(user.id, "enforcement_set", `Level ${level} — ${levelNames[level]}`, user.role);
    await storage.logActivity(user.partnerId, "enforcement_received", `Level ${level} — ${levelNames[level]}${tasksToCreate.length > 0 ? ` (+${tasksToCreate.length} tasks)` : ''}`, user.role);

    res.json({ enforcementLevel: updated.enforcementLevel, tasksCreated: tasksToCreate.length });
  });

  app.get("/api/partner/enforcement", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (user.partnerId) {
      const partnerUser = await storage.getUser(user.partnerId);
      res.json({ enforcementLevel: partnerUser?.enforcementLevel ?? 1 });
    } else {
      res.json({ enforcementLevel: 1 });
    }
  });

  app.get("/api/user/enforcement", requireAuth, async (req, res) => {
    const user = req.user as User;
    res.json({ enforcementLevel: user.enforcementLevel ?? 1 });
  });

  // --- OVERRIDE ACTIONS ---
  app.post("/api/partner/override/revoke-rewards", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) return res.status(404).json({ message: "No partner linked" });
    await storage.revokeAllRewardsForUser(user.partnerId);
    await notifyUser(user.partnerId, "All your rewards have been revoked by your Dom.", "alert", user.role);
    await storage.logActivity(user.id, "rewards_revoked", "All partner rewards revoked", user.role);
    await storage.logActivity(user.partnerId, "rewards_revoked_received", "All rewards have been revoked", user.role);
    res.json({ message: "All rewards revoked" });
  });

  app.post("/api/partner/override/clear-tasks", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) return res.status(404).json({ message: "No partner linked" });
    await storage.deleteAllTasksForUser(user.partnerId);
    await notifyUser(user.partnerId, "All your tasks have been cleared by your Dom.", "alert", user.role);
    await storage.logActivity(user.id, "tasks_cleared", "All partner tasks cleared", user.role);
    await storage.logActivity(user.partnerId, "tasks_cleared_received", "All tasks have been cleared", user.role);
    res.json({ message: "All tasks cleared" });
  });

  app.post("/api/partner/override/force-checkin", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) return res.status(404).json({ message: "No partner linked" });
    await notifyUser(user.partnerId, "IMMEDIATE CHECK-IN REQUIRED. Submit your report now.", "alert", user.role);
    await storage.logActivity(user.id, "checkin_forced", "Forced immediate check-in from partner", user.role);
    await storage.logActivity(user.partnerId, "checkin_forced_received", "Immediate check-in demanded", user.role);
    const expiresAt = new Date(Date.now() + 300000);
    await storage.createDemandTimer({
      fromUserId: user.id,
      toUserId: user.partnerId,
      message: "Immediate check-in required",
      durationSeconds: 300,
      expiresAt,
      createdAsRole: user.role,
    });
    res.json({ message: "Check-in forced" });
  });

  // --- ACCUSATIONS ---
  app.get("/api/accusations", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getAccusations(user.id);
    res.json(list);
  });

  app.get("/api/partner/accusations", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) return res.status(404).json({ message: "No partner linked" });
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(404).json({ message: "No partner linked" });
    const list = await storage.getAccusations(user.partnerId, partner.role);
    res.json(list);
  });

  app.post("/api/accusations", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) return res.status(404).json({ message: "No partner linked" });
    const { accusation } = req.body;
    if (!accusation || typeof accusation !== "string" || !accusation.trim()) {
      return res.status(400).json({ message: "Accusation text required" });
    }
    const acc = await storage.createAccusation({
      fromUserId: user.id,
      toUserId: user.partnerId,
      accusation: accusation.trim(),
      createdAsRole: user.role,
    });
    await notifyUser(user.partnerId, `You have been accused: "${accusation.trim()}" — Respond immediately.`, "alert", user.role);
    await storage.logActivity(user.id, "accusation_made", accusation.trim(), user.role);
    await storage.logActivity(user.partnerId, "accusation_received", accusation.trim(), user.role);
    res.status(201).json(acc);
  });

  app.post("/api/accusations/:id/respond", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existingAcc = await storage.getAccusationById(req.params.id);
    if (!existingAcc) return res.status(404).json({ message: "Accusation not found" });
    if (existingAcc.toUserId !== user.id) return res.status(403).json({ message: "Not authorized" });
    const { response } = req.body;
    if (!response || typeof response !== "string" || !response.trim()) {
      return res.status(400).json({ message: "Response required" });
    }
    const acc = await storage.respondToAccusation(req.params.id, response.trim());
    if (!acc) return res.status(404).json({ message: "Accusation not found" });
    if (acc.fromUserId) {
      await notifyUser(acc.fromUserId, `Response to accusation "${acc.accusation}": "${response.trim()}"`, "info", user.role);
    }
    await storage.logActivity(user.id, "accusation_responded", `Re: "${acc.accusation}" — "${response.trim()}"`, user.role);
    res.json(acc);
  });

  app.post("/api/partner/lockdown", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) return res.status(404).json({ message: "No partner linked" });
    const { locked } = req.body;
    const updated = await storage.updateUserLockdown(user.partnerId, !!locked);
    if (!updated) return res.status(404).json({ message: "Partner not found" });
    if (locked) {
      await notifyUser(user.partnerId, "Your dashboard has been locked down. Focus on your protocols.", "alert", user.role);
    } else {
      await notifyUser(user.partnerId, "Lockdown lifted. Full access restored.", "info", user.role);
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

  // --- INTENSITY LADDER ---
  app.get("/api/intensity-sessions", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const sessions = await storage.getIntensitySessionsForPair(userIds);
    res.json(sessions);
  });

  app.post("/api/intensity-sessions", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) return res.status(400).json({ message: "No partner linked" });
    const { currentTier, notes, status } = req.body;
    const session = await storage.createIntensitySession({
      userId: user.id,
      partnerId: user.partnerId,
      currentTier: currentTier || 1,
      notes: notes || null,
      status: status || "active",
      createdAsRole: user.role,
    });
    await storage.logActivity(user.id, "intensity_session_started", `Tier ${currentTier || 1}`, user.role);
    await notifyUser(user.partnerId, `Intensity session started at Tier ${currentTier || 1}`, "alert", user.role);
    res.json(session);
  });

  app.patch("/api/intensity-sessions/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getIntensitySessionById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Session not found" });
    if (existing.userId !== user.id && existing.userId !== user.partnerId) return res.status(403).json({ message: "Forbidden" });
    const { currentTier, maxTierReached, status, durationSeconds, notes, completedAt } = req.body;
    const data: any = {};
    if (currentTier !== undefined) data.currentTier = currentTier;
    if (maxTierReached !== undefined) data.maxTierReached = maxTierReached;
    if (status !== undefined) data.status = status;
    if (durationSeconds !== undefined) data.durationSeconds = durationSeconds;
    if (notes !== undefined) data.notes = notes;
    if (completedAt !== undefined) data.completedAt = new Date(completedAt);
    const session = await storage.updateIntensitySession(req.params.id, data);
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (status === "completed" && user.partnerId) {
      await notifyUser(user.partnerId, `Intensity session completed! Max tier: ${session.maxTierReached}`, "info", user.role);
      await storage.logActivity(user.id, "intensity_session_completed", `Max tier: ${session.maxTierReached}`, user.role);
    }
    res.json(session);
  });

  // --- OBEDIENCE TRIALS ---
  app.get("/api/obedience-trials", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const trials = await storage.getObedienceTrialsForPair(userIds);
    res.json(trials);
  });

  app.post("/api/obedience-trials", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) return res.status(400).json({ message: "No partner linked" });
    const { title, timeLimitSeconds, steps, autoReward, autoPunishment } = req.body;
    if (!title || !steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ message: "Title and at least one step required" });
    }
    const trial = await storage.createObedienceTrial({
      userId: user.id,
      partnerId: user.partnerId,
      title,
      timeLimitSeconds: timeLimitSeconds || 600,
      totalSteps: steps.length,
      autoReward: autoReward || null,
      autoPunishment: autoPunishment || null,
      status: "pending",
      createdAsRole: user.role,
    });
    for (let i = 0; i < steps.length; i++) {
      await storage.createTrialStep({
        trialId: trial.id,
        stepOrder: i + 1,
        instruction: steps[i],
        status: "pending",
      });
    }
    await notifyUser(user.partnerId, `New trial assigned: "${title}" (${steps.length} steps)`, "alert", user.role);
    await storage.logActivity(user.id, "trial_created", title, user.role);
    res.json(trial);
  });

  app.get("/api/obedience-trials/:id/steps", requireAuth, async (req, res) => {
    const steps = await storage.getTrialSteps(req.params.id);
    res.json(steps);
  });

  app.patch("/api/obedience-trials/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getObedienceTrialById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Trial not found" });
    if (existing.userId !== user.id && existing.partnerId !== user.id) return res.status(403).json({ message: "Not authorized" });
    const { status, score, completedSteps, startedAt, completedAt } = req.body;
    const data: any = {};
    if (status !== undefined) data.status = status;
    if (score !== undefined) data.score = score;
    if (completedSteps !== undefined) data.completedSteps = completedSteps;
    if (startedAt !== undefined) data.startedAt = new Date(startedAt);
    if (completedAt !== undefined) data.completedAt = new Date(completedAt);
    const trial = await storage.updateObedienceTrial(req.params.id, data);
    if (!trial) return res.status(404).json({ message: "Trial not found" });
    if (status === "passed") {
      if (trial.autoReward && trial.partnerId) {
        await storage.createReward({ userId: trial.partnerId, name: trial.autoReward, unlockLevel: 1, createdAsRole: user.role });
        await notifyUser(trial.partnerId, `Trial passed! Reward earned: ${trial.autoReward}`, "info", user.role);
      }
      await storage.logActivity(user.id, "trial_passed", trial.title, user.role);
    } else if (status === "failed") {
      if (trial.autoPunishment && trial.partnerId) {
        await storage.createPunishment({ userId: trial.partnerId, name: trial.autoPunishment, assignedBy: trial.userId, createdAsRole: user.role });
        await notifyUser(trial.partnerId, `Trial failed. Punishment assigned: ${trial.autoPunishment}`, "alert", user.role);
      }
      await storage.logActivity(user.id, "trial_failed", trial.title, user.role);
    }
    res.json(trial);
  });

  app.patch("/api/trial-steps/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existingStep = await storage.getTrialStepById(req.params.id);
    if (!existingStep) return res.status(404).json({ message: "Step not found" });
    const parentTrial = await storage.getObedienceTrialById(existingStep.trialId);
    if (!parentTrial) return res.status(404).json({ message: "Trial not found" });
    if (parentTrial.userId !== user.id && parentTrial.partnerId !== user.id) return res.status(403).json({ message: "Forbidden" });
    const { status } = req.body;
    const data: any = { status };
    if (status === "completed") data.completedAt = new Date();
    const step = await storage.updateTrialStep(req.params.id, data);
    if (!step) return res.status(404).json({ message: "Step not found" });
    res.json(step);
  });

  // --- SENSATION ROULETTE ---
  app.get("/api/sensation-cards", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const cards = await storage.getSensationCardsForPair(userIds);
    res.json(cards);
  });

  app.post("/api/sensation-cards", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { label, description, intensity, cardType, durationMinutes } = req.body;
    if (!label) return res.status(400).json({ message: "Label required" });
    const card = await storage.createSensationCard({
      userId: user.id,
      label,
      description: description || null,
      intensity: intensity || 3,
      cardType: cardType || "normal",
      durationMinutes: durationMinutes || null,
      createdAsRole: user.role,
    });
    await storage.logActivity(user.id, "sensation_card_created", label, user.role);
    res.json(card);
  });

  app.delete("/api/sensation-cards/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getSensationCardById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Card not found" });
    if (existing.userId !== user.id) return res.status(403).json({ message: "Not authorized" });
    await storage.deleteSensationCard(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/sensation-spins", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const spins = await storage.getSensationSpinsForPair(userIds);
    res.json(spins);
  });

  app.post("/api/sensation-spins", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { cardId, result, cardType } = req.body;
    if (!cardId || !result) return res.status(400).json({ message: "Card ID and result required" });
    const recentSpins = await storage.getSensationSpins(user.id);
    const consecutiveCompleted = recentSpins.filter(s => s.completed).length;
    let streakCount = 1;
    for (const s of recentSpins) {
      if (s.completed) streakCount++;
      else break;
    }
    const baseXp = 10;
    const xpAwarded = Math.min(baseXp * streakCount, 50);
    const spin = await storage.createSensationSpin({
      userId: user.id,
      cardId,
      result,
      cardType: cardType || "normal",
    });
    const updated = await storage.updateSensationSpin(spin.id, { xpAwarded, streakCount });
    await storage.logActivity(user.id, "sensation_spin", result, user.role);
    res.json(updated || spin);
  });

  app.patch("/api/sensation-spins/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existingSpin = await storage.getSensationSpinById(req.params.id);
    if (!existingSpin) return res.status(404).json({ message: "Spin not found" });
    if (existingSpin.userId !== user.id) return res.status(403).json({ message: "Not authorized" });
    const { completed } = req.body;
    const spin = await storage.updateSensationSpin(req.params.id, { completed: !!completed });
    if (!spin) return res.status(404).json({ message: "Spin not found" });
    if (completed && spin.xpAwarded > 0) {
      const currentUser = await storage.getUser(user.id);
      if (currentUser) {
        await storage.updateUserXp(user.id, (currentUser.xp || 0) + spin.xpAwarded);
      }
      await notifyUser(user.id, `Sensation completed! +${spin.xpAwarded} XP (streak: ${spin.streakCount}x)`, "info", user.role);
    }
    res.json(spin);
  });

  // --- PROTOCOL LOCKBOX ---
  app.get("/api/sealed-orders", requireAuth, async (req, res) => {
    const user = req.user as User;
    const orders = await storage.getSealedOrders(user.id);
    res.json(orders);
  });

  app.get("/api/sealed-orders/created", requireAuth, async (req, res) => {
    const user = req.user as User;
    const orders = await storage.getSealedOrdersByCreator(user.id);
    res.json(orders);
  });

  app.post("/api/sealed-orders", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) return res.status(400).json({ message: "No partner linked" });
    const { title, content, unlockAt, chainOrder, previousOrderId, xpCost } = req.body;
    if (!title || !content || !unlockAt) return res.status(400).json({ message: "Title, content, and unlock time required" });
    const order = await storage.createSealedOrder({
      userId: user.id,
      targetUserId: user.partnerId,
      title,
      content,
      unlockAt: new Date(unlockAt),
      chainOrder: chainOrder || null,
      previousOrderId: previousOrderId || null,
      xpCost: xpCost || 25,
      createdAsRole: user.role,
    });
    await notifyUser(user.partnerId, `New sealed order: "${title}" — unlocks soon...`, "alert", user.role);
    await storage.logActivity(user.id, "sealed_order_created", title, user.role);
    res.json(order);
  });

  app.patch("/api/sealed-orders/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getSealedOrderById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Order not found" });
    if (existing.userId !== user.id && existing.targetUserId !== user.id) return res.status(403).json({ message: "Not authorized" });
    const { revealed, completed, emergencyUnsealed } = req.body;
    const data: any = {};
    if (revealed !== undefined) data.revealed = revealed;
    if (completed !== undefined) data.completed = completed;
    if (emergencyUnsealed !== undefined) data.emergencyUnsealed = emergencyUnsealed;
    const order = await storage.updateSealedOrder(req.params.id, data);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (emergencyUnsealed) {
      const currentUser = await storage.getUser(user.id);
      if (currentUser && currentUser.xp >= order.xpCost) {
        await storage.updateUserXp(user.id, currentUser.xp - order.xpCost);
        await storage.updateSealedOrder(req.params.id, { revealed: true });
        await notifyUser(order.userId, `Emergency unseal used on "${order.title}" (-${order.xpCost} XP)`, "alert", user.role);
        await storage.logActivity(user.id, "emergency_unseal", `${order.title} (-${order.xpCost} XP)`, user.role);
      } else {
        return res.status(400).json({ message: `Not enough XP. Need ${order.xpCost}, have ${currentUser?.xp || 0}` });
      }
    }
    if (completed) {
      await storage.logActivity(user.id, "sealed_order_completed", order.title, user.role);
    }
    res.json(order);
  });

  // --- ENDURANCE CHALLENGES ---
  app.get("/api/endurance-challenges", requireAuth, async (req, res) => {
    const user = req.user as User;
    const challenges = await storage.getEnduranceChallenges(user.id);
    res.json(challenges);
  });

  app.get("/api/endurance-challenges/created", requireAuth, async (req, res) => {
    const user = req.user as User;
    const challenges = await storage.getEnduranceChallengesByCreator(user.id);
    res.json(challenges);
  });

  app.post("/api/endurance-challenges", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) return res.status(400).json({ message: "No partner linked" });
    const { title, description, durationHours, checkinIntervalMinutes, xpPerCheckin, autoPunishment } = req.body;
    if (!title || !durationHours) return res.status(400).json({ message: "Title and duration required" });
    const intervalMins = checkinIntervalMinutes || 60;
    const totalCheckins = Math.floor((durationHours * 60) / intervalMins);
    const endsAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    const challenge = await storage.createEnduranceChallenge({
      userId: user.id,
      targetUserId: user.partnerId,
      title,
      description: description || null,
      durationHours,
      checkinIntervalMinutes: intervalMins,
      xpPerCheckin: xpPerCheckin || 15,
      autoPunishment: autoPunishment || null,
      status: "active",
      startedAt: new Date(),
      endsAt,
      createdAsRole: user.role,
    });
    await storage.updateEnduranceChallenge(challenge.id, { totalCheckins });
    await notifyUser(user.partnerId, `Endurance challenge: "${title}" — ${durationHours}h, check in every ${intervalMins}min`, "alert", user.role);
    await storage.logActivity(user.id, "endurance_challenge_created", title, user.role);
    res.json(challenge);
  });

  app.patch("/api/endurance-challenges/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getEnduranceChallengeById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Challenge not found" });
    if (existing.userId !== user.id && existing.targetUserId !== user.id) return res.status(403).json({ message: "Not authorized" });
    const { status, completedAt, completedCheckins, missedCheckins } = req.body;
    const data: any = {};
    if (status !== undefined) data.status = status;
    if (completedAt !== undefined) data.completedAt = new Date(completedAt);
    if (completedCheckins !== undefined) data.completedCheckins = completedCheckins;
    if (missedCheckins !== undefined) data.missedCheckins = missedCheckins;
    const challenge = await storage.updateEnduranceChallenge(req.params.id, data);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });
    if (status === "completed") {
      await storage.logActivity(user.id, "endurance_completed", challenge.title, user.role);
      if (challenge.userId !== user.id) {
        await notifyUser(challenge.userId, `Endurance challenge "${challenge.title}" completed!`, "info", user.role);
      }
    }
    if (status === "failed" && challenge.autoPunishment) {
      await storage.createPunishment({ userId: challenge.targetUserId, name: challenge.autoPunishment, assignedBy: challenge.userId, createdAsRole: user.role });
      await notifyUser(challenge.targetUserId, `Endurance failed. Punishment: ${challenge.autoPunishment}`, "alert", user.role);
    }
    res.json(challenge);
  });

  app.get("/api/endurance-challenges/:id/checkins", requireAuth, async (req, res) => {
    const checkins = await storage.getEnduranceCheckins(req.params.id);
    res.json(checkins);
  });

  app.post("/api/endurance-challenges/:id/checkins", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { gateNumber } = req.body;
    const challenge = await storage.getEnduranceChallenges(user.id);
    const ch = challenge.find(c => c.id === req.params.id);
    if (!ch) return res.status(404).json({ message: "Challenge not found" });
    const checkin = await storage.createEnduranceCheckin({
      challengeId: req.params.id,
      userId: user.id,
      gateNumber: gateNumber || 1,
      status: "completed",
    });
    const updatedCheckin = await storage.updateEnduranceChallenge(req.params.id, {
      completedCheckins: (ch.completedCheckins || 0) + 1,
    });
    const xpPerCheckin = ch.xpPerCheckin || 15;
    const currentUser = await storage.getUser(user.id);
    if (currentUser) {
      await storage.updateUserXp(user.id, (currentUser.xp || 0) + xpPerCheckin);
    }
    await notifyUser(user.id, `Endurance check-in #${gateNumber}! +${xpPerCheckin} XP`, "info", user.role);
    if (ch.userId !== user.id) {
      await notifyUser(ch.userId, `${user.username} checked in for "${ch.title}" (gate #${gateNumber})`, "info", user.role);
    }
    res.json(checkin);
  });

  // --- MEDIA UPLOADS ---
  app.use("/uploads", express.static(uploadsDir));

  app.post("/api/profile-pic", requireAuth, upload.single("file"), async (req, res) => {
    const user = req.user as User;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });
    if (!file.mimetype.startsWith("image/")) return res.status(400).json({ message: "Only image files allowed" });
    const url = `/uploads/${file.filename}`;
    const updated = await storage.updateUserProfilePic(user.id, url);
    await storage.logActivity(user.id, "profile_pic_updated", "Updated profile picture", user.role);
    res.json({ profilePic: url, user: updated });
  });

  app.post("/api/media/upload", requireAuth, upload.single("file"), async (req, res) => {
    const user = req.user as User;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });
    const { entityType, entityId } = req.body;
    if (!entityType || !entityId) return res.status(400).json({ message: "entityType and entityId required" });
    const mediaItem = await storage.createMedia({
      userId: user.id,
      entityType,
      entityId,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      createdAsRole: user.role,
    });
    await storage.logActivity(user.id, "media_uploaded", `Uploaded ${file.originalname}`, user.role);
    res.json(mediaItem);
  });

  app.get("/api/media/:entityType/:entityId", requireAuth, async (req, res) => {
    const list = await storage.getMedia(req.params.entityType, req.params.entityId);
    res.json(list);
  });

  app.delete("/api/media/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getMediaById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== user.id && existing.userId !== user.partnerId) return res.status(403).json({ message: "Forbidden" });
    await storage.deleteMedia(req.params.id);
    res.json({ message: "Deleted" });
  });

  // --- STICKERS ---
  app.get("/api/stickers", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const list = await storage.getStickersForPair(userIds);
    res.json(list);
  });

  app.post("/api/stickers", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { recipientId, stickerType, message } = req.body;
    if (!recipientId || !stickerType) return res.status(400).json({ message: "recipientId and stickerType required" });
    const STICKER_VALUES: Record<string, number> = {
      "gold-star": 5, heart: 3, fire: 4, crown: 10, diamond: 15, ribbon: 2, trophy: 8, sparkle: 1,
    };
    const sticker = await storage.createSticker({
      senderId: user.id,
      recipientId,
      stickerType,
      message: message || null,
      createdAsRole: user.role,
    });
    const stickerValue = STICKER_VALUES[stickerType] || 1;
    const recipient = await storage.getUser(recipientId);
    if (recipient) {
      await storage.updateUserStickerBalance(recipientId, (recipient.stickerBalance || 0) + stickerValue);
    }
    await storage.logActivity(user.id, "sticker_sent", `Sent a ${stickerType} sticker`, user.role);
    await notifyUser(recipientId, `${user.username} sent you a ${stickerType} sticker! (+${stickerValue} points)`, "info", user.role);
    res.json(sticker);
  });

  app.post("/api/stickers/spend", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { amount } = req.body;
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    if ((user.stickerBalance || 0) < amount) {
      return res.status(400).json({ message: "Insufficient sticker balance" });
    }
    await storage.updateUserStickerBalance(user.id, (user.stickerBalance || 0) - amount);
    res.json({ success: true, newBalance: (user.stickerBalance || 0) - amount });
  });

  // --- FEATURE SETTINGS ---
  app.get("/api/feature-settings", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const domId = user.originalRole === "dom" ? user.id : (partner ? partner.id : user.id);
    const settings = await storage.getFeatureSettings(domId);
    res.json(settings);
  });

  app.put("/api/feature-settings/:featureKey", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (user.role !== "dom") return res.status(403).json({ message: "Only Dom accounts can manage feature settings" });
    const { enabled } = req.body;
    if (typeof enabled !== "boolean") return res.status(400).json({ message: "enabled must be a boolean" });
    const setting = await storage.upsertFeatureSetting(user.id, req.params.featureKey, enabled);
    await storage.logActivity(user.id, "feature_toggled", `${enabled ? "Enabled" : "Disabled"} ${req.params.featureKey}`, user.role);
    res.json(setting);
  });

  app.get("/api/body-map-zones", requireAuth, async (req, res) => {
    const user = req.user as User;
    const zones = await storage.getBodyMapZones(user.id);
    res.json(zones);
  });

  app.put("/api/body-map-zones/:zoneName", requireAuth, async (req, res) => {
    const user = req.user as User;
    const bodyMapSchema = z.object({
      status: z.enum(["neutral", "desire", "void"]),
      intensity: z.number().int().min(0).max(100),
    });
    const parsed = bodyMapSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid body map zone data", errors: parsed.error.errors });
    const { status, intensity } = parsed.data;
    const partner = await storage.getPartner(user.id);
    const zone = await storage.upsertBodyMapZone(
      user.id,
      partner?.id || null,
      req.params.zoneName,
      status,
      intensity,
      user.role
    );
    res.json(zone);
  });

  app.delete("/api/body-map-zones", requireAuth, async (req, res) => {
    const user = req.user as User;
    await storage.deleteBodyMapZones(user.id);
    res.json({ success: true });
  });

  // --- LOCKED MEDIA ---
  app.get("/api/media/locked", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const items = await storage.getLockedMediaForPair(userIds);
    res.json(items.map(m => ({
      ...m,
      url: m.isLocked && m.userId !== user.id && m.unlockedBy !== user.id ? null : m.url,
    })));
  });

  app.post("/api/media/locked", requireAuth, upload.single("file"), async (req, res) => {
    const user = req.user as User;
    if (!req.file) return res.status(400).json({ message: "File required" });
    const unlockCost = parseInt(req.body.unlockCost) || 100;
    const m = await storage.createMedia({
      userId: user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      entityType: "locked_media",
      entityId: null,
      isLocked: true,
      unlockCost,
      unlockedBy: null,
      createdAsRole: user.role,
    });
    await storage.logActivity(user.id, "locked_media_uploaded", `Uploaded locked ${req.file.mimetype.startsWith("video") ? "video" : "photo"}`, user.role);
    const partner = await storage.getPartner(user.id);
    if (partner) {
      await notifyUser(partner.id, `${user.username} uploaded a locked ${req.file.mimetype.startsWith("video") ? "video" : "photo"} (${unlockCost} XP to unlock)`, "info", user.role);
    }
    res.status(201).json(m);
  });

  app.post("/api/media/:id/unlock", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) return res.status(400).json({ message: "No partner linked" });
    const userIds = [user.id, partner.id];
    const items = await storage.getLockedMediaForPair(userIds);
    const item = items.find(m => m.id === req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    if (item.userId === user.id) return res.status(400).json({ message: "You own this media" });
    if (!item.isLocked) return res.status(400).json({ message: "Already unlocked" });
    const cost = item.unlockCost || 100;
    if (user.xp < cost) {
      return res.status(400).json({ message: `Not enough XP. Need ${cost} XP.` });
    }
    await storage.updateUserXp(user.id, user.xp - cost);
    const unlocked = await storage.unlockMedia(req.params.id, user.id);
    await storage.logActivity(user.id, "media_unlocked", `Spent ${cost} XP to unlock media`, user.role);
    await notifyUser(item.userId, `${user.username} unlocked your locked media!`, "info", user.role);
    res.json({ ...unlocked, url: unlocked?.url });
  });

  // --- TRENDS ---
  app.get("/api/trends", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const logs = await storage.getActivityLogForPair(userIds);
    const now = new Date();
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    const completionTrend: number[] = [];
    const taskTrend: number[] = [];
    const orderTrend: number[] = [];
    const ritualTrend: number[] = [];
    for (const day of days) {
      const dayLogs = logs.filter(l => l.createdAt && new Date(l.createdAt).toISOString().split("T")[0] === day);
      completionTrend.push(dayLogs.filter(l => l.action.includes("completed")).length);
      taskTrend.push(dayLogs.filter(l => l.action.includes("task")).length);
      orderTrend.push(dayLogs.filter(l => l.action.includes("order") || l.action.includes("command")).length);
      ritualTrend.push(dayLogs.filter(l => l.action.includes("ritual")).length);
    }
    res.json({ completionTrend, taskTrend, orderTrend, ritualTrend });
  });

  // --- STREAKS ---
  app.get("/api/streaks", requireAuth, async (req, res) => {
    const user = req.user as User;
    const result = await storage.getStreaks(user.id);
    res.json(result);
  });

  // --- ANALYTICS ---
  app.get("/api/analytics", requireAuth, async (req, res) => {
    const user = req.user as User;
    const checkInList = await storage.getCheckIns(user.id);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentCheckIns = checkInList.filter(c => c.createdAt && new Date(c.createdAt) >= thirtyDaysAgo);
    const avgMood = recentCheckIns.length > 0 ? recentCheckIns.reduce((s, c) => s + c.mood, 0) / recentCheckIns.length : 0;
    const avgObedience = recentCheckIns.length > 0 ? recentCheckIns.reduce((s, c) => s + c.obedience, 0) / recentCheckIns.length : 0;
    const punishmentList = await storage.getPunishments(user.id);
    const rewardList = await storage.getRewards(user.id);
    const sessionList = await storage.getPlaySessions(user.id);
    const taskList = await storage.getTasks(user.id);
    const completedTasks = taskList.filter(t => t.done).length;
    const taskCompletionRate = taskList.length > 0 ? Math.round((completedTasks / taskList.length) * 100) : 0;
    const activityLogs = await storage.getActivityLog(user.id);
    const recentActivity = activityLogs.filter(a => a.createdAt && new Date(a.createdAt) >= thirtyDaysAgo);
    res.json({
      avgMood: Math.round(avgMood * 10) / 10,
      avgObedience: Math.round(avgObedience * 10) / 10,
      totalCheckIns: recentCheckIns.length,
      punishmentCount: punishmentList.length,
      rewardCount: rewardList.length,
      sessionCount: sessionList.length,
      taskCompletionRate,
      totalTasks: taskList.length,
      completedTasks,
      activityCount: recentActivity.length,
    });
  });

  // --- ANALYTICS RELATIONSHIP ---
  app.get("/api/analytics/relationship", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    if (!partner) {
      return res.json({ daysBonded: 0, totalSessions: 0, combinedActivity: 0, bondHealthScore: 0 });
    }
    const daysBonded = user.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const userIds = [user.id, partner.id];
    const sessions = await storage.getPlaySessionsForPair(userIds);
    const activityLogs = await storage.getActivityLogForPair(userIds);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = activityLogs.filter(a => a.createdAt && new Date(a.createdAt) >= sevenDaysAgo);
    const bondHealthScore = Math.min(100, Math.round((recentActivity.length / 7) * 10));
    res.json({
      daysBonded,
      totalSessions: sessions.length,
      combinedActivity: activityLogs.length,
      bondHealthScore,
    });
  });

  // --- CONTRACTS ---
  app.get("/api/contracts", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getContracts(user.id);
    res.json(list);
  });

  app.post("/api/contracts", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, terms, limits, safeword, duration, startDate, endDate, partnerId } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const contract = await storage.createContract({
      creatorId: user.id,
      partnerId: partnerId || null,
      title: title.trim(),
      terms: terms || null,
      limits: limits || null,
      safeword: safeword || null,
      duration: duration || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });
    await storage.logActivity(user.id, "contract_created", title.trim(), user.role);
    res.status(201).json(contract);
  });

  app.put("/api/contracts/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getContractById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.creatorId !== user.id && existing.partnerId !== user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const contract = await storage.updateContract(req.params.id, req.body);
    if (!contract) return res.status(404).json({ message: "Not found" });
    res.json(contract);
  });

  // --- CONFESSIONS ---
  app.get("/api/confessions", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getConfessions(user.id);
    res.json(list);
  });

  app.post("/api/confessions", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { content, partnerId } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Content required" });
    const confession = await storage.createConfession({
      userId: user.id,
      partnerId: partnerId || user.partnerId || null,
      content: content.trim(),
    });
    await storage.logActivity(user.id, "confession_submitted", "New confession", user.role);
    if (confession.partnerId) {
      await notifyUser(confession.partnerId, `${user.username} submitted a confession`, "alert", user.role);
    }
    res.status(201).json(confession);
  });

  app.put("/api/confessions/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getConfessionById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== user.id && existing.partnerId !== user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const confession = await storage.updateConfession(req.params.id, req.body);
    if (!confession) return res.status(404).json({ message: "Not found" });
    res.json(confession);
  });

  // --- TRAINING PROGRAMS ---
  app.get("/api/training-programs", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getTrainingPrograms(user.id);
    res.json(list);
  });

  app.post("/api/training-programs", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description, durationDays, category } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const program = await storage.createTrainingProgram({
      creatorId: user.id,
      title: title.trim(),
      description: description || null,
      durationDays: durationDays || 7,
      category: category || null,
    });
    await storage.logActivity(user.id, "training_program_created", title.trim(), user.role);
    res.status(201).json(program);
  });

  app.put("/api/training-programs/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getTrainingProgramById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.creatorId !== user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const program = await storage.updateTrainingProgram(req.params.id, req.body);
    if (!program) return res.status(404).json({ message: "Not found" });
    res.json(program);
  });

  // --- TRAINING DAYS ---
  app.get("/api/training-programs/:programId/days", requireAuth, async (req, res) => {
    const days = await storage.getTrainingDays(req.params.programId);
    res.json(days);
  });

  app.post("/api/training-days", requireAuth, async (req, res) => {
    const { programId, dayNumber, title, objectives, ritualIds, taskIds } = req.body;
    if (!programId || !title?.trim()) return res.status(400).json({ message: "programId and title required" });
    const day = await storage.createTrainingDay({
      programId,
      dayNumber: dayNumber || 1,
      title: title.trim(),
      objectives: objectives || null,
      ritualIds: ritualIds || null,
      taskIds: taskIds || null,
    });
    res.status(201).json(day);
  });

  // --- TRAINING ENROLLMENTS ---
  app.get("/api/training-enrollments", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getTrainingEnrollments(user.id);
    res.json(list);
  });

  app.post("/api/training-enrollments", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { programId } = req.body;
    if (!programId) return res.status(400).json({ message: "programId required" });
    const enrollment = await storage.createTrainingEnrollment({
      programId,
      userId: user.id,
      startedAt: new Date(),
    });
    await storage.logActivity(user.id, "training_enrolled", `Enrolled in program`, user.role);
    res.status(201).json(enrollment);
  });

  app.put("/api/training-enrollments/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getTrainingEnrollmentById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const enrollment = await storage.updateTrainingEnrollment(req.params.id, req.body);
    if (!enrollment) return res.status(404).json({ message: "Not found" });
    res.json(enrollment);
  });

  // --- SCENE SCRIPTS ---
  app.get("/api/scene-scripts", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getSceneScripts(user.id);
    res.json(list);
  });

  app.post("/api/scene-scripts", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { title, description, estimatedDuration, category } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title required" });
    const script = await storage.createSceneScript({
      creatorId: user.id,
      title: title.trim(),
      description: description || null,
      estimatedDuration: estimatedDuration || null,
      category: category || null,
    });
    await storage.logActivity(user.id, "scene_script_created", title.trim(), user.role);
    res.status(201).json(script);
  });

  app.put("/api/scene-scripts/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getSceneScriptById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.creatorId !== user.id) return res.status(403).json({ message: "Not authorized" });
    const script = await storage.updateSceneScript(req.params.id, req.body);
    if (!script) return res.status(404).json({ message: "Not found" });
    res.json(script);
  });

  app.delete("/api/scene-scripts/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getSceneScriptById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.creatorId !== user.id) return res.status(403).json({ message: "Not authorized" });
    await storage.deleteSceneScript(req.params.id);
    res.json({ message: "Deleted" });
  });

  // --- SCRIPT STEPS ---
  app.get("/api/scene-scripts/:scriptId/steps", requireAuth, async (req, res) => {
    const steps = await storage.getScriptSteps(req.params.scriptId);
    res.json(steps);
  });

  app.post("/api/script-steps", requireAuth, async (req, res) => {
    const { scriptId, stepOrder, instruction, durationSeconds, intensity, ambientTone, branchCondition, branchTargetStep } = req.body;
    if (!scriptId || !instruction?.trim()) return res.status(400).json({ message: "scriptId and instruction required" });
    const step = await storage.createScriptStep({
      scriptId,
      stepOrder: stepOrder || 1,
      instruction: instruction.trim(),
      durationSeconds: durationSeconds || 60,
      intensity: intensity || 5,
      ambientTone: ambientTone || null,
      branchCondition: branchCondition || null,
      branchTargetStep: branchTargetStep || null,
    });
    res.status(201).json(step);
  });

  app.put("/api/script-steps/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existingStep = await storage.getScriptStepById(req.params.id);
    if (!existingStep) return res.status(404).json({ message: "Not found" });
    const parentScript = await storage.getSceneScriptById(existingStep.scriptId);
    if (!parentScript || parentScript.creatorId !== user.id) return res.status(403).json({ message: "Not authorized" });
    const step = await storage.updateScriptStep(req.params.id, req.body);
    if (!step) return res.status(404).json({ message: "Not found" });
    res.json(step);
  });

  app.delete("/api/script-steps/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existingStep = await storage.getScriptStepById(req.params.id);
    if (!existingStep) return res.status(404).json({ message: "Not found" });
    const parentScript = await storage.getSceneScriptById(existingStep.scriptId);
    if (!parentScript || parentScript.creatorId !== user.id) return res.status(403).json({ message: "Not authorized" });
    await storage.deleteScriptStep(req.params.id);
    res.json({ message: "Deleted" });
  });

  // --- INTERROGATION SESSIONS ---
  app.get("/api/interrogation-sessions", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getInterrogationSessions(user.id);
    res.json(list);
  });

  app.get("/api/interrogation-sessions/active", requireAuth, async (req, res) => {
    const user = req.user as User;
    const active = await storage.getActiveInterrogationSession(user.id);
    res.json(active);
  });

  app.post("/api/interrogation-sessions", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { subjectId, title, totalQuestions, autoConsequence, consequencePerWrong, timeLimitPerQuestion, questions } = req.body;
    if (!title?.trim() || !subjectId) return res.status(400).json({ message: "Title and subjectId required" });
    const session = await storage.createInterrogationSession({
      inquisitorId: user.id,
      subjectId,
      title: title.trim(),
      totalQuestions: totalQuestions || (questions?.length || 0),
      autoConsequence: autoConsequence !== undefined ? autoConsequence : true,
      consequencePerWrong: consequencePerWrong || null,
      timeLimitPerQuestion: timeLimitPerQuestion || 30,
    });
    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (q.question?.trim()) {
          await storage.createInterrogationQuestion({
            sessionId: session.id,
            questionOrder: i,
            question: q.question.trim(),
            expectedAnswer: q.expectedAnswer || null,
          });
        }
      }
    }
    await storage.updateInterrogationSession(session.id, { status: "active", startedAt: new Date() });
    await storage.logActivity(user.id, "interrogation_created", title.trim(), user.role);
    await notifyUser(subjectId, `You are being interrogated: "${title.trim()}"`, "alert", user.role);
    const updated = await storage.updateInterrogationSession(session.id, { status: "active" });
    sendToUser(subjectId, "interrogation-started", { sessionId: session.id, title: title.trim() });
    res.status(201).json(updated || session);
  });

  app.put("/api/interrogation-sessions/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getInterrogationSessionById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.inquisitorId !== user.id && existing.subjectId !== user.id) return res.status(403).json({ message: "Forbidden" });
    const allowed: Partial<typeof existing> = {};
    if (req.body.status === "cancelled" && existing.inquisitorId === user.id) allowed.status = "cancelled";
    const session = await storage.updateInterrogationSession(req.params.id, allowed);
    res.json(session);
  });

  app.put("/api/interrogation-sessions/:id/submit-answers", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getInterrogationSessionById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.subjectId !== user.id) return res.status(403).json({ message: "Only the subject can submit answers" });
    const session = await storage.updateInterrogationSession(req.params.id, { status: "answered" });
    if (!session) return res.status(404).json({ message: "Not found" });
    await notifyUser(session.inquisitorId, `Interrogation "${session.title}" answers submitted — ready for grading`, "alert", user.role);
    sendToUser(session.inquisitorId, "interrogation-answered", { sessionId: session.id });
    res.json(session);
  });

  app.put("/api/interrogation-sessions/:id/grade", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getInterrogationSessionById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.inquisitorId !== user.id) return res.status(403).json({ message: "Only the inquisitor can grade" });
    const { grades } = req.body;
    if (!grades || !Array.isArray(grades)) return res.status(400).json({ message: "grades array required" });
    const sessionQuestions = await storage.getInterrogationQuestions(req.params.id);
    const sessionQuestionIds = new Set(sessionQuestions.map(q => q.id));
    for (const g of grades) {
      if (!sessionQuestionIds.has(g.questionId)) continue;
      await storage.updateInterrogationQuestion(g.questionId, { correct: g.correct });
    }
    const questions = await storage.getInterrogationQuestions(req.params.id);
    const correctCount = questions.filter(q => q.correct === true).length;
    const total = questions.length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const session = await storage.updateInterrogationSession(req.params.id, {
      status: "graded",
      correctAnswers: correctCount,
      score,
      completedAt: new Date(),
    });
    if (!session) return res.status(404).json({ message: "Not found" });
    await notifyUser(session.subjectId, `Interrogation "${session.title}" graded — Score: ${score}%`, "alert", "dom");
    sendToUser(session.subjectId, "interrogation-graded", { sessionId: session.id, score });
    res.json({ session, questions });
  });

  // --- INTERROGATION QUESTIONS ---
  app.get("/api/interrogation-sessions/:sessionId/questions", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getInterrogationSessionById(req.params.sessionId);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.inquisitorId !== user.id && existing.subjectId !== user.id) return res.status(403).json({ message: "Forbidden" });
    const questions = await storage.getInterrogationQuestions(req.params.sessionId);
    res.json(questions);
  });

  app.post("/api/interrogation-questions", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { sessionId, questionOrder, question, expectedAnswer } = req.body;
    if (!sessionId || !question?.trim()) return res.status(400).json({ message: "sessionId and question required" });
    const existing = await storage.getInterrogationSessionById(sessionId);
    if (!existing) return res.status(404).json({ message: "Session not found" });
    if (existing.inquisitorId !== user.id) return res.status(403).json({ message: "Only the inquisitor can add questions" });
    const q = await storage.createInterrogationQuestion({
      sessionId,
      questionOrder: questionOrder || 1,
      question: question.trim(),
      expectedAnswer: expectedAnswer || null,
    });
    res.status(201).json(q);
  });

  app.put("/api/interrogation-questions/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const question = await storage.updateInterrogationQuestion(req.params.id, {});
    if (!question) return res.status(404).json({ message: "Not found" });
    const existing = await storage.getInterrogationSessionById(question.sessionId);
    if (!existing) return res.status(404).json({ message: "Session not found" });
    if (existing.subjectId !== user.id && existing.inquisitorId !== user.id) return res.status(403).json({ message: "Forbidden" });
    const allowed: any = {};
    if (existing.subjectId === user.id) {
      if (req.body.actualAnswer !== undefined) allowed.actualAnswer = req.body.actualAnswer;
      if (req.body.answeredInSeconds !== undefined) allowed.answeredInSeconds = req.body.answeredInSeconds;
    }
    if (existing.inquisitorId === user.id) {
      if (req.body.correct !== undefined) allowed.correct = req.body.correct;
      if (req.body.question !== undefined) allowed.question = req.body.question;
      if (req.body.expectedAnswer !== undefined) allowed.expectedAnswer = req.body.expectedAnswer;
    }
    const updated = await storage.updateInterrogationQuestion(req.params.id, allowed);
    res.json(updated);
  });

  // --- AFTERCARE ITEMS ---
  app.get("/api/aftercare/:sessionId", requireAuth, async (req, res) => {
    const user = req.user as User;
    const session = await storage.getPlaySessionById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: "Play session not found" });
    if (session.userId !== user.id && session.partnerId !== user.id) {
      return res.status(403).json({ message: "Not authorized to view aftercare for this session" });
    }
    const items = await storage.getAftercareItems(req.params.sessionId);
    res.json(items);
  });

  app.post("/api/aftercare", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { sessionId, type, label } = req.body;
    if (!sessionId || !label?.trim()) return res.status(400).json({ message: "sessionId and label required" });
    const session = await storage.getPlaySessionById(sessionId);
    if (!session) return res.status(404).json({ message: "Play session not found" });
    if (session.userId !== user.id && session.partnerId !== user.id) {
      return res.status(403).json({ message: "Not authorized to add aftercare for this session" });
    }
    const item = await storage.createAftercareItem({
      sessionId,
      userId: user.id,
      type: type || "custom",
      label: label.trim(),
    });
    res.status(201).json(item);
  });

  app.put("/api/aftercare/:id", requireAuth, async (req, res) => {
    const user = req.user as User;
    const existing = await storage.getAftercareItemById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== user.id) return res.status(403).json({ message: "Not authorized" });
    const item = await storage.updateAftercareItem(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  // --- PLAY SESSIONS LIVE ---
  app.get("/api/play-sessions/active-live", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const allSessions = await storage.getPlaySessionsForPair(userIds);
    const liveSession = allSessions.find(s => s.isLive && s.status === "active");
    res.json(liveSession || null);
  });

  app.post("/api/play-sessions/start-live", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (user.role !== "dom") {
      return res.status(403).json({ message: "Only the Dom can start a live session" });
    }
    const partner = await storage.getPartner(user.id);
    const session = await storage.createPlaySession({
      userId: user.id,
      partnerId: partner?.id,
      title: "Live Session",
      status: "active",
      isLive: true,
      currentPhase: "warmup",
      currentIntensity: 5,
      createdAsRole: user.role,
    });
    await storage.logActivity(user.id, "live_session_started", "Live Session started", user.role);
    if (partner) {
      await notifyUser(partner.id, "Your partner has started a Live Session. Join now!", "live_session");
      sendToUser(partner.id, "live-session-started", { sessionId: session.id });
    }
    res.status(201).json(session);
  });

  app.put("/api/play-sessions/:id/live", requireAuth, async (req, res) => {
    const user = req.user as User;
    const partner = await storage.getPartner(user.id);
    const userIds = partner ? [user.id, partner.id] : [user.id];
    const allSessions = await storage.getPlaySessionsForPair(userIds);
    const existing = allSessions.find(s => s.id === req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    const { currentInstruction, currentIntensity, currentPhase, isLive, status } = req.body;
    const data: any = {};
    if (currentInstruction !== undefined) data.currentInstruction = currentInstruction;
    if (currentIntensity !== undefined) data.currentIntensity = currentIntensity;
    if (currentPhase !== undefined) data.currentPhase = currentPhase;
    if (isLive !== undefined) data.isLive = isLive;
    if (status !== undefined) data.status = status;
    const session = await storage.updatePlaySession(req.params.id, data);
    if (!session) return res.status(404).json({ message: "Not found" });
    if (partner) {
      if (status === "completed" || isLive === false) {
        await notifyUser(partner.id, "The Live Session has ended.", "live_session_ended");
        sendToUser(partner.id, "live-session-ended", { sessionId: req.params.id });
      } else {
        sendToUser(partner.id, "live-session-updated", { sessionId: req.params.id, ...data });
      }
    }
    res.json(session);
  });

  // --- RITUAL REMIND ---
  app.post("/api/rituals/:id/remind", requireAuth, async (req, res) => {
    const user = req.user as User;
    const ritualList = await storage.getRituals(user.id);
    const ritual = ritualList.find(r => r.id === req.params.id);
    if (!ritual) return res.status(404).json({ message: "Ritual not found" });
    const targetUserId = ritual.userId;
    await sendPushToUser(targetUserId, "Ritual Reminder", `Don't forget: ${ritual.title}`, "ritual_reminder");
    await notifyUser(targetUserId, `Reminder: ${ritual.title}`, "alert", user.role);
    res.json({ message: "Reminder sent" });
  });

  // --- AUTO-DOM SIMULATION ---
  app.get("/api/simulation/active", requireAuth, async (req, res) => {
    const user = req.user as User;
    const sim = await storage.getActiveSimulation(user.id);
    res.json(sim || null);
  });

  app.post("/api/simulation/activate", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (!user.partnerId) return res.status(400).json({ message: "You must be paired to activate a simulation" });

    const { level, mode } = req.body;
    if (!level || level < 1 || level > 10) return res.status(400).json({ message: "Level must be between 1 and 10" });
    if (!["dom-sub", "switch", "sub-dom"].includes(mode)) return res.status(400).json({ message: "Invalid mode" });

    const existing = await storage.getActiveSimulation(user.id);
    if (existing) return res.status(400).json({ message: "A simulation is already active. Deactivate it first." });

    const sim = await storage.createSimulation({
      userId: user.id,
      partnerId: user.partnerId,
      level,
      mode,
    });

    const summary = await generateSimulation(user.id, user.partnerId, level, mode, sim.id, storage);

    await storage.updateSimulationGeneratedItems(sim.id, summary);

    await storage.logActivity(user.id, "simulation_activated", `Activated Auto-Dom Level ${level} (${mode})`, user.role);

    const partner = await storage.getPartner(user.id);
    if (partner) {
      await notifyUser(partner.id, `Auto-Dom Level ${level} has been activated (${mode} mode)`, "simulation", user.role);
      sendToUser(partner.id, "simulation-activated", { simulationId: sim.id, level, mode });
      await sendPushToUser(partner.id, "Auto-Dom Activated", `Level ${level} simulation is now active in ${mode} mode`, "simulation");
    }
    sendToUser(user.id, "simulation-activated", { simulationId: sim.id, level, mode });

    const finalSim = await storage.getActiveSimulation(user.id);
    res.json(finalSim);
  });

  app.post("/api/simulation/deactivate", requireAuth, async (req, res) => {
    const user = req.user as User;
    const sim = await storage.getActiveSimulation(user.id);
    if (!sim) return res.status(404).json({ message: "No active simulation found" });

    await storage.deactivateSimulationItems(sim.id);
    const deactivated = await storage.deactivateSimulation(sim.id);

    await storage.logActivity(user.id, "simulation_deactivated", `Deactivated Auto-Dom Level ${sim.level}`, user.role);

    if (user.partnerId) {
      const partner = await storage.getPartner(user.id);
      if (partner) {
        await notifyUser(partner.id, `Auto-Dom simulation has been deactivated`, "simulation", user.role);
        sendToUser(partner.id, "simulation-deactivated", { simulationId: sim.id });
        await sendPushToUser(partner.id, "Auto-Dom Deactivated", "The simulation has been turned off", "simulation");
      }
    }
    sendToUser(user.id, "simulation-deactivated", { simulationId: sim.id });

    res.json(deactivated);
  });

  return httpServer;
}
