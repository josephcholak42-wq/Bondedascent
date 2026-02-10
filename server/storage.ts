import { eq, desc, and } from "drizzle-orm";
import { db } from "./db";
import {
  users, tasks, checkIns, dares, rewards, punishments,
  journalEntries, notifications, activityLog, pairCodes,
  rituals, limits, secrets, wagers, ratings, countdownEvents,
  standingOrders, permissionRequests, devotions, conflicts,
  desiredChanges, achievements, playSessions, pushSubscriptions,
  demandTimers, quickCommands, presenceHeartbeats, accusations,
  intensitySessions, trialSteps, obedienceTrials, sensationCards, sensationSpins, sealedOrders, enduranceChallenges, enduranceCheckins,
  type User, type InsertUser, type Task, type InsertTask,
  type CheckIn, type InsertCheckIn, type Reward, type InsertReward,
  type Punishment, type InsertPunishment, type JournalEntry,
  type InsertJournal, type Notification, type InsertNotification,
  type ActivityLogEntry, type Dare, type PairCode,
  type Ritual, type InsertRitual, type Limit, type InsertLimit,
  type Secret, type InsertSecret, type Wager, type InsertWager,
  type Rating, type InsertRating, type CountdownEvent, type InsertCountdownEvent,
  type StandingOrder, type InsertStandingOrder, type PermissionRequest, type InsertPermissionRequest,
  type Devotion, type InsertDevotion, type Conflict, type InsertConflict,
  type DesiredChange, type InsertDesiredChange, type Achievement, type InsertAchievement,
  type PlaySession, type InsertPlaySession,
  type PushSubscription, type InsertPushSubscription,
  type DemandTimer, type InsertDemandTimer,
  type QuickCommand, type InsertQuickCommand,
  type PresenceHeartbeat,
  type Accusation, type InsertAccusation,
  type IntensitySession, type InsertIntensitySession,
  type ObedienceTrial, type InsertObedienceTrial,
  type TrialStep, type InsertTrialStep,
  type SensationCard, type InsertSensationCard,
  type SensationSpin, type InsertSensationSpin,
  type SealedOrder, type InsertSealedOrder,
  type EnduranceChallenge, type InsertEnduranceChallenge,
  type EnduranceCheckin, type InsertEnduranceCheckin,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserXp(userId: string, xp: number): Promise<User | undefined>;
  updateUserLevel(userId: string, level: number): Promise<User | undefined>;
  updateUserRole(userId: string, role: string): Promise<User | undefined>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<User | undefined>;

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

  createPairCode(userId: string, code: string, expiresAt: Date): Promise<PairCode>;
  getPairCodeByCode(code: string): Promise<PairCode | undefined>;
  usePairCode(codeId: string, usedByUserId: string): Promise<PairCode | undefined>;
  linkPartners(userId1: string, userId2: string): Promise<void>;
  unlinkPartner(userId: string): Promise<void>;
  getPartner(userId: string): Promise<User | undefined>;

  getRituals(userId: string): Promise<Ritual[]>;
  createRitual(ritual: InsertRitual): Promise<Ritual>;
  updateRitual(id: string, data: Partial<Ritual>): Promise<Ritual | undefined>;
  deleteRitual(id: string): Promise<void>;

  getLimits(userId: string): Promise<Limit[]>;
  createLimit(limit: InsertLimit): Promise<Limit>;
  updateLimit(id: string, data: Partial<Limit>): Promise<Limit | undefined>;
  deleteLimit(id: string): Promise<void>;

  getSecrets(userId: string): Promise<Secret[]>;
  getSecretsForUser(forUserId: string): Promise<Secret[]>;
  createSecret(secret: InsertSecret): Promise<Secret>;
  revealSecret(id: string): Promise<Secret | undefined>;

  getWagers(userId: string): Promise<Wager[]>;
  createWager(wager: InsertWager): Promise<Wager>;
  updateWager(id: string, data: Partial<Wager>): Promise<Wager | undefined>;

  getRatings(userId: string): Promise<Rating[]>;
  getRatingsForUser(ratedUserId: string): Promise<Rating[]>;
  createRating(rating: InsertRating): Promise<Rating>;

  getCountdownEvents(userId: string): Promise<CountdownEvent[]>;
  createCountdownEvent(event: InsertCountdownEvent): Promise<CountdownEvent>;
  deleteCountdownEvent(id: string): Promise<void>;

  getStandingOrders(userId: string): Promise<StandingOrder[]>;
  createStandingOrder(order: InsertStandingOrder): Promise<StandingOrder>;
  updateStandingOrder(id: string, data: Partial<StandingOrder>): Promise<StandingOrder | undefined>;
  deleteStandingOrder(id: string): Promise<void>;

  getPermissionRequests(userId: string): Promise<PermissionRequest[]>;
  createPermissionRequest(request: InsertPermissionRequest): Promise<PermissionRequest>;
  updatePermissionRequest(id: string, data: Partial<PermissionRequest>): Promise<PermissionRequest | undefined>;

  getDevotions(userId: string): Promise<Devotion[]>;
  createDevotion(devotion: InsertDevotion): Promise<Devotion>;
  updateDevotion(id: string, data: Partial<Devotion>): Promise<Devotion | undefined>;

  getConflicts(userId: string): Promise<Conflict[]>;
  createConflict(conflict: InsertConflict): Promise<Conflict>;
  updateConflict(id: string, data: Partial<Conflict>): Promise<Conflict | undefined>;

  getDesiredChanges(userId: string): Promise<DesiredChange[]>;
  createDesiredChange(change: InsertDesiredChange): Promise<DesiredChange>;
  updateDesiredChange(id: string, data: Partial<DesiredChange>): Promise<DesiredChange | undefined>;

  getAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;

  getPlaySessions(userId: string): Promise<PlaySession[]>;
  createPlaySession(session: InsertPlaySession): Promise<PlaySession>;
  updatePlaySession(id: string, data: Partial<PlaySession>): Promise<PlaySession | undefined>;

  getPushSubscriptions(userId: string): Promise<PushSubscription[]>;
  createPushSubscription(sub: InsertPushSubscription): Promise<PushSubscription>;
  deletePushSubscription(endpoint: string): Promise<void>;
  deletePushSubscriptionForUser(userId: string, endpoint: string): Promise<void>;

  getDemandTimers(toUserId: string): Promise<DemandTimer[]>;
  createDemandTimer(timer: InsertDemandTimer): Promise<DemandTimer>;
  respondDemandTimer(id: string): Promise<DemandTimer | undefined>;

  getQuickCommands(toUserId: string): Promise<QuickCommand[]>;
  createQuickCommand(cmd: InsertQuickCommand): Promise<QuickCommand>;
  acknowledgeQuickCommand(id: string): Promise<QuickCommand | undefined>;

  updatePresence(userId: string): Promise<void>;
  getPresence(userId: string): Promise<PresenceHeartbeat | undefined>;

  updateUserLockdown(userId: string, lockedDown: boolean): Promise<User | undefined>;
  updateUserEnforcementLevel(userId: string, level: number): Promise<User | undefined>;

  deleteAllTasksForUser(userId: string): Promise<void>;
  revokeAllRewardsForUser(userId: string): Promise<void>;

  getAccusations(toUserId: string): Promise<Accusation[]>;
  createAccusation(accusation: InsertAccusation): Promise<Accusation>;
  respondToAccusation(id: string, response: string): Promise<Accusation | undefined>;

  // Intensity Ladder
  getIntensitySessions(userId: string): Promise<IntensitySession[]>;
  createIntensitySession(session: InsertIntensitySession): Promise<IntensitySession>;
  updateIntensitySession(id: string, data: Partial<IntensitySession>): Promise<IntensitySession | undefined>;

  // Obedience Trials
  getObedienceTrials(userId: string): Promise<ObedienceTrial[]>;
  createObedienceTrial(trial: InsertObedienceTrial): Promise<ObedienceTrial>;
  updateObedienceTrial(id: string, data: Partial<ObedienceTrial>): Promise<ObedienceTrial | undefined>;
  getTrialSteps(trialId: string): Promise<TrialStep[]>;
  createTrialStep(step: InsertTrialStep): Promise<TrialStep>;
  updateTrialStep(id: string, data: Partial<TrialStep>): Promise<TrialStep | undefined>;

  // Sensation Roulette
  getSensationCards(userId: string): Promise<SensationCard[]>;
  createSensationCard(card: InsertSensationCard): Promise<SensationCard>;
  updateSensationCard(id: string, data: Partial<SensationCard>): Promise<SensationCard | undefined>;
  deleteSensationCard(id: string): Promise<void>;
  getSensationSpins(userId: string): Promise<SensationSpin[]>;
  createSensationSpin(spin: InsertSensationSpin): Promise<SensationSpin>;
  updateSensationSpin(id: string, data: Partial<SensationSpin>): Promise<SensationSpin | undefined>;

  // Protocol Lockbox
  getSealedOrders(targetUserId: string): Promise<SealedOrder[]>;
  getSealedOrdersByCreator(userId: string): Promise<SealedOrder[]>;
  createSealedOrder(order: InsertSealedOrder): Promise<SealedOrder>;
  updateSealedOrder(id: string, data: Partial<SealedOrder>): Promise<SealedOrder | undefined>;

  // Endurance Challenges
  getEnduranceChallenges(targetUserId: string): Promise<EnduranceChallenge[]>;
  getEnduranceChallengesByCreator(userId: string): Promise<EnduranceChallenge[]>;
  createEnduranceChallenge(challenge: InsertEnduranceChallenge): Promise<EnduranceChallenge>;
  updateEnduranceChallenge(id: string, data: Partial<EnduranceChallenge>): Promise<EnduranceChallenge | undefined>;
  getEnduranceCheckins(challengeId: string): Promise<EnduranceCheckin[]>;
  createEnduranceCheckin(checkin: InsertEnduranceCheckin): Promise<EnduranceCheckin>;
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

  async updateUserPassword(userId: string, hashedPassword: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId)).returning();
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

  async createPairCode(userId: string, code: string, expiresAt: Date): Promise<PairCode> {
    const [pairCode] = await db.insert(pairCodes).values({ userId, code, expiresAt }).returning();
    return pairCode;
  }

  async getPairCodeByCode(code: string): Promise<PairCode | undefined> {
    const [pairCode] = await db.select().from(pairCodes).where(and(eq(pairCodes.code, code), eq(pairCodes.used, false)));
    return pairCode;
  }

  async usePairCode(codeId: string, usedByUserId: string): Promise<PairCode | undefined> {
    const [updated] = await db.update(pairCodes).set({ used: true, usedBy: usedByUserId }).where(eq(pairCodes.id, codeId)).returning();
    return updated;
  }

  async linkPartners(userId1: string, userId2: string): Promise<void> {
    await db.update(users).set({ partnerId: userId2 }).where(eq(users.id, userId1));
    await db.update(users).set({ partnerId: userId1 }).where(eq(users.id, userId2));
  }

  async unlinkPartner(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user?.partnerId) return;
    const partnerId = user.partnerId;
    await db.update(users).set({ partnerId: null }).where(eq(users.id, userId));
    await db.update(users).set({ partnerId: null }).where(eq(users.id, partnerId));
  }

  async getPartner(userId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user?.partnerId) return undefined;
    return this.getUser(user.partnerId);
  }

  async getRituals(userId: string): Promise<Ritual[]> {
    return db.select().from(rituals).where(eq(rituals.userId, userId)).orderBy(desc(rituals.createdAt));
  }

  async createRitual(ritual: InsertRitual): Promise<Ritual> {
    const [r] = await db.insert(rituals).values(ritual).returning();
    return r;
  }

  async updateRitual(id: string, data: Partial<Ritual>): Promise<Ritual | undefined> {
    const [r] = await db.update(rituals).set(data).where(eq(rituals.id, id)).returning();
    return r;
  }

  async deleteRitual(id: string): Promise<void> {
    await db.delete(rituals).where(eq(rituals.id, id));
  }

  async getLimits(userId: string): Promise<Limit[]> {
    return db.select().from(limits).where(eq(limits.userId, userId)).orderBy(desc(limits.createdAt));
  }

  async createLimit(limit: InsertLimit): Promise<Limit> {
    const [l] = await db.insert(limits).values(limit).returning();
    return l;
  }

  async updateLimit(id: string, data: Partial<Limit>): Promise<Limit | undefined> {
    const [l] = await db.update(limits).set(data).where(eq(limits.id, id)).returning();
    return l;
  }

  async deleteLimit(id: string): Promise<void> {
    await db.delete(limits).where(eq(limits.id, id));
  }

  async getSecrets(userId: string): Promise<Secret[]> {
    return db.select().from(secrets).where(eq(secrets.userId, userId)).orderBy(desc(secrets.createdAt));
  }

  async getSecretsForUser(forUserId: string): Promise<Secret[]> {
    return db.select().from(secrets).where(eq(secrets.forUserId, forUserId)).orderBy(desc(secrets.createdAt));
  }

  async createSecret(secret: InsertSecret): Promise<Secret> {
    const [s] = await db.insert(secrets).values(secret).returning();
    return s;
  }

  async revealSecret(id: string): Promise<Secret | undefined> {
    const [s] = await db.update(secrets).set({ revealed: true }).where(eq(secrets.id, id)).returning();
    return s;
  }

  async getWagers(userId: string): Promise<Wager[]> {
    return db.select().from(wagers).where(eq(wagers.userId, userId)).orderBy(desc(wagers.createdAt));
  }

  async createWager(wager: InsertWager): Promise<Wager> {
    const [w] = await db.insert(wagers).values(wager).returning();
    return w;
  }

  async updateWager(id: string, data: Partial<Wager>): Promise<Wager | undefined> {
    const [w] = await db.update(wagers).set(data).where(eq(wagers.id, id)).returning();
    return w;
  }

  async getRatings(userId: string): Promise<Rating[]> {
    return db.select().from(ratings).where(eq(ratings.userId, userId)).orderBy(desc(ratings.createdAt));
  }

  async getRatingsForUser(ratedUserId: string): Promise<Rating[]> {
    return db.select().from(ratings).where(eq(ratings.ratedUserId, ratedUserId)).orderBy(desc(ratings.createdAt));
  }

  async createRating(rating: InsertRating): Promise<Rating> {
    const [r] = await db.insert(ratings).values(rating).returning();
    return r;
  }

  async getCountdownEvents(userId: string): Promise<CountdownEvent[]> {
    return db.select().from(countdownEvents).where(eq(countdownEvents.userId, userId)).orderBy(desc(countdownEvents.createdAt));
  }

  async createCountdownEvent(event: InsertCountdownEvent): Promise<CountdownEvent> {
    const [e] = await db.insert(countdownEvents).values(event).returning();
    return e;
  }

  async deleteCountdownEvent(id: string): Promise<void> {
    await db.delete(countdownEvents).where(eq(countdownEvents.id, id));
  }

  async getStandingOrders(userId: string): Promise<StandingOrder[]> {
    return db.select().from(standingOrders).where(eq(standingOrders.userId, userId)).orderBy(desc(standingOrders.createdAt));
  }

  async createStandingOrder(order: InsertStandingOrder): Promise<StandingOrder> {
    const [o] = await db.insert(standingOrders).values(order).returning();
    return o;
  }

  async updateStandingOrder(id: string, data: Partial<StandingOrder>): Promise<StandingOrder | undefined> {
    const [o] = await db.update(standingOrders).set(data).where(eq(standingOrders.id, id)).returning();
    return o;
  }

  async deleteStandingOrder(id: string): Promise<void> {
    await db.delete(standingOrders).where(eq(standingOrders.id, id));
  }

  async getPermissionRequests(userId: string): Promise<PermissionRequest[]> {
    return db.select().from(permissionRequests).where(eq(permissionRequests.userId, userId)).orderBy(desc(permissionRequests.createdAt));
  }

  async createPermissionRequest(request: InsertPermissionRequest): Promise<PermissionRequest> {
    const [r] = await db.insert(permissionRequests).values(request).returning();
    return r;
  }

  async updatePermissionRequest(id: string, data: Partial<PermissionRequest>): Promise<PermissionRequest | undefined> {
    const [r] = await db.update(permissionRequests).set(data).where(eq(permissionRequests.id, id)).returning();
    return r;
  }

  async getDevotions(userId: string): Promise<Devotion[]> {
    return db.select().from(devotions).where(eq(devotions.userId, userId)).orderBy(desc(devotions.createdAt));
  }

  async createDevotion(devotion: InsertDevotion): Promise<Devotion> {
    const [d] = await db.insert(devotions).values(devotion).returning();
    return d;
  }

  async updateDevotion(id: string, data: Partial<Devotion>): Promise<Devotion | undefined> {
    const [d] = await db.update(devotions).set(data).where(eq(devotions.id, id)).returning();
    return d;
  }

  async getConflicts(userId: string): Promise<Conflict[]> {
    return db.select().from(conflicts).where(eq(conflicts.userId, userId)).orderBy(desc(conflicts.createdAt));
  }

  async createConflict(conflict: InsertConflict): Promise<Conflict> {
    const [c] = await db.insert(conflicts).values(conflict).returning();
    return c;
  }

  async updateConflict(id: string, data: Partial<Conflict>): Promise<Conflict | undefined> {
    const [c] = await db.update(conflicts).set(data).where(eq(conflicts.id, id)).returning();
    return c;
  }

  async getDesiredChanges(userId: string): Promise<DesiredChange[]> {
    return db.select().from(desiredChanges).where(eq(desiredChanges.userId, userId)).orderBy(desc(desiredChanges.createdAt));
  }

  async createDesiredChange(change: InsertDesiredChange): Promise<DesiredChange> {
    const [c] = await db.insert(desiredChanges).values(change).returning();
    return c;
  }

  async updateDesiredChange(id: string, data: Partial<DesiredChange>): Promise<DesiredChange | undefined> {
    const [c] = await db.update(desiredChanges).set(data).where(eq(desiredChanges.id, id)).returning();
    return c;
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    return db.select().from(achievements).where(eq(achievements.userId, userId)).orderBy(desc(achievements.unlockedAt));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [a] = await db.insert(achievements).values(achievement).returning();
    return a;
  }

  async getPlaySessions(userId: string): Promise<PlaySession[]> {
    return db.select().from(playSessions).where(eq(playSessions.userId, userId)).orderBy(desc(playSessions.createdAt));
  }

  async createPlaySession(session: InsertPlaySession): Promise<PlaySession> {
    const [s] = await db.insert(playSessions).values(session).returning();
    return s;
  }

  async updatePlaySession(id: string, data: Partial<PlaySession>): Promise<PlaySession | undefined> {
    const [s] = await db.update(playSessions).set(data).where(eq(playSessions.id, id)).returning();
    return s;
  }
  async getPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    return db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  }

  async createPushSubscription(sub: InsertPushSubscription): Promise<PushSubscription> {
    await db.delete(pushSubscriptions).where(
      and(eq(pushSubscriptions.userId, sub.userId), eq(pushSubscriptions.endpoint, sub.endpoint))
    );
    const [s] = await db.insert(pushSubscriptions).values(sub).returning();
    return s;
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  }

  async deletePushSubscriptionForUser(userId: string, endpoint: string): Promise<void> {
    await db.delete(pushSubscriptions).where(
      and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint))
    );
  }

  async getDemandTimers(toUserId: string): Promise<DemandTimer[]> {
    return db.select().from(demandTimers).where(eq(demandTimers.toUserId, toUserId)).orderBy(desc(demandTimers.createdAt));
  }

  async createDemandTimer(timer: InsertDemandTimer): Promise<DemandTimer> {
    const [t] = await db.insert(demandTimers).values(timer).returning();
    return t;
  }

  async respondDemandTimer(id: string): Promise<DemandTimer | undefined> {
    const [t] = await db.update(demandTimers).set({ responded: true }).where(eq(demandTimers.id, id)).returning();
    return t;
  }

  async getQuickCommands(toUserId: string): Promise<QuickCommand[]> {
    return db.select().from(quickCommands).where(eq(quickCommands.toUserId, toUserId)).orderBy(desc(quickCommands.createdAt));
  }

  async createQuickCommand(cmd: InsertQuickCommand): Promise<QuickCommand> {
    const [c] = await db.insert(quickCommands).values(cmd).returning();
    return c;
  }

  async acknowledgeQuickCommand(id: string): Promise<QuickCommand | undefined> {
    const [c] = await db.update(quickCommands).set({ acknowledged: true }).where(eq(quickCommands.id, id)).returning();
    return c;
  }

  async updatePresence(userId: string): Promise<void> {
    const existing = await db.select().from(presenceHeartbeats).where(eq(presenceHeartbeats.userId, userId));
    if (existing.length > 0) {
      await db.update(presenceHeartbeats).set({ lastSeen: new Date() }).where(eq(presenceHeartbeats.userId, userId));
    } else {
      await db.insert(presenceHeartbeats).values({ userId, lastSeen: new Date() });
    }
  }

  async getPresence(userId: string): Promise<PresenceHeartbeat | undefined> {
    const [p] = await db.select().from(presenceHeartbeats).where(eq(presenceHeartbeats.userId, userId));
    return p;
  }

  async updateUserLockdown(userId: string, lockedDown: boolean): Promise<User | undefined> {
    const [user] = await db.update(users).set({ lockedDown }).where(eq(users.id, userId)).returning();
    return user;
  }

  async updateUserEnforcementLevel(userId: string, level: number): Promise<User | undefined> {
    const [user] = await db.update(users).set({ enforcementLevel: level }).where(eq(users.id, userId)).returning();
    return user;
  }

  async deleteAllTasksForUser(userId: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.userId, userId));
  }

  async revokeAllRewardsForUser(userId: string): Promise<void> {
    await db.update(rewards).set({ unlocked: false }).where(eq(rewards.userId, userId));
  }

  async getAccusations(toUserId: string): Promise<Accusation[]> {
    return db.select().from(accusations).where(eq(accusations.toUserId, toUserId)).orderBy(desc(accusations.createdAt));
  }

  async createAccusation(accusation: InsertAccusation): Promise<Accusation> {
    const [a] = await db.insert(accusations).values(accusation).returning();
    return a;
  }

  async respondToAccusation(id: string, response: string): Promise<Accusation | undefined> {
    const [a] = await db.update(accusations).set({ response, status: "responded" }).where(eq(accusations.id, id)).returning();
    return a;
  }

  // Intensity Ladder
  async getIntensitySessions(userId: string): Promise<IntensitySession[]> {
    return db.select().from(intensitySessions).where(eq(intensitySessions.userId, userId)).orderBy(desc(intensitySessions.createdAt));
  }
  async createIntensitySession(session: InsertIntensitySession): Promise<IntensitySession> {
    const [s] = await db.insert(intensitySessions).values(session).returning();
    return s;
  }
  async updateIntensitySession(id: string, data: Partial<IntensitySession>): Promise<IntensitySession | undefined> {
    const [s] = await db.update(intensitySessions).set(data).where(eq(intensitySessions.id, id)).returning();
    return s;
  }

  // Obedience Trials
  async getObedienceTrials(userId: string): Promise<ObedienceTrial[]> {
    return db.select().from(obedienceTrials).where(eq(obedienceTrials.userId, userId)).orderBy(desc(obedienceTrials.createdAt));
  }
  async createObedienceTrial(trial: InsertObedienceTrial): Promise<ObedienceTrial> {
    const [t] = await db.insert(obedienceTrials).values(trial).returning();
    return t;
  }
  async updateObedienceTrial(id: string, data: Partial<ObedienceTrial>): Promise<ObedienceTrial | undefined> {
    const [t] = await db.update(obedienceTrials).set(data).where(eq(obedienceTrials.id, id)).returning();
    return t;
  }
  async getTrialSteps(trialId: string): Promise<TrialStep[]> {
    return db.select().from(trialSteps).where(eq(trialSteps.trialId, trialId)).orderBy(trialSteps.stepOrder);
  }
  async createTrialStep(step: InsertTrialStep): Promise<TrialStep> {
    const [s] = await db.insert(trialSteps).values(step).returning();
    return s;
  }
  async updateTrialStep(id: string, data: Partial<TrialStep>): Promise<TrialStep | undefined> {
    const [s] = await db.update(trialSteps).set(data).where(eq(trialSteps.id, id)).returning();
    return s;
  }

  // Sensation Roulette
  async getSensationCards(userId: string): Promise<SensationCard[]> {
    return db.select().from(sensationCards).where(eq(sensationCards.userId, userId)).orderBy(desc(sensationCards.createdAt));
  }
  async createSensationCard(card: InsertSensationCard): Promise<SensationCard> {
    const [c] = await db.insert(sensationCards).values(card).returning();
    return c;
  }
  async updateSensationCard(id: string, data: Partial<SensationCard>): Promise<SensationCard | undefined> {
    const [c] = await db.update(sensationCards).set(data).where(eq(sensationCards.id, id)).returning();
    return c;
  }
  async deleteSensationCard(id: string): Promise<void> {
    await db.delete(sensationCards).where(eq(sensationCards.id, id));
  }
  async getSensationSpins(userId: string): Promise<SensationSpin[]> {
    return db.select().from(sensationSpins).where(eq(sensationSpins.userId, userId)).orderBy(desc(sensationSpins.createdAt));
  }
  async createSensationSpin(spin: InsertSensationSpin): Promise<SensationSpin> {
    const [s] = await db.insert(sensationSpins).values(spin).returning();
    return s;
  }
  async updateSensationSpin(id: string, data: Partial<SensationSpin>): Promise<SensationSpin | undefined> {
    const [s] = await db.update(sensationSpins).set(data).where(eq(sensationSpins.id, id)).returning();
    return s;
  }

  // Protocol Lockbox
  async getSealedOrders(targetUserId: string): Promise<SealedOrder[]> {
    return db.select().from(sealedOrders).where(eq(sealedOrders.targetUserId, targetUserId)).orderBy(sealedOrders.unlockAt);
  }
  async getSealedOrdersByCreator(userId: string): Promise<SealedOrder[]> {
    return db.select().from(sealedOrders).where(eq(sealedOrders.userId, userId)).orderBy(desc(sealedOrders.createdAt));
  }
  async createSealedOrder(order: InsertSealedOrder): Promise<SealedOrder> {
    const [o] = await db.insert(sealedOrders).values(order).returning();
    return o;
  }
  async updateSealedOrder(id: string, data: Partial<SealedOrder>): Promise<SealedOrder | undefined> {
    const [o] = await db.update(sealedOrders).set(data).where(eq(sealedOrders.id, id)).returning();
    return o;
  }

  // Endurance Challenges
  async getEnduranceChallenges(targetUserId: string): Promise<EnduranceChallenge[]> {
    return db.select().from(enduranceChallenges).where(eq(enduranceChallenges.targetUserId, targetUserId)).orderBy(desc(enduranceChallenges.createdAt));
  }
  async getEnduranceChallengesByCreator(userId: string): Promise<EnduranceChallenge[]> {
    return db.select().from(enduranceChallenges).where(eq(enduranceChallenges.userId, userId)).orderBy(desc(enduranceChallenges.createdAt));
  }
  async createEnduranceChallenge(challenge: InsertEnduranceChallenge): Promise<EnduranceChallenge> {
    const [c] = await db.insert(enduranceChallenges).values(challenge).returning();
    return c;
  }
  async updateEnduranceChallenge(id: string, data: Partial<EnduranceChallenge>): Promise<EnduranceChallenge | undefined> {
    const [c] = await db.update(enduranceChallenges).set(data).where(eq(enduranceChallenges.id, id)).returning();
    return c;
  }
  async getEnduranceCheckins(challengeId: string): Promise<EnduranceCheckin[]> {
    return db.select().from(enduranceCheckins).where(eq(enduranceCheckins.challengeId, challengeId)).orderBy(enduranceCheckins.gateNumber);
  }
  async createEnduranceCheckin(checkin: InsertEnduranceCheckin): Promise<EnduranceCheckin> {
    const [c] = await db.insert(enduranceCheckins).values(checkin).returning();
    return c;
  }
}

export const storage = new DatabaseStorage();
