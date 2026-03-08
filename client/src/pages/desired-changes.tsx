import React, { useState, useMemo } from 'react';
import { Target, Plus, Check, X, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction, PulseIndicator, ActionBadge } from '@/components/ui/role-gate';
import { useDesiredChanges, useCreateDesiredChange, useUpdateDesiredChange, useAuth } from '@/lib/hooks';
import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { PREBUILT_DESIRED_CHANGES, DESIRED_CHANGE_CATEGORIES } from '@/lib/prebuilt-desired-changes';

const categoryColors: Record<string, string> = {
  behavior: 'bg-red-700/20 text-red-400',
  communication: 'bg-red-800/20 text-red-400',
  physical: 'bg-rose-800/20 text-rose-400',
  emotional: 'bg-red-700/20 text-red-400',
  attitude: 'bg-red-700/20 text-red-500',
  skill: 'bg-red-700/20 text-red-400',
  habit: 'bg-red-500/20 text-red-500',
  appearance: 'bg-rose-500/20 text-rose-500',
  mindset: 'bg-red-700/20 text-red-400',
  routine: 'bg-red-700/20 text-red-300',
  other: 'bg-slate-400/20 text-slate-400',
};

const statusStyles: Record<string, string> = {
  active: 'text-white',
  achieved: 'text-red-500',
  dismissed: 'text-slate-600',
};

export default function DesiredChangesPage() {
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: changes = [] } = useDesiredChanges();
  const createMutation = useCreateDesiredChange();
  const updateMutation = useUpdateDesiredChange();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('behavior');
  const [showForm, setShowForm] = useState(false);
  const [showPrebuilt, setShowPrebuilt] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredPrebuilt = useMemo(() => {
    return PREBUILT_DESIRED_CHANGES.filter((c) => {
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCreate = () => {
    if (!title.trim()) return;
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
    });
    setTitle('');
    setDescription('');
    setCategory('behavior');
    setShowForm(false);
  };

  const handleQuickAssign = (change: typeof PREBUILT_DESIRED_CHANGES[0]) => {
    createMutation.mutate({
      title: change.name,
      description: change.description,
      category: change.category.toLowerCase(),
    });
  };

  const handleStatusUpdate = (id: string, status: string) => {
    updateMutation.mutate({ id, status });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <PageBreadcrumb current="Desired Changes" />

      <div className="flex items-center gap-3 mb-8">
        <Target className="text-red-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider" data-testid="text-page-title">
            {userRole === 'dom' ? 'Desired Changes' : 'Required Changes'}
          </h1>
          <p className="text-slate-400 text-sm" data-testid="text-page-description">
            {userRole === 'dom' ? 'Changes you want from your sub' : 'Changes requested by your Dom'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <RoleGatedButton
          data-testid="button-toggle-form"
          allowed={userRole === 'dom'}
          tooltipText="Only your Dom can request changes"
          className="bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
          onClick={() => { setShowForm(!showForm); setShowPrebuilt(false); }}
        >
          <Plus size={16} className="mr-2" />
          Custom Change
        </RoleGatedButton>
        <RoleGatedButton
          data-testid="button-toggle-prebuilt"
          allowed={userRole === 'dom'}
          tooltipText="Only your Dom can request changes"
          className="bg-slate-800 hover:bg-slate-700 text-white uppercase tracking-wider border border-slate-700"
          onClick={() => { setShowPrebuilt(!showPrebuilt); setShowForm(false); }}
        >
          <BookOpen size={16} className="mr-2" />
          Browse Library
        </RoleGatedButton>
      </div>

      {showForm && userRole === 'dom' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-3" data-testid="form-create-change">
          <Input
            data-testid="input-change-title"
            placeholder="Change title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <Input
            data-testid="input-change-description"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <select
            data-testid="select-change-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
          >
            <option value="behavior">Behavior</option>
            <option value="attitude">Attitude</option>
            <option value="skill">Skill</option>
            <option value="habit">Habit</option>
            <option value="communication">Communication</option>
            <option value="appearance">Appearance</option>
            <option value="mindset">Mindset</option>
            <option value="routine">Routine</option>
            <option value="physical">Physical</option>
            <option value="emotional">Emotional</option>
            <option value="other">Other</option>
          </select>
          <div className="flex gap-2">
            <Button
              data-testid="button-submit-change"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              <Check size={16} className="mr-2" />
              Create
            </Button>
            <Button
              data-testid="button-cancel-change"
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

      {showPrebuilt && userRole === 'dom' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6" data-testid="section-prebuilt-changes">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              data-testid="input-search-prebuilt"
              placeholder="Search desired changes..."
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
            {DESIRED_CHANGE_CATEGORIES.map((cat) => (
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
              <p className="text-slate-500 text-center py-4 text-sm" data-testid="text-no-prebuilt-results">No changes match your search.</p>
            )}
            {filteredPrebuilt.map((change, idx) => (
              <div
                key={idx}
                data-testid={`prebuilt-change-${idx}`}
                className="flex items-center justify-between gap-3 bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{change.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5 truncate">{change.description}</p>
                  <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${categoryColors[change.category.toLowerCase()] || categoryColors.other}`}>
                    {change.category}
                  </span>
                </div>
                <Button
                  data-testid={`button-assign-prebuilt-${idx}`}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs shrink-0"
                  onClick={() => handleQuickAssign(change)}
                  disabled={createMutation.isPending}
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
        {changes.length === 0 && (
          <p className="text-slate-500 text-center py-8" data-testid="text-no-changes">
            {userRole === 'sub' ? 'No changes requested by your Dom yet.' : 'No desired changes yet. Create your first one.'}
          </p>
        )}
        {changes.map((change) => (
          <div
            key={change.id}
            data-testid={`card-change-${change.id}`}
            className={`bg-slate-900 border border-slate-800 rounded-lg p-4 ${change.status === 'dismissed' ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold ${statusStyles[change.status] || 'text-white'}`} data-testid={`text-change-title-${change.id}`}>
                    {change.title}
                  </h3>
                  <span
                    data-testid={`badge-category-${change.id}`}
                    className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider ${categoryColors[change.category] || categoryColors.other}`}
                  >
                    {change.category}
                  </span>
                </div>
                {change.description && (
                  <p className="text-slate-400 text-sm mb-2" data-testid={`text-change-desc-${change.id}`}>
                    {change.description}
                  </p>
                )}
                <span
                  data-testid={`text-change-status-${change.id}`}
                  className={`text-xs uppercase tracking-wider ${statusStyles[change.status] || 'text-white'}`}
                >
                  {change.status}
                </span>
                {userRole === 'sub' && change.status === 'active' && <PulseIndicator show className="ml-1" />}
              </div>
              {change.status === 'active' && (
                <div className="flex items-center gap-1">
                  <RoleGatedAction allowed={userRole === 'dom'} tooltipText="Only your Dom can mark changes achieved">
                    <Button
                      data-testid={`button-achieve-change-${change.id}`}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-400"
                      onClick={() => handleStatusUpdate(change.id, 'achieved')}
                      disabled={updateMutation.isPending}
                    >
                      <Check size={16} />
                    </Button>
                  </RoleGatedAction>
                  <RoleGatedAction allowed={userRole === 'dom'} tooltipText="Only your Dom can dismiss changes">
                    <Button
                      data-testid={`button-dismiss-change-${change.id}`}
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:text-slate-400"
                      onClick={() => handleStatusUpdate(change.id, 'dismissed')}
                      disabled={updateMutation.isPending}
                    >
                      <X size={16} />
                    </Button>
                  </RoleGatedAction>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}