import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Dices, Plus, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWagers, useCreateWager, useUpdateWager, useAuth } from '@/lib/hooks';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-yellow-500/20 text-yellow-500',
  won: 'bg-green-500/20 text-green-500',
  lost: 'bg-red-500/20 text-red-500',
  draw: 'bg-blue-500/20 text-blue-500',
};

export default function WagersPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const { data: wagers = [] } = useWagers();
  const createWagerMutation = useCreateWager();
  const updateWagerMutation = useUpdateWager();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stakes, setStakes] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleCreate = () => {
    if (!title.trim()) return;
    createWagerMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      stakes: stakes.trim() || undefined,
    });
    setTitle('');
    setDescription('');
    setStakes('');
    setShowForm(false);
  };

  const handleResolve = (id: string, status: string) => {
    updateWagerMutation.mutate({
      id,
      status,
      winnerId: status === 'won' ? user?.id : undefined,
    });
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
        <Dices className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider" data-testid="text-page-title">
          Wagers
        </h1>
      </div>

      <Button
        data-testid="button-toggle-form"
        className="mb-6 bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
        onClick={() => setShowForm(!showForm)}
      >
        <Plus size={16} className="mr-2" />
        New Wager
      </Button>

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-3" data-testid="form-create-wager">
          <Input
            data-testid="input-wager-title"
            placeholder="Wager title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <Input
            data-testid="input-wager-description"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <Input
            data-testid="input-wager-stakes"
            placeholder="Stakes (what's on the line)"
            value={stakes}
            onChange={(e) => setStakes(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <div className="flex gap-2">
            <Button
              data-testid="button-submit-wager"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createWagerMutation.isPending}
            >
              <Plus size={16} className="mr-2" />
              Create
            </Button>
            <Button
              data-testid="button-cancel-wager"
              variant="ghost"
              className="text-slate-400 hover:text-white"
              onClick={() => setShowForm(false)}
            >
              <X size={16} className="mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {wagers.length === 0 && (
          <p className="text-slate-500 text-center py-8" data-testid="text-no-wagers">No wagers yet. Create your first one.</p>
        )}
        {wagers.map((wager) => (
          <div
            key={wager.id}
            data-testid={`card-wager-${wager.id}`}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold" data-testid={`text-wager-title-${wager.id}`}>
                    {wager.title}
                  </h3>
                  <span
                    data-testid={`badge-wager-status-${wager.id}`}
                    className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider font-bold ${STATUS_COLORS[wager.status] || 'bg-slate-700 text-slate-400'}`}
                  >
                    {wager.status}
                  </span>
                </div>
                {wager.description && (
                  <p className="text-slate-400 text-sm mb-2" data-testid={`text-wager-desc-${wager.id}`}>
                    {wager.description}
                  </p>
                )}
                {wager.stakes && (
                  <p className="text-sm text-yellow-500/80 mb-2" data-testid={`text-wager-stakes-${wager.id}`}>
                    <Trophy size={12} className="inline mr-1" />
                    Stakes: {wager.stakes}
                  </p>
                )}
              </div>
            </div>
            {wager.status === 'active' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800">
                <Button
                  data-testid={`button-resolve-won-${wager.id}`}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white text-xs uppercase tracking-wider"
                  onClick={() => handleResolve(wager.id, 'won')}
                  disabled={updateWagerMutation.isPending}
                >
                  <Trophy size={14} className="mr-1" />
                  Won
                </Button>
                <Button
                  data-testid={`button-resolve-lost-${wager.id}`}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider"
                  onClick={() => handleResolve(wager.id, 'lost')}
                  disabled={updateWagerMutation.isPending}
                >
                  <X size={14} className="mr-1" />
                  Lost
                </Button>
                <Button
                  data-testid={`button-resolve-draw-${wager.id}`}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase tracking-wider"
                  onClick={() => handleResolve(wager.id, 'draw')}
                  disabled={updateWagerMutation.isPending}
                >
                  <Dices size={14} className="mr-1" />
                  Draw
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}