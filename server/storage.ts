import { eq, desc, and } from "drizzle-orm";
import { db } from "./db";
import {
  users, tasks, checkIns, dares, rewards, punishments,
  journalEntries, notifications, activityLog,
  type User, type InsertUser, type Task, type InsertTask,
  type CheckIn, type InsertCheckIn, type Reward, type InsertReward,
  type Punishment, type InsertPunishment, type JournalEntry,
  type InsertJournal, type Notification, type InsertNotification,
  type ActivityLogEntry, type Dare,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserXp(userId: string, xp: number): Promise<User | undefined>;
  updateUserLevel(userId: string, level: number): Promise<User | undefined>;
  updateUserRole(userId: string, role: string): Promise<User | undefined>;

  getTasks(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  toggleTask(taskId: string): Promise<Task | undefined>;
  deleteTask(taskId: string): Promise<void>;

  getCheckIns(userId: string): Promise<CheckIn[]>;
  getPendingCheckIns(userId: string): Promise<CheckIn[]>;
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  reviewCheckIn(checkInId: string, status: string, xpAwarded: number): Promise<CheckIn | undefined>;

  getDares(userId: string): Promise<Dare[]>;
  createDare(userId: string, text: string): Promise<Dare>;
  completeDare(dareId: string): Promise<Dare | undefined>;

  getRewards(userId: string): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  toggleReward(rewardId: string): Promise<Reward | undefined>;

  getPunishments(userId: string): Promise<Punishment[]>;
  createPunishment(punishment: InsertPunishment): Promise<Punishment>;
  updatePunishmentStatus(punishmentId: string, status: string): Promise<Punishment | undefined>;

  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournal): Promise<JournalEntry>;

  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  dismissNotification(notificationId: string): Promise<void>;

  getActivityLog(userId: string): Promise<ActivityLogEntry[]>;
  logActivity(userId: string, action: string, detail?: string): Promise<ActivityLogEntry>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserXp(userId: string, xp: number): Promise<User | undefined> {
    const [user] = await db.update(users).set({ xp }).where(eq(users.id, userId)).returning();
    return user;
  }

  async updateUserLevel(userId: string, level: number): Promise<User | undefined> {
    const [user] = await db.update(users).set({ level }).where(eq(users.id, userId)).returning();
    return user;
  }

  async updateUserRole(userId: string, role: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ role }).where(eq(users.id, userId)).returning();
    return user;
  }

  async getTasks(userId: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async toggleTask(taskId: string): Promise<Task | undefined> {
    const [existing] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!existing) return undefined;
    const [updated] = await db.update(tasks).set({ done: !existing.done }).where(eq(tasks.id, taskId)).returning();
    return updated;
  }

  async deleteTask(taskId: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, taskId));
  }

  async getCheckIns(userId: string): Promise<CheckIn[]> {
    return db.select().from(checkIns).where(eq(checkIns.userId, userId)).orderBy(desc(checkIns.createdAt));
  }

  async getPendingCheckIns(userId: string): Promise<CheckIn[]> {
    return db.select().from(checkIns).where(and(eq(checkIns.userId, userId), eq(checkIns.status, "pending"))).orderBy(desc(checkIns.createdAt));
  }

  async createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn> {
    const [newCheckIn] = await db.insert(checkIns).values(checkIn).returning();
    return newCheckIn;
  }

  async reviewCheckIn(checkInId: string, status: string, xpAwarded: number): Promise<CheckIn | undefined> {
    const [updated] = await db.update(checkIns).set({ status, xpAwarded }).where(eq(checkIns.id, checkInId)).returning();
    return updated;
  }

  async getDares(userId: string): Promise<Dare[]> {
    return db.select().from(dares).where(eq(dares.userId, userId)).orderBy(desc(dares.createdAt));
  }

  async createDare(userId: string, text: string): Promise<Dare> {
    const [dare] = await db.insert(dares).values({ userId, text }).returning();
    return dare;
  }

  async completeDare(dareId: string): Promise<Dare | undefined> {
    const [updated] = await db.update(dares).set({ completed: true }).where(eq(dares.id, dareId)).returning();
    return updated;
  }

  async getRewards(userId: string): Promise<Reward[]> {
    return db.select().from(rewards).where(eq(rewards.userId, userId)).orderBy(desc(rewards.createdAt));
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const [newReward] = await db.insert(rewards).values(reward).returning();
    return newReward;
  }

  async toggleReward(rewardId: string): Promise<Reward | undefined> {
    const [existing] = await db.select().from(rewards).where(eq(rewards.id, rewardId));
    if (!existing) return undefined;
    const [updated] = await db.update(rewards).set({ unlocked: !existing.unlocked }).where(eq(rewards.id, rewardId)).returning();
    return updated;
  }

  async getPunishments(userId: string): Promise<Punishment[]> {
    return db.select().from(punishments).where(eq(punishments.userId, userId)).orderBy(desc(punishments.createdAt));
  }

  async createPunishment(punishment: InsertPunishment): Promise<Punishment> {
    const [newPunishment] = await db.insert(punishments).values(punishment).returning();
    return newPunishment;
  }

  async updatePunishmentStatus(punishmentId: string, status: string): Promise<Punishment | undefined> {
    const [updated] = await db.update(punishments).set({ status }).where(eq(punishments.id, punishmentId)).returning();
    return updated;
  }

  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).orderBy(desc(journalEntries.createdAt));
  }

  async createJournalEntry(entry: InsertJournal): Promise<JournalEntry> {
    const [newEntry] = await db.insert(journalEntries).values(entry).returning();
    return newEntry;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async dismissNotification(notificationId: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, notificationId));
  }

  async getActivityLog(userId: string): Promise<ActivityLogEntry[]> {
    return db.select().from(activityLog).where(eq(activityLog.userId, userId)).orderBy(desc(activityLog.createdAt));
  }

  async logActivity(userId: string, action: string, detail?: string): Promise<ActivityLogEntry> {
    const [entry] = await db.insert(activityLog).values({ userId, action, detail }).returning();
    return entry;
  }
}

export const storage = new DatabaseStorage();
