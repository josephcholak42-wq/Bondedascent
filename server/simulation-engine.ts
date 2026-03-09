import { db } from "./db";
import {
  tasks, rituals, standingOrders, dares,
  punishments, rewards, wagers, devotions, sealedOrders,
  countdownEvents, enduranceChallenges, obedienceTrials, sensationCards,
  accusations, desiredChanges, confessions, aftercareItems, permissionRequests,
} from "@shared/schema";
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
  "Dare partner to go one full hour without using their phone",
  "Challenge partner to compose a formal letter of devotion in under 10 minutes",
  "Dare partner to follow a brand-new ritual perfectly on the first attempt",
];

const SUB_DARE_TEMPLATES = [
  "Complete a surprise act of service and document it with proof",
  "Write a detailed letter of devotion and submit it for review",
  "Maintain perfect posture for one full hour and report back",
  "Complete three tasks in a row without any reminders",
  "Go an entire day following every standing order perfectly",
  "Write a gratitude list of 20 items about your dynamic",
  "Perform a random act of service without any prompting",
  "Memorize and recite all active standing orders flawlessly",
];

const DOM_PUNISHMENT_TEMPLATES = [
  { name: "Written Lines", category: "discipline", duration: "30 minutes" },
  { name: "Reflection Essay", category: "written", duration: "1 hour" },
  { name: "Privilege Restriction", category: "restriction", duration: "24 hours" },
  { name: "Extra Service Tasks", category: "service", duration: "2 hours" },
  { name: "Kneeling Reflection", category: "position", duration: "15 minutes" },
  { name: "Device Restriction", category: "restriction", duration: "4 hours" },
  { name: "Early Bedtime", category: "schedule", duration: "1 day" },
  { name: "Corner Time", category: "position", duration: "20 minutes" },
  { name: "Apology Letter", category: "written", duration: "30 minutes" },
  { name: "Loss of Reward", category: "restriction", duration: "until earned back" },
];

const DOM_REWARD_TEMPLATES = [
  { name: "Extra Screen Time", category: "privilege" },
  { name: "Choice of Activity", category: "freedom" },
  { name: "Sleep In Permission", category: "schedule" },
  { name: "Special Praise Session", category: "attention" },
  { name: "Treat or Dessert", category: "treat" },
  { name: "Bath or Spa Time", category: "self-care" },
  { name: "Free Time Block", category: "freedom" },
  { name: "Sticker Reward", category: "recognition" },
  { name: "Skip a Chore", category: "privilege" },
  { name: "Date Night Choice", category: "experience" },
];

const WAGER_TEMPLATES = [
  { title: "Obedience Bet", description: "Wager on perfect obedience for 24 hours — loser does winner's chores", stakes: "Chore duty for a day" },
  { title: "Task Speed Race", description: "Who can complete 5 tasks faster? Loser writes an essay", stakes: "1000-word reflection essay" },
  { title: "Compliance Challenge", description: "Bet on maintaining perfect check-in compliance for a week", stakes: "Winner picks dinner for a week" },
  { title: "Ritual Streak", description: "Who can maintain a longer ritual streak without missing?", stakes: "Loser does an extra dare" },
  { title: "Posture Endurance", description: "Bet on who can maintain perfect posture longer during a session", stakes: "Winner gets a massage" },
  { title: "Silence Challenge", description: "First to break the silence protocol loses", stakes: "Loser writes 50 lines" },
];

const DOM_DEVOTION_TEMPLATES = [
  { type: "affirmation", content: "Write three things you appreciate about your partner's obedience today" },
  { type: "praise", content: "Compose a detailed praise message acknowledging specific improvements" },
  { type: "guidance", content: "Write a guiding letter outlining growth areas and encouragement" },
  { type: "acknowledgment", content: "List five moments where your partner exceeded expectations this week" },
];

const SUB_DEVOTION_TEMPLATES = [
  { type: "affirmation", content: "Write a morning affirmation expressing gratitude for guidance received" },
  { type: "service", content: "Document an act of service performed today and its meaning to you" },
  { type: "reflection", content: "Reflect on how today's protocols helped your personal growth" },
  { type: "gratitude", content: "Write a heartfelt gratitude letter for the structure in your life" },
  { type: "praise", content: "Express what you admire most about your partner's leadership today" },
  { type: "commitment", content: "Reaffirm your commitment by writing about what this dynamic means to you" },
  { type: "service", content: "Plan and document a surprise act of devotion for your partner" },
  { type: "reflection", content: "Write about a moment today where you felt most connected" },
];

const DOM_SEALED_ORDER_TEMPLATES = [
  { title: "Mystery Assignment", content: "Complete 10 pushups, write a gratitude list, then prepare a favorite drink for your partner" },
  { title: "Surprise Inspection", content: "Take a photo of your workspace — it must be perfectly organized" },
  { title: "Secret Service Task", content: "Plan a small surprise for your partner without them knowing" },
  { title: "Hidden Challenge", content: "Maintain complete silence for 30 minutes while completing all tasks" },
  { title: "Sealed Ritual", content: "Follow this exact sequence: 5 minutes meditation, write an affirmation, perform an act of service" },
  { title: "Covert Operation", content: "Without being asked, complete your partner's least favorite chore" },
  { title: "Time Capsule Order", content: "Write a letter to your future self about your growth in this dynamic" },
  { title: "Blind Obedience Test", content: "Follow the next three instructions given to you without question or hesitation" },
];

const COUNTDOWN_TEMPLATES = [
  { title: "Task Deadline", description: "Complete all assigned tasks before the countdown expires", category: "deadline" },
  { title: "Inspection Timer", description: "Prepare for inspection — everything must be perfect by this time", category: "inspection" },
  { title: "Reward Unlock", description: "Maintain compliance to unlock a special reward when timer ends", category: "reward" },
  { title: "Challenge Countdown", description: "Complete the endurance challenge before time runs out", category: "challenge" },
  { title: "Revelation Timer", description: "A sealed order will be revealed when this countdown reaches zero", category: "reveal" },
  { title: "Compliance Window", description: "Perfect obedience required during this time window", category: "compliance" },
];

const ENDURANCE_TEMPLATES = [
  { title: "Silence Endurance", description: "Maintain complete silence except when directly addressed", durationHours: 4, checkinIntervalMinutes: 60 },
  { title: "Posture Marathon", description: "Maintain perfect posture with hourly check-ins for proof", durationHours: 6, checkinIntervalMinutes: 60 },
  { title: "Focus Challenge", description: "No phone or social media — check in every 30 minutes to confirm", durationHours: 3, checkinIntervalMinutes: 30 },
  { title: "Service Marathon", description: "Complete continuous acts of service with regular documentation", durationHours: 8, checkinIntervalMinutes: 120 },
  { title: "Gratitude Endurance", description: "Write a new gratitude entry every hour for the duration", durationHours: 5, checkinIntervalMinutes: 60 },
  { title: "Obedience Watch", description: "Follow every standing order perfectly with no reminders needed", durationHours: 12, checkinIntervalMinutes: 120 },
];

const TRIAL_TEMPLATES = [
  { title: "Rapid Response Trial", timeLimitSeconds: 300, steps: ["Acknowledge this trial within 10 seconds", "List all active standing orders", "Write a 50-word devotion", "Complete a posture check photo", "Express gratitude in one sentence"] },
  { title: "Obedience Gauntlet", timeLimitSeconds: 600, steps: ["Drop everything and stand at attention", "Recite your daily affirmation", "Complete 20 pushups or stretches", "Write a brief compliance report", "Await further instructions silently"] },
  { title: "Discipline Check", timeLimitSeconds: 420, steps: ["Report current status immediately", "List three things you are grateful for", "Identify one area for improvement", "Propose a corrective action", "Submit for review"] },
  { title: "Speed Service", timeLimitSeconds: 480, steps: ["Clean your immediate area", "Prepare something for your partner", "Document what you did with proof", "Write a reflection on service"] },
  { title: "Memory Test", timeLimitSeconds: 360, steps: ["List all current rituals from memory", "Name three recent standing orders", "Describe your last punishment and lesson learned", "State your current compliance streak"] },
  { title: "Devotion Sprint", timeLimitSeconds: 300, steps: ["Write an affirmation of commitment", "List five things you admire about your partner", "Describe your growth this week", "Make a promise for tomorrow"] },
];

const SENSATION_CARD_TEMPLATES = [
  { label: "Light Touch", description: "Gentle sensory exploration with light fingertip contact", intensity: 2, cardType: "normal", durationMinutes: 10 },
  { label: "Temperature Play", description: "Alternate warm and cool sensations on safe areas", intensity: 4, cardType: "normal", durationMinutes: 15 },
  { label: "Blindfold Focus", description: "Remove visual sense to heighten other sensory awareness", intensity: 5, cardType: "challenge", durationMinutes: 20 },
  { label: "Texture Exploration", description: "Use different textures — silk, cotton, leather — for varied sensation", intensity: 3, cardType: "normal", durationMinutes: 15 },
  { label: "Pressure Points", description: "Firm pressure on shoulders, hands, and feet for grounding", intensity: 4, cardType: "normal", durationMinutes: 10 },
  { label: "Breath Focus", description: "Synchronized breathing exercise with partner for deep connection", intensity: 2, cardType: "bonding", durationMinutes: 10 },
  { label: "Sensation Roulette", description: "Random selection of sensation types — spin and discover", intensity: 6, cardType: "challenge", durationMinutes: 20 },
  { label: "Edge Awareness", description: "Focused awareness on physical and emotional boundaries", intensity: 7, cardType: "challenge", durationMinutes: 15 },
];

const ACCUSATION_TEMPLATES = [
  { accusation: "You failed to complete your morning ritual on time" },
  { accusation: "Your check-in response was insufficient and lacked detail" },
  { accusation: "You did not follow the standing order regarding communication protocol" },
  { accusation: "Your task completion quality was below the expected standard" },
  { accusation: "You were observed breaking the digital curfew protocol" },
  { accusation: "Your posture was not maintained during the last interaction" },
];

const DESIRED_CHANGE_TEMPLATES = [
  { title: "Improve Response Time", description: "Consistently respond to all messages within the required timeframe", category: "communication" },
  { title: "Better Task Quality", description: "Pay more attention to detail when completing assigned tasks", category: "performance" },
  { title: "Deeper Reflections", description: "Write more thoughtful and detailed journal entries", category: "reflection" },
  { title: "Consistent Ritual Practice", description: "Complete all rituals on time without reminders", category: "discipline" },
  { title: "Proactive Service", description: "Initiate acts of service without being prompted", category: "initiative" },
  { title: "Emotional Openness", description: "Share feelings more openly during check-ins and reflections", category: "communication" },
];

const CONFESSION_TEMPLATES = [
  { content: "I need to confess that I did not fully complete a task today and covered it up" },
  { content: "I broke a standing order when I thought no one was paying attention" },
  { content: "I have been feeling resistant to a ritual but have not communicated this" },
  { content: "I skipped part of my evening reflection because I was tired" },
  { content: "I did not follow the communication protocol exactly as required today" },
];

const AFTERCARE_TEMPLATES = [
  { type: "hydration", label: "Drink a full glass of water" },
  { type: "comfort", label: "Wrap in a soft blanket or comfortable clothing" },
  { type: "connection", label: "Share how you are feeling with your partner" },
  { type: "physical", label: "Gentle stretching or body scan for tension" },
  { type: "emotional", label: "Express one thing you appreciated about this session" },
  { type: "grounding", label: "Name 5 things you can see, 4 you can hear, 3 you can touch" },
  { type: "nourishment", label: "Have a light snack or warm drink" },
  { type: "rest", label: "Take 10 minutes of quiet rest with no obligations" },
];

const PERMISSION_REQUEST_TEMPLATES = [
  { title: "Schedule Change Request", description: "Requesting permission to adjust daily routine timing" },
  { title: "Activity Permission", description: "Requesting permission to engage in a recreational activity" },
  { title: "Social Outing Request", description: "Requesting permission to go out with friends" },
  { title: "Purchase Permission", description: "Requesting permission to make a discretionary purchase" },
  { title: "Bedtime Extension", description: "Requesting permission to stay up past the usual curfew" },
];

interface IntensityConfig {
  tasks: number;
  rituals: number;
  standingOrders: number;
  dares: number;
  punishments: number;
  rewards: number;
  wagers: number;
  devotions: number;
  sealedOrders: number;
  countdownEvents: number;
  enduranceChallenges: number;
  obedienceTrials: number;
  sensationCards: number;
  accusations: number;
  desiredChanges: number;
  confessions: number;
  aftercareItems: number;
  permissionRequests: number;
}

function getIntensityConfig(level: number): IntensityConfig {
  if (level <= 2) return {
    tasks: 2, rituals: 1, standingOrders: 1, dares: 0,
    punishments: 0, rewards: 1, wagers: 0, devotions: 1, sealedOrders: 0,
    countdownEvents: 0, enduranceChallenges: 0, obedienceTrials: 0, sensationCards: 0,
    accusations: 0, desiredChanges: 1, confessions: 0, aftercareItems: 2, permissionRequests: 1,
  };
  if (level <= 4) return {
    tasks: 4, rituals: 2, standingOrders: 2, dares: 1,
    punishments: 1, rewards: 2, wagers: 1, devotions: 2, sealedOrders: 1,
    countdownEvents: 1, enduranceChallenges: 0, obedienceTrials: 0, sensationCards: 2,
    accusations: 0, desiredChanges: 2, confessions: 1, aftercareItems: 3, permissionRequests: 2,
  };
  if (level <= 6) return {
    tasks: 6, rituals: 3, standingOrders: 3, dares: 2,
    punishments: 2, rewards: 3, wagers: 2, devotions: 3, sealedOrders: 2,
    countdownEvents: 2, enduranceChallenges: 1, obedienceTrials: 1, sensationCards: 3,
    accusations: 1, desiredChanges: 3, confessions: 2, aftercareItems: 4, permissionRequests: 3,
  };
  if (level <= 8) return {
    tasks: 9, rituals: 5, standingOrders: 4, dares: 3,
    punishments: 3, rewards: 4, wagers: 3, devotions: 4, sealedOrders: 3,
    countdownEvents: 3, enduranceChallenges: 2, obedienceTrials: 2, sensationCards: 4,
    accusations: 2, desiredChanges: 4, confessions: 3, aftercareItems: 5, permissionRequests: 3,
  };
  return {
    tasks: 12, rituals: 7, standingOrders: 6, dares: 5,
    punishments: 5, rewards: 5, wagers: 4, devotions: 5, sealedOrders: 4,
    countdownEvents: 4, enduranceChallenges: 3, obedienceTrials: 3, sensationCards: 5,
    accusations: 3, desiredChanges: 5, confessions: 4, aftercareItems: 6, permissionRequests: 4,
  };
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
  punishments: number;
  rewards: number;
  wagers: number;
  devotions: number;
  sealedOrders: number;
  countdownEvents: number;
  enduranceChallenges: number;
  obedienceTrials: number;
  sensationCards: number;
  accusations: number;
  desiredChanges: number;
  confessions: number;
  aftercareItems: number;
  permissionRequests: number;
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
  partnerId: string,
  role: "dom" | "sub",
  config: IntensityConfig,
  simulationId: string,
): Promise<RoleLaneSummary> {
  const taskTemplates = role === "dom" ? DOM_DUTY_TEMPLATES : SUB_DUTY_TEMPLATES;
  const ritualTemplates = role === "dom" ? DOM_RITUAL_TEMPLATES : SUB_RITUAL_TEMPLATES;
  const orderTemplates = role === "dom" ? DOM_STANDING_ORDER_TEMPLATES : SUB_STANDING_ORDER_TEMPLATES;
  const dareTemplates = role === "dom" ? DOM_DARE_TEMPLATES : SUB_DARE_TEMPLATES;
  const devotionTemplates = role === "dom" ? DOM_DEVOTION_TEMPLATES : SUB_DEVOTION_TEMPLATES;

  const selectedTasks = pickRandom(taskTemplates, config.tasks);
  const selectedRituals = pickRandom(ritualTemplates, config.rituals);
  const selectedOrders = pickRandom(orderTemplates, config.standingOrders);
  const selectedDares = pickRandom(dareTemplates, config.dares);
  const selectedPunishments = role === "dom" ? pickRandom(DOM_PUNISHMENT_TEMPLATES, config.punishments) : [];
  const selectedRewards = role === "dom" ? pickRandom(DOM_REWARD_TEMPLATES, config.rewards) : [];
  const selectedWagers = pickRandom(WAGER_TEMPLATES, config.wagers);
  const selectedDevotions = pickRandom(devotionTemplates, config.devotions);
  const selectedSealedOrders = role === "dom" ? pickRandom(DOM_SEALED_ORDER_TEMPLATES, config.sealedOrders) : [];
  const selectedCountdowns = pickRandom(COUNTDOWN_TEMPLATES, config.countdownEvents);
  const selectedEndurance = pickRandom(ENDURANCE_TEMPLATES, config.enduranceChallenges);
  const selectedTrials = pickRandom(TRIAL_TEMPLATES, config.obedienceTrials);
  const selectedSensation = pickRandom(SENSATION_CARD_TEMPLATES, config.sensationCards);
  const selectedAccusations = role === "dom" ? pickRandom(ACCUSATION_TEMPLATES, config.accusations) : [];
  const selectedDesiredChanges = pickRandom(DESIRED_CHANGE_TEMPLATES, config.desiredChanges);
  const selectedConfessions = role === "sub" ? pickRandom(CONFESSION_TEMPLATES, config.confessions) : [];
  const selectedAftercare = pickRandom(AFTERCARE_TEMPLATES, config.aftercareItems);
  const selectedPermissions = role === "sub" ? pickRandom(PERMISSION_REQUEST_TEMPLATES, config.permissionRequests) : [];

  if (selectedTasks.length > 0) {
    await db.insert(tasks).values(
      selectedTasks.map((text) => ({ userId, text, createdAsRole: role, simulationId }))
    );
  }

  if (selectedRituals.length > 0) {
    await db.insert(rituals).values(
      selectedRituals.map((r) => ({ userId, title: r.title, description: r.description, frequency: r.frequency, timeOfDay: r.timeOfDay, createdAsRole: role, simulationId }))
    );
  }

  if (selectedOrders.length > 0) {
    await db.insert(standingOrders).values(
      selectedOrders.map((o) => ({ userId, title: o.title, description: o.description, priority: o.priority, createdAsRole: role, simulationId }))
    );
  }

  if (selectedDares.length > 0) {
    await db.insert(dares).values(
      selectedDares.map((text) => ({ userId, text, createdAsRole: role, simulationId }))
    );
  }

  if (selectedPunishments.length > 0) {
    await db.insert(punishments).values(
      selectedPunishments.map((p) => ({ userId, name: p.name, category: p.category, duration: p.duration, simulationId, createdAsRole: role }))
    );
  }

  if (selectedRewards.length > 0) {
    await db.insert(rewards).values(
      selectedRewards.map((r) => ({ userId: partnerId, name: r.name, category: r.category, simulationId, createdAsRole: "sub" as const }))
    );
  }

  if (selectedWagers.length > 0) {
    await db.insert(wagers).values(
      selectedWagers.map((w) => ({ userId, partnerId, title: w.title, description: w.description, stakes: w.stakes, simulationId, createdAsRole: role }))
    );
  }

  if (selectedDevotions.length > 0) {
    await db.insert(devotions).values(
      selectedDevotions.map((d) => ({ userId, type: d.type, content: d.content, simulationId, createdAsRole: role }))
    );
  }

  if (selectedSealedOrders.length > 0) {
    const unlockAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.insert(sealedOrders).values(
      selectedSealedOrders.map((s) => ({ userId, targetUserId: partnerId, title: s.title, content: s.content, unlockAt, simulationId, createdAsRole: role }))
    );
  }

  if (selectedCountdowns.length > 0) {
    const targetDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.insert(countdownEvents).values(
      selectedCountdowns.map((c) => ({ userId, title: c.title, description: c.description, targetDate, category: c.category, simulationId, createdAsRole: role }))
    );
  }

  if (selectedEndurance.length > 0) {
    await db.insert(enduranceChallenges).values(
      selectedEndurance.map((e) => ({
        userId, targetUserId: partnerId, title: e.title, description: e.description,
        durationHours: e.durationHours, checkinIntervalMinutes: e.checkinIntervalMinutes,
        endsAt: new Date(Date.now() + e.durationHours * 60 * 60 * 1000),
        simulationId, createdAsRole: role,
      }))
    );
  }

  if (selectedTrials.length > 0) {
    for (const trial of selectedTrials) {
      const [inserted] = await db.insert(obedienceTrials).values({
        userId: partnerId, partnerId: userId, title: trial.title,
        timeLimitSeconds: trial.timeLimitSeconds, totalSteps: trial.steps.length,
        simulationId, createdAsRole: role,
      }).returning();
      if (inserted) {
        const { trialSteps: trialStepsTable } = await import("@shared/schema");
        await db.insert(trialStepsTable).values(
          trial.steps.map((instruction, idx) => ({
            trialId: inserted.id, stepOrder: idx + 1, instruction,
          }))
        );
      }
    }
  }

  if (selectedSensation.length > 0) {
    await db.insert(sensationCards).values(
      selectedSensation.map((s) => ({
        userId, label: s.label, description: s.description, intensity: s.intensity,
        cardType: s.cardType, durationMinutes: s.durationMinutes, simulationId, createdAsRole: role,
      }))
    );
  }

  if (selectedAccusations.length > 0) {
    await db.insert(accusations).values(
      selectedAccusations.map((a) => ({
        fromUserId: userId, toUserId: partnerId, accusation: a.accusation,
        simulationId, createdAsRole: role,
      }))
    );
  }

  if (selectedDesiredChanges.length > 0) {
    await db.insert(desiredChanges).values(
      selectedDesiredChanges.map((d) => ({
        userId, targetUserId: partnerId, title: d.title, description: d.description,
        category: d.category, simulationId, createdAsRole: role,
      }))
    );
  }

  if (selectedConfessions.length > 0) {
    await db.insert(confessions).values(
      selectedConfessions.map((c) => ({
        userId, partnerId, content: c.content, simulationId,
      }))
    );
  }

  if (selectedAftercare.length > 0) {
    await db.insert(aftercareItems).values(
      selectedAftercare.map((a) => ({
        sessionId: `sim-${simulationId}`, userId, type: a.type, label: a.label, simulationId,
      }))
    );
  }

  if (selectedPermissions.length > 0) {
    await db.insert(permissionRequests).values(
      selectedPermissions.map((p) => ({
        userId, title: p.title, description: p.description, simulationId, createdAsRole: role,
      }))
    );
  }

  return {
    tasks: selectedTasks.length,
    rituals: selectedRituals.length,
    standingOrders: selectedOrders.length,
    dares: selectedDares.length,
    punishments: selectedPunishments.length,
    rewards: selectedRewards.length,
    wagers: selectedWagers.length,
    devotions: selectedDevotions.length,
    sealedOrders: selectedSealedOrders.length,
    countdownEvents: selectedCountdowns.length,
    enduranceChallenges: selectedEndurance.length,
    obedienceTrials: selectedTrials.length,
    sensationCards: selectedSensation.length,
    accusations: selectedAccusations.length,
    desiredChanges: selectedDesiredChanges.length,
    confessions: selectedConfessions.length,
    aftercareItems: selectedAftercare.length,
    permissionRequests: selectedPermissions.length,
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
    summary.userA.dom = await generateRoleLane(userId, partnerId, "dom", config, simulationId);
    summary.userB.sub = await generateRoleLane(partnerId, userId, "sub", config, simulationId);
  } else if (mode === "sub-dom") {
    summary.userA.sub = await generateRoleLane(userId, partnerId, "sub", config, simulationId);
    summary.userB.dom = await generateRoleLane(partnerId, userId, "dom", config, simulationId);
  } else if (mode === "switch") {
    summary.userA.dom = await generateRoleLane(userId, partnerId, "dom", config, simulationId);
    summary.userA.sub = await generateRoleLane(userId, partnerId, "sub", config, simulationId);
    summary.userB.dom = await generateRoleLane(partnerId, userId, "dom", config, simulationId);
    summary.userB.sub = await generateRoleLane(partnerId, userId, "sub", config, simulationId);
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
    punishments: config.punishments,
    rewards: config.rewards,
    wagers: config.wagers,
    devotions: config.devotions,
    sealedOrders: config.sealedOrders,
    countdownEvents: config.countdownEvents,
    enduranceChallenges: config.enduranceChallenges,
    obedienceTrials: config.obedienceTrials,
    sensationCards: config.sensationCards,
    accusations: config.accusations,
    desiredChanges: config.desiredChanges,
    confessions: config.confessions,
    aftercareItems: config.aftercareItems,
    permissionRequests: config.permissionRequests,
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
