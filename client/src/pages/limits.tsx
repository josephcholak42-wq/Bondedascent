import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Shield, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLimits, useCreateLimit, useDeleteLimit, useAuth } from '@/lib/hooks';

const CATEGORIES = ['general', 'physical', 'emotional', 'sexual'] as const;

const LEVEL_COLORS: Record<string, string> = {
  hard: 'text-red-500',
  soft: 'text-yellow-500',
  curious: 'text-green-500',
};

const LEVEL_BG: Record<string, string> = {
  hard: 'bg-red-500/20 text-red-500',
  soft: 'bg-yellow-500/20 text-yellow-500',
  curious: 'bg-green-500/20 text-green-500',
};

export default function LimitsPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: limits = [] } = useLimits();
  const createLimitMutation = useCreateLimit();
  const deleteLimitMutation = useDeleteLimit();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('general');
  const [level, setLevel] = useState('soft');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) return;
    createLimitMutation.mutate({
      name: name.trim(),
      category,
      level,
      description: description.trim() || undefined,
    });
    setName('');
    setCategory('general');
    setLevel('soft');
    setDescription('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteLimitMutation.mutate(id);
  };

  const groupedLimits = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = limits.filter((l) => l.category === cat);
    return acc;
  }, {} as Record<string, typeof limits>);

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

      <div className="flex items-center gap-3 mb-2">
        <Shield className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-tighter" data-testid="text-page-title">
          {userRole === 'dom' ? 'Limits & Boundaries' : 'My Limits'}
        </h1>
      </div>
      <p className="text-slate-400 text-sm mb-8 ml-10" data-testid="text-page-description">
        {userRole === 'dom' ? 'Define and review boundaries' : 'Set your boundaries and limits'}
      </p>

      <Button
        data-testid="button-toggle-form"
        className="mb-6 bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
        onClick={() => setShowForm(!showForm)}
      >
        <Plus size={16} className="mr-2" />
        Add Limit
      </Button>

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-3" data-testid="form-create-limit">
          <Input
            data-testid="input-limit-name"
            placeholder="Limit name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <div className="flex gap-3">
            <select
              data-testid="select-limit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <select
              data-testid="select-limit-level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
            >
              <option value="hard">Hard Limit</option>
              <option value="soft">Soft Limit</option>
              <option value="curious">Curious</option>
            </select>
          </div>
          <Input
            data-testid="input-limit-description"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <div className="flex gap-2">
            <Button
              data-testid="button-submit-limit"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createLimitMutation.isPending}
            >
              <Plus size={16} className="mr-2" />
              Add
            </Button>
            <Button
              data-testid="button-cancel-limit"
              variant="ghost"
              className="text-slate-400 hover:text-white"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {CATEGORIES.map((cat) => {
          const catLimits = groupedLimits[cat];
          if (catLimits.length === 0) return null;
          return (
            <div key={cat} data-testid={`section-category-${cat}`}>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-600" />
                {cat}
              </h2>
              <div className="space-y-2">
                {catLimits.map((limit) => (
                  <div
                    key={limit.id}
                    data-testid={`card-limit-${limit.id}`}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold" data-testid={`text-limit-name-${limit.id}`}>
                          {limit.name}
                        </h3>
                        <span
                          data-testid={`badge-limit-level-${limit.id}`}
                          className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider font-bold ${LEVEL_BG[limit.level] || 'bg-slate-700 text-slate-400'}`}
                        >
                          {limit.level}
                        </span>
                      </div>
                      {limit.description && (
                        <p className="text-slate-400 text-sm" data-testid={`text-limit-desc-${limit.id}`}>
                          {limit.description}
                        </p>
                      )}
                    </div>
                    <Button
                      data-testid={`button-delete-limit-${limit.id}`}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-400"
                      onClick={() => handleDelete(limit.id)}
                      disabled={deleteLimitMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {limits.length === 0 && (
          <p className="text-slate-500 text-center py-8" data-testid="text-no-limits">No limits defined yet. Add your first boundary.</p>
        )}
      </div>
    </div>
  );
}
