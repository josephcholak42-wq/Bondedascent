import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "./queryClient";
import type { User, Task, CheckIn, Dare, Reward, Punishment, JournalEntry, Notification, ActivityLogEntry } from "@shared/schema";

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
