import React, { useState, useMemo } from 'react';
import { Dices, Plus, Trophy, X, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction, PulseIndicator } from '@/components/ui/role-gate';
import { useWagers, useCreateWager, useUpdateWager, useAuth } from '@/lib/hooks';
import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { PREBUILT_WAGERS, WAGER_CATEGORIES } from '@/lib/prebuilt-wagers';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-yellow-500/20 text-yellow-500',
  won: 'bg-green-500/20 text-green-500',
  lost: 'bg-red-500/20 text-red-500',
  draw: 'bg-blue-500/20 text-blue-500',
};

export default function WagersPage() {
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: wagers = [] } = useWagers();
  const createWagerMutation = useCreateWager();
  const updateWagerMutation = useUpdateWager();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stakes, setStakes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showPrebuilt, setShowPrebuilt] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredPrebuilt = useMemo(() => {
    return PREBUILT_WAGERS.filter((w) => {
      const matchesCategory = selectedCategory === 'All' || w.category === selectedCategory;
      const matchesSearch = !searchQuery || w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.stakes.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

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

  const handleQuickAssign = (wager: typeof PREBUILT_WAGERS[0]) => {
    createWagerMutation.mutate({
      title: wager.name,
      description: `Category: ${wager.category}`,
      stakes: wager.stakes,
    });
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
      <PageBreadcrumb current="Wagers" />

      <div className="flex items-center gap-3 mb-2">
        <Dices className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider" data-testid="text-page-title">
          {userRole === 'dom' ? 'Wagers' : 'Active Wagers'}
        </h1>
      </div>
      <p className="text-sm text-slate-400 mb-8" data-testid="text-page-description">
        {userRole === 'dom' ? 'Set stakes and challenges' : 'Wagers set by your Dom'}
      </p>

      <div className="flex gap-2 mb-6">
        <RoleGatedButton
          data-testid="button-toggle-form"
          allowed={userRole === 'dom'}
          tooltipText="Only your Dom can propose wagers"
          className="bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
          onClick={() => { setShowForm(!showForm); setShowPrebuilt(false); }}
        >
          <Plus size={16} className="mr-2" />
          Custom Wager
        </RoleGatedButton>
        <RoleGatedButton
          data-testid="button-toggle-prebuilt"
          allowed={userRole === 'dom'}
          tooltipText="Only your Dom can propose wagers"
          className="bg-slate-800 hover:bg-slate-700 text-white uppercase tracking-wider border border-slate-700"
          onClick={() => { setShowPrebuilt(!showPrebuilt); setShowForm(false); }}
        >
          <BookOpen size={16} className="mr-2" />
          Browse Library
        </RoleGatedButton>
      </div>

      {userRole === 'dom' && showForm && (
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

      {userRole === 'dom' && showPrebuilt && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6" data-testid="section-prebuilt-wagers">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              data-testid="input-search-prebuilt"
              placeholder="Search wagers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4" data-testid="pills-category-filter">
            <button
              data-testid="pill-category-all"
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${selectedCategory === 'All' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              onClick={() => setSelectedCategory('All')}
            >
              All
            </button>
            {WAGER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                data-testid={`pill-category-${cat.toLowerCase()}`}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${selectedCategory === cat ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredPrebuilt.length === 0 && (
              <p className="text-slate-500 text-center py-4 text-sm" data-testid="text-no-prebuilt-results">No wagers match your search.</p>
            )}
            {filteredPrebuilt.map((wager, idx) => (
              <div
                key={idx}
                data-testid={`prebuilt-wager-${idx}`}
                className="flex items-center justify-between gap-3 bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{wager.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{wager.category}</span>
                    <span className="text-xs text-yellow-500/80">
                      <Trophy size={10} className="inline mr-1" />
                      {wager.stakes}
                    </span>
                  </div>
                </div>
                <Button
                  data-testid={`button-assign-prebuilt-${idx}`}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs shrink-0"
                  onClick={() => handleQuickAssign(wager)}
                  disabled={createWagerMutation.isPending}
                >
                  <Plus size={14} className="mr-1" />
                  Assign
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {wagers.length === 0 && (
          <p className="text-slate-500 text-center py-8" data-testid="text-no-wagers">{userRole === 'sub' ? 'No wagers from your Dom yet.' : 'No wagers yet. Create your first one.'}</p>
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
                  {userRole === 'sub' && wager.status === 'active' && <PulseIndicator show className="ml-1" />}
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
                <RoleGatedAction allowed={userRole === 'dom'} tooltipText="Only your Dom can resolve wagers">
                  <Button data-testid={`button-resolve-won-${wager.id}`} size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs uppercase tracking-wider" onClick={() => handleResolve(wager.id, 'won')} disabled={updateWagerMutation.isPending}>
                    <Trophy size={14} className="mr-1" /> Won
                  </Button>
                </RoleGatedAction>
                <RoleGatedAction allowed={userRole === 'dom'} tooltipText="Only your Dom can resolve wagers">
                  <Button data-testid={`button-resolve-lost-${wager.id}`} size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider" onClick={() => handleResolve(wager.id, 'lost')} disabled={updateWagerMutation.isPending}>
                    <X size={14} className="mr-1" /> Lost
                  </Button>
                </RoleGatedAction>
                <RoleGatedAction allowed={userRole === 'dom'} tooltipText="Only your Dom can resolve wagers">
                  <Button data-testid={`button-resolve-draw-${wager.id}`} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase tracking-wider" onClick={() => handleResolve(wager.id, 'draw')} disabled={updateWagerMutation.isPending}>
                    <Dices size={14} className="mr-1" /> Draw
                  </Button>
                </RoleGatedAction>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}