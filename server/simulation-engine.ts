import { db } from "./db";
import { tasks, rituals, standingOrders, dares } from "@shared/schema";
import type { IStorage } from "./storage";

const DOM_DUTY_TEMPLATES = [
  "Review partner's journal entry and provide feedback",
  "Rate partner's obedience on a scale of 1–10",
  "Inspect all completed tasks for quality and thoroughness",
  "Issue a correction or punishment for any infractions",
  "Set a new dare for partner to complete today",
  "Review partner's check-in submissions",
  "Write a performance summary for the day",
  "Assign a surprise task to test obedience",
  "Conduct an evening debrief session",
  "Plan tomorrow's full schedule for partner",
  "Evaluate partner's posture and presentation standards",
  "Create a new standing order based on recent behavior",
  "Review and approve partner's permission requests",
  "Design a new ritual for partner's routine",
  "Send a midday check-in command",
];

const SUB_DUTY_TEMPLATES = [
  "Morning check-in: report mood, energy level, and obedience commitment",
  "Complete assigned workout or physical activity routine",
  "Write a reflective journal entry about today's growth",
  "Practice a devotion ritual with full focus",
  "Complete a personal improvement task",
  "Maintain posture and presentation standards throughout the day",
  "Prepare a detailed evening report for review",
  "Follow standing hygiene and grooming protocol",
  "Complete a dare with photo or written proof",
  "Write a gratitude list acknowledging guidance received",
  "Practice a mindfulness or meditation exercise",
  "Organize and clean a designated area",
  "Review and memorize current standing orders",
  "Send a midday status update without being prompted",
  "Complete an act of service without being asked",
];

const DOM_RITUAL_TEMPLATES = [
  { title: "Daily Review Schedule", description: "Review partner's daily performance and provide structured feedback", frequency: "daily", timeOfDay: "evening" },
  { title: "Weekly Performance Audit", description: "Conduct a thorough weekly review of obedience metrics and progress", frequency: "weekly", timeOfDay: "evening" },
  { title: "Enforcement Check", description: "Verify all standing orders are being followed and address violations", frequency: "daily", timeOfDay: "afternoon" },
  { title: "Morning Command Brief", description: "Issue daily priorities and expectations at the start of each day", frequency: "daily", timeOfDay: "morning" },
  { title: "Midday Inspection", description: "Check in on task progress and make adjustments to the day's schedule", frequency: "daily", timeOfDay: "afternoon" },
  { title: "Evening Discipline Review", description: "Assess the day's behavior and determine any needed corrections", frequency: "daily", timeOfDay: "evening" },
  { title: "Hourly Status Demand", description: "Require hourly status updates on all assigned activities", frequency: "daily", timeOfDay: "all-day" },
  { title: "Protocol Compliance Sweep", description: "Comprehensive check of all active protocols and standing orders", frequency: "daily", timeOfDay: "afternoon" },
];

const SUB_RITUAL_TEMPLATES = [
  { title: "Morning Protocol", description: "Complete morning greeting, posture check, and daily affirmation", frequency: "daily", timeOfDay: "morning" },
  { title: "Midday Check-In", description: "Submit a midday status update with mood and task progress", frequency: "daily", timeOfDay: "afternoon" },
  { title: "Evening Reflection", description: "Write a structured reflection on obedience, growth, and gratitude", frequency: "daily", timeOfDay: "evening" },
  { title: "Bedtime Routine", description: "Complete end-of-day protocol: report, gratitude list, and permission to rest", frequency: "daily", timeOfDay: "night" },
  { title: "Hourly Position Check", description: "Report current position, activity, and compliance status every hour", frequency: "daily", timeOfDay: "all-day" },
  { title: "Devotion Practice", description: "Spend dedicated time on assigned devotion or affirmation exercise", frequency: "daily", timeOfDay: "morning" },
  { title: "Service Act", description: "Perform a proactive act of service and document it", frequency: "daily", timeOfDay: "afternoon" },
  { title: "Gratitude Meditation", description: "5-minute guided gratitude meditation focused on dynamic", frequency: "daily", timeOfDay: "evening" },
];

const DOM_STANDING_ORDER_TEMPLATES = [
  { title: "Communication Protocol", description: "All messages must be respectful, prompt, and begin with proper address", priority: "high" },
  { title: "Response Time Requirement", description: "All commands must be acknowledged within 5 minutes", priority: "high" },
  { title: "Daily Minimum Tasks", description: "A minimum of 3 tasks must be completed each day", priority: "standard" },
  { title: "Journaling Requirement", description: "One journal entry must be submitted daily before bedtime", priority: "standard" },
  { title: "Posture Standard", description: "Maintain proper posture during all check-ins and interactions", priority: "standard" },
  { title: "Permission Protocol", description: "Certain activities require explicit permission before proceeding", priority: "high" },
  { title: "Dress Code Enforcement", description: "Follow assigned dress code or presentation standards at all times", priority: "standard" },
  { title: "Digital Curfew", description: "No recreational screen time after designated curfew hour", priority: "standard" },
];

const SUB_STANDING_ORDER_TEMPLATES = [
  { title: "Always Respond Promptly", description: "Acknowledge all messages and commands within 5 minutes", priority: "high" },
  { title: "Daily Journal Submission", description: "Submit a journal entry every day before bedtime", priority: "standard" },
  { title: "Maintain Presentation", description: "Keep personal presentation to agreed-upon standards at all times", priority: "standard" },
  { title: "Task Completion Report", description: "Report when each task is completed with brief summary", priority: "standard" },
  { title: "Respectful Communication", description: "Use proper address and respectful tone in all interactions", priority: "high" },
  { title: "Gratitude Expression", description: "Express genuine gratitude at least once daily", priority: "standard" },
  { title: "Permission Before Changes", description: "Request permission before making changes to routine or schedule", priority: "high" },
  { title: "Hydration and Self-Care", description: "Drink adequate water and follow self-care protocol", priority: "standard" },
];

const DOM_DARE_TEMPLATES = [
  "Challenge partner to complete a task within a strict time limit",
  "Dare partner to write a detailed confession about a hidden desire",
  "Challenge partner to maintain a specific posture for 30 minutes",
  "Dare partner to learn and recite all current standing orders from memory",
  "Challenge partner to complete an act of service they've never done before",
];

const SUB_DARE_TEMPLATES = [
  "Complete a surprise act of service and document it with proof",
  "Write a detailed letter of devotion and submit it for review",
  "Maintain perfect posture for one full hour and report back",
  "Complete three tasks in a row without any reminders",
  "Go an entire day following every standing order perfectly",
];

interface IntensityConfig {
  tasks: number;
  rituals: number;
  standingOrders: number;
  dares: number;
}

function getIntensityConfig(level: number): IntensityConfig {
  if (level <= 2) return { tasks: 2, rituals: 1, standingOrders: 1, dares: 0 };
  if (level <= 4) return { tasks: 4, rituals: 2, standingOrders: 2, dares: 1 };
  if (level <= 6) return { tasks: 6, rituals: 3, standingOrders: 3, dares: 2 };
  if (level <= 8) return { tasks: 9, rituals: 5, standingOrders: 4, dares: 3 };
  return { tasks: 12, rituals: 7, standingOrders: 6, dares: 5 };
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

interface RoleLaneSummary {
  tasks: number;
  rituals: number;
  standingOrders: number;
  dares: number;
}

interface UserSummary {
  dom?: RoleLaneSummary;
  sub?: RoleLaneSummary;
}

interface SimulationSummary {
  userA: UserSummary;
  userB: UserSummary;
}

async function generateRoleLane(
  userId: string,
  role: "dom" | "sub",
  config: IntensityConfig,
  simulationId: string,
): Promise<RoleLaneSummary> {
  const taskTemplates = role === "dom" ? DOM_DUTY_TEMPLATES : SUB_DUTY_TEMPLATES;
  const ritualTemplates = role === "dom" ? DOM_RITUAL_TEMPLATES : SUB_RITUAL_TEMPLATES;
  const orderTemplates = role === "dom" ? DOM_STANDING_ORDER_TEMPLATES : SUB_STANDING_ORDER_TEMPLATES;
  const dareTemplates = role === "dom" ? DOM_DARE_TEMPLATES : SUB_DARE_TEMPLATES;

  const selectedTasks = pickRandom(taskTemplates, config.tasks);
  const selectedRituals = pickRandom(ritualTemplates, config.rituals);
  const selectedOrders = pickRandom(orderTemplates, config.standingOrders);
  const selectedDares = pickRandom(dareTemplates, config.dares);

  if (selectedTasks.length > 0) {
    await db.insert(tasks).values(
      selectedTasks.map((text) => ({
        userId,
        text,
        createdAsRole: role,
        simulationId,
      }))
    );
  }

  if (selectedRituals.length > 0) {
    await db.insert(rituals).values(
      selectedRituals.map((r) => ({
        userId,
        title: r.title,
        description: r.description,
        frequency: r.frequency,
        timeOfDay: r.timeOfDay,
        createdAsRole: role,
        simulationId,
      }))
    );
  }

  if (selectedOrders.length > 0) {
    await db.insert(standingOrders).values(
      selectedOrders.map((o) => ({
        userId,
        title: o.title,
        description: o.description,
        priority: o.priority,
        createdAsRole: role,
        simulationId,
      }))
    );
  }

  if (selectedDares.length > 0) {
    await db.insert(dares).values(
      selectedDares.map((text) => ({
        userId,
        text,
        createdAsRole: role,
        simulationId,
      }))
    );
  }

  return {
    tasks: selectedTasks.length,
    rituals: selectedRituals.length,
    standingOrders: selectedOrders.length,
    dares: selectedDares.length,
  };
}

export async function generateSimulation(
  userId: string,
  partnerId: string,
  level: number,
  mode: "dom-sub" | "switch" | "sub-dom",
  simulationId: string,
  _storage: IStorage,
): Promise<SimulationSummary> {
  const config = getIntensityConfig(level);

  const summary: SimulationSummary = {
    userA: {},
    userB: {},
  };

  if (mode === "dom-sub") {
    summary.userA.dom = await generateRoleLane(userId, "dom", config, simulationId);
    summary.userB.sub = await generateRoleLane(partnerId, "sub", config, simulationId);
  } else if (mode === "sub-dom") {
    summary.userA.sub = await generateRoleLane(userId, "sub", config, simulationId);
    summary.userB.dom = await generateRoleLane(partnerId, "dom", config, simulationId);
  } else if (mode === "switch") {
    summary.userA.dom = await generateRoleLane(userId, "dom", config, simulationId);
    summary.userA.sub = await generateRoleLane(userId, "sub", config, simulationId);
    summary.userB.dom = await generateRoleLane(partnerId, "dom", config, simulationId);
    summary.userB.sub = await generateRoleLane(partnerId, "sub", config, simulationId);
  }

  return summary;
}

export function getEstimatedCounts(level: number, mode: "dom-sub" | "switch" | "sub-dom") {
  const config = getIntensityConfig(level);

  const laneSummary = {
    tasks: config.tasks,
    rituals: config.rituals,
    standingOrders: config.standingOrders,
    dares: config.dares,
  };

  if (mode === "dom-sub") {
    return { userA: { dom: { ...laneSummary } }, userB: { sub: { ...laneSummary } } };
  } else if (mode === "sub-dom") {
    return { userA: { sub: { ...laneSummary } }, userB: { dom: { ...laneSummary } } };
  } else {
    return {
      userA: { dom: { ...laneSummary }, sub: { ...laneSummary } },
      userB: { dom: { ...laneSummary }, sub: { ...laneSummary } },
    };
  }
}
