import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { type User } from "@shared/schema";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

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
    const { text, targetUserId } = req.body;
    if (!text) return res.status(400).json({ message: "Task text required" });

    const task = await storage.createTask({
      text,
      userId: targetUserId || user.id,
      assignedBy: user.id,
    });

    await storage.logActivity(user.id, "task_created", text);
    res.status(201).json(task);
  });

  app.patch("/api/tasks/:id/toggle", requireAuth, async (req, res) => {
    const user = req.user as User;
    const task = await storage.toggleTask(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.done) {
      const newXp = Math.min((user.xp || 0) + 5, 100 * (user.level || 1));
      await storage.updateUserXp(user.id, newXp);
      await storage.logActivity(user.id, "task_completed", task.text);
      await storage.createNotification({ userId: user.id, text: `Completed: ${task.text} (+5 XP)`, type: "info" });
    }

    res.json(task);
  });

  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    await storage.deleteTask(req.params.id);
    res.json({ message: "Deleted" });
  });

  // --- CHECK-INS ---
  app.get("/api/checkins", requireAuth, async (req, res) => {
    const user = req.user as User;
    const list = await storage.getCheckIns(user.id);
    res.json(list);
  });

  app.get("/api/checkins/pending", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { userId } = req.query;
    const list = await storage.getPendingCheckIns((userId as string) || user.id);
    res.json(list);
  });

  app.post("/api/checkins", requireAuth, async (req, res) => {
    const user = req.user as User;
    const { mood, obedience, notes } = req.body;
    const checkIn = await storage.createCheckIn({ userId: user.id, mood, obedience, notes });
    await storage.logActivity(user.id, "checkin_submitted", `Mood: ${mood}, Obedience: ${obedience}`);
    await storage.createNotification({ userId: user.id, text: "Check-in submitted successfully", type: "info" });

    const newXp = Math.min((user.xp || 0) + 15, 100 * (user.level || 1));
    await storage.updateUserXp(user.id, newXp);

    res.status(201).json(checkIn);
  });

  app.patch("/api/checkins/:id/review", requireAuth, async (req, res) => {
    const { status, xpAwarded } = req.body;
    const checkIn = await storage.reviewCheckIn(req.params.id, status, xpAwarded || 0);
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
    const dare = await storage.completeDare(req.params.id);
    if (!dare) return res.status(404).json({ message: "Dare not found" });
    const newXp = Math.min((user.xp || 0) + 10, 100 * (user.level || 1));
    await storage.updateUserXp(user.id, newXp);
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
    const { name, unlockLevel, targetUserId } = req.body;
    if (!name) return res.status(400).json({ message: "Reward name required" });
    const reward = await storage.createReward({ userId: targetUserId || user.id, name, unlockLevel: unlockLevel || 1 });
    res.status(201).json(reward);
  });

  app.patch("/api/rewards/:id/toggle", requireAuth, async (req, res) => {
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
    const { name, targetUserId } = req.body;
    if (!name) return res.status(400).json({ message: "Punishment name required" });
    const punishment = await storage.createPunishment({
      userId: targetUserId || user.id,
      assignedBy: user.id,
      name,
    });
    await storage.logActivity(user.id, "punishment_assigned", name);
    await storage.createNotification({ userId: targetUserId || user.id, text: `Punishment assigned: ${name}`, type: "alert" });
    res.status(201).json(punishment);
  });

  app.patch("/api/punishments/:id/status", requireAuth, async (req, res) => {
    const { status } = req.body;
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
    if (!content) return res.status(400).json({ message: "Journal content required" });
    const entry = await storage.createJournalEntry({ userId: user.id, content });
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
    const taskList = await storage.getTasks(user.id);
    const completedTasks = taskList.filter(t => t.done).length;
    const totalTasks = taskList.length;
    const checkInList = await storage.getCheckIns(user.id);
    const journalList = await storage.getJournalEntries(user.id);
    const dareList = await storage.getDares(user.id);
    const completedDares = dareList.filter(d => d.completed).length;

    res.json({
      xp: user.xp,
      level: user.level,
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

  return httpServer;
}
