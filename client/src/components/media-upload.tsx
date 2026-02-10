import { useState, useRef } from 'react';
import { Camera, X, Upload, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMedia, useUploadMedia, useDeleteMedia } from '@/lib/hooks';

interface MediaUploadProps {
  entityType: string;
  entityId: string;
  compact?: boolean;
}

export function MediaUpload({ entityType, entityId, compact }: MediaUploadProps) {
  const { data: mediaList = [] } = useMedia(entityType, entityId);
  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate({ file, entityType, entityId });
    e.target.value = '';
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid={`input-media-${entityType}-${entityId}`}
      />

      <button
        data-testid={`button-upload-media-${entityType}-${entityId}`}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadMutation.isPending}
        className={`flex items-center gap-2 cursor-pointer transition-all ${
          compact
            ? 'text-[10px] text-slate-500 hover:text-slate-300'
            : 'w-full bg-slate-900/40 border border-dashed border-white/10 hover:border-red-900/40 rounded-xl p-4 text-sm text-slate-400 hover:text-white justify-center'
        }`}
      >
        {uploadMutation.isPending ? (
          <Loader2 size={compact ? 12 : 16} className="animate-spin" />
        ) : (
          <Camera size={compact ? 12 : 16} />
        )}
        <span>{uploadMutation.isPending ? 'Uploading...' : (compact ? 'Attach' : 'Upload Photo or Video')}</span>
      </button>

      {mediaList.length > 0 && (
        <div className={`grid ${compact ? 'grid-cols-3 gap-1' : 'grid-cols-2 gap-2'}`}>
          {mediaList.map(m => (
            <div key={m.id} className="relative group rounded-lg overflow-hidden border border-white/5">
              {m.mimeType.startsWith('image/') ? (
                <img
                  src={m.url}
                  alt={m.originalName}
                  className={`w-full object-cover cursor-pointer ${compact ? 'h-16' : 'h-32'}`}
                  onClick={() => setPreview(m.url)}
                  data-testid={`media-image-${m.id}`}
                />
              ) : (
                <video
                  src={m.url}
                  className={`w-full object-cover ${compact ? 'h-16' : 'h-32'}`}
                  controls
                  data-testid={`media-video-${m.id}`}
                />
              )}
              <button
                data-testid={`button-delete-media-${m.id}`}
                onClick={() => deleteMutation.mutate(m.id)}
                className="absolute top-1 right-1 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 size={10} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreview(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-red-500 cursor-pointer"
            onClick={() => setPreview(null)}
          >
            <X size={28} />
          </button>
          <img src={preview} alt="Preview" className="max-w-full max-h-[90vh] rounded-xl" />
        </div>
      )}
    </div>
  );
}
