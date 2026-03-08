import React, { useState, useMemo } from 'react';
import { Heart, Plus, Check, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction, PulseIndicator } from '@/components/ui/role-gate';
import { useDevotions, useCreateDevotion, useUpdateDevotion, useAuth } from '@/lib/hooks';
import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { PREBUILT_DEVOTIONS, DEVOTION_CATEGORIES } from '@/lib/prebuilt-devotions';

const typeColors: Record<string, string> = {
  affirmation: 'bg-rose-600/20 text-rose-600',
  prayer: 'bg-red-400/20 text-red-400',
  mantra: 'bg-slate-400/20 text-slate-400',
  gratitude: 'bg-red-400/20 text-red-400',
};

export default function DevotionsPage() {
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: devotions = [] } = useDevotions();
  const createMutation = useCreateDevotion();
  const updateMutation = useUpdateDevotion();

  const [type, setType] = useState('affirmation');
  const [content, setContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showPrebuilt, setShowPrebuilt] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredPrebuilt = useMemo(() => {
    return PREBUILT_DEVOTIONS.filter((d) => {
      const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
      const matchesSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCreate = () => {
    if (!content.trim()) return;
    createMutation.mutate({
      type,
      content: content.trim(),
    });
    setType('affirmation');
    setContent('');
    setShowForm(false);
  };

  const handleQuickAssign = (devotion: typeof PREBUILT_DEVOTIONS[0]) => {
    createMutation.mutate({
      type: devotion.type,
      content: devotion.name,
    });
  };

  const handleToggleCompleted = (devotion: { id: string; completed: boolean }) => {
    updateMutation.mutate({ id: devotion.id, completed: !devotion.completed });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <PageBreadcrumb current="Devotions" />

      <div className="flex items-center gap-3 mb-2">
        <Heart className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider" data-testid="text-page-title">
          {userRole === 'dom' ? "Sub's Devotions" : 'Devotions'}
        </h1>
      </div>
      <p className="text-slate-400 text-sm mb-8 ml-10" data-testid="text-page-description">
        {userRole === 'dom' ? "View your sub's expressions of devotion" : 'Express your devotion and commitment'}
      </p>

      <div className="flex gap-2 mb-6">
        <RoleGatedButton
          data-testid="button-toggle-form"
          allowed={userRole === 'sub'}
          tooltipText="Only your sub can create devotions"
          className="bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
          onClick={() => { setShowForm(!showForm); setShowPrebuilt(false); }}
        >
          <Plus size={16} className="mr-2" />
          Custom Devotion
        </RoleGatedButton>
        <RoleGatedButton
          data-testid="button-toggle-prebuilt"
          allowed={userRole === 'sub'}
          tooltipText="Only your sub can create devotions"
          className="bg-slate-800 hover:bg-slate-700 text-white uppercase tracking-wider border border-slate-700"
          onClick={() => { setShowPrebuilt(!showPrebuilt); setShowForm(false); }}
        >
          <BookOpen size={16} className="mr-2" />
          Browse Library
        </RoleGatedButton>
      </div>

      {userRole === 'sub' && showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-3" data-testid="form-create-devotion">
          <select
            data-testid="select-devotion-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
          >
            <option value="affirmation">Affirmation</option>
            <option value="prayer">Prayer</option>
            <option value="mantra">Mantra</option>
            <option value="gratitude">Gratitude</option>
          </select>
          <textarea
            data-testid="input-devotion-content"
            placeholder="Enter your devotion..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-md px-3 py-2 text-sm min-h-[80px] resize-none"
          />
          <div className="flex gap-2">
            <Button
              data-testid="button-submit-devotion"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              <Check size={16} className="mr-2" />
              Create
            </Button>
            <Button
              data-testid="button-cancel-devotion"
              variant="ghost"
              className="text-slate-400 hover:text-white"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {userRole === 'sub' && showPrebuilt && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6" data-testid="section-prebuilt-devotions">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              data-testid="input-search-prebuilt"
              placeholder="Search devotions..."
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
            {DEVOTION_CATEGORIES.map((cat) => (
              <button
                key={cat}
                data-testid={`pill-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${selectedCategory === cat ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredPrebuilt.length === 0 && (
              <p className="text-slate-500 text-center py-4 text-sm" data-testid="text-no-prebuilt-results">No devotions match your search.</p>
            )}
            {filteredPrebuilt.map((devotion, idx) => (
              <div
                key={idx}
                data-testid={`prebuilt-devotion-${idx}`}
                className="flex items-center justify-between gap-3 bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{devotion.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{devotion.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${typeColors[devotion.type] || typeColors.affirmation}`}>{devotion.type}</span>
                  </div>
                </div>
                <Button
                  data-testid={`button-assign-prebuilt-${idx}`}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs shrink-0"
                  onClick={() => handleQuickAssign(devotion)}
                  disabled={createMutation.isPending}
                >
                  <Plus size={14} className="mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {devotions.length === 0 && (
          <p className="text-slate-500 text-center py-8" data-testid="text-no-devotions">
            {userRole === 'dom' ? "Your sub hasn't created any devotions yet." : 'No devotions yet. Create your first one.'}
          </p>
        )}
        {devotions.map((devotion) => (
          <div
            key={devotion.id}
            data-testid={`card-devotion-${devotion.id}`}
            className={`bg-slate-900 border border-slate-800 rounded-lg p-4 ${devotion.completed ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    data-testid={`badge-type-${devotion.id}`}
                    className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider ${typeColors[devotion.type] || typeColors.affirmation}`}
                  >
                    {devotion.type}
                  </span>
                  {devotion.completed && (
                    <span className="text-xs text-red-500 uppercase tracking-wider" data-testid={`text-completed-${devotion.id}`}>
                      Completed
                    </span>
                  )}
                  {userRole === 'dom' && !devotion.completed && <PulseIndicator show className="ml-1" />}
                </div>
                <p className="text-white text-sm" data-testid={`text-devotion-content-${devotion.id}`}>
                  {devotion.content}
                </p>
              </div>
              <RoleGatedAction allowed={userRole === 'sub'} tooltipText="Only your sub can mark devotions complete">
                <Button
                  data-testid={`button-toggle-devotion-${devotion.id}`}
                  variant="ghost"
                  size="sm"
                  className={devotion.completed ? 'text-red-500 hover:text-red-400' : 'text-slate-600 hover:text-slate-400'}
                  onClick={() => handleToggleCompleted(devotion)}
                  disabled={updateMutation.isPending}
                >
                  <Check size={16} />
                </Button>
              </RoleGatedAction>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}