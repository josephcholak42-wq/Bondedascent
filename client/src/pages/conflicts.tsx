import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { AlertTriangle, Plus, Check, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConflicts, useCreateConflict, useUpdateConflict, useAuth } from '@/lib/hooks';

const statusColors: Record<string, string> = {
  open: 'bg-red-500/20 text-red-500',
  discussing: 'bg-yellow-500/20 text-yellow-500',
  resolved: 'bg-green-500/20 text-green-500',
};

export default function ConflictsPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const { data: conflicts = [] } = useConflicts();
  const createMutation = useCreateConflict();
  const updateMutation = useUpdateConflict();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');

  const handleCreate = () => {
    if (!title.trim()) return;
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
    });
    setTitle('');
    setDescription('');
    setShowForm(false);
  };

  const handleResolve = (id: string) => {
    if (!resolution.trim()) return;
    updateMutation.mutate({ id, status: 'resolved', resolution: resolution.trim() });
    setResolvingId(null);
    setResolution('');
  };

  const handleSetDiscussing = (id: string) => {
    updateMutation.mutate({ id, status: 'discussing' });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <Button
        data-testid="button-back"
        variant="ghost"
        className="text-slate-400 hover:text-white mb-6"
        onClick={() => setLocation('/')}
      >
        ← Back
      </Button>

      <div className="flex items-center gap-3 mb-8">
        <AlertTriangle className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider" data-testid="text-page-title">
          Conflict Resolution
        </h1>
      </div>

      <Button
        data-testid="button-toggle-form"
        className="mb-6 bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
        onClick={() => setShowForm(!showForm)}
      >
        <Plus size={16} className="mr-2" />
        New Conflict
      </Button>

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-3" data-testid="form-create-conflict">
          <Input
            data-testid="input-conflict-title"
            placeholder="Conflict title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <textarea
            data-testid="input-conflict-description"
            placeholder="Describe the conflict..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-md px-3 py-2 text-sm min-h-[80px] resize-none"
          />
          <div className="flex gap-2">
            <Button
              data-testid="button-submit-conflict"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              <Check size={16} className="mr-2" />
              Create
            </Button>
            <Button
              data-testid="button-cancel-conflict"
              variant="ghost"
              className="text-slate-400 hover:text-white"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {conflicts.length === 0 && (
          <p className="text-slate-500 text-center py-8" data-testid="text-no-conflicts">No conflicts recorded. Create one to start resolving.</p>
        )}
        {conflicts.map((conflict) => (
          <div
            key={conflict.id}
            data-testid={`card-conflict-${conflict.id}`}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold" data-testid={`text-conflict-title-${conflict.id}`}>
                    {conflict.title}
                  </h3>
                  <span
                    data-testid={`badge-status-${conflict.id}`}
                    className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider ${statusColors[conflict.status] || statusColors.open}`}
                  >
                    {conflict.status}
                  </span>
                </div>
                {conflict.description && (
                  <p className="text-slate-400 text-sm mb-2" data-testid={`text-conflict-desc-${conflict.id}`}>
                    {conflict.description}
                  </p>
                )}
                {conflict.resolution && (
                  <p className="text-green-400 text-sm mt-2" data-testid={`text-conflict-resolution-${conflict.id}`}>
                    Resolution: {conflict.resolution}
                  </p>
                )}
              </div>
              {conflict.status !== 'resolved' && (
                <div className="flex items-center gap-1">
                  {conflict.status === 'open' && (
                    <Button
                      data-testid={`button-discuss-conflict-${conflict.id}`}
                      variant="ghost"
                      size="sm"
                      className="text-yellow-500 hover:text-yellow-400"
                      onClick={() => handleSetDiscussing(conflict.id)}
                      disabled={updateMutation.isPending}
                    >
                      <MessageSquare size={16} />
                    </Button>
                  )}
                  <Button
                    data-testid={`button-resolve-conflict-${conflict.id}`}
                    variant="ghost"
                    size="sm"
                    className="text-green-500 hover:text-green-400"
                    onClick={() => setResolvingId(resolvingId === conflict.id ? null : conflict.id)}
                  >
                    <Check size={16} />
                  </Button>
                </div>
              )}
            </div>
            {resolvingId === conflict.id && (
              <div className="mt-3 flex gap-2" data-testid={`form-resolve-${conflict.id}`}>
                <Input
                  data-testid={`input-resolution-${conflict.id}`}
                  placeholder="Enter resolution..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 flex-1"
                />
                <Button
                  data-testid={`button-submit-resolution-${conflict.id}`}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleResolve(conflict.id)}
                  disabled={updateMutation.isPending}
                >
                  <Check size={16} />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
