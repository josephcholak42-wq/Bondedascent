import React, { useState, useMemo } from 'react';
import { Shield, Plus, Trash2, AlertTriangle, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction, PulseIndicator } from '@/components/ui/role-gate';
import { useLimits, useCreateLimit, useDeleteLimit, useAuth } from '@/lib/hooks';
import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { PREBUILT_LIMITS, LIMIT_CATEGORIES } from '@/lib/prebuilt-limits';

const LEVEL_COLORS: Record<string, string> = {
  hard: 'text-red-500',
  soft: 'text-red-400',
  curious: 'text-red-500',
};

const LEVEL_BG: Record<string, string> = {
  hard: 'bg-red-500/20 text-red-500',
  soft: 'bg-red-700/20 text-red-400',
  curious: 'bg-red-500/20 text-red-500',
};

export default function LimitsPage() {
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: limits = [] } = useLimits();
  const createLimitMutation = useCreateLimit();
  const deleteLimitMutation = useDeleteLimit();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Physical');
  const [level, setLevel] = useState('soft');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showPrebuilt, setShowPrebuilt] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredPrebuilt = useMemo(() => {
    return PREBUILT_LIMITS.filter((l) => {
      const matchesCategory = selectedCategory === 'All' || l.category === selectedCategory;
      const matchesSearch = !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCreate = () => {
    if (!name.trim()) return;
    createLimitMutation.mutate({
      name: name.trim(),
      category: category.toLowerCase(),
      level,
      description: description.trim() || undefined,
    });
    setName('');
    setCategory('Physical');
    setLevel('soft');
    setDescription('');
    setShowForm(false);
  };

  const handleQuickAssign = (limit: typeof PREBUILT_LIMITS[0]) => {
    createLimitMutation.mutate({
      name: limit.name,
      category: limit.category.toLowerCase(),
      level: limit.level,
      description: `Category: ${limit.category}`,
    });
  };

  const handleDelete = (id: string) => {
    deleteLimitMutation.mutate(id);
  };

  const allCategories = ['general', 'physical', 'emotional', 'sexual', 'social', 'digital', 'financial', 'time', 'psychological'];

  const groupedLimits = allCategories.reduce((acc, cat) => {
    acc[cat] = limits.filter((l) => l.category === cat);
    return acc;
  }, {} as Record<string, typeof limits>);

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <PageBreadcrumb current="Limits" />

      <div className="flex items-center gap-3 mb-2">
        <Shield className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-tighter" data-testid="text-page-title">
          {userRole === 'dom' ? 'Limits & Boundaries' : 'My Limits'}
        </h1>
      </div>
      <p className="text-slate-400 text-sm mb-8 ml-10" data-testid="text-page-description">
        {userRole === 'dom' ? 'Define and review boundaries' : 'Set your boundaries and limits'}
      </p>

      <div className="flex gap-2 mb-6">
        <Button
          data-testid="button-toggle-form"
          className="bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
          onClick={() => { setShowForm(!showForm); setShowPrebuilt(false); }}
        >
          <Plus size={16} className="mr-2" />
          Custom Limit
        </Button>
        <Button
          data-testid="button-toggle-prebuilt"
          className="bg-slate-800 hover:bg-slate-700 text-white uppercase tracking-wider border border-slate-700"
          onClick={() => { setShowPrebuilt(!showPrebuilt); setShowForm(false); }}
        >
          <BookOpen size={16} className="mr-2" />
          Browse Library
        </Button>
      </div>

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
              {allCategories.map((cat) => (
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

      {showPrebuilt && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6" data-testid="section-prebuilt-limits">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              data-testid="input-search-prebuilt"
              placeholder="Search limits..."
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
            {LIMIT_CATEGORIES.map((cat) => (
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
              <p className="text-slate-500 text-center py-4 text-sm" data-testid="text-no-prebuilt-results">No limits match your search.</p>
            )}
            {filteredPrebuilt.map((limit, idx) => (
              <div
                key={idx}
                data-testid={`prebuilt-limit-${idx}`}
                className="flex items-center justify-between gap-3 bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{limit.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{limit.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${LEVEL_BG[limit.level] || 'bg-slate-700 text-slate-400'}`}>{limit.level}</span>
                  </div>
                </div>
                <Button
                  data-testid={`button-assign-prebuilt-${idx}`}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs shrink-0"
                  onClick={() => handleQuickAssign(limit)}
                  disabled={createLimitMutation.isPending}
                >
                  <Plus size={14} className="mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {allCategories.map((cat) => {
          const catLimits = groupedLimits[cat] || [];
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