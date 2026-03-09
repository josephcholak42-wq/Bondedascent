import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").notNull().default("sub"),
  originalRole: text("original_role").notNull().default("sub"),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  partnerId: varchar("partner_id"),
  lockedDown: boolean("locked_down").notNull().default(false),
  enforcementLevel: integer("enforcement_level").notNull().default(1),
  stickerBalance: integer("sticker_balance").notNull().default(0),
  profilePic: text("profile_pic"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  assignedBy: varchar("assigned_by"),
  text: text("text").notNull(),
  done: boolean("done").notNull().default(false),
  simulationId: varchar("simulation_id"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const checkIns = pgTable("check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  mood: integer("mood").notNull(),
  obedience: integer("obedience").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  xpAwarded: integer("xp_awarded").default(0),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dares = pgTable("dares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  text: text("text").notNull(),
  completed: boolean("completed").notNull().default(false),
  simulationId: varchar("simulation_id"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category"),
  duration: text("duration"),
  unlocked: boolean("unlocked").notNull().default(false),
  unlockLevel: integer("unlock_level").notNull().default(1),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const punishments = pgTable("punishments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  assignedBy: varchar("assigned_by"),
  name: text("name").notNull(),
  category: text("category"),
  duration: text("duration"),
  status: text("status").notNull().default("active"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  isShared: boolean("is_shared").notNull().default(false),
  unlockCost: integer("unlock_cost").notNull().default(50),
  unlockedBy: varchar("unlocked_by"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  text: text("text").notNull(),
  type: text("type").notNull().default("info"),
  read: boolean("read").notNull().default(false),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(),
  detail: text("detail"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pairCodes = pgTable("pair_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  userId: varchar("user_id").notNull(),
  used: boolean("used").notNull().default(false),
  usedBy: varchar("used_by"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rituals = pgTable("rituals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  assignedBy: varchar("assigned_by"),
  title: text("title").notNull(),
  description: text("description"),
  frequency: text("frequency").notNull().default("daily"),
  timeOfDay: text("time_of_day"),
  active: boolean("active").notNull().default(true),
  lastCompleted: timestamp("last_completed"),
  reminderEnabled: boolean("reminder_enabled").notNull().default(true),
  simulationId: varchar("simulation_id"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const limits = pgTable("limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().default("general"),
  level: text("level").notNull().default("soft"),
  description: text("description"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const secrets = pgTable("secrets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  forUserId: varchar("for_user_id"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tier: text("tier").notNull().default("common"),
  revealed: boolean("revealed").notNull().default(false),
  xpCost: integer("xp_cost").notNull().default(25),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wagers = pgTable("wagers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  partnerId: varchar("partner_id"),
  title: text("title").notNull(),
  description: text("description"),
  stakes: text("stakes"),
  status: text("status").notNull().default("active"),
  winnerId: varchar("winner_id"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  ratedUserId: varchar("rated_user_id").notNull(),
  overall: integer("overall").notNull(),
  communication: integer("communication"),
  obedience: integer("obedience_rating"),
  effort: integer("effort"),
  notes: text("notes"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const countdownEvents = pgTable("countdown_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetDate: timestamp("target_date").notNull(),
  category: text("category").notNull().default("special"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const standingOrders = pgTable("standing_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  assignedBy: varchar("assigned_by"),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("standard"),
  active: boolean("active").notNull().default(true),
  simulationId: varchar("simulation_id"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const permissionRequests = pgTable("permission_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  reviewedBy: varchar("reviewed_by"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const devotions = pgTable("devotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull().default("affirmation"),
  content: text("content").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conflicts = pgTable("conflicts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  partnerId: varchar("partner_id"),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("open"),
  resolution: text("resolution"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const desiredChanges = pgTable("desired_changes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  targetUserId: varchar("target_user_id"),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("behavior"),
  status: text("status").notNull().default("active"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  tier: text("tier").notNull().default("bronze"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const playSessions = pgTable("play_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  partnerId: varchar("partner_id"),
  title: text("title"),
  notes: text("notes"),
  mood: text("mood"),
  intensity: integer("intensity"),
  duration: integer("duration"),
  activities: text("activities").array(),
  status: text("status").notNull().default("planned"),
  scheduledFor: timestamp("scheduled_for"),
  completedAt: timestamp("completed_at"),
  currentInstruction: text("current_instruction"),
  currentIntensity: integer("current_intensity"),
  currentPhase: text("current_phase"),
  isLive: boolean("is_live").notNull().default(false),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
  originalRole: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  text: true,
  userId: true,
  assignedBy: true,
  createdAsRole: true,
});

export const insertCheckInSchema = createInsertSchema(checkIns).pick({
  userId: true,
  mood: true,
  obedience: true,
  notes: true,
  createdAsRole: true,
});

export const insertJournalSchema = createInsertSchema(journalEntries).pick({
  userId: true,
  content: true,
  isShared: true,
  unlockCost: true,
  createdAsRole: true,
});

export const insertRewardSchema = createInsertSchema(rewards).pick({
  userId: true,
  name: true,
  category: true,
  duration: true,
  unlockLevel: true,
  createdAsRole: true,
});

export const insertPunishmentSchema = createInsertSchema(punishments).pick({
  userId: true,
  assignedBy: true,
  name: true,
  category: true,
  duration: true,
  createdAsRole: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  text: true,
  type: true,
  createdAsRole: true,
});

export const insertRitualSchema = createInsertSchema(rituals).pick({
  userId: true,
  assignedBy: true,
  title: true,
  description: true,
  frequency: true,
  timeOfDay: true,
  createdAsRole: true,
});

export const insertLimitSchema = createInsertSchema(limits).pick({
  userId: true,
  name: true,
  category: true,
  level: true,
  description: true,
  createdAsRole: true,
});

export const insertSecretSchema = createInsertSchema(secrets).pick({
  userId: true,
  forUserId: true,
  title: true,
  content: true,
  tier: true,
  createdAsRole: true,
});

export const insertWagerSchema = createInsertSchema(wagers).pick({
  userId: true,
  partnerId: true,
  title: true,
  description: true,
  stakes: true,
  createdAsRole: true,
});

export const insertRatingSchema = createInsertSchema(ratings).pick({
  userId: true,
  ratedUserId: true,
  overall: true,
  communication: true,
  obedience: true,
  effort: true,
  notes: true,
  createdAsRole: true,
});

export const insertCountdownEventSchema = createInsertSchema(countdownEvents).pick({
  userId: true,
  title: true,
  description: true,
  targetDate: true,
  category: true,
  createdAsRole: true,
});

export const insertStandingOrderSchema = createInsertSchema(standingOrders).pick({
  userId: true,
  assignedBy: true,
  title: true,
  description: true,
  priority: true,
  createdAsRole: true,
});

export const insertPermissionRequestSchema = createInsertSchema(permissionRequests).pick({
  userId: true,
  title: true,
  description: true,
  createdAsRole: true,
});

export const insertDevotionSchema = createInsertSchema(devotions).pick({
  userId: true,
  type: true,
  content: true,
  createdAsRole: true,
});

export const insertConflictSchema = createInsertSchema(conflicts).pick({
  userId: true,
  partnerId: true,
  title: true,
  description: true,
  createdAsRole: true,
});

export const insertDesiredChangeSchema = createInsertSchema(desiredChanges).pick({
  userId: true,
  targetUserId: true,
  title: true,
  description: true,
  category: true,
  createdAsRole: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  userId: true,
  name: true,
  description: true,
  icon: true,
  tier: true,
  createdAsRole: true,
});

export const insertPlaySessionSchema = createInsertSchema(playSessions).pick({
  userId: true,
  partnerId: true,
  title: true,
  notes: true,
  mood: true,
  intensity: true,
  activities: true,
  status: true,
  scheduledFor: true,
  createdAsRole: true,
  isLive: true,
  currentPhase: true,
  currentIntensity: true,
  currentInstruction: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type Dare = typeof dares.$inferSelect;
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Punishment = typeof punishments.$inferSelect;
export type InsertPunishment = z.infer<typeof insertPunishmentSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournal = z.infer<typeof insertJournalSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type ActivityLogEntry = typeof activityLog.$inferSelect;
export type PairCode = typeof pairCodes.$inferSelect;
export type Ritual = typeof rituals.$inferSelect;
export type InsertRitual = z.infer<typeof insertRitualSchema>;
export type Limit = typeof limits.$inferSelect;
export type InsertLimit = z.infer<typeof insertLimitSchema>;
export type Secret = typeof secrets.$inferSelect;
export type InsertSecret = z.infer<typeof insertSecretSchema>;
export type Wager = typeof wagers.$inferSelect;
export type InsertWager = z.infer<typeof insertWagerSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type CountdownEvent = typeof countdownEvents.$inferSelect;
export type InsertCountdownEvent = z.infer<typeof insertCountdownEventSchema>;
export type StandingOrder = typeof standingOrders.$inferSelect;
export type InsertStandingOrder = z.infer<typeof insertStandingOrderSchema>;
export type PermissionRequest = typeof permissionRequests.$inferSelect;
export type InsertPermissionRequest = z.infer<typeof insertPermissionRequestSchema>;
export type Devotion = typeof devotions.$inferSelect;
export type InsertDevotion = z.infer<typeof insertDevotionSchema>;
export type Conflict = typeof conflicts.$inferSelect;
export type InsertConflict = z.infer<typeof insertConflictSchema>;
export type DesiredChange = typeof desiredChanges.$inferSelect;
export type InsertDesiredChange = z.infer<typeof insertDesiredChangeSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type PlaySession = typeof playSessions.$inferSelect;
export type InsertPlaySession = z.infer<typeof insertPlaySessionSchema>;

export const accusations = pgTable("accusations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id").notNull(),
  accusation: text("accusation").notNull(),
  response: text("response"),
  status: text("status").notNull().default("pending"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAccusationSchema = createInsertSchema(accusations).omit({ id: true, createdAt: true, response: true, status: true });
export type Accusation = typeof accusations.$inferSelect;
export type InsertAccusation = z.infer<typeof insertAccusationSchema>;

export const demandTimers = pgTable("demand_timers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id").notNull(),
  message: text("message").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  responded: boolean("responded").notNull().default(false),
  createdAsRole: text("created_as_role").notNull().default("dom"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quickCommands = pgTable("quick_commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id").notNull(),
  message: text("message").notNull(),
  acknowledged: boolean("acknowledged").notNull().default(false),
  createdAsRole: text("created_as_role").notNull().default("dom"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const presenceHeartbeats = pgTable("presence_heartbeats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDemandTimerSchema = createInsertSchema(demandTimers).omit({ id: true, createdAt: true, responded: true });
export const insertQuickCommandSchema = createInsertSchema(quickCommands).omit({ id: true, createdAt: true, acknowledged: true });

export type DemandTimer = typeof demandTimers.$inferSelect;
export type InsertDemandTimer = z.infer<typeof insertDemandTimerSchema>;
export type QuickCommand = typeof quickCommands.$inferSelect;
export type InsertQuickCommand = z.infer<typeof insertQuickCommandSchema>;
export type PresenceHeartbeat = typeof presenceHeartbeats.$inferSelect;

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({ id: true, createdAt: true });
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;

export const intensitySessions = pgTable("intensity_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  partnerId: varchar("partner_id").notNull(),
  currentTier: integer("current_tier").notNull().default(1),
  maxTierReached: integer("max_tier_reached").notNull().default(1),
  status: text("status").notNull().default("active"),
  durationSeconds: integer("duration_seconds").default(0),
  notes: text("notes"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertIntensitySessionSchema = createInsertSchema(intensitySessions).omit({ id: true, createdAt: true, completedAt: true, durationSeconds: true, maxTierReached: true });
export type IntensitySession = typeof intensitySessions.$inferSelect;
export type InsertIntensitySession = z.infer<typeof insertIntensitySessionSchema>;

export const obedienceTrials = pgTable("obedience_trials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  partnerId: varchar("partner_id").notNull(),
  title: text("title").notNull(),
  timeLimitSeconds: integer("time_limit_seconds").notNull().default(600),
  status: text("status").notNull().default("pending"),
  score: integer("score").default(0),
  totalSteps: integer("total_steps").notNull().default(0),
  completedSteps: integer("completed_steps").notNull().default(0),
  autoReward: text("auto_reward"),
  autoPunishment: text("auto_punishment"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trialSteps = pgTable("trial_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trialId: varchar("trial_id").notNull(),
  stepOrder: integer("step_order").notNull(),
  instruction: text("instruction").notNull(),
  status: text("status").notNull().default("pending"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertObedienceTrialSchema = createInsertSchema(obedienceTrials).omit({ id: true, createdAt: true, completedAt: true, startedAt: true, score: true, completedSteps: true });
export type ObedienceTrial = typeof obedienceTrials.$inferSelect;
export type InsertObedienceTrial = z.infer<typeof insertObedienceTrialSchema>;

export const insertTrialStepSchema = createInsertSchema(trialSteps).omit({ id: true, createdAt: true, completedAt: true });
export type TrialStep = typeof trialSteps.$inferSelect;
export type InsertTrialStep = z.infer<typeof insertTrialStepSchema>;

export const sensationCards = pgTable("sensation_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  intensity: integer("intensity").notNull().default(3),
  cardType: text("card_type").notNull().default("normal"),
  durationMinutes: integer("duration_minutes"),
  active: boolean("active").notNull().default(true),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sensationSpins = pgTable("sensation_spins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  cardId: varchar("card_id").notNull(),
  result: text("result").notNull(),
  cardType: text("card_type").notNull().default("normal"),
  xpAwarded: integer("xp_awarded").notNull().default(0),
  streakCount: integer("streak_count").notNull().default(1),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSensationCardSchema = createInsertSchema(sensationCards).omit({ id: true, createdAt: true, active: true });
export type SensationCard = typeof sensationCards.$inferSelect;
export type InsertSensationCard = z.infer<typeof insertSensationCardSchema>;

export const insertSensationSpinSchema = createInsertSchema(sensationSpins).omit({ id: true, createdAt: true, completed: true, xpAwarded: true, streakCount: true });
export type SensationSpin = typeof sensationSpins.$inferSelect;
export type InsertSensationSpin = z.infer<typeof insertSensationSpinSchema>;

export const sealedOrders = pgTable("sealed_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  targetUserId: varchar("target_user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  unlockAt: timestamp("unlock_at").notNull(),
  chainOrder: integer("chain_order"),
  previousOrderId: varchar("previous_order_id"),
  revealed: boolean("revealed").notNull().default(false),
  completed: boolean("completed").notNull().default(false),
  emergencyUnsealed: boolean("emergency_unsealed").notNull().default(false),
  xpCost: integer("xp_cost").notNull().default(25),
  createdAsRole: text("created_as_role").notNull().default("dom"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSealedOrderSchema = createInsertSchema(sealedOrders).omit({ id: true, createdAt: true, revealed: true, completed: true, emergencyUnsealed: true });
export type SealedOrder = typeof sealedOrders.$inferSelect;
export type InsertSealedOrder = z.infer<typeof insertSealedOrderSchema>;

export const enduranceChallenges = pgTable("endurance_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  targetUserId: varchar("target_user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  durationHours: integer("duration_hours").notNull(),
  checkinIntervalMinutes: integer("checkin_interval_minutes").notNull().default(60),
  status: text("status").notNull().default("active"),
  totalCheckins: integer("total_checkins").notNull().default(0),
  completedCheckins: integer("completed_checkins").notNull().default(0),
  missedCheckins: integer("missed_checkins").notNull().default(0),
  xpPerCheckin: integer("xp_per_checkin").notNull().default(15),
  autoPunishment: text("auto_punishment"),
  startedAt: timestamp("started_at").defaultNow(),
  endsAt: timestamp("ends_at").notNull(),
  completedAt: timestamp("completed_at"),
  createdAsRole: text("created_as_role").notNull().default("dom"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const enduranceCheckins = pgTable("endurance_checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull(),
  userId: varchar("user_id").notNull(),
  gateNumber: integer("gate_number").notNull(),
  status: text("status").notNull().default("completed"),
  xpAwarded: integer("xp_awarded").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEnduranceChallengeSchema = createInsertSchema(enduranceChallenges).omit({ id: true, createdAt: true, completedAt: true, totalCheckins: true, completedCheckins: true, missedCheckins: true });
export type EnduranceChallenge = typeof enduranceChallenges.$inferSelect;
export type InsertEnduranceChallenge = z.infer<typeof insertEnduranceChallengeSchema>;

export const insertEnduranceCheckinSchema = createInsertSchema(enduranceCheckins).omit({ id: true, createdAt: true, xpAwarded: true });
export type EnduranceCheckin = typeof enduranceCheckins.$inferSelect;
export type InsertEnduranceCheckin = z.infer<typeof insertEnduranceCheckinSchema>;

export const media = pgTable("media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  entityType: text("entity_type"),
  entityId: varchar("entity_id"),
  isLocked: boolean("is_locked").notNull().default(false),
  unlockCost: integer("unlock_cost").notNull().default(100),
  unlockedBy: varchar("unlocked_by"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaSchema = createInsertSchema(media).omit({ id: true, createdAt: true });
export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

export const stickers = pgTable("stickers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull(),
  recipientId: varchar("recipient_id").notNull(),
  stickerType: varchar("sticker_type").notNull(),
  message: text("message"),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStickerSchema = createInsertSchema(stickers).omit({ id: true, createdAt: true });
export type Sticker = typeof stickers.$inferSelect;
export type InsertSticker = z.infer<typeof insertStickerSchema>;

export const featureSettings = pgTable("feature_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pairOwnerId: varchar("pair_owner_id").notNull(),
  featureKey: text("feature_key").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFeatureSettingSchema = createInsertSchema(featureSettings).omit({ id: true, updatedAt: true });
export type FeatureSetting = typeof featureSettings.$inferSelect;
export type InsertFeatureSetting = z.infer<typeof insertFeatureSettingSchema>;

export const bodyMapZones = pgTable("body_map_zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  partnerId: varchar("partner_id"),
  zoneName: text("zone_name").notNull(),
  status: text("status").notNull().default("desire"),
  intensity: integer("intensity").notNull().default(50),
  createdAsRole: text("created_as_role").notNull().default("sub"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBodyMapZoneSchema = createInsertSchema(bodyMapZones).omit({ id: true, createdAt: true, updatedAt: true });
export type BodyMapZone = typeof bodyMapZones.$inferSelect;
export type InsertBodyMapZone = z.infer<typeof insertBodyMapZoneSchema>;

export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull(),
  partnerId: varchar("partner_id"),
  title: text("title").notNull(),
  terms: text("terms"),
  limits: text("limits"),
  safeword: text("safeword"),
  duration: text("duration"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("draft"),
  signedByCreator: boolean("signed_by_creator").notNull().default(false),
  signedByPartner: boolean("signed_by_partner").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true, signedByCreator: true, signedByPartner: true, status: true });
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

export const confessions = pgTable("confessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  partnerId: varchar("partner_id"),
  content: text("content").notNull(),
  response: text("response"),
  respondedAt: timestamp("responded_at"),
  status: text("status").notNull().default("pending"),
  consequenceType: text("consequence_type"),
  consequenceId: varchar("consequence_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConfessionSchema = createInsertSchema(confessions).omit({ id: true, createdAt: true, response: true, respondedAt: true, status: true, consequenceType: true, consequenceId: true });
export type Confession = typeof confessions.$inferSelect;
export type InsertConfession = z.infer<typeof insertConfessionSchema>;

export const trainingPrograms = pgTable("training_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  durationDays: integer("duration_days").notNull().default(7),
  category: text("category"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTrainingProgramSchema = createInsertSchema(trainingPrograms).omit({ id: true, createdAt: true, status: true });
export type TrainingProgram = typeof trainingPrograms.$inferSelect;
export type InsertTrainingProgram = z.infer<typeof insertTrainingProgramSchema>;

export const trainingDays = pgTable("training_days", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull(),
  dayNumber: integer("day_number").notNull(),
  title: text("title").notNull(),
  objectives: text("objectives"),
  ritualIds: text("ritual_ids").array(),
  taskIds: text("task_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTrainingDaySchema = createInsertSchema(trainingDays).omit({ id: true, createdAt: true });
export type TrainingDay = typeof trainingDays.$inferSelect;
export type InsertTrainingDay = z.infer<typeof insertTrainingDaySchema>;

export const trainingEnrollments = pgTable("training_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull(),
  userId: varchar("user_id").notNull(),
  currentDay: integer("current_day").notNull().default(1),
  status: text("status").notNull().default("active"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertTrainingEnrollmentSchema = createInsertSchema(trainingEnrollments).omit({ id: true, completedAt: true, currentDay: true, status: true });
export type TrainingEnrollment = typeof trainingEnrollments.$inferSelect;
export type InsertTrainingEnrollment = z.infer<typeof insertTrainingEnrollmentSchema>;

export const sceneScripts = pgTable("scene_scripts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  estimatedDuration: integer("estimated_duration"),
  category: text("category"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSceneScriptSchema = createInsertSchema(sceneScripts).omit({ id: true, createdAt: true, status: true });
export type SceneScript = typeof sceneScripts.$inferSelect;
export type InsertSceneScript = z.infer<typeof insertSceneScriptSchema>;

export const scriptSteps = pgTable("script_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scriptId: varchar("script_id").notNull(),
  stepOrder: integer("step_order").notNull(),
  instruction: text("instruction").notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(60),
  intensity: integer("intensity").notNull().default(5),
  ambientTone: text("ambient_tone"),
  branchCondition: text("branch_condition"),
  branchTargetStep: integer("branch_target_step"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScriptStepSchema = createInsertSchema(scriptSteps).omit({ id: true, createdAt: true });
export type ScriptStep = typeof scriptSteps.$inferSelect;
export type InsertScriptStep = z.infer<typeof insertScriptStepSchema>;

export const interrogationSessions = pgTable("interrogation_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inquisitorId: varchar("inquisitor_id").notNull(),
  subjectId: varchar("subject_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("pending"),
  totalQuestions: integer("total_questions").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  autoConsequence: boolean("auto_consequence").notNull().default(true),
  consequencePerWrong: text("consequence_per_wrong"),
  timeLimitPerQuestion: integer("time_limit_per_question").notNull().default(30),
  score: integer("score").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInterrogationSessionSchema = createInsertSchema(interrogationSessions).omit({ id: true, createdAt: true, startedAt: true, completedAt: true, correctAnswers: true, score: true, status: true });
export type InterrogationSession = typeof interrogationSessions.$inferSelect;
export type InsertInterrogationSession = z.infer<typeof insertInterrogationSessionSchema>;

export const interrogationQuestions = pgTable("interrogation_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  questionOrder: integer("question_order").notNull(),
  question: text("question").notNull(),
  expectedAnswer: text("expected_answer"),
  actualAnswer: text("actual_answer"),
  correct: boolean("correct"),
  answeredInSeconds: integer("answered_in_seconds"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInterrogationQuestionSchema = createInsertSchema(interrogationQuestions).omit({ id: true, createdAt: true, actualAnswer: true, correct: true, answeredInSeconds: true });
export type InterrogationQuestion = typeof interrogationQuestions.$inferSelect;
export type InsertInterrogationQuestion = z.infer<typeof insertInterrogationQuestionSchema>;

export const aftercareItems = pgTable("aftercare_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull().default("custom"),
  label: text("label").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAftercareItemSchema = createInsertSchema(aftercareItems).omit({ id: true, createdAt: true, completed: true, completedAt: true });
export type AftercareItem = typeof aftercareItems.$inferSelect;
export type InsertAftercareItem = z.infer<typeof insertAftercareItemSchema>;

export const streaks = pgTable("streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  streakType: text("streak_type").notNull(),
  currentCount: integer("current_count").notNull().default(0),
  longestCount: integer("longest_count").notNull().default(0),
  lastCompletedDate: text("last_completed_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStreakSchema = createInsertSchema(streaks).omit({ id: true, createdAt: true, updatedAt: true, currentCount: true, longestCount: true, lastCompletedDate: true });
export type Streak = typeof streaks.$inferSelect;
export type InsertStreak = z.infer<typeof insertStreakSchema>;

export const simulations = pgTable("simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  partnerId: varchar("partner_id").notNull(),
  level: integer("level").notNull(),
  mode: text("mode").notNull().default("dom-sub"),
  active: boolean("active").notNull().default(true),
  generatedItems: jsonb("generated_items"),
  createdAt: timestamp("created_at").defaultNow(),
  deactivatedAt: timestamp("deactivated_at"),
});

export const insertSimulationSchema = createInsertSchema(simulations).omit({ id: true, createdAt: true, deactivatedAt: true, active: true });
export type Simulation = typeof simulations.$inferSelect;
export type InsertSimulation = z.infer<typeof insertSimulationSchema>;
