import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link as WouterLink } from "wouter";
import { Lock, Unlock, Upload, Image, Video, ArrowLeft, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";

export default function LockedMediaPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [unlockCost, setUnlockCost] = useState(100);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const userRole = user?.role || "sub";
  const isDom = userRole === "dom";

  const { data: media = [] } = useQuery({
    queryKey: ["/api/media/locked"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/media/locked");
      return res.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("unlockCost", unlockCost.toString());
      const res = await fetch("/api/media/locked", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media/locked"] });
      toast({ title: "Uploaded", description: "Locked media uploaded successfully" });
    },
  });

  const unlockMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const res = await apiRequest("POST", `/api/media/${mediaId}/unlock`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media/locked"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Unlocked!", description: "Media has been revealed" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Not enough XP", variant: "destructive" });
    },
  });

  const myMedia = media.filter((m: any) => m.userId === user?.id);
  const partnerMedia = media.filter((m: any) => m.userId !== user?.id);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <PageBreadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: isDom ? "Locked Vault" : "Secret Gallery" },
          ]}
        />

        <div className="text-center space-y-1">
          <h1 data-testid="text-page-title" className="text-xl font-black uppercase tracking-wider">
            {isDom ? "🔐 Locked Vault" : "🖼️ Secret Gallery"}
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">
            {isDom ? "Upload locked photos & videos for your Sub to unlock" : "Unlock your Dom's hidden content with XP"}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Coins size={14} className="text-red-400" />
            <span className="text-xs text-red-400 font-bold">Your XP: {user?.xp || 0}</span>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs text-slate-400 font-bold">Sticker Points: {user?.stickerBalance || 0}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">Upload Locked Media</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <label className="text-[10px] text-slate-400">Unlock Cost (XP):</label>
                <input
                  data-testid="input-unlock-cost"
                  type="number"
                  value={unlockCost}
                  onChange={(e) => setUnlockCost(parseInt(e.target.value) || 50)}
                  className="w-20 bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center"
                  min={10}
                  max={1000}
                />
              </div>
              <Button
                data-testid="button-upload"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700"
              >
                <Upload size={14} className="mr-1" />
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {partnerMedia.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-red-400">
                {isDom ? "Sub's Uploads" : "Partner's Locked Content"}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {partnerMedia.map((m: any) => (
                  <div
                    key={m.id}
                    data-testid={`media-card-${m.id}`}
                    className={`relative rounded-xl border overflow-hidden ${
                      m.isLocked && !m.url
                        ? "border-red-500/30 bg-red-950/20"
                        : "border-red-500/30 bg-red-950/20"
                    }`}
                  >
                    {m.url ? (
                      <div
                        className="aspect-square cursor-pointer"
                        onClick={() => setPreviewUrl(m.url)}
                      >
                        {m.mimeType?.startsWith("video") ? (
                          <video src={m.url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={m.url} alt="" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute top-2 right-2">
                          <Unlock size={14} className="text-red-400" />
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-900 to-black">
                        <Lock size={24} className="text-red-400" />
                        <span className="text-[10px] text-red-400 font-bold">{m.unlockCost} XP</span>
                        {m.mimeType?.startsWith("video") ? (
                          <Video size={14} className="text-slate-500" />
                        ) : (
                          <Image size={14} className="text-slate-500" />
                        )}
                        <Button
                          data-testid={`unlock-media-${m.id}`}
                          size="sm"
                          className="bg-red-600 hover:bg-red-500 h-6 px-3 text-[10px] font-bold"
                          onClick={() => unlockMutation.mutate(m.id)}
                          disabled={unlockMutation.isPending}
                        >
                          Unlock
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {myMedia.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Your Uploads</h2>
              <div className="grid grid-cols-2 gap-3">
                {myMedia.map((m: any) => (
                  <div
                    key={m.id}
                    data-testid={`my-media-${m.id}`}
                    className="relative rounded-xl border border-slate-500/30 overflow-hidden"
                  >
                    <div
                      className="aspect-square cursor-pointer"
                      onClick={() => setPreviewUrl(m.url)}
                    >
                      {m.mimeType?.startsWith("video") ? (
                        <video src={m.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 flex items-center justify-between">
                      <span className="text-[9px] text-slate-300">{m.unlockCost} XP</span>
                      {m.isLocked ? (
                        <Lock size={10} className="text-red-400" />
                      ) : (
                        <Unlock size={10} className="text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {media.length === 0 && (
            <div className="text-center py-12">
              <Lock size={48} className="mx-auto text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">No locked media yet</p>
              <p className="text-[10px] text-slate-600 mt-1">Upload photos or videos for your partner to unlock</p>
            </div>
          )}
        </div>
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          {previewUrl.match(/\.(mp4|webm|mov)/i) ? (
            <video src={previewUrl} controls className="max-w-full max-h-full" />
          ) : (
            <img src={previewUrl} alt="" className="max-w-full max-h-full object-contain" />
          )}
        </div>
      )}
    </div>
  );
}
