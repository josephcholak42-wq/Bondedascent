import { eq, desc, and, or, inArray, isNull, isNotNull } from "drizzle-orm";
import { db } from "./db";
import {
  users, tasks, checkIns, dares, rewards, punishments,
  journalEntries, notifications, activityLog, pairCodes,
  rituals, limits, secrets, wagers, ratings, countdownEvents,
  standingOrders, permissionRequests, devotions, conflicts,
  desiredChanges, achievements, playSessions, pushSubscriptions,
  demandTimers, quickCommands, presenceHeartbeats, accusations,
  intensitySessions, trialSteps, obedienceTrials, sensationCards, sensationSpins, sealedOrders, enduranceChallenges, enduranceCheckins,
  media, stickers, featureSettings, bodyMapZones,
  contracts, confessions, trainingPrograms, trainingDays, trainingEnrollments,
  sceneScripts, scriptSteps, interrogationSessions, interrogationQuestions,
  aftercareItems, streaks, apiKeys,
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
  type Media, type InsertMedia,
  type Sticker, type InsertSticker,
  type FeatureSetting, type InsertFeatureSetting,
  type BodyMapZone, type InsertBodyMapZone,
  type Contract, type InsertContract,
  type Confession, type InsertConfession,
  type TrainingProgram, type InsertTrainingProgram,
  type TrainingDay, type InsertTrainingDay,
  type TrainingEnrollment, type InsertTrainingEnrollment,
  type SceneScript, type InsertSceneScript,
  type ScriptStep, type InsertScriptStep,
  type InterrogationSession, type InsertInterrogationSession,
  type InterrogationQuestion, type InsertInterrogationQuestion,
  type AftercareItem, type InsertAftercareItem,
  type Streak,
  simulations,
  type Simulation, type InsertSimulation,
  whispers, altarOfferings, notificationPreferences, ritualCompletions, tribunals,
  adminSettings, adminStickers, trinkets, userTrinkets,
  type Whisper, type InsertWhisper,
  type AltarOffering, type InsertAltarOffering,
  type NotificationPreference, type InsertNotificationPreference,
  type RitualCompletion, type InsertRitualCompletion,
  type Tribunal, type InsertTribunal,
  type AdminSettings, type AdminSticker, type InsertAdminSticker,
  type Trinket, type InsertTrinket, type UserTrinket, type InsertUserTrinket,
  type ApiKey, type InsertApiKey,
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
  toggleTask(taskId: string, completionNotes?: string): Promise<Task | undefined>;
  updateTask(taskId: string, data: Partial<Task>): Promise<Task | undefined>;
  deleteTask(taskId: string): Promise<void>;

  getCheckIns(userId: string): Promise<CheckIn[]>;
  getPendingCheckIns(userId: string): Promise<CheckIn[]>;
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  reviewCheckIn(checkInId: string, status: string, xpAwarded: number): Promise<CheckIn | undefined>;

  getDares(userId: string): Promise<Dare[]>;
  createDare(userId: string, text: string, createdAsRole?: string): Promise<Dare>;
  completeDare(dareId: string, completionNotes?: string): Promise<Dare | undefined>;

  getRewards(userId: string): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(rewardId: string, data: Partial<Reward>): Promise<Reward | undefined>;
  toggleReward(rewardId: string): Promise<Reward | undefined>;
  deleteReward(rewardId: string): Promise<void>;
  claimReward(rewardId: string): Promise<Reward | undefined>;
  redeemReward(rewardId: string): Promise<Reward | undefined>;
  getRewardChest(userId: string): Promise<Reward[]>;
  stockpileReward(rewardId: string): Promise<Reward | undefined>;
  deployReward(rewardId: string): Promise<Reward | undefined>;
  getRewardArsenal(userId: string): Promise<Reward[]>;

  getPunishments(userId: string): Promise<Punishment[]>;
  createPunishment(punishment: InsertPunishment): Promise<Punishment>;
  updatePunishmentStatus(punishmentId: string, status: string, completionNotes?: string): Promise<Punishment | undefined>;
  deletePunishment(punishmentId: string): Promise<void>;
  stockpilePunishment(punishmentId: string): Promise<Punishment | undefined>;
  deployPunishment(punishmentId: string): Promise<Punishment | undefined>;
  getPunishmentChest(userId: string): Promise<Punishment[]>;

  getJournalEntries(userId: string, role?: string): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournal): Promise<JournalEntry>;

  getNotifications(userId: string, role?: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  dismissNotification(notificationId: string): Promise<void>;
  markNotificationRead(notificationId: string): Promise<Notification | undefined>;

  getActivityLog(userId: string, role?: string): Promise<ActivityLogEntry[]>;
  logActivity(userId: string, action: string, detail?: string, createdAsRole?: string): Promise<ActivityLogEntry>;

  createPairCode(userId: string, code: string, expiresAt: Date): Promise<PairCode>;
  getPairCodeByCode(code: string): Promise<PairCode | undefined>;
  usePairCode(codeId: string, usedByUserId: string): Promise<PairCode | undefined>;
  linkPartners(userId1: string, userId2: string): Promise<void>;
  unlinkPartner(userId: string): Promise<void>;
  getPartner(userId: string): Promise<User | undefined>;

  getRituals(userId: string): Promise<Ritual[]>;
  getRitualById(id: string): Promise<Ritual | undefined>;
  createRitual(ritual: InsertRitual): Promise<Ritual>;
  updateRitual(id: string, data: Partial<Ritual>): Promise<Ritual | undefined>;
  deleteRitual(id: string): Promise<void>;

  getLimits(userId: string): Promise<Limit[]>;
  getLimitById(id: string): Promise<Limit | undefined>;
  createLimit(limit: InsertLimit): Promise<Limit>;
  updateLimit(id: string, data: Partial<Limit>): Promise<Limit | undefined>;
  deleteLimit(id: string): Promise<void>;

  getSecrets(userId: string): Promise<Secret[]>;
  getSecretsForUser(forUserId: string): Promise<Secret[]>;
  createSecret(secret: InsertSecret): Promise<Secret>;
  revealSecret(id: string): Promise<Secret | undefined>;
  deleteSecret(id: string): Promise<void>;

  getWagers(userId: string): Promise<Wager[]>;
  getWagerById(id: string): Promise<Wager | undefined>;
  createWager(wager: InsertWager): Promise<Wager>;
  updateWager(id: string, data: Partial<Wager>): Promise<Wager | undefined>;
  deleteWager(id: string): Promise<void>;

  getRatings(userId: string): Promise<Rating[]>;
  getRatingsForUser(ratedUserId: string): Promise<Rating[]>;
  createRating(rating: InsertRating): Promise<Rating>;
  deleteRating(id: string): Promise<void>;

  getCountdownEvents(userId: string): Promise<CountdownEvent[]>;
  getCountdownEventById(id: string): Promise<CountdownEvent | undefined>;
  createCountdownEvent(event: InsertCountdownEvent): Promise<CountdownEvent>;
  deleteCountdownEvent(id: string): Promise<void>;

  getStandingOrders(userId: string): Promise<StandingOrder[]>;
  createStandingOrder(order: InsertStandingOrder): Promise<StandingOrder>;
  updateStandingOrder(id: string, data: Partial<StandingOrder>): Promise<StandingOrder | undefined>;
  deleteStandingOrder(id: string): Promise<void>;

  getPermissionRequests(userId: string): Promise<PermissionRequest[]>;
  createPermissionRequest(request: InsertPermissionRequest): Promise<PermissionRequest>;
  updatePermissionRequest(id: string, data: Partial<PermissionRequest>): Promise<PermissionRequest | undefined>;
  deletePermissionRequest(id: string): Promise<void>;

  getDevotions(userId: string): Promise<Devotion[]>;
  createDevotion(devotion: InsertDevotion): Promise<Devotion>;
  updateDevotion(id: string, data: Partial<Devotion>): Promise<Devotion | undefined>;
  deleteDevotion(id: string): Promise<void>;

  getConflicts(userId: string): Promise<Conflict[]>;
  createConflict(conflict: InsertConflict): Promise<Conflict>;
  updateConflict(id: string, data: Partial<Conflict>): Promise<Conflict | undefined>;
  deleteConflict(id: string): Promise<void>;

  getDesiredChanges(userId: string): Promise<DesiredChange[]>;
  createDesiredChange(change: InsertDesiredChange): Promise<DesiredChange>;
  updateDesiredChange(id: string, data: Partial<DesiredChange>): Promise<DesiredChange | undefined>;
  deleteDesiredChange(id: string): Promise<void>;

  getAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;

  getPlaySessions(userId: string): Promise<PlaySession[]>;
  createPlaySession(session: InsertPlaySession): Promise<PlaySession>;
  updatePlaySession(id: string, data: Partial<PlaySession>): Promise<PlaySession | undefined>;
  deletePlaySession(id: string): Promise<void>;

  getPushSubscriptions(userId: string): Promise<PushSubscription[]>;
  createPushSubscription(sub: InsertPushSubscription): Promise<PushSubscription>;
  deletePushSubscription(endpoint: string): Promise<void>;
  deletePushSubscriptionForUser(userId: string, endpoint: string): Promise<void>;

  getDemandTimers(toUserId: string, role?: string): Promise<DemandTimer[]>;
  createDemandTimer(timer: InsertDemandTimer): Promise<DemandTimer>;
  respondDemandTimer(id: string): Promise<DemandTimer | undefined>;

  getQuickCommands(toUserId: string, role?: string): Promise<QuickCommand[]>;
  createQuickCommand(cmd: InsertQuickCommand): Promise<QuickCommand>;
  acknowledgeQuickCommand(id: string): Promise<QuickCommand | undefined>;

  updatePresence(userId: string): Promise<void>;
  getPresence(userId: string): Promise<PresenceHeartbeat | undefined>;

  updateUserLockdown(userId: string, lockedDown: boolean): Promise<User | undefined>;
  updateUserEnforcementLevel(userId: string, level: number): Promise<User | undefined>;

  deleteAllTasksForUser(userId: string): Promise<void>;
  revokeAllRewardsForUser(userId: string): Promise<void>;

  getAccusations(toUserId: string, role?: string): Promise<Accusation[]>;
  createAccusation(accusation: InsertAccusation): Promise<Accusation>;
  respondToAccusation(id: string, response: string): Promise<Accusation | undefined>;

  // Intensity Ladder
  getIntensitySessions(userId: string): Promise<IntensitySession[]>;
  getIntensitySessionById(id: string): Promise<IntensitySession | undefined>;
  createIntensitySession(session: InsertIntensitySession): Promise<IntensitySession>;
  updateIntensitySession(id: string, data: Partial<IntensitySession>): Promise<IntensitySession | undefined>;

  // Obedience Trials
  getObedienceTrials(userId: string): Promise<ObedienceTrial[]>;
  createObedienceTrial(trial: InsertObedienceTrial): Promise<ObedienceTrial>;
  updateObedienceTrial(id: string, data: Partial<ObedienceTrial>): Promise<ObedienceTrial | undefined>;
  getTrialSteps(trialId: string): Promise<TrialStep[]>;
  getTrialStepById(id: string): Promise<TrialStep | undefined>;
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
  getEnduranceChallengesForPair(userIds: string[]): Promise<EnduranceChallenge[]>;
  getEnduranceChallengesByCreator(userId: string): Promise<EnduranceChallenge[]>;
  createEnduranceChallenge(challenge: InsertEnduranceChallenge): Promise<EnduranceChallenge>;
  updateEnduranceChallenge(id: string, data: Partial<EnduranceChallenge>): Promise<EnduranceChallenge | undefined>;
  getEnduranceCheckins(challengeId: string): Promise<EnduranceCheckin[]>;
  createEnduranceCheckin(checkin: InsertEnduranceCheckin): Promise<EnduranceCheckin>;

  getTasksForPair(userIds: string[], role?: string): Promise<Task[]>;
  getCheckInsForPair(userIds: string[], role?: string): Promise<CheckIn[]>;
  getRitualsForPair(userIds: string[], role?: string): Promise<Ritual[]>;
  getLimitsForPair(userIds: string[], role?: string): Promise<Limit[]>;
  getSecretsForPair(userIds: string[], role?: string): Promise<Secret[]>;
  getWagersForPair(userIds: string[], role?: string): Promise<Wager[]>;
  getRatingsForPair(userIds: string[], role?: string): Promise<Rating[]>;
  getCountdownEventsForPair(userIds: string[], role?: string): Promise<CountdownEvent[]>;
  getStandingOrdersForPair(userIds: string[], role?: string): Promise<StandingOrder[]>;
  getPermissionRequestsForPair(userIds: string[], role?: string): Promise<PermissionRequest[]>;
  getDevotionsForPair(userIds: string[], role?: string): Promise<Devotion[]>;
  getConflictsForPair(userIds: string[], role?: string): Promise<Conflict[]>;
  getDesiredChangesForPair(userIds: string[], role?: string): Promise<DesiredChange[]>;
  getPlaySessionsForPair(userIds: string[], role?: string): Promise<PlaySession[]>;
  getIntensitySessionsForPair(userIds: string[], role?: string): Promise<IntensitySession[]>;
  getObedienceTrialsForPair(userIds: string[], role?: string): Promise<ObedienceTrial[]>;
  getSensationCardsForPair(userIds: string[], role?: string): Promise<SensationCard[]>;
  getSensationSpinsForPair(userIds: string[], role?: string): Promise<SensationSpin[]>;

  getDaresForPair(userIds: string[], role?: string): Promise<Dare[]>;
  getRewardsForPair(userIds: string[], role?: string): Promise<Reward[]>;
  getRewardByWagerSourceId(wagerSourceId: string): Promise<Reward | undefined>;
  getPunishmentsForPair(userIds: string[], role?: string): Promise<Punishment[]>;
  getAchievementsForPair(userIds: string[], role?: string): Promise<Achievement[]>;
  getActivityLogForPair(userIds: string[], role?: string): Promise<ActivityLogEntry[]>;

  getMedia(entityType: string, entityId: string): Promise<Media[]>;
  getMediaByUser(userId: string): Promise<Media[]>;
  getMediaById(id: string): Promise<Media | undefined>;
  createMedia(m: InsertMedia): Promise<Media>;
  deleteMedia(id: string): Promise<void>;

  getStickers(recipientId: string): Promise<Sticker[]>;
  getStickersForPair(userIds: string[], role?: string): Promise<Sticker[]>;
  createSticker(sticker: InsertSticker): Promise<Sticker>;

  getFeatureSettings(pairOwnerId: string): Promise<FeatureSetting[]>;
  upsertFeatureSetting(pairOwnerId: string, featureKey: string, enabled: boolean): Promise<FeatureSetting>;

  getBodyMapZones(userId: string): Promise<BodyMapZone[]>;
  upsertBodyMapZone(userId: string, partnerId: string | null, zoneName: string, status: string, intensity: number, createdAsRole?: string): Promise<BodyMapZone>;
  deleteBodyMapZones(userId: string): Promise<void>;

  updateUserStickerBalance(userId: string, balance: number): Promise<User | undefined>;
  updateUserProfilePic(userId: string, profilePic: string): Promise<User | undefined>;
  updateUserProfileType(userId: string, profileType: string): Promise<User | undefined>;
  getJournalEntriesForPair(userIds: string[], role?: string): Promise<JournalEntry[]>;
  unlockJournalEntry(id: string, unlockedBy: string): Promise<JournalEntry | undefined>;
  getLockedMediaForPair(userIds: string[], role?: string): Promise<Media[]>;
  unlockMedia(id: string, unlockedBy: string): Promise<Media | undefined>;

  getContracts(userId: string): Promise<Contract[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: string, data: Partial<Contract>): Promise<Contract | undefined>;

  getConfessions(userId: string): Promise<Confession[]>;
  createConfession(confession: InsertConfession): Promise<Confession>;
  updateConfession(id: string, data: Partial<Confession>): Promise<Confession | undefined>;

  getTrainingPrograms(userId: string): Promise<TrainingProgram[]>;
  createTrainingProgram(program: InsertTrainingProgram): Promise<TrainingProgram>;
  updateTrainingProgram(id: string, data: Partial<TrainingProgram>): Promise<TrainingProgram | undefined>;
  getTrainingDays(programId: string): Promise<TrainingDay[]>;
  createTrainingDay(day: InsertTrainingDay): Promise<TrainingDay>;
  getTrainingEnrollments(userId: string): Promise<TrainingEnrollment[]>;
  createTrainingEnrollment(enrollment: InsertTrainingEnrollment): Promise<TrainingEnrollment>;
  updateTrainingEnrollment(id: string, data: Partial<TrainingEnrollment>): Promise<TrainingEnrollment | undefined>;

  getSceneScripts(userId: string): Promise<SceneScript[]>;
  createSceneScript(script: InsertSceneScript): Promise<SceneScript>;
  updateSceneScript(id: string, data: Partial<SceneScript>): Promise<SceneScript | undefined>;
  deleteSceneScript(id: string): Promise<void>;
  getScriptSteps(scriptId: string): Promise<ScriptStep[]>;
  createScriptStep(step: InsertScriptStep): Promise<ScriptStep>;
  updateScriptStep(id: string, data: Partial<ScriptStep>): Promise<ScriptStep | undefined>;
  deleteScriptStep(id: string): Promise<void>;

  getInterrogationSessions(userId: string): Promise<InterrogationSession[]>;
  getInterrogationSessionById(id: string): Promise<InterrogationSession | undefined>;
  getActiveInterrogationSession(userId: string): Promise<InterrogationSession | null>;
  createInterrogationSession(session: InsertInterrogationSession): Promise<InterrogationSession>;
  updateInterrogationSession(id: string, data: Partial<InterrogationSession>): Promise<InterrogationSession | undefined>;
  getInterrogationQuestions(sessionId: string): Promise<InterrogationQuestion[]>;
  createInterrogationQuestion(question: InsertInterrogationQuestion): Promise<InterrogationQuestion>;
  updateInterrogationQuestion(id: string, data: Partial<InterrogationQuestion>): Promise<InterrogationQuestion | undefined>;

  getAftercareItems(sessionId: string): Promise<AftercareItem[]>;
  createAftercareItem(item: InsertAftercareItem): Promise<AftercareItem>;
  updateAftercareItem(id: string, data: Partial<AftercareItem>): Promise<AftercareItem | undefined>;

  getStreaks(userId: string): Promise<Streak[]>;
  upsertStreak(userId: string, streakType: string, date: string): Promise<Streak>;

  getStandingOrderById(id: string): Promise<StandingOrder | undefined>;
  getPermissionRequestById(id: string): Promise<PermissionRequest | undefined>;
  getDevotionById(id: string): Promise<Devotion | undefined>;
  getConflictById(id: string): Promise<Conflict | undefined>;
  getDesiredChangeById(id: string): Promise<DesiredChange | undefined>;
  getPlaySessionById(id: string): Promise<PlaySession | undefined>;
  getContractById(id: string): Promise<Contract | undefined>;
  getConfessionById(id: string): Promise<Confession | undefined>;
  getTrainingProgramById(id: string): Promise<TrainingProgram | undefined>;
  getTrainingEnrollmentById(id: string): Promise<TrainingEnrollment | undefined>;
  getSceneScriptById(id: string): Promise<SceneScript | undefined>;
  getScriptStepById(id: string): Promise<ScriptStep | undefined>;
  getAftercareItemById(id: string): Promise<AftercareItem | undefined>;
  getSealedOrderById(id: string): Promise<SealedOrder | undefined>;
  getEnduranceChallengeById(id: string): Promise<EnduranceChallenge | undefined>;
  getObedienceTrialById(id: string): Promise<ObedienceTrial | undefined>;
  getSensationCardById(id: string): Promise<SensationCard | undefined>;
  getSensationSpinById(id: string): Promise<SensationSpin | undefined>;
  getAccusationById(id: string): Promise<Accusation | undefined>;

  createSimulation(data: InsertSimulation): Promise<Simulation>;
  getActiveSimulation(userId: string): Promise<Simulation | undefined>;
  deactivateSimulation(id: string): Promise<Simulation | undefined>;
  updateSimulationGeneratedItems(id: string, generatedItems: any): Promise<Simulation | undefined>;
  deactivateSimulationItems(simulationId: string): Promise<void>;

  // Whispers
  createWhisper(data: InsertWhisper): Promise<Whisper>;
  getWhispers(userId: string, partnerId: string): Promise<Whisper[]>;
  markWhisperRead(id: string): Promise<Whisper | undefined>;
  etchWhisper(id: string): Promise<Whisper | undefined>;
  getUnreadWhisperCount(userId: string): Promise<number>;

  // Altar
  getAltarState(userId: string): Promise<AltarOffering | undefined>;
  claimAltarOffering(userId: string): Promise<AltarOffering>;

  // Notification Preferences
  getNotificationPreferences(userId: string): Promise<NotificationPreference | undefined>;
  upsertNotificationPreferences(userId: string, prefs: Partial<NotificationPreference>): Promise<NotificationPreference>;

  // Ritual Completions
  recordRitualCompletion(data: InsertRitualCompletion): Promise<RitualCompletion>;
  getRitualCompletions(userId: string, days: number): Promise<RitualCompletion[]>;
  incrementRitualMiss(ritualId: string): Promise<Ritual | undefined>;

  // Tribunals
  createTribunal(data: InsertTribunal): Promise<Tribunal>;
  getTribunals(userId: string): Promise<Tribunal[]>;
  getCurrentTribunal(userId: string): Promise<Tribunal | undefined>;
  updateTribunalVerdict(id: string, verdict: string, grade: string, sentence?: string): Promise<Tribunal | undefined>;
  updateTribunalPlea(id: string, plea: string): Promise<Tribunal | undefined>;

  // Tutorial
  completeTutorial(userId: string): Promise<User | undefined>;

  // Unlocks
  getAllUsers(): Promise<User[]>;
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

  async toggleTask(taskId: string, completionNotes?: string): Promise<Task | undefined> {
    const [existing] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!existing) return undefined;
    const setData: any = { done: !existing.done };
    if (!existing.done && completionNotes !== undefined) setData.completionNotes = completionNotes;
    const [updated] = await db.update(tasks).set(setData).where(eq(tasks.id, taskId)).returning();
    return updated;
  }

  async updateTask(taskId: string, data: Partial<Task>): Promise<Task | undefined> {
    const [updated] = await db.update(tasks).set(data).where(eq(tasks.id, taskId)).returning();
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

  async createDare(userId: string, text: string, createdAsRole?: string): Promise<Dare> {
    const [dare] = await db.insert(dares).values({ userId, text, ...(createdAsRole ? { createdAsRole } : {}) }).returning();
    return dare;
  }

  async completeDare(dareId: string, completionNotes?: string): Promise<Dare | undefined> {
    const setData: any = { completed: true };
    if (completionNotes !== undefined) setData.completionNotes = completionNotes;
    const [updated] = await db.update(dares).set(setData).where(eq(dares.id, dareId)).returning();
    return updated;
  }

  async getRewards(userId: string): Promise<Reward[]> {
    return db.select().from(rewards).where(eq(rewards.userId, userId)).orderBy(desc(rewards.createdAt));
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const [newReward] = await db.insert(rewards).values(reward).returning();
    return newReward;
  }

  async updateReward(rewardId: string, data: Partial<Reward>): Promise<Reward | undefined> {
    const [updated] = await db.update(rewards).set(data).where(eq(rewards.id, rewardId)).returning();
    return updated;
  }

  async toggleReward(rewardId: string): Promise<Reward | undefined> {
    const [existing] = await db.select().from(rewards).where(eq(rewards.id, rewardId));
    if (!existing) return undefined;
    const [updated] = await db.update(rewards).set({ unlocked: !existing.unlocked }).where(eq(rewards.id, rewardId)).returning();
    return updated;
  }

  async deleteReward(rewardId: string): Promise<void> {
    await db.delete(rewards).where(eq(rewards.id, rewardId));
  }

  async claimReward(rewardId: string): Promise<Reward | undefined> {
    const [updated] = await db.update(rewards).set({ claimedAt: new Date() }).where(eq(rewards.id, rewardId)).returning();
    return updated;
  }

  async redeemReward(rewardId: string): Promise<Reward | undefined> {
    const [updated] = await db.update(rewards).set({ redeemedAt: new Date(), unlocked: true }).where(eq(rewards.id, rewardId)).returning();
    return updated;
  }

  async getRewardChest(userId: string): Promise<Reward[]> {
    return db.select().from(rewards).where(and(eq(rewards.userId, userId), isNotNull(rewards.claimedAt), isNull(rewards.redeemedAt))).orderBy(desc(rewards.claimedAt));
  }

  async stockpileReward(rewardId: string): Promise<Reward | undefined> {
    const [updated] = await db.update(rewards).set({ stockpiledAt: new Date() }).where(eq(rewards.id, rewardId)).returning();
    return updated;
  }

  async deployReward(rewardId: string): Promise<Reward | undefined> {
    const [updated] = await db.update(rewards).set({ deployedAt: new Date() }).where(eq(rewards.id, rewardId)).returning();
    return updated;
  }

  async getRewardArsenal(userId: string): Promise<Reward[]> {
    return db.select().from(rewards).where(and(eq(rewards.assignedBy, userId), isNotNull(rewards.stockpiledAt), isNull(rewards.deployedAt))).orderBy(desc(rewards.stockpiledAt));
  }

  async getPunishments(userId: string): Promise<Punishment[]> {
    return db.select().from(punishments).where(eq(punishments.userId, userId)).orderBy(desc(punishments.createdAt));
  }

  async createPunishment(punishment: InsertPunishment): Promise<Punishment> {
    const [newPunishment] = await db.insert(punishments).values(punishment).returning();
    return newPunishment;
  }

  async updatePunishmentStatus(punishmentId: string, status: string, completionNotes?: string): Promise<Punishment | undefined> {
    const setData: any = { status };
    if (status === "completed" && completionNotes !== undefined) setData.completionNotes = completionNotes;
    const [updated] = await db.update(punishments).set(setData).where(eq(punishments.id, punishmentId)).returning();
    return updated;
  }

  async deletePunishment(punishmentId: string): Promise<void> {
    await db.delete(punishments).where(eq(punishments.id, punishmentId));
  }

  async stockpilePunishment(punishmentId: string): Promise<Punishment | undefined> {
    const [updated] = await db.update(punishments).set({ stockpiledAt: new Date(), status: "stockpiled" }).where(eq(punishments.id, punishmentId)).returning();
    return updated;
  }

  async deployPunishment(punishmentId: string): Promise<Punishment | undefined> {
    const [updated] = await db.update(punishments).set({ deployedAt: new Date(), status: "active" }).where(eq(punishments.id, punishmentId)).returning();
    return updated;
  }

  async getPunishmentChest(userId: string): Promise<Punishment[]> {
    return db.select().from(punishments).where(and(eq(punishments.assignedBy, userId), isNotNull(punishments.stockpiledAt), isNull(punishments.deployedAt))).orderBy(desc(punishments.stockpiledAt));
  }

  async getJournalEntries(userId: string, role?: string): Promise<JournalEntry[]> {
    const conditions = [eq(journalEntries.userId, userId)];
    if (role) conditions.push(eq(journalEntries.createdAsRole, role));
    return db.select().from(journalEntries).where(and(...conditions)).orderBy(desc(journalEntries.createdAt));
  }

  async createJournalEntry(entry: InsertJournal): Promise<JournalEntry> {
    const [newEntry] = await db.insert(journalEntries).values(entry).returning();
    return newEntry;
  }

  async getNotifications(userId: string, role?: string): Promise<Notification[]> {
    const conditions = [eq(notifications.userId, userId)];
    if (role) conditions.push(eq(notifications.createdAsRole, role));
    return db.select().from(notifications).where(and(...conditions)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async dismissNotification(notificationId: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, notificationId));
  }

  async markNotificationRead(notificationId: string): Promise<Notification | undefined> {
    const [updated] = await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId)).returning();
    return updated;
  }

  async getActivityLog(userId: string, role?: string): Promise<ActivityLogEntry[]> {
    const conditions = [eq(activityLog.userId, userId)];
    if (role) conditions.push(eq(activityLog.createdAsRole, role));
    return db.select().from(activityLog).where(and(...conditions)).orderBy(desc(activityLog.createdAt));
  }

  async logActivity(userId: string, action: string, detail?: string, createdAsRole?: string): Promise<ActivityLogEntry> {
    const [entry] = await db.insert(activityLog).values({ userId, action, detail, ...(createdAsRole ? { createdAsRole } : {}) }).returning();
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
  async getRitualById(id: string): Promise<Ritual | undefined> {
    const [r] = await db.select().from(rituals).where(eq(rituals.id, id)).limit(1);
    return r;
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
  async getLimitById(id: string): Promise<Limit | undefined> {
    const [r] = await db.select().from(limits).where(eq(limits.id, id)).limit(1);
    return r;
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
  async deleteSecret(id: string): Promise<void> {
    await db.delete(secrets).where(eq(secrets.id, id));
  }

  async getWagers(userId: string): Promise<Wager[]> {
    return db.select().from(wagers).where(eq(wagers.userId, userId)).orderBy(desc(wagers.createdAt));
  }
  async getWagerById(id: string): Promise<Wager | undefined> {
    const [r] = await db.select().from(wagers).where(eq(wagers.id, id)).limit(1);
    return r;
  }

  async createWager(wager: InsertWager): Promise<Wager> {
    const [w] = await db.insert(wagers).values(wager).returning();
    return w;
  }

  async updateWager(id: string, data: Partial<Wager>): Promise<Wager | undefined> {
    const [w] = await db.update(wagers).set(data).where(eq(wagers.id, id)).returning();
    return w;
  }
  async deleteWager(id: string): Promise<void> {
    await db.delete(wagers).where(eq(wagers.id, id));
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
  async deleteRating(id: string): Promise<void> {
    await db.delete(ratings).where(eq(ratings.id, id));
  }

  async getCountdownEvents(userId: string): Promise<CountdownEvent[]> {
    return db.select().from(countdownEvents).where(eq(countdownEvents.userId, userId)).orderBy(desc(countdownEvents.createdAt));
  }
  async getCountdownEventById(id: string): Promise<CountdownEvent | undefined> {
    const [r] = await db.select().from(countdownEvents).where(eq(countdownEvents.id, id)).limit(1);
    return r;
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
  async deletePermissionRequest(id: string): Promise<void> {
    await db.delete(permissionRequests).where(eq(permissionRequests.id, id));
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
  async deleteDevotion(id: string): Promise<void> {
    await db.delete(devotions).where(eq(devotions.id, id));
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
  async deleteConflict(id: string): Promise<void> {
    await db.delete(conflicts).where(eq(conflicts.id, id));
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
  async deleteDesiredChange(id: string): Promise<void> {
    await db.delete(desiredChanges).where(eq(desiredChanges.id, id));
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
  async deletePlaySession(id: string): Promise<void> {
    await db.delete(playSessions).where(eq(playSessions.id, id));
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

  async getDemandTimers(toUserId: string, role?: string): Promise<DemandTimer[]> {
    const conditions = [eq(demandTimers.toUserId, toUserId)];
    if (role) conditions.push(eq(demandTimers.createdAsRole, role));
    return db.select().from(demandTimers).where(and(...conditions)).orderBy(desc(demandTimers.createdAt));
  }

  async createDemandTimer(timer: InsertDemandTimer): Promise<DemandTimer> {
    const [t] = await db.insert(demandTimers).values(timer).returning();
    return t;
  }

  async respondDemandTimer(id: string): Promise<DemandTimer | undefined> {
    const [t] = await db.update(demandTimers).set({ responded: true }).where(eq(demandTimers.id, id)).returning();
    return t;
  }

  async getQuickCommands(toUserId: string, role?: string): Promise<QuickCommand[]> {
    const conditions = [eq(quickCommands.toUserId, toUserId)];
    if (role) conditions.push(eq(quickCommands.createdAsRole, role));
    return db.select().from(quickCommands).where(and(...conditions)).orderBy(desc(quickCommands.createdAt));
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

  async getAccusations(toUserId: string, role?: string): Promise<Accusation[]> {
    const conditions = [eq(accusations.toUserId, toUserId)];
    if (role) conditions.push(eq(accusations.createdAsRole, role));
    return db.select().from(accusations).where(and(...conditions)).orderBy(desc(accusations.createdAt));
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
  async getIntensitySessionById(id: string): Promise<IntensitySession | undefined> {
    const [r] = await db.select().from(intensitySessions).where(eq(intensitySessions.id, id)).limit(1);
    return r;
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
  async getTrialStepById(id: string): Promise<TrialStep | undefined> {
    const [r] = await db.select().from(trialSteps).where(eq(trialSteps.id, id)).limit(1);
    return r;
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
  async getEnduranceChallengesForPair(userIds: string[]): Promise<EnduranceChallenge[]> {
    return db.select().from(enduranceChallenges).where(
      and(inArray(enduranceChallenges.userId, userIds), inArray(enduranceChallenges.targetUserId, userIds))
    ).orderBy(desc(enduranceChallenges.createdAt));
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

  async getTasksForPair(userIds: string[], role?: string): Promise<Task[]> {
    const conditions = [inArray(tasks.userId, userIds)];
    if (role) conditions.push(eq(tasks.createdAsRole, role));
    return db.select().from(tasks).where(and(...conditions)).orderBy(desc(tasks.createdAt));
  }
  async getCheckInsForPair(userIds: string[], role?: string): Promise<CheckIn[]> {
    const conditions = [inArray(checkIns.userId, userIds)];
    if (role) conditions.push(eq(checkIns.createdAsRole, role));
    return db.select().from(checkIns).where(and(...conditions)).orderBy(desc(checkIns.createdAt));
  }
  async getRitualsForPair(userIds: string[], role?: string): Promise<Ritual[]> {
    const conditions = [inArray(rituals.userId, userIds)];
    if (role) conditions.push(eq(rituals.createdAsRole, role));
    return db.select().from(rituals).where(and(...conditions)).orderBy(desc(rituals.createdAt));
  }
  async getLimitsForPair(userIds: string[], role?: string): Promise<Limit[]> {
    const conditions = [inArray(limits.userId, userIds)];
    if (role) conditions.push(eq(limits.createdAsRole, role));
    return db.select().from(limits).where(and(...conditions)).orderBy(desc(limits.createdAt));
  }
  async getSecretsForPair(userIds: string[], role?: string): Promise<Secret[]> {
    const conditions = [inArray(secrets.userId, userIds)];
    if (role) conditions.push(eq(secrets.createdAsRole, role));
    return db.select().from(secrets).where(and(...conditions)).orderBy(desc(secrets.createdAt));
  }
  async getWagersForPair(userIds: string[], role?: string): Promise<Wager[]> {
    const conditions = [inArray(wagers.userId, userIds)];
    if (role) conditions.push(eq(wagers.createdAsRole, role));
    return db.select().from(wagers).where(and(...conditions)).orderBy(desc(wagers.createdAt));
  }
  async getRatingsForPair(userIds: string[], role?: string): Promise<Rating[]> {
    const conditions = [inArray(ratings.userId, userIds)];
    if (role) conditions.push(eq(ratings.createdAsRole, role));
    return db.select().from(ratings).where(and(...conditions)).orderBy(desc(ratings.createdAt));
  }
  async getCountdownEventsForPair(userIds: string[], role?: string): Promise<CountdownEvent[]> {
    const conditions = [inArray(countdownEvents.userId, userIds)];
    if (role) conditions.push(eq(countdownEvents.createdAsRole, role));
    return db.select().from(countdownEvents).where(and(...conditions)).orderBy(desc(countdownEvents.createdAt));
  }
  async getStandingOrdersForPair(userIds: string[], role?: string): Promise<StandingOrder[]> {
    const conditions = [inArray(standingOrders.userId, userIds)];
    if (role) conditions.push(eq(standingOrders.createdAsRole, role));
    return db.select().from(standingOrders).where(and(...conditions)).orderBy(desc(standingOrders.createdAt));
  }
  async getPermissionRequestsForPair(userIds: string[], role?: string): Promise<PermissionRequest[]> {
    const conditions = [inArray(permissionRequests.userId, userIds)];
    if (role) conditions.push(eq(permissionRequests.createdAsRole, role));
    return db.select().from(permissionRequests).where(and(...conditions)).orderBy(desc(permissionRequests.createdAt));
  }
  async getDevotionsForPair(userIds: string[], role?: string): Promise<Devotion[]> {
    const conditions = [inArray(devotions.userId, userIds)];
    if (role) conditions.push(eq(devotions.createdAsRole, role));
    return db.select().from(devotions).where(and(...conditions)).orderBy(desc(devotions.createdAt));
  }
  async getConflictsForPair(userIds: string[], _role?: string): Promise<Conflict[]> {
    return db.select().from(conflicts).where(inArray(conflicts.userId, userIds)).orderBy(desc(conflicts.createdAt));
  }
  async getDesiredChangesForPair(userIds: string[], role?: string): Promise<DesiredChange[]> {
    const conditions = [inArray(desiredChanges.userId, userIds)];
    if (role) conditions.push(eq(desiredChanges.createdAsRole, role));
    return db.select().from(desiredChanges).where(and(...conditions)).orderBy(desc(desiredChanges.createdAt));
  }
  async getPlaySessionsForPair(userIds: string[], role?: string): Promise<PlaySession[]> {
    const conditions = [inArray(playSessions.userId, userIds)];
    if (role) conditions.push(eq(playSessions.createdAsRole, role));
    return db.select().from(playSessions).where(and(...conditions)).orderBy(desc(playSessions.createdAt));
  }
  async getIntensitySessionsForPair(userIds: string[], role?: string): Promise<IntensitySession[]> {
    const conditions = [inArray(intensitySessions.userId, userIds)];
    if (role) conditions.push(eq(intensitySessions.createdAsRole, role));
    return db.select().from(intensitySessions).where(and(...conditions)).orderBy(desc(intensitySessions.createdAt));
  }
  async getObedienceTrialsForPair(userIds: string[], role?: string): Promise<ObedienceTrial[]> {
    const conditions = [inArray(obedienceTrials.userId, userIds)];
    if (role) conditions.push(eq(obedienceTrials.createdAsRole, role));
    return db.select().from(obedienceTrials).where(and(...conditions)).orderBy(desc(obedienceTrials.createdAt));
  }
  async getSensationCardsForPair(userIds: string[], role?: string): Promise<SensationCard[]> {
    const conditions = [inArray(sensationCards.userId, userIds)];
    if (role) conditions.push(eq(sensationCards.createdAsRole, role));
    return db.select().from(sensationCards).where(and(...conditions)).orderBy(desc(sensationCards.createdAt));
  }
  async getSensationSpinsForPair(userIds: string[], role?: string): Promise<SensationSpin[]> {
    const conditions = [inArray(sensationSpins.userId, userIds)];
    if (role) conditions.push(eq(sensationSpins.cardType, role));
    return db.select().from(sensationSpins).where(and(...conditions)).orderBy(desc(sensationSpins.createdAt));
  }

  async getDaresForPair(userIds: string[], role?: string): Promise<Dare[]> {
    const conditions = [inArray(dares.userId, userIds)];
    if (role) conditions.push(eq(dares.createdAsRole, role));
    return db.select().from(dares).where(and(...conditions)).orderBy(desc(dares.createdAt));
  }
  async getRewardsForPair(userIds: string[], role?: string): Promise<Reward[]> {
    const conditions = [inArray(rewards.userId, userIds)];
    if (role) conditions.push(eq(rewards.createdAsRole, role));
    return db.select().from(rewards).where(and(...conditions)).orderBy(desc(rewards.createdAt));
  }
  async getRewardByWagerSourceId(wagerSourceId: string): Promise<Reward | undefined> {
    const [reward] = await db.select().from(rewards).where(eq(rewards.wagerSourceId, wagerSourceId)).limit(1);
    return reward;
  }
  async getPunishmentsForPair(userIds: string[], role?: string): Promise<Punishment[]> {
    const conditions = [inArray(punishments.userId, userIds)];
    if (role) conditions.push(eq(punishments.createdAsRole, role));
    return db.select().from(punishments).where(and(...conditions)).orderBy(desc(punishments.createdAt));
  }
  async getAchievementsForPair(userIds: string[], role?: string): Promise<Achievement[]> {
    const conditions = [inArray(achievements.userId, userIds)];
    if (role) conditions.push(eq(achievements.createdAsRole, role));
    return db.select().from(achievements).where(and(...conditions)).orderBy(desc(achievements.unlockedAt));
  }
  async getActivityLogForPair(userIds: string[], role?: string): Promise<ActivityLogEntry[]> {
    const conditions = [inArray(activityLog.userId, userIds)];
    if (role) conditions.push(eq(activityLog.createdAsRole, role));
    return db.select().from(activityLog).where(and(...conditions)).orderBy(desc(activityLog.createdAt));
  }

  async getMedia(entityType: string, entityId: string): Promise<Media[]> {
    return db.select().from(media).where(and(eq(media.entityType, entityType), eq(media.entityId, entityId))).orderBy(desc(media.createdAt));
  }
  async getMediaById(id: string): Promise<Media | undefined> {
    const [r] = await db.select().from(media).where(eq(media.id, id)).limit(1);
    return r;
  }
  async getMediaByUser(userId: string): Promise<Media[]> {
    return db.select().from(media).where(eq(media.userId, userId)).orderBy(desc(media.createdAt));
  }
  async createMedia(m: InsertMedia): Promise<Media> {
    const [item] = await db.insert(media).values(m).returning();
    return item;
  }
  async deleteMedia(id: string): Promise<void> {
    await db.delete(media).where(eq(media.id, id));
  }

  async getStickers(recipientId: string): Promise<Sticker[]> {
    return db.select().from(stickers).where(eq(stickers.recipientId, recipientId)).orderBy(desc(stickers.createdAt));
  }
  async getStickersForPair(userIds: string[], role?: string): Promise<Sticker[]> {
    const conditions = [inArray(stickers.recipientId, userIds)];
    if (role) conditions.push(eq(stickers.createdAsRole, role));
    return db.select().from(stickers).where(and(...conditions)).orderBy(desc(stickers.createdAt));
  }
  async createSticker(sticker: InsertSticker): Promise<Sticker> {
    const [s] = await db.insert(stickers).values(sticker).returning();
    return s;
  }

  async getFeatureSettings(pairOwnerId: string): Promise<FeatureSetting[]> {
    return db.select().from(featureSettings).where(eq(featureSettings.pairOwnerId, pairOwnerId));
  }
  async upsertFeatureSetting(pairOwnerId: string, featureKey: string, enabled: boolean): Promise<FeatureSetting> {
    const existing = await db.select().from(featureSettings).where(and(eq(featureSettings.pairOwnerId, pairOwnerId), eq(featureSettings.featureKey, featureKey)));
    if (existing.length > 0) {
      const [updated] = await db.update(featureSettings).set({ enabled, updatedAt: new Date() }).where(eq(featureSettings.id, existing[0].id)).returning();
      return updated;
    }
    const [created] = await db.insert(featureSettings).values({ pairOwnerId, featureKey, enabled }).returning();
    return created;
  }

  async getBodyMapZones(userId: string): Promise<BodyMapZone[]> {
    return db.select().from(bodyMapZones).where(eq(bodyMapZones.userId, userId));
  }

  async upsertBodyMapZone(userId: string, partnerId: string | null, zoneName: string, status: string, intensity: number, createdAsRole?: string): Promise<BodyMapZone> {
    const existing = await db.select().from(bodyMapZones).where(and(eq(bodyMapZones.userId, userId), eq(bodyMapZones.zoneName, zoneName)));
    if (existing.length > 0) {
      if (status === "neutral") {
        await db.delete(bodyMapZones).where(eq(bodyMapZones.id, existing[0].id));
        return { ...existing[0], status, intensity };
      }
      const [updated] = await db.update(bodyMapZones).set({ status, intensity, partnerId, updatedAt: new Date() }).where(eq(bodyMapZones.id, existing[0].id)).returning();
      return updated;
    }
    if (status === "neutral") return { id: "", userId, partnerId, zoneName, status, intensity, createdAsRole: createdAsRole || "sub", createdAt: new Date(), updatedAt: new Date() };
    const [created] = await db.insert(bodyMapZones).values({ userId, partnerId, zoneName, status, intensity, ...(createdAsRole ? { createdAsRole } : {}) }).returning();
    return created;
  }

  async deleteBodyMapZones(userId: string): Promise<void> {
    await db.delete(bodyMapZones).where(eq(bodyMapZones.userId, userId));
  }

  async updateUserStickerBalance(userId: string, balance: number): Promise<User | undefined> {
    const [user] = await db.update(users).set({ stickerBalance: balance }).where(eq(users.id, userId)).returning();
    return user;
  }

  async updateUserProfilePic(userId: string, profilePic: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ profilePic }).where(eq(users.id, userId)).returning();
    return user;
  }

  async updateUserProfileType(userId: string, profileType: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ profileType }).where(eq(users.id, userId)).returning();
    return user;
  }

  async getJournalEntriesForPair(userIds: string[], role?: string): Promise<JournalEntry[]> {
    const conditions = [inArray(journalEntries.userId, userIds)];
    if (role) conditions.push(eq(journalEntries.createdAsRole, role));
    return db.select().from(journalEntries).where(and(...conditions)).orderBy(desc(journalEntries.createdAt));
  }

  async unlockJournalEntry(id: string, unlockedBy: string): Promise<JournalEntry | undefined> {
    const [entry] = await db.update(journalEntries).set({ unlockedBy }).where(eq(journalEntries.id, id)).returning();
    return entry;
  }

  async getLockedMediaForPair(userIds: string[], role?: string): Promise<Media[]> {
    const conditions = [inArray(media.userId, userIds), eq(media.entityType, "locked_media")];
    if (role) conditions.push(eq(media.createdAsRole, role));
    return db.select().from(media).where(and(...conditions)).orderBy(desc(media.createdAt));
  }

  async unlockMedia(id: string, unlockedBy: string): Promise<Media | undefined> {
    const [m] = await db.update(media).set({ isLocked: false, unlockedBy }).where(eq(media.id, id)).returning();
    return m;
  }

  async getContracts(userId: string): Promise<Contract[]> {
    return db.select().from(contracts).where(eq(contracts.creatorId, userId)).orderBy(desc(contracts.createdAt));
  }

  async createContract(contract: InsertContract): Promise<Contract> {
    const [c] = await db.insert(contracts).values(contract).returning();
    return c;
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract | undefined> {
    const [c] = await db.update(contracts).set(data).where(eq(contracts.id, id)).returning();
    return c;
  }

  async getConfessions(userId: string): Promise<Confession[]> {
    return db.select().from(confessions).where(eq(confessions.userId, userId)).orderBy(desc(confessions.createdAt));
  }

  async createConfession(confession: InsertConfession): Promise<Confession> {
    const [c] = await db.insert(confessions).values(confession).returning();
    return c;
  }

  async updateConfession(id: string, data: Partial<Confession>): Promise<Confession | undefined> {
    const [c] = await db.update(confessions).set(data).where(eq(confessions.id, id)).returning();
    return c;
  }

  async getTrainingPrograms(userId: string): Promise<TrainingProgram[]> {
    return db.select().from(trainingPrograms).where(eq(trainingPrograms.creatorId, userId)).orderBy(desc(trainingPrograms.createdAt));
  }

  async createTrainingProgram(program: InsertTrainingProgram): Promise<TrainingProgram> {
    const [p] = await db.insert(trainingPrograms).values(program).returning();
    return p;
  }

  async updateTrainingProgram(id: string, data: Partial<TrainingProgram>): Promise<TrainingProgram | undefined> {
    const [p] = await db.update(trainingPrograms).set(data).where(eq(trainingPrograms.id, id)).returning();
    return p;
  }

  async getTrainingDays(programId: string): Promise<TrainingDay[]> {
    return db.select().from(trainingDays).where(eq(trainingDays.programId, programId)).orderBy(desc(trainingDays.createdAt));
  }

  async createTrainingDay(day: InsertTrainingDay): Promise<TrainingDay> {
    const [d] = await db.insert(trainingDays).values(day).returning();
    return d;
  }

  async getTrainingEnrollments(userId: string): Promise<TrainingEnrollment[]> {
    return db.select().from(trainingEnrollments).where(eq(trainingEnrollments.userId, userId));
  }

  async createTrainingEnrollment(enrollment: InsertTrainingEnrollment): Promise<TrainingEnrollment> {
    const [e] = await db.insert(trainingEnrollments).values(enrollment).returning();
    return e;
  }

  async updateTrainingEnrollment(id: string, data: Partial<TrainingEnrollment>): Promise<TrainingEnrollment | undefined> {
    const [e] = await db.update(trainingEnrollments).set(data).where(eq(trainingEnrollments.id, id)).returning();
    return e;
  }

  async getSceneScripts(userId: string): Promise<SceneScript[]> {
    return db.select().from(sceneScripts).where(eq(sceneScripts.creatorId, userId)).orderBy(desc(sceneScripts.createdAt));
  }

  async createSceneScript(script: InsertSceneScript): Promise<SceneScript> {
    const [s] = await db.insert(sceneScripts).values(script).returning();
    return s;
  }

  async updateSceneScript(id: string, data: Partial<SceneScript>): Promise<SceneScript | undefined> {
    const [s] = await db.update(sceneScripts).set(data).where(eq(sceneScripts.id, id)).returning();
    return s;
  }

  async deleteSceneScript(id: string): Promise<void> {
    await db.delete(sceneScripts).where(eq(sceneScripts.id, id));
  }

  async getScriptSteps(scriptId: string): Promise<ScriptStep[]> {
    return db.select().from(scriptSteps).where(eq(scriptSteps.scriptId, scriptId)).orderBy(desc(scriptSteps.createdAt));
  }

  async createScriptStep(step: InsertScriptStep): Promise<ScriptStep> {
    const [s] = await db.insert(scriptSteps).values(step).returning();
    return s;
  }

  async updateScriptStep(id: string, data: Partial<ScriptStep>): Promise<ScriptStep | undefined> {
    const [s] = await db.update(scriptSteps).set(data).where(eq(scriptSteps.id, id)).returning();
    return s;
  }

  async deleteScriptStep(id: string): Promise<void> {
    await db.delete(scriptSteps).where(eq(scriptSteps.id, id));
  }

  async getInterrogationSessions(userId: string): Promise<InterrogationSession[]> {
    return db.select().from(interrogationSessions).where(eq(interrogationSessions.inquisitorId, userId)).orderBy(desc(interrogationSessions.createdAt));
  }

  async getInterrogationSessionById(id: string): Promise<InterrogationSession | undefined> {
    const [s] = await db.select().from(interrogationSessions).where(eq(interrogationSessions.id, id)).limit(1);
    return s;
  }

  async getActiveInterrogationSession(userId: string): Promise<InterrogationSession | null> {
    const rows = await db.select().from(interrogationSessions).where(
      and(
        or(eq(interrogationSessions.inquisitorId, userId), eq(interrogationSessions.subjectId, userId)),
        or(eq(interrogationSessions.status, "active"), eq(interrogationSessions.status, "answered"))
      )
    ).orderBy(desc(interrogationSessions.createdAt)).limit(1);
    return rows[0] || null;
  }

  async createInterrogationSession(session: InsertInterrogationSession): Promise<InterrogationSession> {
    const [s] = await db.insert(interrogationSessions).values(session).returning();
    return s;
  }

  async updateInterrogationSession(id: string, data: Partial<InterrogationSession>): Promise<InterrogationSession | undefined> {
    const [s] = await db.update(interrogationSessions).set(data).where(eq(interrogationSessions.id, id)).returning();
    return s;
  }

  async getInterrogationQuestions(sessionId: string): Promise<InterrogationQuestion[]> {
    return db.select().from(interrogationQuestions).where(eq(interrogationQuestions.sessionId, sessionId)).orderBy(desc(interrogationQuestions.createdAt));
  }

  async createInterrogationQuestion(question: InsertInterrogationQuestion): Promise<InterrogationQuestion> {
    const [q] = await db.insert(interrogationQuestions).values(question).returning();
    return q;
  }

  async updateInterrogationQuestion(id: string, data: Partial<InterrogationQuestion>): Promise<InterrogationQuestion | undefined> {
    const [q] = await db.update(interrogationQuestions).set(data).where(eq(interrogationQuestions.id, id)).returning();
    return q;
  }

  async getAftercareItems(sessionId: string): Promise<AftercareItem[]> {
    return db.select().from(aftercareItems).where(eq(aftercareItems.sessionId, sessionId)).orderBy(desc(aftercareItems.createdAt));
  }

  async createAftercareItem(item: InsertAftercareItem): Promise<AftercareItem> {
    const [a] = await db.insert(aftercareItems).values(item).returning();
    return a;
  }

  async updateAftercareItem(id: string, data: Partial<AftercareItem>): Promise<AftercareItem | undefined> {
    const [a] = await db.update(aftercareItems).set(data).where(eq(aftercareItems.id, id)).returning();
    return a;
  }

  async getStreaks(userId: string): Promise<Streak[]> {
    return db.select().from(streaks).where(eq(streaks.userId, userId));
  }

  async upsertStreak(userId: string, streakType: string, date: string): Promise<Streak> {
    const existing = await db.select().from(streaks).where(and(eq(streaks.userId, userId), eq(streaks.streakType, streakType)));
    if (existing.length > 0) {
      const streak = existing[0];
      const lastDate = streak.lastCompletedDate;
      const yesterday = new Date(date);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      let newCount = 1;
      if (lastDate === yesterdayStr) {
        newCount = (streak.currentCount || 0) + 1;
      } else if (lastDate === date) {
        return streak;
      }
      const longestCount = Math.max(streak.longestCount || 0, newCount);
      const [updated] = await db.update(streaks).set({ currentCount: newCount, longestCount, lastCompletedDate: date, updatedAt: new Date() }).where(eq(streaks.id, streak.id)).returning();
      return updated;
    }
    const [created] = await db.insert(streaks).values({ userId, streakType, currentCount: 1, longestCount: 1, lastCompletedDate: date }).returning();
    return created;
  }

  async getStandingOrderById(id: string): Promise<StandingOrder | undefined> {
    const [row] = await db.select().from(standingOrders).where(eq(standingOrders.id, id)).limit(1);
    return row;
  }

  async getPermissionRequestById(id: string): Promise<PermissionRequest | undefined> {
    const [row] = await db.select().from(permissionRequests).where(eq(permissionRequests.id, id)).limit(1);
    return row;
  }

  async getDevotionById(id: string): Promise<Devotion | undefined> {
    const [row] = await db.select().from(devotions).where(eq(devotions.id, id)).limit(1);
    return row;
  }

  async getConflictById(id: string): Promise<Conflict | undefined> {
    const [row] = await db.select().from(conflicts).where(eq(conflicts.id, id)).limit(1);
    return row;
  }

  async getDesiredChangeById(id: string): Promise<DesiredChange | undefined> {
    const [row] = await db.select().from(desiredChanges).where(eq(desiredChanges.id, id)).limit(1);
    return row;
  }

  async getPlaySessionById(id: string): Promise<PlaySession | undefined> {
    const [row] = await db.select().from(playSessions).where(eq(playSessions.id, id)).limit(1);
    return row;
  }

  async getContractById(id: string): Promise<Contract | undefined> {
    const [row] = await db.select().from(contracts).where(eq(contracts.id, id)).limit(1);
    return row;
  }

  async getConfessionById(id: string): Promise<Confession | undefined> {
    const [row] = await db.select().from(confessions).where(eq(confessions.id, id)).limit(1);
    return row;
  }

  async getTrainingProgramById(id: string): Promise<TrainingProgram | undefined> {
    const [row] = await db.select().from(trainingPrograms).where(eq(trainingPrograms.id, id)).limit(1);
    return row;
  }

  async getTrainingEnrollmentById(id: string): Promise<TrainingEnrollment | undefined> {
    const [row] = await db.select().from(trainingEnrollments).where(eq(trainingEnrollments.id, id)).limit(1);
    return row;
  }

  async getSceneScriptById(id: string): Promise<SceneScript | undefined> {
    const [row] = await db.select().from(sceneScripts).where(eq(sceneScripts.id, id)).limit(1);
    return row;
  }

  async getScriptStepById(id: string): Promise<ScriptStep | undefined> {
    const [row] = await db.select().from(scriptSteps).where(eq(scriptSteps.id, id)).limit(1);
    return row;
  }

  async getAftercareItemById(id: string): Promise<AftercareItem | undefined> {
    const [row] = await db.select().from(aftercareItems).where(eq(aftercareItems.id, id)).limit(1);
    return row;
  }

  async getSealedOrderById(id: string): Promise<SealedOrder | undefined> {
    const [row] = await db.select().from(sealedOrders).where(eq(sealedOrders.id, id)).limit(1);
    return row;
  }

  async getEnduranceChallengeById(id: string): Promise<EnduranceChallenge | undefined> {
    const [row] = await db.select().from(enduranceChallenges).where(eq(enduranceChallenges.id, id)).limit(1);
    return row;
  }

  async getObedienceTrialById(id: string): Promise<ObedienceTrial | undefined> {
    const [row] = await db.select().from(obedienceTrials).where(eq(obedienceTrials.id, id)).limit(1);
    return row;
  }

  async getSensationCardById(id: string): Promise<SensationCard | undefined> {
    const [row] = await db.select().from(sensationCards).where(eq(sensationCards.id, id)).limit(1);
    return row;
  }

  async getSensationSpinById(id: string): Promise<SensationSpin | undefined> {
    const [row] = await db.select().from(sensationSpins).where(eq(sensationSpins.id, id)).limit(1);
    return row;
  }

  async getAccusationById(id: string): Promise<Accusation | undefined> {
    const [row] = await db.select().from(accusations).where(eq(accusations.id, id)).limit(1);
    return row;
  }

  async createSimulation(data: InsertSimulation): Promise<Simulation> {
    const [sim] = await db.insert(simulations).values(data).returning();
    return sim;
  }

  async getActiveSimulation(userId: string): Promise<Simulation | undefined> {
    const [sim] = await db.select().from(simulations)
      .where(and(
        or(eq(simulations.userId, userId), eq(simulations.partnerId, userId)),
        eq(simulations.active, true)
      ))
      .limit(1);
    return sim;
  }

  async deactivateSimulation(id: string): Promise<Simulation | undefined> {
    const [sim] = await db.update(simulations)
      .set({ active: false, deactivatedAt: new Date() })
      .where(eq(simulations.id, id))
      .returning();
    return sim;
  }

  async updateSimulationGeneratedItems(id: string, generatedItems: any): Promise<Simulation | undefined> {
    const [sim] = await db.update(simulations)
      .set({ generatedItems })
      .where(eq(simulations.id, id))
      .returning();
    return sim;
  }

  async deactivateSimulationItems(simulationId: string): Promise<void> {
    await db.update(tasks)
      .set({ done: true })
      .where(eq(tasks.simulationId, simulationId));
    await db.update(rituals)
      .set({ active: false })
      .where(eq(rituals.simulationId, simulationId));
    await db.update(standingOrders)
      .set({ active: false })
      .where(eq(standingOrders.simulationId, simulationId));
    await db.update(dares)
      .set({ completed: true })
      .where(eq(dares.simulationId, simulationId));
    await db.update(punishments)
      .set({ status: "completed" })
      .where(eq(punishments.simulationId, simulationId));
    await db.update(rewards)
      .set({ unlocked: true })
      .where(eq(rewards.simulationId, simulationId));
    await db.update(wagers)
      .set({ status: "cancelled" })
      .where(eq(wagers.simulationId, simulationId));
    await db.update(devotions)
      .set({ completed: true })
      .where(eq(devotions.simulationId, simulationId));
    await db.update(sealedOrders)
      .set({ completed: true })
      .where(eq(sealedOrders.simulationId, simulationId));
    await db.delete(countdownEvents)
      .where(eq(countdownEvents.simulationId, simulationId));
    await db.update(enduranceChallenges)
      .set({ status: "cancelled" })
      .where(eq(enduranceChallenges.simulationId, simulationId));
    await db.update(obedienceTrials)
      .set({ status: "cancelled" })
      .where(eq(obedienceTrials.simulationId, simulationId));
    await db.update(sensationCards)
      .set({ active: false })
      .where(eq(sensationCards.simulationId, simulationId));
    await db.update(accusations)
      .set({ status: "dismissed" })
      .where(eq(accusations.simulationId, simulationId));
    await db.update(desiredChanges)
      .set({ status: "completed" })
      .where(eq(desiredChanges.simulationId, simulationId));
    await db.update(confessions)
      .set({ status: "dismissed" })
      .where(eq(confessions.simulationId, simulationId));
    await db.update(aftercareItems)
      .set({ completed: true })
      .where(eq(aftercareItems.simulationId, simulationId));
    await db.update(permissionRequests)
      .set({ status: "dismissed" })
      .where(eq(permissionRequests.simulationId, simulationId));
  }

  // Whispers
  async createWhisper(data: InsertWhisper): Promise<Whisper> {
    const [w] = await db.insert(whispers).values(data).returning();
    return w;
  }

  async getWhispers(userId: string, partnerId: string): Promise<Whisper[]> {
    const now = new Date();
    const results = await db.select().from(whispers).where(
      or(
        and(eq(whispers.senderId, userId), eq(whispers.receiverId, partnerId)),
        and(eq(whispers.senderId, partnerId), eq(whispers.receiverId, userId))
      )
    ).orderBy(desc(whispers.createdAt));
    return results.filter(w => w.etched || !w.expiresAt || new Date(w.expiresAt) > now);
  }

  async markWhisperRead(id: string): Promise<Whisper | undefined> {
    const [w] = await db.update(whispers).set({ readAt: new Date() }).where(eq(whispers.id, id)).returning();
    return w;
  }

  async etchWhisper(id: string): Promise<Whisper | undefined> {
    const [w] = await db.update(whispers).set({ etched: true, expiresAt: null }).where(eq(whispers.id, id)).returning();
    return w;
  }

  async getUnreadWhisperCount(userId: string): Promise<number> {
    const results = await db.select().from(whispers).where(
      and(eq(whispers.receiverId, userId), isNull(whispers.readAt))
    );
    const now = new Date();
    return results.filter(w => !w.expiresAt || new Date(w.expiresAt) > now).length;
  }

  // Altar
  async getAltarState(userId: string): Promise<AltarOffering | undefined> {
    const [state] = await db.select().from(altarOfferings).where(eq(altarOfferings.userId, userId));
    return state;
  }

  async claimAltarOffering(userId: string): Promise<AltarOffering> {
    const today = new Date().toISOString().split("T")[0];
    const existing = await this.getAltarState(userId);

    if (!existing) {
      const [created] = await db.insert(altarOfferings).values({
        userId,
        cycleDay: 1,
        lastClaimedDate: today,
        currentCycleStart: today,
      }).returning();
      return created;
    }

    if (existing.lastClaimedDate === today) {
      return existing;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newCycleDay: number;
    let newCycleStart = existing.currentCycleStart;
    let newRelics = existing.totalRelics;

    if (existing.lastClaimedDate === yesterdayStr) {
      if (existing.cycleDay >= 7) {
        newRelics = existing.totalRelics + 1;
        newCycleDay = 1;
        newCycleStart = today;
      } else {
        newCycleDay = existing.cycleDay + 1;
      }
    } else {
      newCycleDay = 1;
      newCycleStart = today;
    }

    const [updated] = await db.update(altarOfferings).set({
      cycleDay: newCycleDay,
      lastClaimedDate: today,
      currentCycleStart: newCycleStart,
      totalRelics: newRelics,
    }).where(eq(altarOfferings.id, existing.id)).returning();
    return updated;
  }

  // Notification Preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreference | undefined> {
    const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
    return prefs;
  }

  async upsertNotificationPreferences(userId: string, prefs: Partial<NotificationPreference>): Promise<NotificationPreference> {
    const existing = await this.getNotificationPreferences(userId);
    if (existing) {
      const { id, userId: _, createdAt, ...rest } = prefs as any;
      const [updated] = await db.update(notificationPreferences).set(rest).where(eq(notificationPreferences.userId, userId)).returning();
      return updated;
    }
    const [created] = await db.insert(notificationPreferences).values({ userId, ...prefs } as any).returning();
    return created;
  }

  // Ritual Completions
  async recordRitualCompletion(data: InsertRitualCompletion): Promise<RitualCompletion> {
    const [rc] = await db.insert(ritualCompletions).values(data).returning();
    await db.update(rituals).set({ consecutiveMisses: 0, lastCompleted: new Date() }).where(eq(rituals.id, data.ritualId));
    return rc;
  }

  async getRitualCompletions(userId: string, days: number): Promise<RitualCompletion[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    const results = await db.select().from(ritualCompletions).where(eq(ritualCompletions.userId, userId)).orderBy(desc(ritualCompletions.completedAt));
    return results.filter(rc => rc.date >= cutoffStr);
  }

  async incrementRitualMiss(ritualId: string): Promise<Ritual | undefined> {
    const [ritual] = await db.select().from(rituals).where(eq(rituals.id, ritualId));
    if (!ritual) return undefined;
    const [updated] = await db.update(rituals).set({
      missedCount: ritual.missedCount + 1,
      consecutiveMisses: ritual.consecutiveMisses + 1,
    }).where(eq(rituals.id, ritualId)).returning();
    return updated;
  }

  // Tribunals
  async createTribunal(data: InsertTribunal): Promise<Tribunal> {
    const [t] = await db.insert(tribunals).values(data).returning();
    return t;
  }

  async getTribunals(userId: string): Promise<Tribunal[]> {
    return db.select().from(tribunals).where(
      or(eq(tribunals.pairDomId, userId), eq(tribunals.pairSubId, userId))
    ).orderBy(desc(tribunals.createdAt));
  }

  async getCurrentTribunal(userId: string): Promise<Tribunal | undefined> {
    const all = await this.getTribunals(userId);
    return all[0];
  }

  async updateTribunalVerdict(id: string, verdict: string, grade: string, sentence?: string): Promise<Tribunal | undefined> {
    const [t] = await db.update(tribunals).set({ verdict, grade, sentence }).where(eq(tribunals.id, id)).returning();
    return t;
  }

  async updateTribunalPlea(id: string, plea: string): Promise<Tribunal | undefined> {
    const [t] = await db.update(tribunals).set({ plea }).where(eq(tribunals.id, id)).returning();
    return t;
  }

  // Tutorial
  async completeTutorial(userId: string): Promise<User | undefined> {
    const [u] = await db.update(users).set({ tutorialCompleted: true }).where(eq(users.id, userId)).returning();
    return u;
  }

  // Unlocks
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getAdminSettings(): Promise<AdminSettings | undefined> {
    const [s] = await db.select().from(adminSettings).limit(1);
    return s;
  }

  async updateAdminSettings(data: Partial<AdminSettings>): Promise<AdminSettings | undefined> {
    const existing = await this.getAdminSettings();
    if (!existing) {
      const [created] = await db.insert(adminSettings).values({
        restrictionsEnabled: data.restrictionsEnabled ?? true,
        maintenanceMode: data.maintenanceMode ?? false,
        globalMessage: data.globalMessage ?? null,
      }).returning();
      return created;
    }
    const [s] = await db.update(adminSettings).set({ ...data, updatedAt: new Date() }).where(eq(adminSettings.id, existing.id)).returning();
    return s;
  }

  async getAllUsersAdmin(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllSecretsAdmin(): Promise<Secret[]> {
    return db.select().from(secrets).orderBy(desc(secrets.createdAt));
  }

  async getAllWhispersAdmin(): Promise<Whisper[]> {
    return db.select().from(whispers).orderBy(desc(whispers.createdAt));
  }

  async setUserLevelOverride(userId: string, levelOverride: number | null): Promise<User | undefined> {
    const [u] = await db.update(users).set({ levelOverride }).where(eq(users.id, userId)).returning();
    return u;
  }

  async setUserAdmin(userId: string, isAdmin: boolean): Promise<User | undefined> {
    const [u] = await db.update(users).set({ isAdmin }).where(eq(users.id, userId)).returning();
    return u;
  }

  async getAdminStickers(): Promise<AdminSticker[]> {
    return db.select().from(adminStickers).orderBy(desc(adminStickers.createdAt));
  }

  async createAdminSticker(data: InsertAdminSticker): Promise<AdminSticker> {
    const [s] = await db.insert(adminStickers).values(data).returning();
    return s;
  }

  async deleteAdminSticker(id: string): Promise<void> {
    await db.delete(adminStickers).where(eq(adminStickers.id, id));
  }

  async getTrinkets(): Promise<Trinket[]> {
    return db.select().from(trinkets).orderBy(desc(trinkets.createdAt));
  }

  async createTrinket(data: InsertTrinket): Promise<Trinket> {
    const [t] = await db.insert(trinkets).values(data).returning();
    return t;
  }

  async deleteTrinket(id: string): Promise<void> {
    await db.delete(trinkets).where(eq(trinkets.id, id));
  }

  async getUserTrinkets(userId: string): Promise<(UserTrinket & { trinket?: Trinket })[]> {
    const uts = await db.select().from(userTrinkets).where(eq(userTrinkets.userId, userId)).orderBy(desc(userTrinkets.earnedAt));
    const allTrinkets = await this.getTrinkets();
    const trinketMap = new Map(allTrinkets.map(t => [t.id, t]));
    return uts.map(ut => ({ ...ut, trinket: trinketMap.get(ut.trinketId) }));
  }

  async awardTrinket(userId: string, trinketId: string): Promise<UserTrinket> {
    const [ut] = await db.insert(userTrinkets).values({ userId, trinketId }).returning();
    return ut;
  }

  async getUserTrinketById(id: string): Promise<UserTrinket | undefined> {
    const [ut] = await db.select().from(userTrinkets).where(eq(userTrinkets.id, id));
    return ut;
  }

  async equipTrinket(id: string, equipped: boolean): Promise<UserTrinket | undefined> {
    const [ut] = await db.update(userTrinkets).set({ equipped }).where(eq(userTrinkets.id, id)).returning();
    return ut;
  }

  async updateUserProfileCustomization(userId: string, data: { profileBorder?: string; profileBadge?: string }): Promise<User | undefined> {
    const [u] = await db.update(users).set(data).where(eq(users.id, userId)).returning();
    return u;
  }

  async createApiKey(data: InsertApiKey): Promise<ApiKey> {
    const [key] = await db.insert(apiKeys).values(data).returning();
    return key;
  }

  async getApiKeysByUser(userId: string): Promise<ApiKey[]> {
    return db.select().from(apiKeys).where(and(eq(apiKeys.userId, userId), eq(apiKeys.revoked, false))).orderBy(desc(apiKeys.createdAt));
  }

  async getApiKeyByPrefix(prefix: string): Promise<ApiKey | undefined> {
    const [key] = await db.select().from(apiKeys).where(and(eq(apiKeys.keyPrefix, prefix), eq(apiKeys.revoked, false)));
    return key;
  }

  async revokeApiKey(keyId: string, userId: string): Promise<ApiKey | undefined> {
    const [key] = await db.update(apiKeys).set({ revoked: true }).where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId))).returning();
    return key;
  }

  async touchApiKeyLastUsed(keyId: string): Promise<void> {
    await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, keyId));
  }
}

export const storage = new DatabaseStorage();
