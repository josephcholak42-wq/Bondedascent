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
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  partnerId: varchar("partner_id"),
  lockedDown: boolean("locked_down").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  assignedBy: varchar("assigned_by"),
  text: text("text").notNull(),
  done: boolean("done").notNull().default(false),
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const dares = pgTable("dares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  text: text("text").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  unlocked: boolean("unlocked").notNull().default(false),
  unlockLevel: integer("unlock_level").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const punishments = pgTable("punishments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  assignedBy: varchar("assigned_by"),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  text: text("text").notNull(),
  type: text("type").notNull().default("info"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(),
  detail: text("detail"),
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const limits = pgTable("limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().default("general"),
  level: text("level").notNull().default("soft"),
  description: text("description"),
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const countdownEvents = pgTable("countdown_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetDate: timestamp("target_date").notNull(),
  category: text("category").notNull().default("special"),
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const permissionRequests = pgTable("permission_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  reviewedBy: varchar("reviewed_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const devotions = pgTable("devotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull().default("affirmation"),
  content: text("content").notNull(),
  completed: boolean("completed").notNull().default(false),
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  tier: text("tier").notNull().default("bronze"),
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
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  text: true,
  userId: true,
  assignedBy: true,
});

export const insertCheckInSchema = createInsertSchema(checkIns).pick({
  userId: true,
  mood: true,
  obedience: true,
  notes: true,
});

export const insertJournalSchema = createInsertSchema(journalEntries).pick({
  userId: true,
  content: true,
});

export const insertRewardSchema = createInsertSchema(rewards).pick({
  userId: true,
  name: true,
  unlockLevel: true,
});

export const insertPunishmentSchema = createInsertSchema(punishments).pick({
  userId: true,
  assignedBy: true,
  name: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  text: true,
  type: true,
});

export const insertRitualSchema = createInsertSchema(rituals).pick({
  userId: true,
  assignedBy: true,
  title: true,
  description: true,
  frequency: true,
  timeOfDay: true,
});

export const insertLimitSchema = createInsertSchema(limits).pick({
  userId: true,
  name: true,
  category: true,
  level: true,
  description: true,
});

export const insertSecretSchema = createInsertSchema(secrets).pick({
  userId: true,
  forUserId: true,
  title: true,
  content: true,
  tier: true,
});

export const insertWagerSchema = createInsertSchema(wagers).pick({
  userId: true,
  partnerId: true,
  title: true,
  description: true,
  stakes: true,
});

export const insertRatingSchema = createInsertSchema(ratings).pick({
  userId: true,
  ratedUserId: true,
  overall: true,
  communication: true,
  obedience: true,
  effort: true,
  notes: true,
});

export const insertCountdownEventSchema = createInsertSchema(countdownEvents).pick({
  userId: true,
  title: true,
  description: true,
  targetDate: true,
  category: true,
});

export const insertStandingOrderSchema = createInsertSchema(standingOrders).pick({
  userId: true,
  assignedBy: true,
  title: true,
  description: true,
  priority: true,
});

export const insertPermissionRequestSchema = createInsertSchema(permissionRequests).pick({
  userId: true,
  title: true,
  description: true,
});

export const insertDevotionSchema = createInsertSchema(devotions).pick({
  userId: true,
  type: true,
  content: true,
});

export const insertConflictSchema = createInsertSchema(conflicts).pick({
  userId: true,
  partnerId: true,
  title: true,
  description: true,
});

export const insertDesiredChangeSchema = createInsertSchema(desiredChanges).pick({
  userId: true,
  targetUserId: true,
  title: true,
  description: true,
  category: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  userId: true,
  name: true,
  description: true,
  icon: true,
  tier: true,
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

export const demandTimers = pgTable("demand_timers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id").notNull(),
  message: text("message").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  responded: boolean("responded").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quickCommands = pgTable("quick_commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id").notNull(),
  message: text("message").notNull(),
  acknowledged: boolean("acknowledged").notNull().default(false),
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
