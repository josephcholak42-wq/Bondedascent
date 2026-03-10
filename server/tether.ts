import { storage } from "./storage";
import { sendPushToUser } from "./push";
import { sendToUser } from "./sse";

async function notifyUser(userId: string, text: string, type: string = "info", createdAsRole?: string) {
  await storage.createNotification({ userId, text, type, ...(createdAsRole ? { createdAsRole } : {}) });
  sendPushToUser(userId, "BondedAscent", text, type).catch(() => {});
  sendToUser(userId, "notification", { text, type });
}

async function checkStreakWarnings() {
  const allUsers = await storage.getAllUsers();
  const now = new Date();
  const hour = now.getHours();
  if (hour < 20 || hour > 23) return;

  const today = now.toISOString().split("T")[0];

  for (const user of allUsers) {
    if (!user.partnerId) continue;
    const prefs = await storage.getNotificationPreferences(user.id);
    if (prefs && !prefs.streakWarnings) continue;

    const userStreaks = await storage.getStreaks(user.id);
    for (const streak of userStreaks) {
      if (streak.lastCompletedDate !== today && streak.currentCount > 0) {
        await notifyUser(user.id, `Your ${streak.streakType.replace(/_/g, " ")} flame flickers — hours remain before it goes dark`, "streak_warning");
      }
    }
  }
}

async function checkSilenceDetector() {
  const allUsers = await storage.getAllUsers();
  const now = new Date();
  const hour = now.getHours();
  if (hour < 8 || hour > 23) return;

  for (const user of allUsers) {
    if (!user.partnerId) continue;
    const prefs = await storage.getNotificationPreferences(user.id);
    if (prefs && !prefs.silenceAlerts) continue;

    const partnerLog = await storage.getActivityLogForPair([user.partnerId]);
    if (partnerLog.length > 0) {
      const lastActivity = new Date(partnerLog[0].createdAt!);
      const hoursSince = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
      if (hoursSince >= 4) {
        await notifyUser(user.id, "The silence grows louder...", "silence");
      }
    }
  }
}

async function checkRitualBells() {
  const allUsers = await storage.getAllUsers();
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const today = now.toISOString().split("T")[0];

  for (const user of allUsers) {
    if (!user.partnerId) continue;

    const userRituals = await storage.getRitualsForPair([user.id, user.partnerId]);
    for (const ritual of userRituals) {
      if (!ritual.reminderEnabled || !ritual.timeOfDay) continue;
      if (ritual.userId !== user.id) continue;

      const [rHour, rMin] = ritual.timeOfDay.split(":").map(Number);
      const ritualMinutes = rHour * 60 + rMin;
      const currentMinutes = currentHour * 60 + currentMin;
      const diff = currentMinutes - ritualMinutes;

      const prefs = await storage.getNotificationPreferences(user.id);

      if (diff >= 0 && diff < 15) {
        if (!prefs || prefs.ritualBells) {
          await notifyUser(user.id, `The Bell tolls — ${ritual.title} awaits`, "ritual_bell");
        }
      }

      const graceMinutes = ritual.gracePeriodMinutes || 30;
      if (diff >= graceMinutes && diff < graceMinutes + 15) {
        const completions = await storage.getRitualCompletions(user.id, 1);
        const completedToday = completions.some(c => c.ritualId === ritual.id && c.date === today);
        if (!completedToday) {
          const updated = await storage.incrementRitualMiss(ritual.id);
          if (updated && updated.consecutiveMisses >= 3) {
            const partner = await storage.getUser(user.partnerId);
            if (partner && partner.role === "dom") {
              await storage.createPunishment({
                userId: user.id,
                assignedBy: partner.id,
                text: `Missed ritual: ${ritual.title} — 3 consecutive failures`,
                createdAsRole: "dom",
              });
              await notifyUser(partner.id, `${user.username} missed ${ritual.title} 3 times — punishment auto-assigned`, "ritual_miss", "dom");
            }
          }

          if (user.partnerId) {
            const partnerPrefs = await storage.getNotificationPreferences(user.partnerId);
            if (!partnerPrefs || partnerPrefs.missedRitualAlerts) {
              await notifyUser(user.partnerId, `${user.username} missed ${ritual.title}`, "ritual_miss");
            }
          }
        }
      }
    }
  }
}

async function checkWeeklyTribunal() {
  const now = new Date();
  if (now.getDay() !== 0 || now.getHours() !== 21) return;
  if (now.getMinutes() > 14) return;

  const allUsers = await storage.getAllUsers();
  const processedPairs = new Set<string>();

  for (const user of allUsers) {
    if (!user.partnerId || user.role !== "dom") continue;
    const pairKey = [user.id, user.partnerId].sort().join("-");
    if (processedPairs.has(pairKey)) continue;
    processedPairs.add(pairKey);

    const partner = await storage.getUser(user.partnerId);
    if (!partner) continue;

    const weekEnd = now.toISOString().split("T")[0];
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const existing = await storage.getCurrentTribunal(user.id);
    if (existing && existing.weekEndDate === weekEnd) continue;

    const pairIds = [user.id, partner.id];
    const tasks = await storage.getTasksForPair(pairIds);
    const weekTasks = tasks.filter(t => t.createdAt && new Date(t.createdAt) >= weekStart);
    const completedTasks = weekTasks.filter(t => t.done);

    const userStreaks = await storage.getStreaks(partner.id);
    const activeStreaks = userStreaks.filter(s => (s.currentCount || 0) > 0).length;
    const brokenStreaks = userStreaks.filter(s => (s.currentCount || 0) === 0 && (s.longestCount || 0) > 0).length;

    const ritualComps = await storage.getRitualCompletions(partner.id, 7);
    const userRituals = await storage.getRitualsForPair(pairIds);
    const ritualsCompleted = ritualComps.length;
    const ritualsMissed = userRituals.reduce((sum, r) => sum + Math.min(r.missedCount || 0, 7), 0);

    const punishments = await storage.getPunishmentsForPair(pairIds);
    const weekPunishments = punishments.filter(p => p.createdAt && new Date(p.createdAt) >= weekStart);
    const rewards = await storage.getRewardsForPair(pairIds);
    const weekRewards = rewards.filter(r => r.createdAt && new Date(r.createdAt) >= weekStart);

    const stats = {
      tasksTotal: weekTasks.length,
      tasksCompleted: completedTasks.length,
      taskCompletionRate: weekTasks.length > 0 ? Math.round((completedTasks.length / weekTasks.length) * 100) : 0,
      streaksMaintained: activeStreaks,
      streaksBroken: brokenStreaks,
      ritualsCompleted,
      ritualsMissed,
      punishmentsAssigned: weekPunishments.length,
      rewardsGranted: weekRewards.length,
      xpEarned: 0,
    };

    await storage.createTribunal({
      pairDomId: user.id,
      pairSubId: partner.id,
      weekStartDate: weekStartStr,
      weekEndDate: weekEnd,
      stats,
    });

    await notifyUser(user.id, "The Tribunal has convened — your weekly review awaits", "tribunal");
    await notifyUser(partner.id, "The Tribunal has convened — your weekly review awaits", "tribunal");
    sendToUser(user.id, "tribunal-convened", {});
    sendToUser(partner.id, "tribunal-convened", {});
  }
}

export async function runTetherChecks() {
  try {
    await checkStreakWarnings();
  } catch (e) { console.error("Tether: streak warning check failed", e); }
  try {
    await checkSilenceDetector();
  } catch (e) { console.error("Tether: silence detector failed", e); }
  try {
    await checkRitualBells();
  } catch (e) { console.error("Tether: ritual bell check failed", e); }
  try {
    await checkWeeklyTribunal();
  } catch (e) { console.error("Tether: weekly tribunal check failed", e); }
}

export function startTetherEngine() {
  console.log("Tether engine started — checking every 15 minutes");
  setInterval(() => {
    runTetherChecks().catch(e => console.error("Tether engine error:", e));
  }, 15 * 60 * 1000);
  setTimeout(() => runTetherChecks().catch(() => {}), 30000);
}
