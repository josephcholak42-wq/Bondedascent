import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "./queryClient";
import type { User, Task, CheckIn, Dare, Reward, Punishment, JournalEntry, Notification, ActivityLogEntry, Ritual, Limit, Secret, Wager, Rating, CountdownEvent, StandingOrder, PermissionRequest, Devotion, Conflict, DesiredChange, Achievement, PlaySession, Accusation, IntensitySession, ObedienceTrial, TrialStep, SensationCard, SensationSpin, SealedOrder, EnduranceChallenge, EnduranceCheckin, Media, Sticker, FeatureSetting } from "@shared/schema";

type SafeUser = Omit<User, "password">;

export function useAuth() {
  return useQuery<SafeUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: Infinity,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: (user) => {
      qc.setQueryData(["/api/auth/me"], user);
      qc.invalidateQueries();
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { username: string; password: string; email?: string; role: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return res.json();
    },
    onSuccess: (user) => {
      qc.setQueryData(["/api/auth/me"], user);
      qc.invalidateQueries();
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      qc.setQueryData(["/api/auth/me"], null);
      qc.clear();
    },
  });
}

export function useSwitchRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (role: string) => {
      const res = await apiRequest("PATCH", "/api/user/role", { role });
      return res.json();
    },
    onSuccess: (user) => {
      qc.setQueryData(["/api/auth/me"], user);
    },
  });
}

export function useStats() {
  return useQuery<{
    xp: number; level: number; completedTasks: number; totalTasks: number;
    totalCheckIns: number; totalJournalEntries: number; totalDares: number;
    completedDares: number; complianceRate: number;
  }>({
    queryKey: ["/api/user/stats"],
  });
}

export function useTasks() {
  return useQuery<Task[]>({ queryKey: ["/api/tasks"] });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { text: string; targetUserId?: string }) => {
      const res = await apiRequest("POST", "/api/tasks", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/tasks"] });
      qc.invalidateQueries({ queryKey: ["/api/user/stats"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiRequest("PATCH", `/api/tasks/${taskId}/toggle`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/tasks"] });
      qc.invalidateQueries({ queryKey: ["/api/user/stats"] });
      qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      await apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/tasks"] });
      qc.invalidateQueries({ queryKey: ["/api/user/stats"] });
    },
  });
}

export function useCheckIns() {
  return useQuery<CheckIn[]>({ queryKey: ["/api/checkins"] });
}

export function useCreateCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { mood: number; obedience: number; notes?: string }) => {
      const res = await apiRequest("POST", "/api/checkins", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/checkins"] });
      qc.invalidateQueries({ queryKey: ["/api/user/stats"] });
      qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useReviewCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { checkInId: string; status: string; xpAwarded: number }) => {
      const res = await apiRequest("PATCH", `/api/checkins/${data.checkInId}/review`, { status: data.status, xpAwarded: data.xpAwarded });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/checkins"] });
      qc.invalidateQueries({ queryKey: ["/api/user/stats"] });
    },
  });
}

export function useDares() {
  return useQuery<Dare[]>({ queryKey: ["/api/dares"] });
}

export function useSpinDare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/dares/spin");
      return res.json() as Promise<Dare>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/dares"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useCompleteDare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dareId: string) => {
      const res = await apiRequest("PATCH", `/api/dares/${dareId}/complete`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/dares"] });
      qc.invalidateQueries({ queryKey: ["/api/user/stats"] });
      qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useRewards() {
  return useQuery<Reward[]>({ queryKey: ["/api/rewards"] });
}

export function useCreateReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; unlockLevel?: number; targetUserId?: string; category?: string; duration?: string }) => {
      const res = await apiRequest("POST", "/api/rewards", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/rewards"] });
    },
  });
}

export function useToggleReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rewardId: string) => {
      const res = await apiRequest("PATCH", `/api/rewards/${rewardId}/toggle`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/rewards"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
}

export function useUpdatePunishmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ punishmentId, status }: { punishmentId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/punishments/${punishmentId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/punishments"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
}

export function usePunishments() {
  return useQuery<Punishment[]>({ queryKey: ["/api/punishments"] });
}

export function useCreatePunishment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; targetUserId?: string }) => {
      const res = await apiRequest("POST", "/api/punishments", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/punishments"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useJournal() {
  return useQuery<JournalEntry[]>({ queryKey: ["/api/journal"] });
}

export function useCreateJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/journal", { content });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/journal"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useNotifications() {
  return useQuery<Notification[]>({ queryKey: ["/api/notifications"] });
}

export function useDismissNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest("DELETE", `/api/notifications/${notificationId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
}

export function useActivityLog() {
  return useQuery<ActivityLogEntry[]>({ queryKey: ["/api/activity"] });
}

export function useLogActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { action: string; detail?: string }) => {
      const res = await apiRequest("POST", "/api/activity", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
      qc.invalidateQueries({ queryKey: ["/api/partner/activity"] });
    },
  });
}

export function usePartner() {
  return useQuery<SafeUser | null>({
    queryKey: ["/api/pair/partner"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
}

export function usePartnerStats() {
  return useQuery<{
    username: string; role: string; xp: number; level: number;
    completedTasks: number; totalTasks: number; totalCheckIns: number;
    totalDares: number; completedDares: number; totalJournalEntries: number;
    complianceRate: number; pendingCheckIns: number;
  } | null>({
    queryKey: ["/api/pair/partner/stats"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/pair/partner/stats", { credentials: "include" });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to fetch partner stats");
        return res.json();
      } catch {
        return null;
      }
    },
  });
}

export function useGeneratePairCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/pair/generate");
      return res.json() as Promise<{ code: string; expiresAt: string }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pair/partner"] });
    },
  });
}

export function useJoinPairCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/pair/join", { code });
      return res.json() as Promise<{ message: string; partnerUsername: string }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pair/partner"] });
      qc.invalidateQueries({ queryKey: ["/api/pair/partner/stats"] });
      qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useUnlinkPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/pair");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/pair/partner"] });
      qc.invalidateQueries({ queryKey: ["/api/pair/partner/stats"] });
      qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function usePartnerTasks() {
  return useQuery<Task[]>({ queryKey: ["/api/partner/tasks"] });
}

export function useCreatePartnerTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { text: string }) => {
      const res = await apiRequest("POST", "/api/partner/tasks", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/partner/tasks"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function usePartnerCheckIns() {
  return useQuery<CheckIn[]>({ queryKey: ["/api/partner/checkins"] });
}

export function useReviewPartnerCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { checkInId: string; status: string; xpAwarded: number }) => {
      const res = await apiRequest("PATCH", `/api/partner/checkins/${data.checkInId}/review`, { status: data.status, xpAwarded: data.xpAwarded });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/partner/checkins"] });
      qc.invalidateQueries({ queryKey: ["/api/pair/partner/stats"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useCreatePartnerPunishment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; category?: string; duration?: string }) => {
      const res = await apiRequest("POST", "/api/partner/punishments", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/punishments"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useCreatePartnerReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; unlockLevel?: number; category?: string; duration?: string }) => {
      const res = await apiRequest("POST", "/api/partner/rewards", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/rewards"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function usePartnerActivity() {
  return useQuery<ActivityLogEntry[]>({ queryKey: ["/api/partner/activity"] });
}

export function useRituals() {
  return useQuery<Ritual[]>({ queryKey: ["/api/rituals"] });
}

export function useCreateRitual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; frequency?: string; timeOfDay?: string }) => {
      const res = await apiRequest("POST", "/api/rituals", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/rituals"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useUpdateRitual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; description?: string; frequency?: string; timeOfDay?: string; active?: boolean }) => {
      const res = await apiRequest("PATCH", `/api/rituals/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/rituals"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useDeleteRitual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/rituals/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/rituals"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function usePartnerRituals() {
  return useQuery<Ritual[]>({ queryKey: ["/api/partner/rituals"] });
}

export function useCreatePartnerRitual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; frequency?: string; timeOfDay?: string }) => {
      const res = await apiRequest("POST", "/api/partner/rituals", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/partner/rituals"] });
      qc.invalidateQueries({ queryKey: ["/api/rituals"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useLimits() {
  return useQuery<Limit[]>({ queryKey: ["/api/limits"] });
}

export function useCreateLimit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; category?: string; level?: string; description?: string }) => {
      const res = await apiRequest("POST", "/api/limits", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/limits"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useUpdateLimit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; category?: string; level?: string; description?: string }) => {
      const res = await apiRequest("PATCH", `/api/limits/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/limits"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useDeleteLimit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/limits/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/limits"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function usePartnerLimits() {
  return useQuery<Limit[]>({ queryKey: ["/api/partner/limits"] });
}

export function useSecrets() {
  return useQuery<Secret[]>({ queryKey: ["/api/secrets"] });
}

export function useSecretsForMe() {
  return useQuery<Secret[]>({ queryKey: ["/api/secrets/for-me"] });
}

export function useCreateSecret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; content: string; forUserId?: string; tier?: string }) => {
      const res = await apiRequest("POST", "/api/secrets", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/secrets"] });
      qc.invalidateQueries({ queryKey: ["/api/secrets/for-me"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useRevealSecret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/secrets/${id}/reveal`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/secrets"] });
      qc.invalidateQueries({ queryKey: ["/api/secrets/for-me"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useWagers() {
  return useQuery<Wager[]>({ queryKey: ["/api/wagers"] });
}

export function useCreateWager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; stakes?: string; partnerId?: string }) => {
      const res = await apiRequest("POST", "/api/wagers", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/wagers"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useUpdateWager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; winnerId?: string }) => {
      const res = await apiRequest("PATCH", `/api/wagers/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/wagers"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useRatings() {
  return useQuery<Rating[]>({ queryKey: ["/api/ratings"] });
}

export function useRatingsReceived() {
  return useQuery<Rating[]>({ queryKey: ["/api/ratings/received"] });
}

export function useCreateRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { ratedUserId: string; overall: number; communication?: number; obedience?: number; effort?: number; notes?: string }) => {
      const res = await apiRequest("POST", "/api/ratings", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/ratings"] });
      qc.invalidateQueries({ queryKey: ["/api/ratings/received"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useCountdownEvents() {
  return useQuery<CountdownEvent[]>({ queryKey: ["/api/countdown-events"] });
}

export function useCreateCountdownEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; targetDate: string; category?: string }) => {
      const res = await apiRequest("POST", "/api/countdown-events", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/countdown-events"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useDeleteCountdownEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/countdown-events/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/countdown-events"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useStandingOrders() {
  return useQuery<StandingOrder[]>({ queryKey: ["/api/standing-orders"] });
}

export function useCreateStandingOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; priority?: string }) => {
      const res = await apiRequest("POST", "/api/standing-orders", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/standing-orders"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useUpdateStandingOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; description?: string; priority?: string; active?: boolean }) => {
      const res = await apiRequest("PATCH", `/api/standing-orders/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/standing-orders"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useDeleteStandingOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/standing-orders/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/standing-orders"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useCreatePartnerStandingOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; priority?: string }) => {
      const res = await apiRequest("POST", "/api/partner/standing-orders", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/standing-orders"] });
      qc.invalidateQueries({ queryKey: ["/api/partner/standing-orders"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function usePermissionRequests() {
  return useQuery<PermissionRequest[]>({ queryKey: ["/api/permission-requests"] });
}

export function useCreatePermissionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const res = await apiRequest("POST", "/api/permission-requests", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/permission-requests"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useUpdatePermissionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string }) => {
      const res = await apiRequest("PATCH", `/api/permission-requests/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/permission-requests"] });
      qc.invalidateQueries({ queryKey: ["/api/partner/permission-requests"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function usePartnerPermissionRequests() {
  return useQuery<PermissionRequest[]>({ queryKey: ["/api/partner/permission-requests"] });
}

export function useDevotions() {
  return useQuery<Devotion[]>({ queryKey: ["/api/devotions"] });
}

export function useCreateDevotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { type?: string; content: string }) => {
      const res = await apiRequest("POST", "/api/devotions", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/devotions"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useUpdateDevotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; content?: string; completed?: boolean }) => {
      const res = await apiRequest("PATCH", `/api/devotions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/devotions"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useConflicts() {
  return useQuery<Conflict[]>({ queryKey: ["/api/conflicts"] });
}

export function useCreateConflict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; partnerId?: string }) => {
      const res = await apiRequest("POST", "/api/conflicts", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/conflicts"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useUpdateConflict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; resolution?: string }) => {
      const res = await apiRequest("PATCH", `/api/conflicts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/conflicts"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useDesiredChanges() {
  return useQuery<DesiredChange[]>({ queryKey: ["/api/desired-changes"] });
}

export function useCreateDesiredChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; targetUserId?: string; category?: string }) => {
      const res = await apiRequest("POST", "/api/desired-changes", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/desired-changes"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useUpdateDesiredChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; title?: string; description?: string }) => {
      const res = await apiRequest("PATCH", `/api/desired-changes/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/desired-changes"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useAchievements() {
  return useQuery<Achievement[]>({ queryKey: ["/api/achievements"] });
}

export function useCreateAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; icon?: string; tier?: string }) => {
      const res = await apiRequest("POST", "/api/achievements", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/achievements"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function usePlaySessions() {
  return useQuery<PlaySession[]>({ queryKey: ["/api/play-sessions"] });
}

export function useCreatePlaySession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title?: string; notes?: string; mood?: string; intensity?: number; activities?: string[]; status?: string; scheduledFor?: string; partnerId?: string }) => {
      const res = await apiRequest("POST", "/api/play-sessions", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/play-sessions"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useUpdatePlaySession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; notes?: string; mood?: string; intensity?: number; duration?: number; activities?: string[]; status?: string; completedAt?: string }) => {
      const res = await apiRequest("PATCH", `/api/play-sessions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/play-sessions"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function useVapidPublicKey() {
  return useQuery<{ publicKey: string }>({
    queryKey: ["/api/push/vapid-public-key"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: Infinity,
  });
}

export function useSubscribePush() {
  return useMutation({
    mutationFn: async (subscription: PushSubscriptionJSON) => {
      const res = await apiRequest("POST", "/api/push/subscribe", { subscription });
      return res.json();
    },
  });
}

export function useUnsubscribePush() {
  return useMutation({
    mutationFn: async (endpoint: string) => {
      const res = await apiRequest("POST", "/api/push/unsubscribe", { endpoint });
      return res.json();
    },
  });
}

export function useTestPush() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/push/test");
      return res.json();
    },
  });
}

export function useDemandTimers() {
  return useQuery<any[]>({
    queryKey: ["/api/demand-timers"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
}

export function useCreateDemandTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { message: string; durationSeconds: number }) => {
      const res = await apiRequest("POST", "/api/demand-timers", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/demand-timers"] });
    },
  });
}

export function useRespondDemandTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/demand-timers/${id}/respond`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/demand-timers"] });
    },
  });
}

export function useQuickCommands() {
  return useQuery<any[]>({
    queryKey: ["/api/quick-commands"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
}

export function useSendQuickCommand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { message: string }) => {
      const res = await apiRequest("POST", "/api/quick-commands", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/quick-commands"] });
    },
  });
}

export function useAcknowledgeCommand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/quick-commands/${id}/acknowledge`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/quick-commands"] });
    },
  });
}

export function usePresenceHeartbeat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/presence/heartbeat");
      return res.json();
    },
  });
}

export function usePartnerPresence(partnerId: string | null | undefined) {
  return useQuery<{ online: boolean; lastSeen: string | null }>({
    queryKey: ["/api/presence", partnerId],
    queryFn: async () => {
      if (!partnerId) return { online: false, lastSeen: null };
      const res = await fetch(`/api/presence/${partnerId}`, { credentials: "include" });
      return res.json();
    },
    enabled: !!partnerId,
  });
}

export function useToggleLockdown() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (locked: boolean) => {
      const res = await apiRequest("POST", "/api/partner/lockdown", { locked });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/partner/lockdown"] });
      qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}

export function useLockdownStatus() {
  return useQuery<{ lockedDown: boolean }>({
    queryKey: ["/api/partner/lockdown"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
}

export function useSetEnforcementLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (level: number) => {
      const res = await apiRequest("POST", "/api/partner/enforcement", { level });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/partner/enforcement"] });
      qc.invalidateQueries({ queryKey: ["/api/partner/tasks"] });
      qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

export function usePartnerEnforcementLevel() {
  return useQuery<{ enforcementLevel: number }>({
    queryKey: ["/api/partner/enforcement"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
}

export function useMyEnforcementLevel() {
  return useQuery<{ enforcementLevel: number }>({
    queryKey: ["/api/user/enforcement"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
}

export function useOverrideRevokeRewards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/partner/override/revoke-rewards");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/rewards"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
      qc.invalidateQueries({ queryKey: ["/api/partner/activity"] });
    },
  });
}

export function useOverrideClearTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/partner/override/clear-tasks");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/tasks"] });
      qc.invalidateQueries({ queryKey: ["/api/partner/tasks"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
      qc.invalidateQueries({ queryKey: ["/api/partner/activity"] });
    },
  });
}

export function useOverrideForceCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/partner/override/force-checkin");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/demand-timers"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
      qc.invalidateQueries({ queryKey: ["/api/partner/activity"] });
    },
  });
}

export function useAccusations() {
  return useQuery<Accusation[]>({ queryKey: ["/api/accusations"] });
}

export function usePartnerAccusations() {
  return useQuery<Accusation[]>({ queryKey: ["/api/partner/accusations"] });
}

export function useCreateAccusation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { accusation: string }) => {
      const res = await apiRequest("POST", "/api/accusations", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/partner/accusations"] });
      qc.invalidateQueries({ queryKey: ["/api/accusations"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
      qc.invalidateQueries({ queryKey: ["/api/partner/activity"] });
    },
  });
}

export function useRespondToAccusation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; response: string }) => {
      const res = await apiRequest("POST", `/api/accusations/${data.id}/respond`, { response: data.response });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/accusations"] });
      qc.invalidateQueries({ queryKey: ["/api/partner/accusations"] });
      qc.invalidateQueries({ queryKey: ["/api/activity"] });
    },
  });
}

// --- INTENSITY LADDER ---
export function useIntensitySessions() {
  return useQuery<IntensitySession[]>({
    queryKey: ["/api/intensity-sessions"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useCreateIntensitySession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { currentTier?: number; notes?: string; status?: string }) => {
      const res = await apiRequest("POST", "/api/intensity-sessions", data);
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/intensity-sessions"] }); },
  });
}

export function useUpdateIntensitySession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; currentTier?: number; maxTierReached?: number; status?: string; durationSeconds?: number; notes?: string; completedAt?: string }) => {
      const res = await apiRequest("PATCH", `/api/intensity-sessions/${id}`, data);
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/intensity-sessions"] }); },
  });
}

// --- OBEDIENCE TRIALS ---
export function useObedienceTrials() {
  return useQuery<ObedienceTrial[]>({
    queryKey: ["/api/obedience-trials"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useCreateObedienceTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; timeLimitSeconds?: number; steps: string[]; autoReward?: string; autoPunishment?: string }) => {
      const res = await apiRequest("POST", "/api/obedience-trials", data);
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/obedience-trials"] }); },
  });
}

export function useUpdateObedienceTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; score?: number; completedSteps?: number; startedAt?: string; completedAt?: string }) => {
      const res = await apiRequest("PATCH", `/api/obedience-trials/${id}`, data);
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/obedience-trials"] }); },
  });
}

export function useTrialSteps(trialId: string | null) {
  return useQuery<TrialStep[]>({
    queryKey: ["/api/obedience-trials", trialId, "steps"],
    queryFn: async () => {
      const res = await fetch(`/api/obedience-trials/${trialId}/steps`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch steps");
      return res.json();
    },
    enabled: !!trialId,
  });
}

export function useUpdateTrialStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/trial-steps/${id}`, { status });
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/obedience-trials"] }); },
  });
}

// --- SENSATION ROULETTE ---
export function useSensationCards() {
  return useQuery<SensationCard[]>({
    queryKey: ["/api/sensation-cards"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useCreateSensationCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { label: string; description?: string; intensity?: number; cardType?: string; durationMinutes?: number }) => {
      const res = await apiRequest("POST", "/api/sensation-cards", data);
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/sensation-cards"] }); },
  });
}

export function useDeleteSensationCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/sensation-cards/${id}`);
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/sensation-cards"] }); },
  });
}

export function useSensationSpins() {
  return useQuery<SensationSpin[]>({
    queryKey: ["/api/sensation-spins"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useCreateSensationSpin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { cardId: string; result: string; cardType?: string }) => {
      const res = await apiRequest("POST", "/api/sensation-spins", data);
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/sensation-spins"] }); },
  });
}

export function useCompleteSensationSpin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/sensation-spins/${id}`, { completed: true });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/sensation-spins"] });
      qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}

// --- PROTOCOL LOCKBOX ---
export function useSealedOrders() {
  return useQuery<SealedOrder[]>({
    queryKey: ["/api/sealed-orders"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useSealedOrdersCreated() {
  return useQuery<SealedOrder[]>({
    queryKey: ["/api/sealed-orders/created"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useCreateSealedOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; content: string; unlockAt: string; chainOrder?: number; previousOrderId?: string; xpCost?: number }) => {
      const res = await apiRequest("POST", "/api/sealed-orders", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/sealed-orders"] });
      qc.invalidateQueries({ queryKey: ["/api/sealed-orders/created"] });
    },
  });
}

export function useUpdateSealedOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; revealed?: boolean; completed?: boolean; emergencyUnsealed?: boolean }) => {
      const res = await apiRequest("PATCH", `/api/sealed-orders/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/sealed-orders"] });
      qc.invalidateQueries({ queryKey: ["/api/sealed-orders/created"] });
      qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}

// --- ENDURANCE CHALLENGES ---
export function useEnduranceChallenges() {
  return useQuery<EnduranceChallenge[]>({
    queryKey: ["/api/endurance-challenges"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useEnduranceChallengesCreated() {
  return useQuery<EnduranceChallenge[]>({
    queryKey: ["/api/endurance-challenges/created"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useCreateEnduranceChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; durationHours: number; checkinIntervalMinutes?: number; xpPerCheckin?: number; autoPunishment?: string }) => {
      const res = await apiRequest("POST", "/api/endurance-challenges", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/endurance-challenges"] });
      qc.invalidateQueries({ queryKey: ["/api/endurance-challenges/created"] });
    },
  });
}

export function useUpdateEnduranceChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; completedAt?: string; completedCheckins?: number; missedCheckins?: number }) => {
      const res = await apiRequest("PATCH", `/api/endurance-challenges/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/endurance-challenges"] });
      qc.invalidateQueries({ queryKey: ["/api/endurance-challenges/created"] });
    },
  });
}

export function useEnduranceCheckins(challengeId: string | null) {
  return useQuery<EnduranceCheckin[]>({
    queryKey: ["/api/endurance-challenges", challengeId, "checkins"],
    queryFn: async () => {
      const res = await fetch(`/api/endurance-challenges/${challengeId}/checkins`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch checkins");
      return res.json();
    },
    enabled: !!challengeId,
  });
}

export function useCreateEnduranceCheckin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ challengeId, gateNumber }: { challengeId: string; gateNumber: number }) => {
      const res = await apiRequest("POST", `/api/endurance-challenges/${challengeId}/checkins`, { gateNumber });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/endurance-challenges"] });
      qc.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}

export function useMedia(entityType: string, entityId: string) {
  return useQuery<Media[]>({
    queryKey: ["/api/media", entityType, entityId],
    queryFn: async () => {
      const res = await fetch(`/api/media/${entityType}/${entityId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch media");
      return res.json();
    },
    enabled: !!entityType && !!entityId,
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, entityType, entityId }: { file: File; entityType: string; entityId: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entityType", entityType);
      formData.append("entityId", entityId);
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["/api/media", variables.entityType, variables.entityId] });
    },
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/media/${id}`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/media" });
    },
  });
}

export function useStickers() {
  return useQuery<Sticker[]>({
    queryKey: ["/api/stickers"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useSendSticker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { recipientId: string; stickerType: string; message?: string }) => {
      const res = await apiRequest("POST", "/api/stickers", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/stickers"] });
    },
  });
}

export function useFeatureSettings() {
  return useQuery<FeatureSetting[]>({
    queryKey: ["/api/feature-settings"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useIsFeatureEnabled(featureKey: string): boolean {
  const { data: settings = [] } = useFeatureSettings();
  const setting = settings.find((s: any) => s.featureKey === featureKey);
  return setting ? setting.enabled : true;
}

export function useToggleFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ featureKey, enabled }: { featureKey: string; enabled: boolean }) => {
      const res = await apiRequest("PUT", `/api/feature-settings/${featureKey}`, { enabled });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/feature-settings"] });
    },
  });
}
