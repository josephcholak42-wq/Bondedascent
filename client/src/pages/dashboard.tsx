import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, Link as WouterLink } from "wouter";
import { SexyIcon } from "@/components/sexy-icon";
import {
  Lock,
  Key,
  Shield,
  AlertCircle,
  CheckCircle,
  FileText,
  User,
  ChevronRight,
  Activity,
  Clock,
  Flame,
  Menu,
  X,
  Terminal,
  Fingerprint,
  Camera,
  DollarSign,
  Send,
  BookOpen,
  Anchor,
  CreditCard,
  Gift,
  Mail,
  Star,
  Heart,
  Sliders,
  Map,
  Film,
  Target,
  Box,
  Home,
  PieChart,
  Award,
  Zap,
  Settings,
  LogOut,
  Trash2,
  Bell,
  ShieldAlert,
  RefreshCw,
  MessageSquare,
  RotateCcw,
  Dices,
  List,
  Play,
  Pause,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  Music,
  Eye,
  Coffee,
  Thermometer,
  Info,
  HeartPulse,
  FlameKindling,
  Sparkles,
  BookHeart,
  UserRoundCheck,
  HandMetal,
  Ear,
  Hand,
  Gavel,
  FileSignature,
  Timer,
  Unlock,
  Ban,
  Search,
  Check,
  XCircle,
  Loader2,
  Plus,
  Square,
  Link,
  Crown,
  Crosshair,
  Siren,
  SendHorizonal,
  Layers,
  ListChecks,
  Hourglass,
  ChevronDown,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useAuth,
  useLogout,
  useSwitchRole,
  useStats,
  useTasks,
  useCreateTask,
  useToggleTask,
  useDeleteTask,
  useCheckIns,
  useCreateCheckIn,
  useSpinDare,
  useCompleteDare,
  useDares,
  useRewards,
  useCreateReward,
  useToggleReward,
  usePunishments,
  useCreatePunishment,
  useUpdatePunishmentStatus,
  useJournal,
  useCreateJournal,
  useNotifications,
  useDismissNotification,
  useActivityLog,
  useLogActivity,
  usePartner,
  usePartnerStats,
  useGeneratePairCode,
  useJoinPairCode,
  useUnlinkPartner,
  usePartnerTasks,
  useCreatePartnerTask,
  usePartnerCheckIns,
  useReviewPartnerCheckIn,
  useCreatePartnerPunishment,
  useCreatePartnerReward,
  usePartnerActivity,
  useVapidPublicKey,
  useSubscribePush,
  useUnsubscribePush,
  useTestPush,
  useDemandTimers,
  useCreateDemandTimer,
  useRespondDemandTimer,
  useQuickCommands,
  useSendQuickCommand,
  useAcknowledgeCommand,
  usePresenceHeartbeat,
  usePartnerPresence,
  useToggleLockdown,
  useLockdownStatus,
  useSetEnforcementLevel,
  usePartnerEnforcementLevel,
  useMyEnforcementLevel,
  useOverrideRevokeRewards,
  useOverrideClearTasks,
  useOverrideForceCheckIn,
  useAccusations,
  usePartnerAccusations,
  useCreateAccusation,
  useRespondToAccusation,
  useStandingOrders,
  useRituals,
  useWagers,
  useDesiredChanges,
  useObedienceTrials,
  useEnduranceChallenges,
  useSealedOrders,
  useIntensitySessions,
  useCountdownEvents,
  usePlaySessions,
  useCreatePlaySession,
  useSecrets,
  useLimits,
  usePermissionRequests,
  useDevotions,
  useConflicts,
  useRatings,
  useStickers,
  useSendSticker,
  useFeatureSettings,
  useToggleFeature,
  useIsFeatureEnabled,
  useUploadMedia,
  useMedia,
  useDeleteMedia,
  useBodyMapZones,
  useUpdateBodyMapZone,
  useResetBodyMap,
  useUploadProfilePic,
  useTrends,
} from "@/lib/hooks";
import {
  PREBUILT_PUNISHMENTS,
  PUNISHMENT_CATEGORIES,
  type PrebuiltPunishment,
} from "@/lib/prebuilt-punishments";
import {
  PREBUILT_REWARDS,
  REWARD_CATEGORIES,
  type PrebuiltReward,
} from "@/lib/prebuilt-rewards";
import {
  PREBUILT_SCENES,
  SCENE_CATEGORIES,
  type PrebuiltScene,
} from "@/lib/prebuilt-scenes";
import { CommandProtocols, type FeedItem, type ActivityEntry } from "@/components/command-protocols";
import {
  useCreateRitual,
  useCreateStandingOrder,
  useCreateWager,
  useCreateDevotion,
  useCreateSecret,
  useCreateLimit,
  useCreateConflict,
  useCreateDesiredChange,
  useCreateCountdownEvent,
  useCreateRating,
  useCreatePermissionRequest,
  useDeleteRitual,
  useDeleteLimit,
  useDeleteCountdownEvent,
  useDeleteStandingOrder,
} from "@/lib/hooks";
import { AmbientPresence } from "@/components/ambient-presence";
const BodyMap3D = React.lazy(() => import("@/components/body-map-3d"));

export default function BondedAscentApp() {
  const [activeView, setActiveView] = useState("dashboard");
  const [isCrisisMode, setIsCrisisMode] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);
  const [checkInStep, setCheckInStep] = useState(0);
  const [checkInData, setCheckInData] = useState({
    mood: 5,
    obedience: 5,
    notes: "",
  });
  const [newTaskText, setNewTaskText] = useState("");
  const [newRewardName, setNewRewardName] = useState("");
  const [newPunishmentName, setNewPunishmentName] = useState("");
  const [punishCategoryFilter, setPunishCategoryFilter] = useState<
    string | null
  >(null);
  const [punishSearch, setPunishSearch] = useState("");
  const [rewardCategoryFilter, setRewardCategoryFilter] = useState<string | null>(null);
  const [rewardSearch, setRewardSearch] = useState("");
  const [sceneSearch, setSceneSearch] = useState("");
  const [sceneCategoryFilter, setSceneCategoryFilter] = useState<string | null>(null);
  const [journalContent, setJournalContent] = useState("");
  const [pairCodeInput, setPairCodeInput] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [pairError, setPairError] = useState<string | null>(null);
  const [pairSuccess, setPairSuccess] = useState<string | null>(null);


  const [trainingActive, setTrainingActive] = useState<string | null>(null);
  const [trainingTimer, setTrainingTimer] = useState(0);
  const [trainingCompleted, setTrainingCompleted] = useState<string[]>([]);
  const trainingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [scenePhase, setScenePhase] = useState<number>(-1);
  const [sceneTimer, setSceneTimer] = useState(0);
  const sceneIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [ladderLevel, setLadderLevel] = useState(1);

  const [sensoryToggles, setSensoryToggles] = useState<Record<string, boolean>>(
    { noise: false, visual: false, temp: false },
  );

  const [worshipDone, setWorshipDone] = useState(false);
  const [aftercareActions, setAftercareActions] = useState<string[]>([]);

  const { data: user } = useAuth();
  const logoutMutation = useLogout();
  const switchRoleMutation = useSwitchRole();
  const { data: stats } = useStats();
  const { data: tasks = [] } = useTasks();
  const createTaskMutation = useCreateTask();
  const toggleTaskMutation = useToggleTask();
  const deleteTaskMutation = useDeleteTask();
  const { data: checkIns = [] } = useCheckIns();
  const createCheckInMutation = useCreateCheckIn();
  const spinDareMutation = useSpinDare();
  const completeDareMutation = useCompleteDare();
  const { data: dares = [] } = useDares();
  const { data: rewards = [] } = useRewards();
  const createRewardMutation = useCreateReward();
  const toggleRewardMutation = useToggleReward();
  const { data: punishments = [] } = usePunishments();
  const createPunishmentMutation = useCreatePunishment();
  const updatePunishmentStatusMutation = useUpdatePunishmentStatus();
  const { data: journalEntries = [] } = useJournal();
  const createJournalMutation = useCreateJournal();
  const { data: notifications = [] } = useNotifications();
  const dismissNotificationMutation = useDismissNotification();
  const { data: activityLog = [] } = useActivityLog();

  const { data: partner } = usePartner();
  const { data: partnerStats } = usePartnerStats();
  const generatePairCodeMutation = useGeneratePairCode();
  const joinPairCodeMutation = useJoinPairCode();
  const unlinkPartnerMutation = useUnlinkPartner();
  const { data: partnerTasks = [] } = usePartnerTasks();
  const createPartnerTaskMutation = useCreatePartnerTask();
  const { data: partnerCheckIns = [] } = usePartnerCheckIns();
  const reviewPartnerCheckInMutation = useReviewPartnerCheckIn();
  const createPartnerPunishmentMutation = useCreatePartnerPunishment();
  const createPartnerRewardMutation = useCreatePartnerReward();
  const { data: partnerActivity = [] } = usePartnerActivity();
  const logActivityMutation = useLogActivity();

  const { data: demandTimers = [] } = useDemandTimers();
  const createDemandTimerMutation = useCreateDemandTimer();
  const respondDemandTimerMutation = useRespondDemandTimer();
  const { data: quickCommands = [] } = useQuickCommands();
  const sendQuickCommandMutation = useSendQuickCommand();
  const acknowledgeCommandMutation = useAcknowledgeCommand();
  const presenceHeartbeatMutation = usePresenceHeartbeat();
  const { data: partnerPresence } = usePartnerPresence(partner?.id);
  const toggleLockdownMutation = useToggleLockdown();
  const { data: lockdownStatus } = useLockdownStatus();
  const setEnforcementLevelMutation = useSetEnforcementLevel();
  const { data: partnerEnforcement } = usePartnerEnforcementLevel();
  const { data: myEnforcement } = useMyEnforcementLevel();
  const overrideRevokeRewardsMutation = useOverrideRevokeRewards();
  const overrideClearTasksMutation = useOverrideClearTasks();
  const overrideForceCheckInMutation = useOverrideForceCheckIn();
  const { data: accusations = [] } = useAccusations();
  const { data: partnerAccusations = [] } = usePartnerAccusations();
  const createAccusationMutation = useCreateAccusation();
  const respondToAccusationMutation = useRespondToAccusation();
  const [accusationInput, setAccusationInput] = useState("");
  const [accusationResponses, setAccusationResponses] = useState<
    Record<string, string>
  >({});

  const { data: standingOrders = [] } = useStandingOrders();
  const { data: rituals = [] } = useRituals();
  const { data: wagers = [] } = useWagers();
  const { data: desiredChanges = [] } = useDesiredChanges();
  const { data: obedienceTrials = [] } = useObedienceTrials();
  const { data: enduranceChallenges = [] } = useEnduranceChallenges();
  const { data: sealedOrders = [] } = useSealedOrders();
  const { data: secrets = [] } = useSecrets();
  const { data: limitsList = [] } = useLimits();
  const { data: permissionRequests = [] } = usePermissionRequests();
  const { data: devotionsList = [] } = useDevotions();
  const { data: conflictsList = [] } = useConflicts();
  const { data: ratingsList = [] } = useRatings();
  const { data: intensitySessions = [] } = useIntensitySessions();
  const { data: countdownEvents = [] } = useCountdownEvents();
  const { data: playSessions = [] } = usePlaySessions();
  const createPlaySessionMutation = useCreatePlaySession();

  const { data: stickersList = [] } = useStickers();
  const sendStickerMutation = useSendSticker();
  const { data: featureSettingsList = [] } = useFeatureSettings();
  const toggleFeatureMutation = useToggleFeature();
  const { data: bodyMapZonesRaw = [] } = useBodyMapZones();
  const updateBodyMapZoneMutation = useUpdateBodyMapZone();
  const resetBodyMapMutation = useResetBodyMap();
  const roleSwitchEnabled = useIsFeatureEnabled("role_switch");
  const uploadMediaMutation = useUploadMedia();
  const deleteMediaMutation = useDeleteMedia();
  const uploadProfilePicMutation = useUploadProfilePic();
  const createRitualMutation = useCreateRitual();
  const createStandingOrderMutation = useCreateStandingOrder();
  const createWagerMutation = useCreateWager();
  const createDevotionMutation = useCreateDevotion();
  const createSecretMutation = useCreateSecret();
  const createLimitMutation = useCreateLimit();
  const createConflictMutation = useCreateConflict();
  const createDesiredChangeMutation = useCreateDesiredChange();
  const createCountdownEventMutation = useCreateCountdownEvent();
  const createRatingMutation = useCreateRating();
  const createPermissionRequestMutation = useCreatePermissionRequest();
  const deleteRitualMutation = useDeleteRitual();
  const deleteLimitMutation = useDeleteLimit();
  const deleteCountdownEventMutation = useDeleteCountdownEvent();
  const deleteStandingOrderMutation = useDeleteStandingOrder();
  const { data: trendData } = useTrends();
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const [stickerMessage, setStickerMessage] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaEntityType, setMediaEntityType] = useState("");
  const [mediaEntityId, setMediaEntityId] = useState("");

  const userRole = (user?.role || "sub") as "sub" | "dom";
  const xp = stats?.xp ?? 0;
  const level = stats?.level ?? 1;
  const xpMax = 100 * level;
  const xpPercent = Math.min(Math.round((xp / xpMax) * 100), 100);

  useEffect(() => {
    document.documentElement.setAttribute("data-role", userRole);
    return () => document.documentElement.removeAttribute("data-role");
  }, [userRole]);

  const handleToggleTask = (taskId: string) => {
    toggleTaskMutation.mutate(taskId);
  };

  const handleCreateTask = () => {
    if (!newTaskText.trim()) return;
    createTaskMutation.mutate({ text: newTaskText });
    setNewTaskText("");
  };

  const handleSpinWheel = () => {
    setIsSpinning(true);
    setWheelResult(null);
    setTimeout(async () => {
      try {
        const dare = await spinDareMutation.mutateAsync();
        setWheelResult(dare.text);
      } catch {
        setWheelResult("Failed to spin. Try again.");
      }
      setIsSpinning(false);
    }, 2000);
  };

  const handleSubmitCheckIn = async () => {
    await createCheckInMutation.mutateAsync({
      mood: checkInData.mood,
      obedience: checkInData.obedience,
      notes: checkInData.notes || undefined,
    });
    setModal(null);
    setCheckInStep(0);
    setCheckInData({ mood: 5, obedience: 5, notes: "" });
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/auth");
  };

  const handleSwitchRole = async () => {
    const newRole = userRole === "sub" ? "dom" : "sub";
    await switchRoleMutation.mutateAsync(newRole);
    setActiveView("dashboard");
  };

  const handleCreateReward = () => {
    if (!newRewardName.trim()) return;
    createRewardMutation.mutate({ name: newRewardName });
    setNewRewardName("");
  };

  const handleCreatePunishment = (name: string) => {
    createPunishmentMutation.mutate({ name });
  };

  const handleSaveJournal = () => {
    if (!journalContent.trim()) return;
    createJournalMutation.mutate(journalContent);
    setJournalContent("");
  };

  const startTraining = useCallback(
    (exercise: string) => {
      if (trainingIntervalRef.current)
        clearInterval(trainingIntervalRef.current);
      setTrainingActive(exercise);
      setTrainingTimer(0);
      trainingIntervalRef.current = setInterval(() => {
        setTrainingTimer((prev) => prev + 1);
      }, 1000);
      logActivityMutation.mutate({
        action: "training_started",
        detail: exercise,
      });
    },
    [logActivityMutation],
  );

  const stopTraining = useCallback(() => {
    if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
    trainingIntervalRef.current = null;
    if (trainingActive && !trainingCompleted.includes(trainingActive)) {
      setTrainingCompleted((prev) => [...prev, trainingActive]);
      logActivityMutation.mutate({
        action: "training_completed",
        detail: `${trainingActive} — ${formatTimerDisplay(trainingTimer)}`,
      });
    }
    setTrainingActive(null);
    setTrainingTimer(0);
  }, [trainingActive, trainingCompleted, trainingTimer, logActivityMutation]);

  useEffect(() => {
    return () => {
      if (trainingIntervalRef.current)
        clearInterval(trainingIntervalRef.current);
      if (sceneIntervalRef.current) clearInterval(sceneIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    presenceHeartbeatMutation.mutate();
  }, []);


  const scenePhases = ["Warm-Up", "Main Scene", "Cooldown"];

  const startScene = useCallback(() => {
    if (sceneIntervalRef.current) clearInterval(sceneIntervalRef.current);
    setScenePhase(0);
    setSceneTimer(0);
    sceneIntervalRef.current = setInterval(() => {
      setSceneTimer((prev) => prev + 1);
    }, 1000);
    logActivityMutation.mutate({
      action: "scene_started",
      detail: "Warm-Up phase",
    });
  }, [logActivityMutation]);

  const advanceScene = useCallback(() => {
    const nextPhase = scenePhase + 1;
    if (nextPhase >= scenePhases.length) {
      if (sceneIntervalRef.current) clearInterval(sceneIntervalRef.current);
      sceneIntervalRef.current = null;
      logActivityMutation.mutate({
        action: "scene_ended",
        detail: `Completed all phases — ${formatTimerDisplay(sceneTimer)}`,
      });
      setScenePhase(-1);
      setSceneTimer(0);
    } else {
      setScenePhase(nextPhase);
      logActivityMutation.mutate({
        action: "scene_phase",
        detail: `Entered ${scenePhases[nextPhase]} phase`,
      });
    }
  }, [scenePhase, sceneTimer, logActivityMutation]);

  const endScene = useCallback(() => {
    if (sceneIntervalRef.current) clearInterval(sceneIntervalRef.current);
    sceneIntervalRef.current = null;
    logActivityMutation.mutate({
      action: "scene_ended",
      detail: `Ended during ${scenePhases[scenePhase] || "prep"} — ${formatTimerDisplay(sceneTimer)}`,
    });
    setScenePhase(-1);
    setSceneTimer(0);
  }, [scenePhase, sceneTimer, logActivityMutation]);

  const formatTimerDisplay = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const DomDashboard = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <CommandProtocols
        role="dom"
        feedItems={buildDomFeedItems()}
        standingOrders={standingOrders}
        rituals={rituals}
        tasks={partnerTasks || []}
        onAction={handleFeedAction}
        onAssignTask={(text) => { createPartnerTaskMutation.mutate({ text }); }}
        onQuickCommand={(msg) => { sendQuickCommandMutation.mutate({ message: msg }); }}
        onDemandTimer={(msg, mins) => { createDemandTimerMutation.mutate({ message: msg, durationSeconds: mins * 60 }); }}
        onToggleLockdown={(locked) => { toggleLockdownMutation.mutate(locked); }}
        partnerStats={partnerStats}
        partnerPresence={partnerPresence}
        partnerName={partner?.username}
        lockdownStatus={lockdownStatus?.lockedDown ?? false}
        enforcementLevel={(partnerEnforcement as any)?.enforcementLevel}
        isAssigning={createPartnerTaskMutation.isPending}
        stickers={stickersList}
        onSendSticker={(stickerType, message) => { sendStickerMutation.mutate({ stickerType, message }); }}
        featureSettings={featureSettingsList}
        onToggleFeature={(key, enabled) => { toggleFeatureMutation.mutate({ featureKey: key, enabled }); }}
        userStats={{ xp: user?.xp ?? 0, level: user?.level ?? 1, badges: (stats as any)?.badges ?? 0, activeTimers: demandTimers?.length ?? 0 }}
        onCrisisMode={(active) => setIsCrisisMode(active)}
        onCreate={handleOnCreate}
        onDelete={handleOnDelete}
        onEdit={handleOnEdit}
        recentActivity={recentActivityEntries}
        trendData={trendData || { completionTrend: [], taskTrend: [], orderTrend: [], ritualTrend: [] }}
      />
      <input
        ref={profilePicInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        data-testid="input-profile-pic"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadProfilePicMutation.mutate(file);
          e.target.value = "";
        }}
      />
    </div>
  );

  const buildSubFeedItems = useCallback((): FeedItem[] => {
    const items: FeedItem[] = [];
    const activeDemands = (demandTimers || []).filter((t: any) => !t.responded && new Date(t.expiresAt) > new Date());
    activeDemands.forEach((t: any) => {
      const remaining = Math.max(0, Math.ceil((new Date(t.expiresAt).getTime() - Date.now()) / 1000));
      items.push({ id: t.id, type: "demand", title: t.message, countdown: remaining, data: t, createdAt: t.createdAt });
    });
    (quickCommands || []).filter((c: any) => !c.acknowledged).forEach((c: any) => {
      items.push({ id: c.id, type: "command", title: c.message, data: c, createdAt: c.createdAt });
    });
    (accusations || []).filter((a: any) => a.status === "pending" && a.toUserId === user?.id).forEach((a: any) => {
      items.push({ id: a.id, type: "accusation", title: a.accusation, data: a, createdAt: a.createdAt });
    });
    tasks.filter((t: any) => !t.completed).forEach((t) => {
      items.push({ id: t.id, type: "task", title: t.text, data: t, createdAt: (t as any).createdAt });
    });
    (punishments || []).filter((p: any) => p.userId === user?.id).filter((p: any) => p.status !== "completed").forEach((p: any) => {
      items.push({ id: p.id, type: "punishment", title: p.name, description: p.category ? `${p.category} · ${p.status || ""}` : p.status, data: p, createdAt: p.createdAt });
    });
    dares.filter((d: any) => !d.completed).forEach((d: any) => {
      items.push({ id: d.id, type: "dare", title: d.text, data: d, createdAt: d.createdAt });
    });
    (rewards || []).filter((r: any) => r.userId === user?.id).filter((r: any) => !r.redeemed).forEach((r: any) => {
      items.push({ id: r.id, type: "reward", title: r.name, description: r.category || undefined, data: r, createdAt: r.createdAt });
    });
    notifications.slice(0, 10).forEach((n) => {
      items.push({ id: n.id, type: "notification", title: n.text, data: n, createdAt: (n as any).createdAt });
    });
    journalEntries.slice(0, 20).forEach((j: any) => {
      items.push({ id: j.id, type: "journal", title: j.content?.slice(0, 80) || "Journal entry", description: j.mood ? `Mood: ${j.mood}` : undefined, data: j, createdAt: j.createdAt });
    });
    devotionsList.forEach((d: any) => {
      items.push({ id: d.id, type: "devotion", title: d.title || d.text, description: d.description, data: d, createdAt: d.createdAt });
    });
    secrets.forEach((s: any) => {
      items.push({ id: s.id, type: "secret", title: s.content?.slice(0, 60) || "Secret", data: s, createdAt: s.createdAt });
    });
    permissionRequests.forEach((p: any) => {
      items.push({ id: p.id, type: "permission_request", title: p.title || p.request, description: p.reason, data: p, createdAt: p.createdAt });
    });
    limitsList.forEach((l: any) => {
      items.push({ id: l.id, type: "limit", title: l.title || l.description, description: l.type === "hard" ? "Hard limit" : "Soft limit", data: l, createdAt: l.createdAt });
    });
    conflictsList.forEach((c: any) => {
      items.push({ id: c.id, type: "conflict", title: c.title || c.description, description: c.status, data: c, createdAt: c.createdAt });
    });
    stickersList.filter((s: any) => s.recipientId === user?.id).slice(0, 10).forEach((s: any) => {
      items.push({ id: s.id?.toString() || `sticker-${s.id}`, type: "sticker_received", title: `Received ${s.stickerType}`, description: s.message || undefined, data: s, createdAt: s.createdAt });
    });
    return items;
  }, [demandTimers, quickCommands, accusations, tasks, punishments, dares, rewards, notifications, user?.id, journalEntries, devotionsList, secrets, permissionRequests, limitsList, conflictsList, stickersList]);

  const buildDomFeedItems = useCallback((): FeedItem[] => {
    const items: FeedItem[] = [];
    (partnerCheckIns || []).filter((c: any) => c.status === "pending").forEach((c: any) => {
      items.push({ id: c.id, type: "checkin_review", title: `Check-In: Mood ${c.mood}/10, Obedience ${c.obedience}/10`, description: c.notes || undefined, data: c, createdAt: c.createdAt });
    });
    (partnerTasks || []).filter((t: any) => !t.completed).forEach((t: any) => {
      items.push({ id: t.id, type: "task", title: t.text, description: t.done ? "Completed" : "Assigned", data: { ...t, isPartnerTask: true }, createdAt: t.createdAt });
    });
    (punishments || []).filter((p: any) => p.status !== "completed").forEach((p: any) => {
      items.push({ id: p.id, type: "punishment", title: p.name, description: `${p.status || "active"} · ${p.category || ""}`, data: p, createdAt: p.createdAt });
    });
    (rewards || []).filter((r: any) => !r.redeemed).forEach((r: any) => {
      items.push({ id: r.id, type: "reward", title: r.name, description: r.category || undefined, data: r, createdAt: r.createdAt });
    });
    notifications.slice(0, 10).forEach((n) => {
      items.push({ id: n.id, type: "notification", title: n.text, data: n, createdAt: (n as any).createdAt });
    });
    dares.filter((d: any) => !d.completed).forEach((d: any) => {
      items.push({ id: d.id, type: "dare", title: d.text, description: d.completed ? "Completed" : "Active", data: d, createdAt: d.createdAt });
    });
    playSessions.forEach((s: any) => {
      items.push({ id: s.id, type: "play_session", title: s.title || s.name || "Play Session", description: s.status, data: s, createdAt: s.createdAt });
    });
    countdownEvents.forEach((e: any) => {
      items.push({ id: e.id, type: "countdown_event", title: e.title || e.name, description: e.eventDate ? `Date: ${new Date(e.eventDate).toLocaleDateString()}` : undefined, data: e, createdAt: e.createdAt });
    });
    wagers.forEach((w: any) => {
      items.push({ id: w.id, type: "wager", title: w.title || w.description, description: w.stakes, data: w, createdAt: w.createdAt });
    });
    ratingsList.slice(0, 10).forEach((r: any) => {
      items.push({ id: r.id, type: "rating", title: `Rating: ${r.score || r.rating}/10`, description: r.notes || r.comment, data: { ...r, score: r.score || r.rating }, createdAt: r.createdAt });
    });
    desiredChanges.forEach((d: any) => {
      items.push({ id: d.id, type: "desired_change", title: d.title || d.description, description: d.priority ? `Priority: ${d.priority}` : undefined, data: d, createdAt: d.createdAt });
    });
    secrets.forEach((s: any) => {
      items.push({ id: s.id, type: "secret", title: s.content?.slice(0, 60) || "Secret", data: s, createdAt: s.createdAt });
    });
    devotionsList.forEach((d: any) => {
      items.push({ id: d.id, type: "devotion", title: d.title || d.text, description: d.description, data: d, createdAt: d.createdAt });
    });
    conflictsList.forEach((c: any) => {
      items.push({ id: c.id, type: "conflict", title: c.title || c.description, description: c.status, data: c, createdAt: c.createdAt });
    });
    limitsList.forEach((l: any) => {
      items.push({ id: l.id, type: "limit", title: l.title || l.description, description: l.type === "hard" ? "Hard limit" : "Soft limit", data: l, createdAt: l.createdAt });
    });
    permissionRequests.forEach((p: any) => {
      items.push({ id: p.id, type: "permission_request", title: p.title || p.request, description: `${p.status || "pending"} · ${p.reason || ""}`, data: p, createdAt: p.createdAt });
    });
    return items;
  }, [partnerCheckIns, partnerTasks, punishments, rewards, notifications, dares, playSessions, countdownEvents, wagers, ratingsList, desiredChanges, secrets, devotionsList, conflictsList, limitsList, permissionRequests]);

  const recentActivityEntries = useMemo((): ActivityEntry[] => {
    const entries: ActivityEntry[] = [];
    (activityLog || []).slice(0, 20).forEach((a: any) => {
      entries.push({ id: a.id?.toString() || `a-${Math.random()}`, action: a.action, detail: a.detail, userId: a.userId, createdAt: a.createdAt });
    });
    (partnerActivity || []).slice(0, 20).forEach((a: any) => {
      entries.push({ id: a.id?.toString() || `pa-${Math.random()}`, action: a.action, detail: a.detail, userId: a.userId, createdAt: a.createdAt });
    });
    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return entries.slice(0, 10);
  }, [activityLog, partnerActivity]);

  const handleOnCreate = useCallback((type: string, data: Record<string, any>) => {
    switch (type) {
      case "task":
        if (userRole === "dom") createPartnerTaskMutation.mutate({ text: data.text });
        else createTaskMutation.mutate({ text: data.text });
        break;
      case "reward": createRewardMutation.mutate({ name: data.text || data.name, category: data.category }); break;
      case "punishment": createPunishmentMutation.mutate({ name: data.text || data.name, category: data.category }); break;
      case "ritual": createRitualMutation.mutate({ title: data.text || data.title, frequency: data.frequency || "daily" }); break;
      case "standing_order": createStandingOrderMutation.mutate({ title: data.text || data.title, description: data.description }); break;
      case "dare": spinDareMutation.mutate(); break;
      case "journal": createJournalMutation.mutate({ content: data.text || data.content, mood: data.mood }); break;
      case "checkin": createCheckInMutation.mutate({ mood: data.mood || 5, obedience: data.obedience || 5, notes: data.text || data.notes || "" }); break;
      case "wager": createWagerMutation.mutate({ title: data.text || data.title, stakes: data.stakes, deadline: data.deadline }); break;
      case "devotion": createDevotionMutation.mutate({ content: data.text || data.description || data.title }); break;
      case "secret": createSecretMutation.mutate({ title: data.title || "Secret", content: data.text || data.content }); break;
      case "limit": createLimitMutation.mutate({ name: data.text || data.name || data.title, level: data.level || data.limitType || "soft", description: data.description }); break;
      case "conflict": createConflictMutation.mutate({ title: data.text || data.title, description: data.description }); break;
      case "desired_change": createDesiredChangeMutation.mutate({ title: data.text || data.title, description: data.description, priority: data.priority || "medium" }); break;
      case "countdown_event": createCountdownEventMutation.mutate({ title: data.text || data.title, targetDate: data.eventDate || data.targetDate || new Date().toISOString() }); break;
      case "rating": createRatingMutation.mutate({ ratedUserId: partner?.id || "", overall: data.score || 5, notes: data.text || data.notes }); break;
      case "permission_request": createPermissionRequestMutation.mutate({ title: data.text || data.title, description: data.reason || data.description }); break;
      case "accusation": createAccusationMutation.mutate({ accusation: data.text }); break;
      case "play_session": createPlaySessionMutation.mutate({ title: data.text || data.title, mood: data.mood, intensity: data.intensity }); break;
    }
    logActivityMutation.mutate({ action: `created_${type}`, detail: data.text || data.title || type });
  }, [userRole, createPartnerTaskMutation, createTaskMutation, createRewardMutation, createPunishmentMutation, createRitualMutation, createStandingOrderMutation, spinDareMutation, createJournalMutation, createCheckInMutation, createWagerMutation, createDevotionMutation, createSecretMutation, createLimitMutation, createConflictMutation, createDesiredChangeMutation, createCountdownEventMutation, createRatingMutation, createPermissionRequestMutation, createAccusationMutation, createPlaySessionMutation, logActivityMutation]);

  const handleOnDelete = useCallback((type: string, id: string) => {
    switch (type) {
      case "task": deleteTaskMutation.mutate(id); break;
      case "ritual": deleteRitualMutation.mutate(id); break;
      case "limit": deleteLimitMutation.mutate(id); break;
      case "countdown_event": deleteCountdownEventMutation.mutate(id); break;
      case "standing_order": deleteStandingOrderMutation.mutate(id); break;
      case "notification": dismissNotificationMutation.mutate(id); break;
      case "punishment": updatePunishmentStatusMutation.mutate({ id, status: "completed" }); break;
      case "reward": toggleRewardMutation.mutate(id); break;
      case "dare": completeDareMutation.mutate(id); break;
    }
  }, [deleteTaskMutation, deleteRitualMutation, deleteLimitMutation, deleteCountdownEventMutation, deleteStandingOrderMutation, dismissNotificationMutation, updatePunishmentStatusMutation, toggleRewardMutation, completeDareMutation]);

  const handleOnEdit = useCallback((_type: string, _id: string, _data: Record<string, any>) => {
  }, []);

  const handleFeedAction = useCallback((itemId: string, action: string, payload?: any) => {
    switch (action) {
      case "respond":
        if (payload && typeof payload === "string") {
          respondToAccusationMutation.mutate({ id: itemId, response: payload });
        } else {
          respondDemandTimerMutation.mutate(itemId);
        }
        break;
      case "acknowledge":
        acknowledgeCommandMutation.mutate(itemId);
        break;
      case "toggle":
        handleToggleTask(itemId);
        break;
      case "complete":
        const punishItem = (punishments || []).find((p: any) => p.id === itemId);
        if (punishItem) {
          updatePunishmentStatusMutation.mutate({ id: itemId, status: "completed" });
        } else {
          completeDareMutation.mutate(itemId);
        }
        break;
      case "redeem":
        toggleRewardMutation.mutate(itemId);
        break;
      case "dismiss":
        dismissNotificationMutation.mutate(itemId);
        break;
      case "approve":
        reviewPartnerCheckInMutation.mutate({ checkInId: itemId, status: "approved", xpAwarded: payload || 10 });
        break;
      case "reject":
        reviewPartnerCheckInMutation.mutate({ checkInId: itemId, status: "rejected", xpAwarded: 0 });
        break;
    }
  }, [respondToAccusationMutation, respondDemandTimerMutation, acknowledgeCommandMutation, toggleTaskMutation, punishments, updatePunishmentStatusMutation, completeDareMutation, toggleRewardMutation, dismissNotificationMutation, reviewPartnerCheckInMutation]);

  const renderContent = () => {
    if (userRole === "dom" && activeView === "dashboard") {
      return DomDashboard();
    }

    if (activeView === "dashboard") {
      return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
          <CommandProtocols
            role="sub"
            feedItems={buildSubFeedItems()}
            standingOrders={standingOrders}
            rituals={rituals}
            tasks={tasks}
            onAction={handleFeedAction}
            onAssignTask={(text) => { createTaskMutation.mutate({ text }); }}
            partnerPresence={partnerPresence}
            partnerName={partner?.username}
            enforcementLevel={(myEnforcement as any)?.enforcementLevel}
            isAssigning={createTaskMutation.isPending}
            stickers={stickersList.filter((s: any) => s.recipientId === user?.id)}
            userStats={{ xp: user?.xp ?? 0, level: user?.level ?? 1, badges: (stats as any)?.badges ?? 0, activeTimers: demandTimers?.length ?? 0 }}
            onCreate={handleOnCreate}
            onDelete={handleOnDelete}
            onEdit={handleOnEdit}
            recentActivity={recentActivityEntries}
            trendData={trendData || { completionTrend: [], taskTrend: [], orderTrend: [], ritualTrend: [] }}
          />
          <input
            ref={profilePicInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            data-testid="input-profile-pic-sub"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadProfilePicMutation.mutate(file);
              e.target.value = "";
            }}
          />
        </div>
      );
    }

    if (activeView === "profile") {
      return (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
          <div className="text-center pt-4">
            <div
              className="w-24 h-24 mx-auto rounded-full p-1 border-2 mb-4 bg-black"
              style={{
                borderColor:
                  userRole === "dom"
                    ? "rgba(220,38,38,0.6)"
                    : "rgba(180,30,30,0.6)",
                boxShadow: `0 0 20px var(--role-glow)`,
              }}
            >
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                <User
                  size={40}
                  className={
                    userRole === "dom" ? "text-red-500" : "text-red-400"
                  }
                />
              </div>
            </div>
            <h2
              data-testid="text-username"
              className="text-3xl font-black text-white uppercase tracking-tighter"
            >
              {user?.username}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="flex items-center gap-2 bg-black/40 w-fit px-4 py-1.5 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(180,30,30,0.5)]" />
                <span className="text-xs font-bold text-red-500 uppercase">
                  Connected
                </span>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${
                  userRole === "dom"
                    ? "bg-red-900/40 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                    : "bg-red-950/40 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(180,30,30,0.3)]"
                }`}
              >
                {userRole === "dom" ? "DOM" : "SUB"}
              </span>
            </div>
          </div>

          <div
            className="p-6 rounded-2xl flex items-center justify-between shadow-lg"
            style={{
              background: `linear-gradient(to right, var(--role-accent-bg), black)`,
              border: `1px solid var(--role-accent-border)`,
            }}
          >
            <div className="flex items-center gap-5">
              <div
                className="p-3 rounded-full"
                style={{
                  backgroundColor: "var(--role-accent-bg)",
                  boxShadow: `0 0 15px var(--role-glow)`,
                }}
              >
                <ShieldAlert size={24} className="text-red-500" />
              </div>
              <div>
                <div className="font-bold text-red-500 text-lg uppercase tracking-wide">
                  Crisis Mode
                </div>
                <div className="text-xs text-red-400/50 font-mono">
                  Pause all tasks & XP
                </div>
              </div>
            </div>
            <button
              data-testid="button-crisis-toggle"
              onClick={() => setIsCrisisMode(!isCrisisMode)}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 shadow-inner cursor-pointer ${isCrisisMode ? "bg-red-600 shadow-[0_0_10px_red]" : "bg-slate-900 border border-slate-700"}`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isCrisisMode ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
          </div>

          <PushNotificationToggle />

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">
              Partner Bond
            </h3>
            {partner ? (
              <div className="bg-gradient-to-r from-red-950/30 to-black border border-red-900/30 p-5 rounded-2xl">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center">
                    <Heart size={20} className="text-red-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white uppercase tracking-wider text-sm">
                      {partner.username}
                    </div>
                    <div className="text-[10px] text-red-400/60 font-mono uppercase">
                      {partner.role} — Level {partner.level}
                    </div>
                  </div>
                </div>
                <Button
                  data-testid="button-unlink"
                  variant="outline"
                  size="sm"
                  className="w-full border-red-900/50 text-red-400 hover:bg-red-950/50 mt-2"
                  onClick={async () => {
                    await unlinkPartnerMutation.mutateAsync();
                  }}
                  disabled={unlinkPartnerMutation.isPending}
                >
                  {unlinkPartnerMutation.isPending ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    "Dissolve Bond"
                  )}
                </Button>
              </div>
            ) : (
              <ProfileItem
                icon={<Anchor size={20} />}
                label="Connect to Partner"
                onClick={() => setModal("pair")}
              />
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">
              Dynamic Management
            </h3>
            <ProfileItem
              icon={<Zap size={20} />}
              label="Punishments & Rewards"
              onClick={() => setActiveView("punishments")}
            />
          </div>

          <div className="space-y-3 pb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">
              Account
            </h3>
            {(user?.originalRole === "dom" || roleSwitchEnabled) && (
              <ProfileItem
                icon={<RefreshCw size={20} />}
                label={`Switch to ${userRole === "sub" ? "Dom" : "Sub"} View`}
                onClick={handleSwitchRole}
              />
            )}
            <ProfileItem
              icon={<LogOut size={20} />}
              label="Log Out"
              onClick={handleLogout}
            />
          </div>
        </div>
      );
    }

    if (activeView === "punishments") {
      return (
        <div className="animate-in slide-in-from-right duration-500 space-y-6">
          <button
            onClick={() => setActiveView("profile")}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 uppercase text-xs font-bold tracking-widest cursor-pointer"
          >
            <ChevronRight className="rotate-180" size={14} /> Back to Profile
          </button>
          <h2 className="text-2xl font-black text-white uppercase mb-6">
            Punishments & Rewards
          </h2>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">
            Active Punishments
          </h3>
          <div className="space-y-2">
            {punishments.filter(p => p.status === "active").map((p) => (
              <div
                key={p.id}
                className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl flex justify-between items-center"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-200 uppercase tracking-wide text-sm">
                    {p.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {p.category && (
                      <span className="text-[9px] text-red-500/60 uppercase">
                        {p.category}
                      </span>
                    )}
                    {p.duration && (
                      <span className="text-[9px] text-slate-600 flex items-center gap-0.5">
                        <Clock size={8} />
                        {p.duration}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  data-testid={`button-complete-punishment-${p.id}`}
                  onClick={() => updatePunishmentStatusMutation.mutate({ punishmentId: p.id, status: "completed" })}
                  className="ml-2 px-3 py-1.5 bg-red-900/30 hover:bg-red-800/50 border border-red-700/30 hover:border-red-500/50 rounded-lg text-[10px] font-bold text-red-400 uppercase tracking-wider transition-all cursor-pointer shrink-0"
                >
                  Done
                </button>
              </div>
            ))}
            {punishments.filter(p => p.status === "completed").length > 0 && (
              <div className="mt-3">
                <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-2 mb-2">Completed</h4>
                {punishments.filter(p => p.status === "completed").map((p) => (
                  <div key={p.id} className="p-3 bg-slate-900/30 border border-slate-800/30 rounded-xl flex justify-between items-center opacity-50 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-red-500 uppercase tracking-wide text-sm line-through">{p.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.category && <span className="text-[9px] text-slate-600 uppercase">{p.category}</span>}
                        {p.duration && <span className="text-[9px] text-slate-600 flex items-center gap-0.5"><Clock size={8} />{p.duration}</span>}
                      </div>
                    </div>
                    <CheckCircle size={16} className="text-red-500 shrink-0" />
                  </div>
                ))}
              </div>
            )}
            {punishments.length === 0 && (
              <div className="text-xs text-slate-600 text-center py-4">
                No punishments assigned
              </div>
            )}
          </div>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2 mt-6">
            Rewards
          </h3>
          <div className="space-y-2">
            {rewards.filter(r => !r.unlocked).map((r) => (
              <div
                key={r.id}
                className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl flex justify-between items-center"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-200 uppercase tracking-wide text-sm">
                    {r.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {r.category && <span className="text-[9px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{r.category}</span>}
                    {r.duration && <span className="text-[9px] text-slate-500">{r.duration}</span>}
                  </div>
                </div>
                <button
                  data-testid={`button-redeem-reward-${r.id}`}
                  onClick={() => toggleRewardMutation.mutate(r.id)}
                  className="ml-2 px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-700/30 hover:border-red-500/50 rounded-lg text-[10px] font-bold text-red-400 uppercase tracking-wider transition-all cursor-pointer shrink-0"
                >
                  Redeem
                </button>
              </div>
            ))}
            {rewards.filter(r => r.unlocked).length > 0 && (
              <div className="mt-3">
                <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-2 mb-2">Redeemed</h4>
                {rewards.filter(r => r.unlocked).map((r) => (
                  <div key={r.id} className="p-3 bg-slate-900/30 border border-slate-800/30 rounded-xl flex justify-between items-center opacity-50 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-red-500 uppercase tracking-wide text-sm line-through">{r.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {r.category && <span className="text-[9px] text-slate-600">{r.category}</span>}
                        {r.duration && <span className="text-[9px] text-slate-600">{r.duration}</span>}
                      </div>
                    </div>
                    <CheckCircle size={16} className="text-red-500 shrink-0" />
                  </div>
                ))}
              </div>
            )}
            {rewards.length === 0 && (
              <div className="text-xs text-slate-600 text-center py-4">
                No rewards yet
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeView === "resume") {
      return (
        <div className="animate-in slide-in-from-right duration-500 space-y-6">
          <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-3">
            <Terminal size={24} className="text-red-600" /> Activity Log
          </h2>
          <div className="space-y-3">
            {activityLog.slice(0, 20).map((log) => (
              <div
                key={log.id}
                className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:bg-black/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-red-500">
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white uppercase tracking-wider">
                      {log.action.replace(/_/g, " ")}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {log.detail || ""}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-600">
                    {formatTime(log.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            {activityLog.length === 0 && (
              <div className="text-center py-12 text-slate-600 text-xs uppercase tracking-widest">
                No activity recorded yet
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeView === "journal") {
      return (
        <div className="animate-in slide-in-from-right duration-500 space-y-6">
          <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-3">
            <BookOpen size={24} className="text-rose-800" /> Reflection Journal
          </h2>
          <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl">
            <div className="mb-6">
              <Label className="text-slate-400 mb-2 block uppercase text-[10px] font-bold tracking-widest">
                Today's Reflection
              </Label>
              <textarea
                data-testid="input-journal"
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                className="w-full bg-black/50 border border-slate-800 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-rose-700/50 min-h-[150px]"
                placeholder="Write your thoughts here..."
              />
            </div>
            <Button
              data-testid="button-save-journal"
              onClick={handleSaveJournal}
              disabled={
                createJournalMutation.isPending || !journalContent.trim()
              }
              className="w-full bg-red-950/50 border border-rose-700/30 text-rose-400 hover:bg-rose-900/50"
            >
              {createJournalMutation.isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Save Journal Entry"
              )}
            </Button>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">
              Previous Entries
            </h3>
            {journalEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-black/40 border border-white/5 p-4 rounded-xl"
              >
                <div className="text-[10px] font-mono text-rose-700 mb-1">
                  {new Date(entry.createdAt!).toLocaleDateString()}
                </div>
                <div className="text-sm text-slate-400 line-clamp-3 italic">
                  "{entry.content}"
                </div>
              </div>
            ))}
            {journalEntries.length === 0 && (
              <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">
                No journal entries yet
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeView === "stats") {
      return (
        <div className="animate-in slide-in-from-right duration-500 space-y-8">
          <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-3">
            <Activity size={24} className="text-red-600" /> Bond Statistics
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl text-center">
              <div
                data-testid="text-compliance-rate"
                className="text-2xl font-black text-white"
              >
                {stats?.complianceRate ?? 0}%
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                Compliance
              </div>
            </div>
            <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl text-center">
              <div
                data-testid="text-total-checkins"
                className="text-2xl font-black text-white"
              >
                {stats?.totalCheckIns ?? 0}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                Check-Ins
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
              <div className="text-xl font-black text-red-500">
                {stats?.completedTasks ?? 0}
              </div>
              <div className="text-[8px] text-slate-500 uppercase font-bold">
                Tasks Done
              </div>
            </div>
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
              <div className="text-xl font-black text-red-500">
                {stats?.completedDares ?? 0}
              </div>
              <div className="text-[8px] text-slate-500 uppercase font-bold">
                Dares Done
              </div>
            </div>
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
              <div className="text-xl font-black text-rose-700">
                {stats?.totalJournalEntries ?? 0}
              </div>
              <div className="text-[8px] text-slate-500 uppercase font-bold">
                Journal
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">
              Breakdown
            </h3>
            {[
              {
                label: "Protocols",
                val: stats?.complianceRate ?? 0,
                color: "bg-red-500",
              },
              {
                label: "Journal Entries",
                val: Math.min((stats?.totalJournalEntries ?? 0) * 10, 100),
                color: "bg-red-600",
              },
              {
                label: "Dares Completed",
                val: stats?.totalDares
                  ? Math.round(
                      ((stats?.completedDares ?? 0) / stats.totalDares) * 100,
                    )
                  : 0,
                color: "bg-slate-500",
              },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">{stat.label}</span>
                  <span className="text-white">{stat.val}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stat.color}`}
                    style={{ width: `${stat.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 opacity-50 border-2 border-dashed border-white/10 rounded-3xl bg-black/20 m-4 animate-in fade-in">
        <Key size={64} className="mb-6 text-slate-600" />
        <h2 className="text-3xl font-black uppercase text-slate-700">
          Module Active
        </h2>
      </div>
    );
  };

  return (
    <div className="flex h-[100dvh] bg-slate-950 text-slate-200 font-sans overflow-hidden relative selection:bg-red-900 selection:text-white">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <AmbientPresence />

      {isCrisisMode && (
        <div className="fixed inset-0 z-[100] bg-red-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <ShieldAlert size={80} className="text-white mb-6" />
          <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-4 text-center drop-shadow-lg">
            Crisis Mode Active
          </h1>
          <p className="text-red-200 text-center max-w-md mb-12 text-lg font-bold">
            All protocols suspended.
            <br />
            Focus on grounding and safety.
          </p>
          <button
            data-testid="button-deactivate-crisis"
            onClick={() => setIsCrisisMode(false)}
            className="px-8 py-4 bg-white text-red-900 font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_white] hover:scale-105 transition-transform cursor-pointer"
          >
            Deactivate
          </button>
        </div>
      )}

      <aside className="w-24 bg-black border-r border-white/10 hidden md:flex flex-col items-center py-8 z-20 shadow-2xl relative">
        <div className="mb-10 p-4 bg-slate-900 rounded-2xl border border-white/5 shadow-inner">
          <Lock className="text-red-600 drop-shadow-[0_0_8px_red]" size={28} />
        </div>
        <div className="flex flex-col gap-8 w-full px-2">
          <SidebarIcon
            icon={<Home />}
            active={activeView === "dashboard"}
            onClick={() => setActiveView("dashboard")}
          />
          <SidebarIcon
            icon={<Terminal />}
            active={activeView === "resume"}
            onClick={() => setActiveView("resume")}
          />
          <SidebarIcon
            icon={<BookOpen />}
            active={activeView === "journal"}
            onClick={() => setActiveView("journal")}
          />
          <SidebarIcon
            icon={<Activity />}
            active={activeView === "stats"}
            onClick={() => setActiveView("stats")}
          />
          <div className="mt-auto pt-8 border-t border-white/10 w-full flex justify-center">
            <SidebarIcon
              icon={<Settings />}
              active={activeView === "profile"}
              onClick={() => setActiveView("profile")}
            />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 p-4 z-10 sticky top-0">
          <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-black text-white tracking-tighter uppercase drop-shadow-md">
                Bonded<span className="text-red-600">Ascent</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white uppercase tracking-wider hidden sm:inline">
                {user?.username}
              </span>
              <span
                data-testid="text-role-badge"
                className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border ${
                  userRole === "dom"
                    ? "bg-red-900/40 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                    : "bg-red-950/40 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(180,30,30,0.3)]"
                }`}
              >
                {userRole === "dom" ? "DOM" : "SUB"}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pb-28 md:pb-8 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-6">
            <button
              data-testid="button-safeword"
              onClick={() => setModal("safeword")}
              className="w-full bg-gradient-to-r from-yellow-900/20 to-transparent border-l-4 border-slate-300 p-4 rounded-r-xl flex items-center gap-4 hover:bg-slate-800/30 transition-all group relative overflow-hidden cursor-pointer"
            >
              <div className="bg-slate-300/10 p-2 rounded-full group-hover:scale-110 transition-transform z-10">
                <ShieldAlert size={24} className="text-slate-300" />
              </div>
              <div className="text-left z-10">
                <div className="font-bold text-slate-300 text-sm uppercase tracking-wider">
                  Safeword / Emergency
                </div>
                <div className="text-[10px] text-slate-300/50">
                  Tap to immediately pause everything
                </div>
              </div>
              <ChevronRight
                className="ml-auto text-slate-300/50 z-10"
                size={20}
              />
            </button>

            {renderContent()}
          </div>
        </div>

        <div className="md:hidden absolute bottom-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 p-2 pb-6 flex justify-around items-end z-30">
          <MobileNavIcon
            icon={<Home />}
            label="Home"
            active={activeView === "dashboard"}
            onClick={() => setActiveView("dashboard")}
          />
          <div
            onClick={() => setActiveView("profile")}
            className={`mb-2 w-14 h-14 rounded-full border-2 border-slate-800 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${activeView === "profile" ? "bg-red-600 border-red-400 text-white shadow-[0_0_15px_red]" : "bg-slate-900 text-slate-400"}`}
          >
            <Menu size={26} />
          </div>
          <MobileNavIcon
            icon={<Activity />}
            label="Stats"
            active={activeView === "stats"}
            onClick={() => setActiveView("stats")}
          />
        </div>
      </div>

      {modal === "dom_command" && (
        <div className="fixed inset-0 z-[60] bg-black animate-in fade-in duration-300" data-testid="body-map-fullscreen">
          <button
            data-testid="button-close-body-map"
            onClick={() => setModal(null)}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all backdrop-blur-sm cursor-pointer"
          >
            <X size={20} />
          </button>
          <div className="absolute top-4 left-0 right-0 z-40 flex justify-center pointer-events-none">
            <h2 className="text-[10px] font-black text-slate-400/60 uppercase tracking-[0.4em]">
              Map of Desire
            </h2>
          </div>
          <div className="w-full h-full">
            <React.Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-black">
                <div className="text-slate-300/50 text-xs uppercase tracking-widest animate-pulse">Loading 3D Model...</div>
              </div>
            }>
              <BodyMap3D
                zones={(bodyMapZonesRaw as any[]).map((z: any) => ({
                  zoneName: z.zoneName,
                  status: z.status as "neutral" | "desire" | "void",
                  intensity: z.intensity,
                }))}
                onZoneUpdate={(zoneName, status, intensity) => {
                  updateBodyMapZoneMutation.mutate({ zoneName, status, intensity });
                }}
                onReset={() => resetBodyMapMutation.mutate()}
              />
            </React.Suspense>
          </div>
        </div>
      )}

      {modal && modal !== "dom_command" && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-black border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <button
              data-testid="button-close-modal"
              onClick={() => {
                setModal(null);
                setPunishSearch("");
                setPunishCategoryFilter(null);
                setRewardSearch("");
                setRewardCategoryFilter(null);
                setSceneSearch("");
                setSceneCategoryFilter(null);
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer z-50"
            >
              <X size={24} />
            </button>

            {modal === "safeword" && (
              <div className="text-center p-4">
                <ShieldAlert
                  size={64}
                  className="mx-auto text-slate-300 mb-6 animate-bounce"
                />
                <h2 className="text-2xl font-black text-white uppercase mb-4">
                  Safeword Triggered
                </h2>
                <p className="text-slate-400 mb-8">
                  Alert sent to Partner. App paused.
                </p>
                <button
                  data-testid="button-resume"
                  onClick={() => setModal(null)}
                  className="w-full py-3 bg-slate-300 hover:bg-slate-400 text-black font-bold uppercase rounded-lg cursor-pointer"
                >
                  Resume
                </button>
              </div>
            )}

            {modal === "pair" && (
              <div className="p-4 space-y-6">
                <div className="text-center mb-4">
                  <Anchor size={48} className="mx-auto text-red-500 mb-2" />
                  <h2 className="text-xl font-black text-white uppercase">
                    Connect to Partner
                  </h2>
                  <p className="text-xs text-slate-500 mt-2">
                    Link your accounts using an invite code
                  </p>
                </div>

                {pairError && (
                  <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle size={14} /> {pairError}
                  </div>
                )}
                {pairSuccess && (
                  <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-xs text-red-400 flex items-center gap-2">
                    <CheckCircle size={14} /> {pairSuccess}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="bg-slate-900/50 border border-white/5 p-5 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Option 1: Generate a Code
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Share this code with your partner so they can connect to
                      you.
                    </p>
                    {generatedCode ? (
                      <div className="text-center">
                        <div className="text-3xl font-black text-red-500 tracking-[0.3em] bg-black/40 py-3 rounded-lg border border-red-500/30">
                          {generatedCode}
                        </div>
                        <p className="text-[10px] text-slate-600 mt-2">
                          Expires in 30 minutes
                        </p>
                      </div>
                    ) : (
                      <Button
                        data-testid="button-generate-code"
                        className="w-full bg-red-600 hover:bg-red-500"
                        onClick={async () => {
                          setPairError(null);
                          try {
                            const result =
                              await generatePairCodeMutation.mutateAsync();
                            setGeneratedCode(result.code);
                          } catch (e: any) {
                            setPairError(
                              e?.message || "Failed to generate code",
                            );
                          }
                        }}
                        disabled={generatePairCodeMutation.isPending}
                      >
                        {generatePairCodeMutation.isPending ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          "Generate Invite Code"
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] text-slate-600 uppercase font-bold">
                      or
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="bg-slate-900/50 border border-white/5 p-5 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Option 2: Enter a Code
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Enter the code your partner shared with you.
                    </p>
                    <div className="flex gap-2">
                      <input
                        data-testid="input-pair-code"
                        type="text"
                        value={pairCodeInput}
                        onChange={(e) =>
                          setPairCodeInput(e.target.value.toUpperCase())
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          pairCodeInput.trim() &&
                          (async () => {
                            setPairError(null);
                            try {
                              const result =
                                await joinPairCodeMutation.mutateAsync(
                                  pairCodeInput.trim(),
                                );
                              setPairSuccess(
                                `Bonded with ${result.partnerUsername}!`,
                              );
                              setPairCodeInput("");
                              setTimeout(() => {
                                setModal(null);
                                setPairSuccess(null);
                              }, 2000);
                            } catch (e: any) {
                              setPairError(e?.message || "Failed to join");
                            }
                          })()
                        }
                        placeholder="XXXXXX"
                        maxLength={6}
                        className="flex-1 bg-black/40 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white text-center font-mono tracking-widest focus:outline-none focus:border-red-500/50 uppercase"
                      />
                      <Button
                        data-testid="button-join-code"
                        className="bg-red-600 hover:bg-red-500"
                        onClick={async () => {
                          if (!pairCodeInput.trim()) return;
                          setPairError(null);
                          try {
                            const result =
                              await joinPairCodeMutation.mutateAsync(
                                pairCodeInput.trim(),
                              );
                            setPairSuccess(
                              `Bonded with ${result.partnerUsername}!`,
                            );
                            setPairCodeInput("");
                            setTimeout(() => {
                              setModal(null);
                              setPairSuccess(null);
                            }, 2000);
                          } catch (e: any) {
                            setPairError(e?.message || "Failed to join");
                          }
                        }}
                        disabled={
                          joinPairCodeMutation.isPending ||
                          !pairCodeInput.trim()
                        }
                      >
                        {joinPairCodeMutation.isPending ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          "Join"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modal === "dom_tasks" && (
              <div className="p-4 space-y-6 overflow-y-auto">
                <div className="text-center mb-4">
                  <List size={48} className="mx-auto text-slate-500 mb-2" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Assign Protocols
                  </h2>
                  {partner && (
                    <p className="text-xs text-slate-500 mt-1">
                      Assigning to {partner.username}
                    </p>
                  )}
                </div>
                {!partner ? (
                  <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">
                    Connect to a partner first
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        data-testid="input-dom-task"
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          newTaskText.trim() &&
                          (() => {
                            createPartnerTaskMutation.mutate({
                              text: newTaskText,
                            });
                            setNewTaskText("");
                          })()
                        }
                        placeholder="New Task Description..."
                        className="flex-1 bg-black/40 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-slate-500"
                      />
                      <Button
                        data-testid="button-dom-add-task"
                        className="bg-slate-600 hover:bg-slate-500"
                        onClick={() => {
                          if (newTaskText.trim()) {
                            createPartnerTaskMutation.mutate({
                              text: newTaskText,
                            });
                            setNewTaskText("");
                          }
                        }}
                        disabled={createPartnerTaskMutation.isPending}
                      >
                        <Check size={16} />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-500 font-bold tracking-widest pl-1">
                        {partner.username}'s Protocols
                      </Label>
                      {partnerTasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-white/5"
                        >
                          <span
                            className={`text-sm text-slate-300 ${t.done ? "line-through opacity-50" : ""}`}
                          >
                            {t.text}
                          </span>
                          {t.done ? (
                            <CheckCircle size={16} className="text-red-500" />
                          ) : (
                            <Clock size={16} className="text-slate-600" />
                          )}
                        </div>
                      ))}
                      {partnerTasks.length === 0 && (
                        <div className="text-xs text-slate-600 text-center py-4">
                          No protocols assigned yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {modal === "dom_rewards" && (
              <div className="p-4 space-y-4 overflow-y-auto">
                <div className="text-center mb-2">
                  <Gift size={48} className="mx-auto text-red-500 mb-2" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Grant Rewards
                  </h2>
                  {partner && (
                    <p className="text-xs text-slate-500 mt-1">
                      For {partner.username}
                    </p>
                  )}
                </div>
                {!partner ? (
                  <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">
                    Connect to a partner first
                  </div>
                ) : (
                  <>
                    {rewards.length > 0 && (
                      <div className="space-y-2 mb-2">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Granted Rewards</h3>
                        {rewards.map((r) => (
                          <div key={r.id} className="flex justify-between items-center p-3 bg-slate-900/50 border border-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-500/10 rounded-full text-red-400"><Star size={14} /></div>
                              <div>
                                <span className="text-sm font-bold text-slate-300">{r.name}</span>
                                {(r.category || r.duration) && (
                                  <div className="flex gap-2 mt-0.5">
                                    {r.category && <span className="text-[9px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{r.category}</span>}
                                    {r.duration && <span className="text-[9px] text-slate-500">{r.duration}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500">{r.unlocked ? "Unlocked" : `Lv ${r.unlockLevel}`}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-t border-white/5 pt-3">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Browse Pre-built Rewards</h3>
                      <input data-testid="input-reward-search" type="text" value={rewardSearch} onChange={(e) => setRewardSearch(e.target.value)} placeholder="Search rewards..." className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 mb-2" style={{ fontSize: '16px' }} />
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <button onClick={() => setRewardCategoryFilter(null)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${!rewardCategoryFilter ? "bg-red-700 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>All</button>
                        {REWARD_CATEGORIES.map((cat) => (
                          <button key={cat} onClick={() => setRewardCategoryFilter(rewardCategoryFilter === cat ? null : cat)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${rewardCategoryFilter === cat ? "bg-red-700 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>{cat}</button>
                        ))}
                      </div>
                      <div className="space-y-1.5 max-h-[40vh] overflow-y-auto">
                        {PREBUILT_REWARDS.filter((r) => (!rewardCategoryFilter || r.category === rewardCategoryFilter) && (!rewardSearch || r.name.toLowerCase().includes(rewardSearch.toLowerCase()))).map((r, i) => (
                          <button key={i} data-testid={`button-prebuilt-reward-${i}`} onClick={() => { createPartnerRewardMutation.mutate({ name: r.name, category: r.category, duration: r.duration }); setRewardSearch(''); setRewardCategoryFilter(null); }} className="w-full text-left p-2.5 bg-slate-900/50 hover:bg-red-950/30 border border-white/5 hover:border-red-500/30 rounded-lg transition-all cursor-pointer group">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-medium text-slate-300 group-hover:text-red-300 leading-tight">{r.name}</span>
                              <Plus size={12} className="text-slate-600 group-hover:text-red-400 shrink-0 ml-2 mt-0.5" />
                            </div>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[9px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{r.category}</span>
                              <span className="text-[9px] text-slate-500">{r.duration}</span>
                            </div>
                          </button>
                        ))}
                        {PREBUILT_REWARDS.filter((r) => (!rewardCategoryFilter || r.category === rewardCategoryFilter) && (!rewardSearch || r.name.toLowerCase().includes(rewardSearch.toLowerCase()))).length === 0 && (
                          <div className="text-xs text-slate-600 text-center py-4">No matching rewards found</div>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-white/5 pt-3">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Custom Reward</h3>
                      <div className="flex gap-2">
                        <input data-testid="input-reward-name" type="text" value={newRewardName} onChange={(e) => setNewRewardName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && newRewardName.trim() && (() => { createPartnerRewardMutation.mutate({ name: newRewardName }); setNewRewardName(""); })()} placeholder="Custom reward name..." className="flex-1 bg-black/40 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500" style={{ fontSize: '16px' }} />
                        <Button data-testid="button-create-reward" className="bg-red-700 hover:bg-red-500 cursor-pointer" onClick={() => { if (newRewardName.trim()) { createPartnerRewardMutation.mutate({ name: newRewardName }); setNewRewardName(""); } }} disabled={createPartnerRewardMutation.isPending}><Plus size={16} /></Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {modal === "dom_punish" && (
              <div className="p-4 space-y-4">
                <div className="text-center mb-2">
                  <Gavel size={48} className="mx-auto text-red-600 mb-2" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Discipline
                  </h2>
                  {partner && (
                    <p className="text-xs text-slate-500 mt-1">
                      For {partner.username}
                    </p>
                  )}
                </div>
                {!partner ? (
                  <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">
                    Connect to a partner first
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        data-testid="input-punishment-search"
                        type="text"
                        value={punishSearch}
                        onChange={(e) => setPunishSearch(e.target.value)}
                        placeholder="Search punishments..."
                        className="w-full bg-black/40 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                        style={{ fontSize: "16px" }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        data-testid="button-punish-cat-all"
                        onClick={() => setPunishCategoryFilter(null)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${!punishCategoryFilter ? "bg-red-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                      >
                        All
                      </button>
                      {PUNISHMENT_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          data-testid={`button-punish-cat-${cat.toLowerCase().replace(/\s/g, "-")}`}
                          onClick={() => setPunishCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${punishCategoryFilter === cat ? "bg-red-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <div
                      className="max-h-[45vh] overflow-y-auto space-y-1.5 pr-1"
                      style={{ WebkitOverflowScrolling: "touch" }}
                    >
                      {PREBUILT_PUNISHMENTS.filter(
                        (p) =>
                          !punishCategoryFilter ||
                          p.category === punishCategoryFilter,
                      )
                        .filter(
                          (p) =>
                            !punishSearch ||
                            p.name
                              .toLowerCase()
                              .includes(punishSearch.toLowerCase()),
                        )
                        .map((p, i) => (
                          <button
                            key={i}
                            data-testid={`button-prebuilt-punish-${i}`}
                            onClick={() => {
                              createPartnerPunishmentMutation.mutate({
                                name: p.name,
                                category: p.category,
                                duration: p.duration,
                              });
                              setModal(null);
                              setPunishSearch("");
                              setPunishCategoryFilter(null);
                            }}
                            className="w-full flex items-center gap-3 p-3 bg-red-950/10 border border-red-900/20 hover:bg-red-900/30 hover:border-red-500/40 rounded-xl transition-all cursor-pointer group text-left"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-red-400 font-semibold group-hover:text-white transition-colors truncate">
                                {p.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-slate-600 uppercase">
                                  {p.category}
                                </span>
                                <span className="text-[9px] text-slate-600">
                                  •
                                </span>
                                <span className="text-[9px] text-red-500/60 flex items-center gap-0.5">
                                  <Clock size={8} />
                                  {p.duration}
                                </span>
                              </div>
                            </div>
                            <Gavel
                              size={12}
                              className="text-red-900 group-hover:text-red-400 transition-colors shrink-0"
                            />
                          </button>
                        ))}
                      {PREBUILT_PUNISHMENTS.filter(
                        (p) =>
                          !punishCategoryFilter ||
                          p.category === punishCategoryFilter,
                      ).filter(
                        (p) =>
                          !punishSearch ||
                          p.name
                            .toLowerCase()
                            .includes(punishSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="text-center py-6 text-slate-600 text-xs">
                          No punishments match your search
                        </div>
                      )}
                    </div>
                    <div className="border-t border-slate-800 pt-3">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">
                        Custom Punishment
                      </div>
                      <div className="flex gap-2">
                        <input
                          data-testid="input-punishment-name"
                          type="text"
                          value={newPunishmentName}
                          onChange={(e) => setNewPunishmentName(e.target.value)}
                          placeholder="Custom punishment..."
                          className="flex-1 bg-black/40 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                          style={{ fontSize: "16px" }}
                        />
                        <Button
                          data-testid="button-custom-punish"
                          className="bg-red-600 hover:bg-red-500 cursor-pointer"
                          onClick={() => {
                            if (newPunishmentName.trim()) {
                              createPartnerPunishmentMutation.mutate({
                                name: newPunishmentName,
                              });
                              setNewPunishmentName("");
                              setModal(null);
                            }
                          }}
                          disabled={createPartnerPunishmentMutation.isPending}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {modal === "dom_review" && (
              <div className="p-4 space-y-6 overflow-y-auto">
                <div className="text-center mb-4">
                  <FileSignature
                    size={48}
                    className="mx-auto text-red-600 mb-2"
                  />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Review Check-Ins
                  </h2>
                  {partner && (
                    <p className="text-xs text-slate-500 mt-1">
                      {partner.username}'s submissions
                    </p>
                  )}
                </div>
                {!partner ? (
                  <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">
                    Connect to a partner first
                  </div>
                ) : (
                  <div className="space-y-4">
                    {partnerCheckIns
                      .filter((c) => c.status === "pending")
                      .map((rev) => (
                        <div
                          key={rev.id}
                          className="bg-slate-900/50 border border-white/5 p-4 rounded-xl space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2 items-center">
                              <span className="px-2 py-0.5 rounded bg-red-900/30 text-red-500 text-[10px] font-bold uppercase">
                                Check-In
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {formatTime(rev.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-black/30 p-2 rounded">
                              <span className="text-slate-500">Mood:</span>{" "}
                              <span className="text-white font-bold">
                                {rev.mood}/10
                              </span>
                            </div>
                            <div className="bg-black/30 p-2 rounded">
                              <span className="text-slate-500">Obedience:</span>{" "}
                              <span className="text-white font-bold">
                                {rev.obedience}/10
                              </span>
                            </div>
                          </div>
                          {rev.notes && (
                            <p className="text-sm text-slate-300 italic">
                              "{rev.notes}"
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              data-testid={`button-approve-${rev.id}`}
                              size="sm"
                              className="flex-1 bg-red-700 hover:bg-red-600"
                              onClick={() =>
                                reviewPartnerCheckInMutation.mutate({
                                  checkInId: rev.id,
                                  status: "approved",
                                  xpAwarded: 10,
                                })
                              }
                              disabled={reviewPartnerCheckInMutation.isPending}
                            >
                              <Check size={14} className="mr-1" /> Approve (+10
                              XP)
                            </Button>
                            <Button
                              data-testid={`button-reject-${rev.id}`}
                              size="sm"
                              variant="outline"
                              className="flex-1 border-red-900/50 text-red-400 hover:bg-red-950/50"
                              onClick={() =>
                                reviewPartnerCheckInMutation.mutate({
                                  checkInId: rev.id,
                                  status: "rejected",
                                  xpAwarded: 0,
                                })
                              }
                              disabled={reviewPartnerCheckInMutation.isPending}
                            >
                              <XCircle size={14} className="mr-1" /> Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    {partnerCheckIns.filter((c) => c.status === "pending")
                      .length === 0 && (
                      <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">
                        No pending reviews
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {modal === "dom_inspect" && (
              <div className="p-4 space-y-6 overflow-y-auto">
                <div className="text-center">
                  <Crosshair
                    size={48}
                    className="mx-auto text-red-600 mb-4"
                  />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Interrogation
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {partner
                      ? `Interrogating ${partner.username}`
                      : "No sub connected"}
                  </p>
                </div>
                {!partner ? (
                  <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">
                    Connect to a sub first
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-red-950/20 border border-red-600/20 p-4 rounded-xl space-y-3">
                      <div className="text-[10px] text-red-500 uppercase font-bold tracking-widest">
                        Make an Accusation
                      </div>
                      <div className="flex gap-2">
                        <input
                          data-testid="input-accusation"
                          type="text"
                          value={accusationInput}
                          onChange={(e) => setAccusationInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && accusationInput.trim()) {
                              createAccusationMutation.mutate({
                                accusation: accusationInput,
                              });
                              setAccusationInput("");
                            }
                          }}
                          placeholder="State your accusation..."
                          className="flex-1 bg-black/60 border border-red-900/50 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-600"
                        />
                        <Button
                          data-testid="button-send-accusation"
                          className="bg-red-700 hover:bg-red-600 cursor-pointer"
                          onClick={() => {
                            if (accusationInput.trim()) {
                              createAccusationMutation.mutate({
                                accusation: accusationInput,
                              });
                              setAccusationInput("");
                            }
                          }}
                          disabled={createAccusationMutation.isPending}
                        >
                          {createAccusationMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <SendHorizonal size={16} />
                          )}
                        </Button>
                      </div>
                    </div>

                    {partnerAccusations.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-[10px] text-red-500 uppercase font-bold tracking-widest">
                          Accusations Log
                        </div>
                        {partnerAccusations.map((acc) => (
                          <div
                            key={acc.id}
                            className="bg-slate-900/50 border border-white/5 p-4 rounded-xl space-y-2"
                          >
                            <div className="flex gap-2 items-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${acc.status === "pending" ? "bg-red-900/30 text-red-400" : "bg-red-900/30 text-red-500"}`}
                              >
                                {acc.status === "pending"
                                  ? "Awaiting Response"
                                  : "Responded"}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {formatTime(acc.createdAt)}
                              </span>
                            </div>
                            <div className="text-sm text-white font-bold">
                              "{acc.accusation}"
                            </div>
                            {acc.response && (
                              <div className="bg-red-950/20 border border-red-600/10 p-3 rounded-lg">
                                <div className="text-[9px] text-red-600 uppercase font-bold mb-1">
                                  Response
                                </div>
                                <div className="text-xs text-slate-300 italic">
                                  "{acc.response}"
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {partnerCheckIns.filter((c) => c.status === "pending")
                      .length > 0 && (
                      <div className="space-y-3">
                        <div className="text-[10px] text-red-500 uppercase font-bold tracking-widest">
                          Pending Check-Ins
                        </div>
                        {partnerCheckIns
                          .filter((c) => c.status === "pending")
                          .map((rev) => (
                            <div
                              key={rev.id}
                              className="bg-slate-900/50 border border-white/5 p-4 rounded-xl space-y-3"
                            >
                              <div className="flex gap-2 items-center">
                                <span className="px-2 py-0.5 rounded bg-red-900/30 text-red-500 text-[10px] font-bold uppercase">
                                  Check-In
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {formatTime(rev.createdAt)}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-black/30 p-2 rounded">
                                  <span className="text-slate-500">Mood:</span>{" "}
                                  <span className="text-white font-bold">
                                    {rev.mood}/10
                                  </span>
                                </div>
                                <div className="bg-black/30 p-2 rounded">
                                  <span className="text-slate-500">
                                    Obedience:
                                  </span>{" "}
                                  <span className="text-white font-bold">
                                    {rev.obedience}/10
                                  </span>
                                </div>
                              </div>
                              {rev.notes && (
                                <p className="text-sm text-slate-300 italic">
                                  "{rev.notes}"
                                </p>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  data-testid={`button-vinspect-approve-${rev.id}`}
                                  size="sm"
                                  className="flex-1 bg-red-700 hover:bg-red-600 cursor-pointer"
                                  onClick={() =>
                                    reviewPartnerCheckInMutation.mutate({
                                      checkInId: rev.id,
                                      status: "approved",
                                      xpAwarded: 10,
                                    })
                                  }
                                  disabled={
                                    reviewPartnerCheckInMutation.isPending
                                  }
                                >
                                  <Check size={14} className="mr-1" /> Approve
                                  (+10 XP)
                                </Button>
                                <Button
                                  data-testid={`button-vinspect-reject-${rev.id}`}
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 border-red-900/50 text-red-400 hover:bg-red-950/50 cursor-pointer"
                                  onClick={() =>
                                    reviewPartnerCheckInMutation.mutate({
                                      checkInId: rev.id,
                                      status: "rejected",
                                      xpAwarded: 0,
                                    })
                                  }
                                  disabled={
                                    reviewPartnerCheckInMutation.isPending
                                  }
                                >
                                  <XCircle size={14} className="mr-1" /> Reject
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {partnerCheckIns.filter((c) => c.status === "pending")
                      .length === 0 &&
                      partnerAccusations.length === 0 && (
                        <div className="text-center py-6">
                          <CheckCircle
                            size={32}
                            className="mx-auto text-red-800 mb-2"
                          />
                          <div className="text-xs text-slate-600 uppercase tracking-widest">
                            No pending items
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}

            {modal === "dom_direct" && (
              <div className="p-4 space-y-6">
                <div className="text-center">
                  <Film size={48} className="mx-auto text-red-500 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Scene Director
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Control the scene flow
                  </p>
                </div>
                {scenePhase >= 0 && (
                  <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-2xl text-center space-y-3">
                    <div className="text-[10px] text-red-400 uppercase font-bold tracking-widest">
                      Scene Active — {scenePhases[scenePhase]}
                    </div>
                    <div className="text-3xl font-black text-red-400 font-mono tracking-widest">
                      {formatTimerDisplay(sceneTimer)}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        data-testid="button-dom-advance-scene"
                        size="sm"
                        onClick={advanceScene}
                        className="bg-red-700 hover:bg-red-500 cursor-pointer"
                      >
                        {scenePhase < scenePhases.length - 1
                          ? `Next: ${scenePhases[scenePhase + 1]}`
                          : "Complete Scene"}
                      </Button>
                      <Button
                        data-testid="button-dom-end-scene"
                        variant="outline"
                        size="sm"
                        onClick={endScene}
                        className="border-red-800 text-red-400 hover:bg-red-950 cursor-pointer"
                      >
                        End
                      </Button>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {[
                    {
                      label: "Warm-Up",
                      desc: "Ease into the scene",
                      color:
                        "bg-red-500/10 border-red-500/20 text-red-400",
                      activeColor:
                        "bg-red-500/30 border-red-500/50 text-red-300 ring-1 ring-red-500/30",
                    },
                    {
                      label: "Main Scene",
                      desc: "Core intensity",
                      color:
                        "bg-red-500/10 border-red-500/20 text-red-400",
                      activeColor:
                        "bg-red-500/30 border-red-500/50 text-red-300 ring-1 ring-red-500/30",
                    },
                    {
                      label: "Cooldown",
                      desc: "Wind down safely",
                      color: "bg-slate-500/10 border-slate-500/20 text-slate-400",
                      activeColor:
                        "bg-slate-500/30 border-slate-500/50 text-blue-300 ring-1 ring-slate-500/30",
                    },
                  ].map((phase, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border transition-all ${scenePhase === i ? phase.activeColor : scenePhase > i ? "bg-white/5 border-white/10 text-slate-600" : phase.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-widest">
                            {phase.label}
                          </div>
                          <div className="text-[9px] opacity-60 mt-0.5">
                            {phase.desc}
                          </div>
                        </div>
                        {scenePhase > i && (
                          <Check size={14} className="text-red-500" />
                        )}
                        {scenePhase === i && (
                          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {scenePhase < 0 && (
                  <Button
                    data-testid="button-dom-start-scene"
                    onClick={startScene}
                    className="w-full bg-red-700 hover:bg-red-500 font-bold uppercase cursor-pointer"
                  >
                    <Play size={16} className="mr-2" /> Begin Scene
                  </Button>
                )}
              </div>
            )}

            {modal === "dom_surveil" && (
              <div className="p-4 space-y-6 overflow-y-auto">
                <div className="text-center">
                  <FileText size={48} className="mx-auto text-slate-500 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Surveillance
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {partner
                      ? `Monitoring ${partner.username}`
                      : "No sub connected"}
                  </p>
                </div>
                {!partner ? (
                  <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">
                    Connect to a sub first
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-slate-500" /> Live
                      Feed
                    </div>
                    {partnerActivity.slice(0, 15).map((log) => (
                      <div
                        key={log.id}
                        className="flex gap-3 items-start bg-slate-900/50 border border-white/5 p-3 rounded-xl"
                      >
                        <span className="font-mono text-[10px] text-cyan-700 min-w-[50px] mt-0.5">
                          {formatTime(log.createdAt)}
                        </span>
                        <div className="mt-0.5">
                          {log.action.includes("task") ? (
                            <CheckCircle size={12} className="text-red-500" />
                          ) : log.action.includes("dare") ? (
                            <Dices size={12} className="text-red-500" />
                          ) : log.action.includes("check") ? (
                            <MessageSquare
                              size={12}
                              className="text-slate-500"
                            />
                          ) : log.action.includes("scene") ? (
                            <Film size={12} className="text-red-400" />
                          ) : (
                            <Activity size={12} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-300 uppercase">
                            {log.action.replace(/_/g, " ")}
                          </div>
                          {log.detail && (
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {log.detail}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {partnerActivity.length === 0 && (
                      <div className="text-center py-8">
                        <Eye
                          size={32}
                          className="mx-auto text-slate-700 mb-2"
                        />
                        <div className="text-xs text-slate-600 uppercase tracking-widest">
                          No activity detected
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {modal === "dom_enforce" && (
              <div className="p-4 space-y-6">
                <div className="text-center">
                  <Activity size={48} className="mx-auto text-rose-500 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Enforcement
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Set intensity — auto-assigns tasks and restrictions
                  </p>
                </div>
                <div className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl text-center space-y-2">
                  <div className="text-[10px] text-rose-400 uppercase font-bold tracking-widest">
                    Current Intensity
                  </div>
                  <div className="text-3xl font-black text-rose-500">
                    Level {partnerEnforcement?.enforcementLevel ?? ladderLevel}
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    {
                      label: "Level 1 — Gentle",
                      desc: "Soft guidance, no auto-tasks",
                      tasks: 0,
                    },
                    {
                      label: "Level 2 — Moderate",
                      desc: "Standard expectations, +2 tasks",
                      tasks: 2,
                    },
                    {
                      label: "Level 3 — Intense",
                      desc: "Strict adherence, +3 tasks, timed check-ins",
                      tasks: 3,
                    },
                    {
                      label: "Level 4 — Advanced",
                      desc: "Full protocol, +4 tasks, frequent reports",
                      tasks: 4,
                    },
                    {
                      label: "Level 5 — Absolute",
                      desc: "Total authority, +5 tasks, permission required",
                      tasks: 5,
                    },
                  ].map((lvl, i) => {
                    const lvlNum = i + 1;
                    const currentLevel =
                      partnerEnforcement?.enforcementLevel ?? ladderLevel;
                    const selected = currentLevel === lvlNum;
                    return (
                      <button
                        key={i}
                        data-testid={`button-dom-enforce-${lvlNum}`}
                        onClick={() => {
                          setLadderLevel(lvlNum);
                          setEnforcementLevelMutation.mutate(lvlNum);
                        }}
                        disabled={setEnforcementLevelMutation.isPending}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
                          ${
                            selected
                              ? "bg-rose-900/30 border-rose-500/50 ring-1 ring-rose-500/30"
                              : "bg-slate-900/50 border-white/5 hover:border-rose-500/30"
                          }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black
                          ${selected ? "bg-rose-500 text-white" : i < 2 ? "bg-red-900/30 text-red-400" : i < 4 ? "bg-slate-800/30 text-slate-400" : "bg-red-900/30 text-red-400"}`}
                        >
                          {selected ? <Check size={14} /> : lvlNum}
                        </div>
                        <div className="text-left flex-1">
                          <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                            {lvl.label}
                          </span>
                          <div className="text-[9px] text-slate-600">
                            {lvl.desc}
                          </div>
                        </div>
                        {lvl.tasks > 0 && (
                          <span className="text-[9px] font-bold text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded-full">
                            +{lvl.tasks}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {setEnforcementLevelMutation.isPending && (
                  <div className="text-center py-2">
                    <Loader2
                      size={18}
                      className="mx-auto text-rose-500 animate-spin"
                    />
                    <div className="text-[10px] text-rose-400 mt-1 uppercase tracking-widest">
                      Applying enforcement...
                    </div>
                  </div>
                )}
                <div className="bg-slate-900/40 border border-white/5 p-3 rounded-xl">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">
                    What Happens at Each Level
                  </div>
                  <div className="space-y-1 text-[9px] text-slate-600">
                    <div>
                      <span className="text-red-400 font-bold">Lv1:</span> No
                      automatic tasks — gentle guidance only
                    </div>
                    <div>
                      <span className="text-red-400 font-bold">Lv2:</span> 2
                      reflection/devotion tasks auto-assigned
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold">Lv3:</span> 3
                      tasks + timed check-in requirements
                    </div>
                    <div>
                      <span className="text-orange-400 font-bold">Lv4:</span> 4
                      tasks + frequent reports + standing orders
                    </div>
                    <div>
                      <span className="text-red-400 font-bold">Lv5:</span> 5
                      tasks + permission required for all activities
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modal === "dom_bestow" && (
              <div className="p-4 space-y-4 overflow-y-auto">
                <div className="text-center">
                  <Gift size={48} className="mx-auto text-slate-300 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Bestow Rewards
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {partner ? `Rewarding ${partner.username}` : "No sub connected"}
                  </p>
                </div>
                {!partner ? (
                  <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">
                    Connect to a sub first
                  </div>
                ) : (
                  <>
                    {rewards.length > 0 && (
                      <div className="space-y-2 mb-2">
                        <h3 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Bestowed Rewards</h3>
                        {rewards.map((r) => (
                          <div key={r.id} className="flex justify-between items-center p-3 bg-amber-950/10 border border-slate-800/20 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-300/10 rounded-full text-slate-400"><Star size={14} /></div>
                              <div>
                                <span className="text-sm font-bold text-amber-200">{r.name}</span>
                                <div className="flex gap-2 mt-0.5">
                                  {r.category && <span className="text-[9px] text-slate-400 bg-slate-300/10 px-1.5 py-0.5 rounded">{r.category}</span>}
                                  {r.duration && <span className="text-[9px] text-amber-600">{r.duration}</span>}
                                  <span className="text-[9px] text-amber-600">{r.unlocked ? "Bestowed" : `Requires Lv ${r.unlockLevel}`}</span>
                                </div>
                              </div>
                            </div>
                            {r.unlocked ? <Check size={14} className="text-slate-400" /> : <Lock size={14} className="text-slate-600" />}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-t border-slate-800/20 pt-3">
                      <h3 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Browse Pre-built Rewards</h3>
                      <input data-testid="input-bestow-reward-search" type="text" value={rewardSearch} onChange={(e) => setRewardSearch(e.target.value)} placeholder="Search rewards..." className="w-full bg-black/40 border border-amber-900/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-300 mb-2" style={{ fontSize: '16px' }} />
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <button onClick={() => setRewardCategoryFilter(null)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${!rewardCategoryFilter ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>All</button>
                        {REWARD_CATEGORIES.map((cat) => (
                          <button key={cat} onClick={() => setRewardCategoryFilter(rewardCategoryFilter === cat ? null : cat)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${rewardCategoryFilter === cat ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>{cat}</button>
                        ))}
                      </div>
                      <div className="space-y-1.5 max-h-[40vh] overflow-y-auto">
                        {PREBUILT_REWARDS.filter((r) => (!rewardCategoryFilter || r.category === rewardCategoryFilter) && (!rewardSearch || r.name.toLowerCase().includes(rewardSearch.toLowerCase()))).map((r, i) => (
                          <button key={i} data-testid={`button-bestow-prebuilt-reward-${i}`} onClick={() => { createPartnerRewardMutation.mutate({ name: r.name, category: r.category, duration: r.duration }); setRewardSearch(''); setRewardCategoryFilter(null); }} className="w-full text-left p-2.5 bg-amber-950/10 hover:bg-amber-950/30 border border-amber-900/10 hover:border-slate-300/30 rounded-lg transition-all cursor-pointer group">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-medium text-amber-200 group-hover:text-amber-100 leading-tight">{r.name}</span>
                              <Plus size={12} className="text-amber-700 group-hover:text-slate-400 shrink-0 ml-2 mt-0.5" />
                            </div>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[9px] text-slate-400 bg-slate-300/10 px-1.5 py-0.5 rounded">{r.category}</span>
                              <span className="text-[9px] text-amber-600">{r.duration}</span>
                            </div>
                          </button>
                        ))}
                        {PREBUILT_REWARDS.filter((r) => (!rewardCategoryFilter || r.category === rewardCategoryFilter) && (!rewardSearch || r.name.toLowerCase().includes(rewardSearch.toLowerCase()))).length === 0 && (
                          <div className="text-xs text-slate-600 text-center py-4">No matching rewards found</div>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-slate-800/20 pt-3">
                      <h3 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Custom Reward</h3>
                      <div className="flex gap-2">
                        <input data-testid="input-dom-bestow-reward" type="text" value={newRewardName} onChange={(e) => setNewRewardName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && newRewardName.trim() && (() => { createPartnerRewardMutation.mutate({ name: newRewardName }); setNewRewardName(""); })()} placeholder="Custom reward to bestow..." className="flex-1 bg-black/40 border border-amber-900/30 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-slate-300" style={{ fontSize: '16px' }} />
                        <Button data-testid="button-dom-bestow-create" className="bg-amber-600 hover:bg-slate-300 cursor-pointer" onClick={() => { if (newRewardName.trim()) { createPartnerRewardMutation.mutate({ name: newRewardName }); setNewRewardName(""); } }} disabled={createPartnerRewardMutation.isPending}><Plus size={16} /></Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {modal === "dom_decree" && (
              <div className="p-4 space-y-4">
                <div className="text-center">
                  <Gavel size={48} className="mx-auto text-orange-500 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Issue Decree
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {partner
                      ? `Disciplining ${partner.username}`
                      : "No sub connected"}
                  </p>
                </div>
                {!partner ? (
                  <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">
                    Connect to a sub first
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        data-testid="input-decree-search"
                        type="text"
                        value={punishSearch}
                        onChange={(e) => setPunishSearch(e.target.value)}
                        placeholder="Search decrees..."
                        className="w-full bg-black/40 border border-orange-900/30 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                        style={{ fontSize: "16px" }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        data-testid="button-decree-cat-all"
                        onClick={() => setPunishCategoryFilter(null)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${!punishCategoryFilter ? "bg-orange-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                      >
                        All
                      </button>
                      {PUNISHMENT_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          data-testid={`button-decree-cat-${cat.toLowerCase().replace(/\s/g, "-")}`}
                          onClick={() => setPunishCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${punishCategoryFilter === cat ? "bg-orange-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <div
                      className="max-h-[40vh] overflow-y-auto space-y-1.5 pr-1"
                      style={{ WebkitOverflowScrolling: "touch" }}
                    >
                      {PREBUILT_PUNISHMENTS.filter(
                        (p) =>
                          !punishCategoryFilter ||
                          p.category === punishCategoryFilter,
                      )
                        .filter(
                          (p) =>
                            !punishSearch ||
                            p.name
                              .toLowerCase()
                              .includes(punishSearch.toLowerCase()),
                        )
                        .map((p, i) => (
                          <button
                            key={i}
                            data-testid={`button-prebuilt-decree-${i}`}
                            onClick={() => {
                              createPartnerPunishmentMutation.mutate({
                                name: p.name,
                                category: p.category,
                                duration: p.duration,
                              });
                              logActivityMutation.mutate({
                                action: "decree_issued",
                                detail: p.name,
                              });
                              setModal(null);
                              setPunishSearch("");
                              setPunishCategoryFilter(null);
                            }}
                            className="w-full flex items-center gap-3 p-3 bg-orange-950/10 border border-orange-900/20 hover:bg-orange-900/30 hover:border-orange-500/40 rounded-xl transition-all cursor-pointer group text-left"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-orange-400 font-semibold group-hover:text-white transition-colors truncate">
                                {p.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-slate-600 uppercase">
                                  {p.category}
                                </span>
                                <span className="text-[9px] text-slate-600">
                                  •
                                </span>
                                <span className="text-[9px] text-orange-500/60 flex items-center gap-0.5">
                                  <Clock size={8} />
                                  {p.duration}
                                </span>
                              </div>
                            </div>
                            <Gavel
                              size={12}
                              className="text-orange-900 group-hover:text-orange-400 transition-colors shrink-0"
                            />
                          </button>
                        ))}
                      {PREBUILT_PUNISHMENTS.filter(
                        (p) =>
                          !punishCategoryFilter ||
                          p.category === punishCategoryFilter,
                      ).filter(
                        (p) =>
                          !punishSearch ||
                          p.name
                            .toLowerCase()
                            .includes(punishSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="text-center py-6 text-slate-600 text-xs">
                          No decrees match your search
                        </div>
                      )}
                    </div>
                    <div className="border-t border-slate-800 pt-3">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">
                        Custom Decree
                      </div>
                      <div className="flex gap-2">
                        <input
                          data-testid="input-dom-decree-custom"
                          type="text"
                          value={newPunishmentName}
                          onChange={(e) => setNewPunishmentName(e.target.value)}
                          placeholder="Custom decree..."
                          className="flex-1 bg-black/40 border border-orange-900/30 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                          style={{ fontSize: "16px" }}
                        />
                        <Button
                          data-testid="button-dom-decree-custom"
                          className="bg-orange-600 hover:bg-orange-500 cursor-pointer"
                          onClick={() => {
                            if (newPunishmentName.trim()) {
                              createPartnerPunishmentMutation.mutate({
                                name: newPunishmentName,
                              });
                              setNewPunishmentName("");
                              setModal(null);
                            }
                          }}
                          disabled={createPartnerPunishmentMutation.isPending}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                    {punishments.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                          Recent Decrees
                        </div>
                        {punishments.slice(0, 5).map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-3 bg-slate-900/30 border border-white/5 p-2 rounded-lg"
                          >
                            <Gavel
                              size={12}
                              className="text-orange-600 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs text-slate-400 block truncate">
                                {p.name}
                              </span>
                              {p.duration && (
                                <span className="text-[9px] text-slate-600 flex items-center gap-0.5">
                                  <Clock size={8} />
                                  {p.duration}
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-[9px] uppercase font-bold shrink-0 ${p.status === "completed" ? "text-red-500" : "text-orange-500"}`}
                            >
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {modal === "dom_override" && (
              <div className="p-4 space-y-6">
                <div className="text-center">
                  <ShieldAlert
                    size={48}
                    className="mx-auto text-red-600 mb-4"
                  />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Override Control
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Emergency overrides and forced modes
                  </p>
                </div>
                <div className="bg-red-950/30 border border-red-500/30 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm uppercase tracking-wider">
                        Force Crisis Mode
                      </div>
                      <div className="text-[10px] text-red-400/70">
                        Immediately lock sub's interface
                      </div>
                    </div>
                    <Button
                      data-testid="button-dom-override-crisis"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setIsCrisisMode(true);
                        setModal(null);
                        logActivityMutation.mutate({
                          action: "crisis_forced",
                          detail: "Dom activated crisis mode",
                        });
                      }}
                      className="cursor-pointer"
                    >
                      ACTIVATE
                    </Button>
                  </div>
                </div>
                <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    Quick Overrides
                  </div>
                  <button
                    data-testid="button-dom-override-0"
                    onClick={() => overrideRevokeRewardsMutation.mutate()}
                    disabled={overrideRevokeRewardsMutation.isPending}
                    className="w-full flex items-center justify-between bg-black/30 border border-white/5 p-3 rounded-xl hover:border-red-500/30 transition-all cursor-pointer group"
                  >
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-300 uppercase group-hover:text-white">
                        Revoke All Rewards
                      </div>
                      <div className="text-[9px] text-slate-600">
                        Reset all earned privileges immediately
                      </div>
                    </div>
                    {overrideRevokeRewardsMutation.isPending ? (
                      <Loader2
                        size={14}
                        className="text-red-500 animate-spin"
                      />
                    ) : (
                      <ChevronRight
                        size={14}
                        className="text-slate-700 group-hover:text-red-500"
                      />
                    )}
                  </button>
                  <button
                    data-testid="button-dom-override-1"
                    onClick={() => overrideClearTasksMutation.mutate()}
                    disabled={overrideClearTasksMutation.isPending}
                    className="w-full flex items-center justify-between bg-black/30 border border-white/5 p-3 rounded-xl hover:border-red-500/30 transition-all cursor-pointer group"
                  >
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-300 uppercase group-hover:text-white">
                        Clear Task Queue
                      </div>
                      <div className="text-[9px] text-slate-600">
                        Remove all pending orders from sub
                      </div>
                    </div>
                    {overrideClearTasksMutation.isPending ? (
                      <Loader2
                        size={14}
                        className="text-red-500 animate-spin"
                      />
                    ) : (
                      <ChevronRight
                        size={14}
                        className="text-slate-700 group-hover:text-red-500"
                      />
                    )}
                  </button>
                  <button
                    data-testid="button-dom-override-2"
                    onClick={() => overrideForceCheckInMutation.mutate()}
                    disabled={overrideForceCheckInMutation.isPending}
                    className="w-full flex items-center justify-between bg-black/30 border border-white/5 p-3 rounded-xl hover:border-red-500/30 transition-all cursor-pointer group"
                  >
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-300 uppercase group-hover:text-white">
                        Force Check-In
                      </div>
                      <div className="text-[9px] text-slate-600">
                        Demand immediate report with 5-min timer
                      </div>
                    </div>
                    {overrideForceCheckInMutation.isPending ? (
                      <Loader2
                        size={14}
                        className="text-red-500 animate-spin"
                      />
                    ) : (
                      <ChevronRight
                        size={14}
                        className="text-slate-700 group-hover:text-red-500"
                      />
                    )}
                  </button>
                </div>
              </div>
            )}

            {modal === "bond" && (
              <div className="text-center p-4">
                <Anchor size={48} className="mx-auto text-red-600 mb-4" />
                <h2 className="text-xl font-black text-white uppercase">
                  Level {level}
                </h2>
                <p className="text-red-400 font-bold uppercase text-xs mb-6">
                  {level === 1
                    ? "Emerging Bond"
                    : level === 2
                      ? "Growing Trust"
                      : "Deep Connection"}
                </p>
                <div className="w-full h-4 bg-black rounded-full overflow-hidden border border-white/20 mb-2">
                  <div
                    className="h-full bg-red-600 transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 uppercase">
                  <span>0 XP</span>
                  <span>
                    {xp} / {xpMax}
                  </span>
                  <span>Level {level + 1}</span>
                </div>
              </div>
            )}

            {modal === "wheel" && (
              <div className="text-center p-4">
                <Dices
                  size={48}
                  className={`mx-auto text-red-500 mb-4 ${isSpinning ? "animate-spin" : ""}`}
                />
                <h2 className="text-xl font-bold text-white mb-2">
                  Wheel of Dares
                </h2>

                {wheelResult ? (
                  <div className="my-8 animate-in zoom-in-95">
                    <div className="text-xs text-red-400 uppercase tracking-widest mb-2">
                      Fate Decided
                    </div>
                    <div className="text-lg font-black text-white border p-4 rounded-xl bg-red-950/20 border-red-500/50">
                      {wheelResult}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 my-8 italic">
                    "Let fate decide your next task..."
                  </p>
                )}

                <button
                  data-testid="button-spin"
                  onClick={handleSpinWheel}
                  disabled={isSpinning}
                  className="w-full py-3 bg-red-700 hover:bg-red-500 text-white font-bold uppercase rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {isSpinning ? "Spinning..." : "Spin Now"}
                </button>

                {dares.length > 0 && (
                  <div className="mt-6 space-y-2 text-left max-h-40 overflow-y-auto">
                    <Label className="text-xs uppercase text-slate-500 font-bold tracking-widest pl-1">
                      Past Dares
                    </Label>
                    {dares.slice(0, 5).map((d) => (
                      <div
                        key={d.id}
                        className="flex justify-between items-center bg-black/30 p-2 rounded-lg text-xs"
                      >
                        <span
                          className={`text-slate-300 ${d.completed ? "line-through opacity-50" : ""}`}
                        >
                          {d.text}
                        </span>
                        {!d.completed && (
                          <button
                            data-testid={`button-complete-dare-${d.id}`}
                            onClick={() => completeDareMutation.mutate(d.id)}
                            className="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold cursor-pointer"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {modal === "checkin" && (
              <div className="p-4 space-y-6">
                <div className="text-center mb-6">
                  <MessageSquare
                    size={32}
                    className="mx-auto text-slate-500 mb-2"
                  />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Daily Check-In
                  </h2>
                </div>

                {checkInStep === 0 && (
                  <div className="space-y-6 animate-in slide-in-from-right">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-slate-300">Current Mood</Label>
                        <span className="text-xs font-mono text-slate-400">
                          {checkInData.mood}/10
                        </span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <Frown size={16} className="text-slate-600" />
                        <Slider
                          defaultValue={[checkInData.mood]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={(v) =>
                            setCheckInData((prev) => ({ ...prev, mood: v[0] }))
                          }
                          className="flex-1"
                        />
                        <Smile size={16} className="text-slate-600" />
                      </div>
                    </div>
                    <Button
                      data-testid="button-checkin-next"
                      onClick={() => setCheckInStep(1)}
                      className="w-full bg-slate-600 hover:bg-slate-500"
                    >
                      Next: Obedience Rating
                    </Button>
                  </div>
                )}

                {checkInStep === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-slate-300">
                          Self-Rated Obedience
                        </Label>
                        <span className="text-xs font-mono text-slate-400">
                          {checkInData.obedience}/10
                        </span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <Ban size={16} className="text-slate-600" />
                        <Slider
                          defaultValue={[checkInData.obedience]}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={(v) =>
                            setCheckInData((prev) => ({
                              ...prev,
                              obedience: v[0],
                            }))
                          }
                          className="flex-1"
                        />
                        <CheckCircle size={16} className="text-slate-600" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCheckInStep(0)}
                        className="flex-1 border-slate-700"
                      >
                        Back
                      </Button>
                      <Button
                        data-testid="button-checkin-next2"
                        onClick={() => setCheckInStep(2)}
                        className="flex-1 bg-slate-600 hover:bg-slate-500"
                      >
                        Next: Notes
                      </Button>
                    </div>
                  </div>
                )}

                {checkInStep === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right">
                    <div>
                      <Label className="text-slate-300 mb-2 block">
                        Additional Notes
                      </Label>
                      <textarea
                        data-testid="input-checkin-notes"
                        value={checkInData.notes}
                        onChange={(e) =>
                          setCheckInData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="w-full bg-black/40 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm focus:outline-none focus:border-slate-500/50 min-h-[100px]"
                        placeholder="How are you feeling today? Any observations..."
                      />
                    </div>
                    <div className="bg-slate-800/20 border border-slate-500/30 p-4 rounded-xl">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-2">
                        Summary
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          Mood:{" "}
                          <span className="text-white font-bold">
                            {checkInData.mood}/10
                          </span>
                        </div>
                        <div>
                          Obedience:{" "}
                          <span className="text-white font-bold">
                            {checkInData.obedience}/10
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCheckInStep(1)}
                        className="flex-1 border-slate-700"
                      >
                        Back
                      </Button>
                      <Button
                        data-testid="button-submit-checkin"
                        onClick={handleSubmitCheckIn}
                        disabled={createCheckInMutation.isPending}
                        className="flex-1 bg-slate-600 hover:bg-slate-500"
                      >
                        {createCheckInMutation.isPending ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          "Submit Check-In"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {modal === "badges" && (
              <div className="text-center p-4">
                <Award size={48} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-white uppercase mb-6">
                  Achievements
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      name: "First Task",
                      icon: <Check size={20} />,
                      unlocked: (stats?.completedTasks ?? 0) > 0,
                    },
                    {
                      name: "First Check-In",
                      icon: <MessageSquare size={20} />,
                      unlocked: (stats?.totalCheckIns ?? 0) > 0,
                    },
                    {
                      name: "First Dare",
                      icon: <Dices size={20} />,
                      unlocked: (stats?.totalDares ?? 0) > 0,
                    },
                    {
                      name: "Journalist",
                      icon: <BookOpen size={20} />,
                      unlocked: (stats?.totalJournalEntries ?? 0) > 0,
                    },
                    {
                      name: "Streak 5",
                      icon: <Flame size={20} />,
                      unlocked: (stats?.completedTasks ?? 0) >= 5,
                    },
                    {
                      name: "Level Up",
                      icon: <Zap size={20} />,
                      unlocked: level >= 2,
                    },
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-center ${badge.unlocked ? "bg-red-900/20 border-red-500/30" : "bg-black/20 border-slate-800 opacity-30"}`}
                    >
                      <div
                        className={
                          badge.unlocked ? "text-red-400" : "text-slate-600"
                        }
                      >
                        {badge.icon}
                      </div>
                      <div className="text-[9px] font-bold uppercase mt-1 text-slate-400">
                        {badge.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modal === "aftercare" && (
              <div className="p-4 space-y-6">
                <div className="text-center">
                  <Heart size={48} className="mx-auto text-rose-700 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Aftercare Protocol
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {aftercareActions.length}/4 steps completed
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      icon: <Coffee size={24} />,
                      label: "Hydrate",
                      key: "hydrate",
                      desc: "Drink water",
                    },
                    {
                      icon: <Music size={24} />,
                      label: "Soothe",
                      key: "soothe",
                      desc: "Calming sounds",
                    },
                    {
                      icon: <Heart size={24} />,
                      label: "Comfort",
                      key: "comfort",
                      desc: "Physical comfort",
                    },
                    {
                      icon: <MessageSquare size={24} />,
                      label: "Debrief",
                      key: "debrief",
                      desc: "Talk it through",
                    },
                  ].map((item) => {
                    const done = aftercareActions.includes(item.key);
                    return (
                      <button
                        key={item.key}
                        data-testid={`button-aftercare-${item.key}`}
                        onClick={() => {
                          if (!done) {
                            setAftercareActions((prev) => [...prev, item.key]);
                            logActivityMutation.mutate({
                              action: "aftercare",
                              detail: item.label,
                            });
                          }
                        }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer
                          ${done ? "bg-pink-900/20 border-rose-700/30" : "bg-slate-900/50 border-white/5 hover:border-rose-700/50"}`}
                      >
                        <div
                          className={done ? "text-rose-500" : "text-rose-600"}
                        >
                          {item.icon}
                        </div>
                        <span className="text-[10px] font-bold uppercase text-slate-300">
                          {item.label}
                        </span>
                        <span className="text-[9px] text-slate-600">
                          {done ? "Done" : item.desc}
                        </span>
                        {done && <Check size={12} className="text-rose-600" />}
                      </button>
                    );
                  })}
                </div>
                {aftercareActions.length === 4 && (
                  <div className="text-center bg-pink-900/20 border border-rose-700/20 p-4 rounded-xl">
                    <div className="text-xs text-rose-600 font-bold uppercase">
                      Aftercare Complete
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      All steps finished. You're safe.
                    </div>
                  </div>
                )}
              </div>
            )}

            {modal === "worship" && (
              <div className="p-4 space-y-6">
                <div className="text-center">
                  <Star size={48} className="mx-auto text-slate-300 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Altar of Worship
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {worshipDone
                      ? "Devotion complete"
                      : "Daily devotion awaits"}
                  </p>
                </div>
                <div
                  className={`border p-6 rounded-2xl text-center transition-all ${worshipDone ? "bg-slate-800/20 border-slate-300/30" : "bg-amber-900/10 border-slate-300/20"}`}
                >
                  <div className="text-xs text-slate-400/70 uppercase tracking-widest mb-2 font-bold">
                    Daily Devotion
                  </div>
                  <div className="text-sm italic text-amber-200">
                    "Your guidance is my only path."
                  </div>
                  {worshipDone ? (
                    <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                      <Check size={18} />{" "}
                      <span className="text-xs font-bold uppercase">
                        Acknowledged
                      </span>
                    </div>
                  ) : (
                    <Button
                      data-testid="button-worship-acknowledge"
                      onClick={() => {
                        setWorshipDone(true);
                        logActivityMutation.mutate({
                          action: "worship",
                          detail: "Daily devotion acknowledged",
                        });
                      }}
                      className="mt-6 w-full bg-amber-600 hover:bg-slate-300 text-black font-black uppercase tracking-widest text-xs cursor-pointer"
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
                {partner && (
                  <div className="bg-amber-950/20 border border-amber-800/20 p-4 rounded-xl text-center">
                    <div className="text-[10px] text-amber-600 uppercase font-bold tracking-widest mb-1">
                      Devoted to
                    </div>
                    <div className="text-lg font-black text-slate-400 uppercase">
                      {partner.username}
                    </div>
                  </div>
                )}
              </div>
            )}

            {modal === "sensory" && (
              <div className="p-4 space-y-6">
                <div className="text-center">
                  <Sliders size={48} className="mx-auto text-slate-400 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Sensory Override
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {Object.values(sensoryToggles).filter(Boolean).length}{" "}
                    active overrides
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      icon: <Music size={14} />,
                      label: "White Noise",
                      key: "noise" as const,
                    },
                    {
                      icon: <Eye size={14} />,
                      label: "Visual Dampening",
                      key: "visual" as const,
                    },
                    {
                      icon: <Thermometer size={14} />,
                      label: "Temp Control",
                      key: "temp" as const,
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className={`flex justify-between items-center p-3 rounded-xl border transition-all
                      ${sensoryToggles[item.key] ? "bg-slate-800/60 border-slate-500/30" : "bg-black/40 border-white/5"}`}
                    >
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-300 uppercase">
                        <span
                          className={
                            sensoryToggles[item.key]
                              ? "text-white"
                              : "text-slate-500"
                          }
                        >
                          {item.icon}
                        </span>{" "}
                        {item.label}
                      </div>
                      <Switch
                        data-testid={`switch-sensory-${item.key}`}
                        checked={sensoryToggles[item.key]}
                        onCheckedChange={(checked) => {
                          setSensoryToggles((prev) => ({
                            ...prev,
                            [item.key]: checked,
                          }));
                          logActivityMutation.mutate({
                            action: "sensory_toggle",
                            detail: `${item.label} ${checked ? "enabled" : "disabled"}`,
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
                {Object.values(sensoryToggles).some(Boolean) && (
                  <div className="text-center bg-slate-800/40 border border-slate-600/20 p-3 rounded-xl">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                      Override Active
                    </div>
                  </div>
                )}
              </div>
            )}

            {modal === "balance" && (
              <div className="p-4 space-y-6 text-center">
                <Clock size={48} className="mx-auto text-slate-300 mb-2" />
                <h2 className="text-xl font-bold text-white uppercase">
                  XP Balance
                </h2>
                <div className="bg-black/40 p-6 rounded-2xl border border-slate-300/20 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 uppercase font-bold">
                      Total XP
                    </span>
                    <span className="text-xl font-black text-slate-300">
                      {xp}
                    </span>
                  </div>
                  <div className="h-0.5 bg-white/5 w-full" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Tasks Completed</span>
                      <span>{stats?.completedTasks ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Check-Ins</span>
                      <span>{stats?.totalCheckIns ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Dares Completed</span>
                      <span>{stats?.completedDares ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modal === "training" && (
              <div className="p-4 space-y-6">
                <div className="text-center">
                  <Target size={48} className="mx-auto text-red-500 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Training Grounds
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Structured exercises and drills
                  </p>
                </div>
                {trainingActive && (
                  <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-2xl text-center space-y-3">
                    <div className="text-[10px] text-red-400 uppercase font-bold tracking-widest">
                      {trainingActive} Active
                    </div>
                    <div className="text-3xl font-black text-red-500 font-mono tracking-widest">
                      {formatTimerDisplay(trainingTimer)}
                    </div>
                    <Button
                      data-testid="button-stop-training"
                      variant="destructive"
                      size="sm"
                      onClick={stopTraining}
                      className="cursor-pointer"
                    >
                      <Square size={14} className="mr-2" /> Stop & Record
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      icon: <Timer size={20} />,
                      label: "Endurance",
                      key: "endurance",
                      desc: "Timed hold exercises",
                    },
                    {
                      icon: <Hand size={20} />,
                      label: "Posture",
                      key: "posture",
                      desc: "Position training",
                    },
                    {
                      icon: <Ear size={20} />,
                      label: "Obedience",
                      key: "obedience",
                      desc: "Response drills",
                    },
                    {
                      icon: <HeartPulse size={20} />,
                      label: "Breathing",
                      key: "breathing",
                      desc: "Controlled breathing",
                    },
                  ].map((item) => {
                    const completed = trainingCompleted.includes(item.key);
                    const active = trainingActive === item.key;
                    return (
                      <button
                        key={item.key}
                        data-testid={`button-training-${item.key}`}
                        onClick={() => !active && startTraining(item.key)}
                        disabled={!!trainingActive && !active}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer
                          ${
                            active
                              ? "bg-red-900/30 border-red-500/50 ring-1 ring-red-500/30"
                              : completed
                                ? "bg-red-900/20 border-red-500/30"
                                : "bg-slate-900/50 border-white/5 hover:border-red-500/50"
                          }
                          ${!!trainingActive && !active ? "opacity-40" : ""}`}
                      >
                        <div
                          className={
                            active
                              ? "text-red-400"
                              : completed
                                ? "text-red-400"
                                : "text-red-400"
                          }
                        >
                          {item.icon}
                        </div>
                        <span className="text-[10px] font-bold uppercase text-slate-300">
                          {item.label}
                        </span>
                        <span className="text-[9px] text-slate-600">
                          {completed ? "Completed" : item.desc}
                        </span>
                        {completed && (
                          <Check size={12} className="text-red-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {trainingCompleted.length > 0 && (
                  <div className="text-center text-[10px] text-red-600 font-bold uppercase">
                    {trainingCompleted.length}/4 Exercises Complete
                  </div>
                )}
              </div>
            )}

            {modal === "scene" && (
              <div className="p-4 space-y-4 overflow-y-auto">
                <div className="text-center">
                  <Film size={48} className="mx-auto text-red-500 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Scene Builder
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Browse 100+ scenes or build your own
                  </p>
                </div>

                {scenePhase >= 0 && (
                  <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-2xl text-center space-y-3">
                    <div className="text-[10px] text-red-400 uppercase font-bold tracking-widest">
                      Scene Active — {scenePhases[scenePhase]}
                    </div>
                    <div className="text-3xl font-black text-red-400 font-mono tracking-widest">
                      {formatTimerDisplay(sceneTimer)}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        data-testid="button-advance-scene"
                        size="sm"
                        onClick={advanceScene}
                        className="bg-red-700 hover:bg-red-500 cursor-pointer"
                      >
                        {scenePhase < scenePhases.length - 1
                          ? `Next: ${scenePhases[scenePhase + 1]}`
                          : "Complete Scene"}
                      </Button>
                      <Button
                        data-testid="button-end-scene"
                        variant="outline"
                        size="sm"
                        onClick={endScene}
                        className="border-red-800 text-red-400 hover:bg-red-950 cursor-pointer"
                      >
                        End
                      </Button>
                    </div>
                  </div>
                )}

                {scenePhase < 0 && (
                  <>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        data-testid="input-scene-search"
                        type="text"
                        value={sceneSearch}
                        onChange={(e) => setSceneSearch(e.target.value)}
                        placeholder="Search scenes or activities..."
                        className="w-full bg-black/40 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                        style={{ fontSize: "16px" }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        data-testid="button-scene-cat-all"
                        onClick={() => setSceneCategoryFilter(null)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${!sceneCategoryFilter ? "bg-red-700 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                      >
                        All
                      </button>
                      {SCENE_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          data-testid={`button-scene-cat-${cat.toLowerCase().replace(/\s/g, "-")}`}
                          onClick={() => setSceneCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${sceneCategoryFilter === cat ? "bg-red-700 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <div className="max-h-[40vh] overflow-y-auto space-y-1.5 pr-1" style={{ WebkitOverflowScrolling: "touch" }}>
                      {PREBUILT_SCENES
                        .filter((s) => !sceneCategoryFilter || s.category === sceneCategoryFilter)
                        .filter((s) => !sceneSearch || s.name.toLowerCase().includes(sceneSearch.toLowerCase()) || s.activities.some(a => a.toLowerCase().includes(sceneSearch.toLowerCase())))
                        .map((s, i) => (
                          <button
                            key={i}
                            data-testid={`button-prebuilt-scene-${i}`}
                            onClick={() => {
                              createPlaySessionMutation.mutate({
                                title: s.name,
                                notes: `Category: ${s.category}\nSuggested Duration: ${s.duration}\nActivities: ${s.activities.join(", ")}`,
                                mood: s.intensity >= 7 ? "intense" : s.intensity >= 4 ? "excited" : "relaxed",
                                intensity: s.intensity,
                                activities: s.activities,
                                status: "planned",
                              });
                              setModal(null);
                              setSceneSearch("");
                              setSceneCategoryFilter(null);
                            }}
                            className="w-full flex items-center gap-3 p-3 bg-red-950/10 border border-red-950/20 hover:bg-red-900/30 hover:border-red-500/40 rounded-xl transition-all cursor-pointer group text-left"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-red-400 font-semibold group-hover:text-white transition-colors truncate">
                                {s.name}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] text-slate-600 uppercase">{s.category}</span>
                                <span className="text-[9px] text-slate-600">•</span>
                                <span className="text-[9px] text-red-500/60 flex items-center gap-0.5">
                                  <Clock size={8} />{s.duration}
                                </span>
                                <span className="text-[9px] text-slate-600">•</span>
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 10 }, (_, j) => (
                                    <div key={j} className={`w-1 h-1 rounded-full ${j < s.intensity ? (s.intensity >= 8 ? "bg-red-500" : s.intensity >= 5 ? "bg-slate-300" : "bg-red-500") : "bg-slate-800"}`} />
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {s.activities.slice(0, 3).map((a, j) => (
                                  <span key={j} className="text-[8px] bg-slate-800/80 text-slate-500 px-1.5 py-0.5 rounded">{a}</span>
                                ))}
                                {s.activities.length > 3 && (
                                  <span className="text-[8px] text-slate-600">+{s.activities.length - 3}</span>
                                )}
                              </div>
                            </div>
                            <Flame size={12} className="text-red-900 group-hover:text-red-400 transition-colors shrink-0" />
                          </button>
                        ))}
                      {PREBUILT_SCENES
                        .filter((s) => !sceneCategoryFilter || s.category === sceneCategoryFilter)
                        .filter((s) => !sceneSearch || s.name.toLowerCase().includes(sceneSearch.toLowerCase()) || s.activities.some(a => a.toLowerCase().includes(sceneSearch.toLowerCase())))
                        .length === 0 && (
                          <div className="text-center py-6 text-slate-600 text-xs">
                            No scenes match your search
                          </div>
                        )}
                    </div>
                  </>
                )}

                <div className="space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    {scenePhase >= 0 ? "Scene Phases" : "Live Scene Tracker"}
                  </div>
                  {[
                    {
                      label: "Warm-Up",
                      desc: "Ease into the scene",
                      color: "bg-red-500/10 border-red-500/20 text-red-400",
                      activeColor: "bg-red-500/30 border-red-500/50 text-red-300 ring-1 ring-red-500/30",
                    },
                    {
                      label: "Main Scene",
                      desc: "Core intensity",
                      color: "bg-red-500/10 border-red-500/20 text-red-400",
                      activeColor: "bg-red-500/30 border-red-500/50 text-red-300 ring-1 ring-red-500/30",
                    },
                    {
                      label: "Cooldown",
                      desc: "Wind down safely",
                      color: "bg-slate-500/10 border-slate-500/20 text-slate-400",
                      activeColor: "bg-slate-500/30 border-slate-500/50 text-blue-300 ring-1 ring-slate-500/30",
                    },
                  ].map((phase, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border transition-all ${scenePhase === i ? phase.activeColor : scenePhase > i ? "bg-white/5 border-white/10 text-slate-600" : phase.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-widest">{phase.label}</div>
                          <div className="text-[9px] opacity-60 mt-0.5">{phase.desc}</div>
                        </div>
                        {scenePhase > i && <Check size={14} className="text-red-500" />}
                        {scenePhase === i && <div className="w-2 h-2 rounded-full bg-current animate-pulse" />}
                      </div>
                    </div>
                  ))}
                </div>
                {scenePhase < 0 && (
                  <Button
                    data-testid="button-start-scene"
                    onClick={startScene}
                    className="w-full bg-red-700 hover:bg-red-500 font-bold uppercase cursor-pointer"
                  >
                    <Play size={16} className="mr-2" /> Start Live Scene
                  </Button>
                )}
              </div>
            )}

            {modal === "ladders" && (
              <div className="p-4 space-y-6">
                <div className="text-center">
                  <Activity size={48} className="mx-auto text-rose-500 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Escalation Ladders
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Current intensity: Level {ladderLevel}
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    {
                      label: "Level 1 — Gentle",
                      desc: "Light play, soft touch",
                    },
                    { label: "Level 2 — Moderate", desc: "Standard intensity" },
                    { label: "Level 3 — Intense", desc: "Elevated sensations" },
                    {
                      label: "Level 4 — Advanced",
                      desc: "High intensity play",
                    },
                    { label: "Level 5 — Expert", desc: "Maximum escalation" },
                  ].map((lvl, i) => {
                    const lvlNum = i + 1;
                    const selected = ladderLevel === lvlNum;
                    const unlocked = lvlNum <= level + 1;
                    return (
                      <button
                        key={i}
                        data-testid={`button-ladder-${lvlNum}`}
                        onClick={() => {
                          if (unlocked) {
                            setLadderLevel(lvlNum);
                            logActivityMutation.mutate({
                              action: "ladder_set",
                              detail: lvl.label,
                            });
                          }
                        }}
                        disabled={!unlocked}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
                          ${
                            selected
                              ? "bg-rose-900/30 border-rose-500/50 ring-1 ring-rose-500/30"
                              : unlocked
                                ? "bg-slate-900/50 border-white/5 hover:border-rose-500/30"
                                : "bg-black/30 border-white/5 opacity-30 cursor-not-allowed"
                          }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black
                          ${selected ? "bg-rose-500 text-white" : i < 2 ? "bg-red-900/30 text-red-400" : i < 4 ? "bg-slate-800/30 text-slate-400" : "bg-red-900/30 text-red-400"}`}
                        >
                          {selected ? <Check size={14} /> : lvlNum}
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                            {lvl.label}
                          </span>
                          <div className="text-[9px] text-slate-600">
                            {unlocked
                              ? lvl.desc
                              : "Reach higher level to unlock"}
                          </div>
                        </div>
                        {!unlocked && (
                          <Lock size={12} className="ml-auto text-slate-700" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {modal === "logbook" && (
              <div className="p-4 space-y-6 overflow-y-auto">
                <div className="text-center">
                  <FileText size={48} className="mx-auto text-rose-700 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    Session Logbook
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Record of past scenes and sessions
                  </p>
                </div>
                <div className="space-y-3">
                  {activityLog.slice(0, 10).map((log) => (
                    <div
                      key={log.id}
                      className="flex gap-3 items-start bg-slate-900/50 border border-white/5 p-3 rounded-xl"
                    >
                      <span className="font-mono text-[10px] text-slate-600 min-w-[50px] mt-0.5">
                        {formatTime(log.createdAt)}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-300 uppercase">
                          {log.action.replace(/_/g, " ")}
                        </div>
                        {log.detail && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {log.detail}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {activityLog.length === 0 && (
                    <div className="text-xs text-slate-600 text-center py-8">
                      No sessions logged yet
                    </div>
                  )}
                </div>
              </div>
            )}

            {modal === "vault" && (
              <div className="p-4 space-y-6">
                <div className="text-center">
                  <Box size={48} className="mx-auto text-red-500 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">
                    The Vault
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Locked achievements and milestones
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "First Task",
                      icon: <Check size={16} />,
                      unlocked: (stats?.completedTasks ?? 0) > 0,
                    },
                    {
                      label: "Check-In",
                      icon: <MessageSquare size={16} />,
                      unlocked: (stats?.totalCheckIns ?? 0) > 0,
                    },
                    {
                      label: "Dare Done",
                      icon: <Dices size={16} />,
                      unlocked: (stats?.completedDares ?? 0) > 0,
                    },
                    {
                      label: "Level 3",
                      icon: <Award size={16} />,
                      unlocked: level >= 3,
                    },
                    {
                      label: "Journal",
                      icon: <BookOpen size={16} />,
                      unlocked: (stats?.totalJournalEntries ?? 0) > 0,
                    },
                    {
                      label: "Bonded",
                      icon: <Heart size={16} />,
                      unlocked: !!partner,
                    },
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${badge.unlocked ? "bg-red-900/20 border-red-500/30" : "bg-black/20 border-white/5 opacity-40"}`}
                    >
                      <div
                        className={
                          badge.unlocked ? "text-red-400" : "text-slate-600"
                        }
                      >
                        {badge.icon}
                      </div>
                      <span className="text-[9px] font-bold uppercase text-slate-400">
                        {badge.label}
                      </span>
                      {badge.unlocked && (
                        <Unlock size={10} className="text-red-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modal === "countdowns" && (
              <div className="p-4 space-y-6 text-center">
                <Zap size={48} className="mx-auto text-red-500 mb-2" />
                <h2 className="text-xl font-bold text-white uppercase">
                  Active Timers
                </h2>
                <div className="bg-black/40 p-6 rounded-2xl border border-red-500/20 space-y-3">
                  {trainingActive ? (
                    <>
                      <div className="text-[10px] text-red-400 uppercase font-bold tracking-widest">
                        Training: {trainingActive}
                      </div>
                      <div className="text-4xl font-black text-red-500 font-mono tracking-widest">
                        {formatTimerDisplay(trainingTimer)}
                      </div>
                      <Button
                        data-testid="button-timer-stop-training"
                        variant="destructive"
                        size="sm"
                        onClick={stopTraining}
                        className="cursor-pointer"
                      >
                        Stop
                      </Button>
                    </>
                  ) : scenePhase >= 0 ? (
                    <>
                      <div className="text-[10px] text-red-400 uppercase font-bold tracking-widest">
                        Scene: {scenePhases[scenePhase]}
                      </div>
                      <div className="text-4xl font-black text-red-400 font-mono tracking-widest">
                        {formatTimerDisplay(sceneTimer)}
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button
                          data-testid="button-timer-advance"
                          size="sm"
                          onClick={advanceScene}
                          className="bg-red-700 hover:bg-red-500 cursor-pointer"
                        >
                          {scenePhase < scenePhases.length - 1
                            ? "Next Phase"
                            : "Complete"}
                        </Button>
                        <Button
                          data-testid="button-timer-end"
                          variant="outline"
                          size="sm"
                          onClick={endScene}
                          className="border-red-800 text-red-400 cursor-pointer"
                        >
                          End
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-black text-slate-700 font-mono tracking-widest">
                        00:00
                      </div>
                      <p className="text-[10px] text-slate-600 uppercase">
                        No active timers
                      </p>
                      <p className="text-[9px] text-slate-700">
                        Start a training exercise or scene to see timers here
                      </p>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setModal(null)}
                  className="border-slate-800 cursor-pointer"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarIcon({
  icon,
  active,
  onClick,
}: {
  icon: React.ReactElement<any>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-3 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 relative group cursor-pointer
        ${active ? "bg-gradient-to-br from-red-900/50 to-transparent text-white border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]" : "text-slate-600 hover:text-white hover:bg-white/5"}`}
    >
      {active && (
        <div className="absolute left-0 h-8 w-1 bg-red-500 rounded-r-full" />
      )}
      {React.cloneElement(icon, {
        size: 24,
        className: active ? "drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" : "",
      })}
    </button>
  );
}

function MobileNavIcon({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactElement<any>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 w-16 cursor-pointer"
    >
      <div
        className={`p-1 transition-colors ${active ? "text-white drop-shadow-[0_0_8px_white]" : "text-slate-600"}`}
      >
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <span
        className={`text-[9px] uppercase font-bold tracking-wider ${active ? "text-white" : "text-slate-700"}`}
      >
        {label}
      </span>
    </button>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onClick,
  sexyIcon,
}: {
  icon: React.ReactElement<any>;
  label: string;
  color: "yellow" | "slate" | "green" | "red";
  onClick: () => void;
  sexyIcon?: string;
}) {
  const colors = {
    yellow: "text-slate-400 bg-slate-800/20 border-slate-600/50",
    slate: "text-slate-300 bg-slate-800/50 border-slate-700",
    green: "text-red-500 bg-red-900/20 border-red-800/50",
    red: "text-red-500 bg-red-900/20 border-red-700/50",
  };
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-1 hover:scale-105 transition-transform cursor-pointer"
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${colors[color]} ${sexyIcon ? "overflow-visible" : "overflow-hidden"}`}
      >
        {sexyIcon ? <SexyIcon name={sexyIcon} size={40} glow="gold" /> : React.cloneElement(icon, { size: 24 })}
      </div>
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
        {label}
      </span>
    </button>
  );
}

function BigButton({
  icon,
  label,
  sub,
  onClick,
  color,
  sexyIcon,
}: {
  icon: React.ReactElement<any>;
  label: string;
  sub: string;
  onClick?: () => void;
  color: string;
  sexyIcon?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-gradient-to-b from-slate-800 to-slate-950 border-t border-white/10 border-b border-black shadow-lg active:scale-95 transition-all p-6 rounded-2xl text-center cursor-pointer group flex flex-col items-center justify-center h-32 w-full"
    >
      <div
        className={`mb-3 ${sexyIcon ? "overflow-visible" : `${color} group-hover:scale-110`} transition-transform duration-300`}
      >
        {sexyIcon ? <SexyIcon name={sexyIcon} size={56} glow="gold" /> : React.cloneElement(icon, { size: 36 })}
      </div>
      <div className="text-sm font-black text-white uppercase tracking-wider">
        {label}
      </div>
      <div className="text-[10px] text-slate-500 font-mono">{sub}</div>
    </button>
  );
}


function PushNotificationToggle() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: vapidData } = useVapidPublicKey();
  const subscribeMutation = useSubscribePush();
  const unsubscribeMutation = useUnsubscribePush();
  const testMutation = useTestPush();

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.getRegistration("/sw.js").then((reg) => {
        if (reg) {
          reg.pushManager.getSubscription().then((sub) => {
            setPushEnabled(!!sub);
          });
        }
      });
    }
  }, []);

  const handleToggle = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications are not supported in this browser.");
      return;
    }
    setLoading(true);
    try {
      if (pushEnabled) {
        const reg = await navigator.serviceWorker.getRegistration("/sw.js");
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            await unsubscribeMutation.mutateAsync(sub.endpoint);
            await sub.unsubscribe();
          }
        }
        setPushEnabled(false);
      } else {
        const reg = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setLoading(false);
          return;
        }
        if (!vapidData?.publicKey) {
          setLoading(false);
          return;
        }
        const applicationServerKey = urlBase64ToUint8Array(vapidData.publicKey);
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
        await subscribeMutation.mutateAsync(sub.toJSON());
        setPushEnabled(true);
      }
    } catch (err) {
      console.error("Push toggle error:", err);
    }
    setLoading(false);
  };

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;
  if (!supported) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900/50 to-black border border-slate-800/50 p-6 rounded-2xl flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-5">
        <div className="bg-slate-800/30 p-3 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <Bell size={24} className="text-slate-400" />
        </div>
        <div>
          <div className="font-bold text-slate-400 text-lg uppercase tracking-wide">
            Push Notifications
          </div>
          <div className="text-xs text-slate-400/50 font-mono">
            Get alerts for tasks, messages & more
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {pushEnabled && (
          <button
            data-testid="button-test-push"
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending}
            className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800/30 px-3 py-1 rounded-full border border-slate-500/30 hover:bg-slate-800/50 cursor-pointer"
          >
            Test
          </button>
        )}
        <button
          data-testid="button-push-toggle"
          onClick={handleToggle}
          disabled={loading}
          className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 shadow-inner cursor-pointer ${pushEnabled ? "bg-slate-600 shadow-[0_0_10px_blue]" : "bg-slate-900 border border-slate-700"}`}
        >
          <div
            className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${pushEnabled ? "translate-x-6" : "translate-x-0"}`}
          />
        </button>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function CategorySection({
  title,
  color,
  borderColor,
  defaultOpen = false,
  children,
}: {
  title: string;
  color: string;
  borderColor: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-xl border ${isOpen ? borderColor : "border-white/5"} bg-gradient-to-b from-slate-900/50 to-slate-950/50 overflow-hidden transition-colors`}>
      <button
        data-testid={`category-${title.toLowerCase().replace(/\s+/g, "-")}`}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
      >
        <h3 className={`text-[10px] font-bold ${color} uppercase tracking-[0.2em]`}>{title}</h3>
        <ChevronDown size={14} className={`${color} transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div className={`transition-all duration-200 ease-in-out ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
        <div className="px-3 pb-3">
          {children}
        </div>
      </div>
    </div>
  );
}

function FeatureLink({
  icon,
  label,
  desc,
  href,
  color,
  badge,
  sexyIcon,
}: {
  icon: React.ReactElement<any>;
  label: string;
  desc?: string;
  href: string;
  color: string;
  badge?: number;
  sexyIcon?: string;
}) {
  return (
    <WouterLink
      href={href}
      data-testid={`link-feature-${label.toLowerCase()}`}
      className="relative flex items-center gap-3 p-3 bg-gradient-to-r from-slate-900/80 to-slate-950/60 border border-white/5 rounded-xl hover:border-white/15 hover:from-slate-800/80 hover:to-slate-900/60 transition-all cursor-pointer group no-underline"
    >
      <div
        className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${sexyIcon ? "overflow-visible" : "overflow-hidden"} ${sexyIcon ? "" : `${color} bg-slate-900/80`}`}
      >
        {sexyIcon ? <SexyIcon name={sexyIcon} size={32} glow="gold" /> : React.cloneElement(icon, { size: 18 })}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="text-xs font-bold text-slate-200 uppercase tracking-wide group-hover:text-white transition-colors truncate">
          {label}
        </div>
        {desc && (
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">{desc}</div>
        )}
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white px-1.5 shadow-[0_0_6px_rgba(220,38,38,0.5)] shrink-0">
          {badge}
        </span>
      )}
      <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors shrink-0" />
    </WouterLink>
  );
}

function ProfileItem({
  icon,
  label,
  onClick,
  className = "",
}: {
  icon: React.ReactElement<any>;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 to-black border border-white/5 rounded-xl hover:border-white/20 hover:shadow-lg transition-all group cursor-pointer ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className="text-slate-500 group-hover:text-red-500 transition-colors">
          {icon}
        </div>
        <span className="text-sm font-bold text-slate-300 group-hover:text-white uppercase tracking-wide">
          {label}
        </span>
      </div>
      <ChevronRight
        size={16}
        className="text-slate-700 group-hover:text-white"
      />
    </button>
  );
}
