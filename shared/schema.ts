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
