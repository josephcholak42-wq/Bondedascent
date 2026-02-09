import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "./queryClient";
import type { User, Task, CheckIn, Dare, Reward, Punishment, JournalEntry, Notification, ActivityLogEntry, Ritual, Limit, Secret, Wager, Rating, CountdownEvent, StandingOrder, PermissionRequest, Devotion, Conflict, DesiredChange, Achievement, PlaySession } from "@shared/schema";

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
    mutationFn: async (data: { name: string; unlockLevel?: number; targetUserId?: string }) => {
      const res = await apiRequest("POST", "/api/rewards", data);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/rewards"] });
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
    mutationFn: async (data: { name: string }) => {
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
    mutationFn: async (data: { name: string; unlockLevel?: number }) => {
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
