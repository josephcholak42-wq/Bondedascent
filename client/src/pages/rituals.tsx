import React, { useState } from 'react';
import { Flame, Plus, Trash2, Check, X, Search, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction, PulseIndicator, ActionBadge } from '@/components/ui/role-gate';
import { useRituals, useCreateRitual, useUpdateRitual, useDeleteRitual, useAuth } from '@/lib/hooks';
import { PREBUILT_RITUALS, RITUAL_CATEGORIES, type PrebuiltRitual } from '@/lib/prebuilt-rituals';

export default function RitualsPage() {
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: rituals = [] } = useRituals();
  const createRitualMutation = useCreateRitual();
  const updateRitualMutation = useUpdateRitual();
  const deleteRitualMutation = useDeleteRitual();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [ritualSearch, setRitualSearch] = useState('');
  const [ritualCategoryFilter, setRitualCategoryFilter] = useState<string | null>(null);

  const handleCreate = () => {
    if (!title.trim()) return;
    createRitualMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      frequency,
      timeOfDay: timeOfDay.trim() || undefined,
    });
    setTitle('');
    setDescription('');
    setFrequency('daily');
    setTimeOfDay('');
    setShowForm(false);
  };

  const handleCreateFromPrebuilt = (ritual: PrebuiltRitual) => {
    createRitualMutation.mutate({
      title: ritual.name,
      description: ritual.description,
      frequency: ritual.frequency,
    });
  };

  const handleToggleActive = (ritual: { id: string; active: boolean }) => {
    updateRitualMutation.mutate({ id: ritual.id, active: !ritual.active });
  };

  const handleDelete = (id: string) => {
    deleteRitualMutation.mutate(id);
  };

  const filteredPrebuilt = PREBUILT_RITUALS
    .filter(r => !ritualCategoryFilter || r.category === ritualCategoryFilter)
    .filter(r => !ritualSearch || r.name.toLowerCase().includes(ritualSearch.toLowerCase()) || r.description.toLowerCase().includes(ritualSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <PageBreadcrumb current="Rituals" />

      <div className="flex items-center gap-3 mb-8">
        <Flame className="text-red-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider" data-testid="text-page-title">
            {userRole === 'dom' ? 'Rituals & Protocols' : 'My Rituals'}
          </h1>
          <p className="text-slate-400 text-sm" data-testid="text-page-description">
            {userRole === 'dom' ? 'Browse 100+ rituals or create custom protocols' : 'Protocols assigned by your Dom'}
          </p>
        </div>
      </div>

      {userRole === 'dom' && (
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              data-testid="input-ritual-search"
              type="text"
              value={ritualSearch}
              onChange={(e) => setRitualSearch(e.target.value)}
              placeholder="Search rituals..."
              className="w-full bg-black/40 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              style={{ fontSize: '16px' }}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              data-testid="button-ritual-cat-all"
              onClick={() => setRitualCategoryFilter(null)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${!ritualCategoryFilter ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              All
            </button>
            {RITUAL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                data-testid={`button-ritual-cat-${cat.toLowerCase().replace(/\s/g, '-')}`}
                onClick={() => setRitualCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${ritualCategoryFilter === cat ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="max-h-[45vh] overflow-y-auto space-y-1.5 pr-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            {filteredPrebuilt.map((ritual, i) => (
              <button
                key={i}
                data-testid={`button-prebuilt-ritual-${i}`}
                onClick={() => handleCreateFromPrebuilt(ritual)}
                className="w-full flex items-center gap-3 p-3 bg-red-950/10 border border-red-900/20 hover:bg-red-900/30 hover:border-red-500/40 rounded-xl transition-all cursor-pointer group text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-red-400 font-semibold group-hover:text-white transition-colors truncate">
                    {ritual.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    {ritual.description}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-slate-600 uppercase">{ritual.category}</span>
                    <span className="text-[9px] text-slate-600">•</span>
                    <span className="text-[9px] text-red-500/60 flex items-center gap-0.5">
                      <Clock size={8} />{ritual.frequency}
                    </span>
                  </div>
                </div>
                <Plus size={14} className="text-slate-600 group-hover:text-red-400 transition-colors flex-shrink-0" />
              </button>
            ))}
            {filteredPrebuilt.length === 0 && (
              <p className="text-slate-600 text-center py-4 text-sm" data-testid="text-no-prebuilt-results">No rituals match your search</p>
            )}
          </div>

          <div className="border-t border-slate-800 pt-4">
            <Button
              data-testid="button-toggle-form"
              className="w-full bg-slate-800 hover:bg-slate-700 text-white uppercase tracking-wider"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus size={16} className="mr-2" />
              {showForm ? 'Hide Custom Form' : 'Create Custom Ritual'}
            </Button>
          </div>
        </div>
      )}

      {userRole === 'sub' && (
        <RoleGatedButton
          data-testid="button-toggle-form"
          allowed={false}
          tooltipText="Only your Dom can assign rituals"
          className="mb-6 bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
          onClick={() => {}}
        >
          <Plus size={16} className="mr-2" />
          Assign Ritual
        </RoleGatedButton>
      )}

      {showForm && userRole === 'dom' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-3" data-testid="form-create-ritual">
          <Input
            data-testid="input-ritual-title"
            placeholder="Ritual title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <Input
            data-testid="input-ritual-description"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <div className="flex gap-3">
            <select
              data-testid="select-ritual-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
            <Input
              data-testid="input-ritual-time"
              placeholder="Time of day"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="button-submit-ritual"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createRitualMutation.isPending}
            >
              <Check size={16} className="mr-2" />
              Create
            </Button>
            <Button
              data-testid="button-cancel-ritual"
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
        {rituals.length === 0 && (
          <p className="text-slate-500 text-center py-8" data-testid="text-no-rituals">
            {userRole === 'sub' ? 'No rituals assigned yet.' : 'No rituals yet. Browse above or create a custom one.'}
          </p>
        )}
        {rituals.map((ritual) => (
          <div
            key={ritual.id}
            data-testid={`card-ritual-${ritual.id}`}
            className={`bg-slate-900 border rounded-lg p-4 ${ritual.active ? 'border-red-600/30' : 'border-slate-800 opacity-60'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold" data-testid={`text-ritual-title-${ritual.id}`}>
                    {ritual.title}
                  </h3>
                  {ritual.assignedBy && (
                    <span className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded" data-testid={`badge-assigned-${ritual.id}`}>
                      Partner Assigned
                    </span>
                  )}
                </div>
                {ritual.description && (
                  <p className="text-slate-400 text-sm mb-2" data-testid={`text-ritual-desc-${ritual.id}`}>
                    {ritual.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span data-testid={`text-ritual-frequency-${ritual.id}`} className="uppercase tracking-wider">
                    {ritual.frequency}
                  </span>
                  {ritual.timeOfDay && (
                    <span data-testid={`text-ritual-time-${ritual.id}`}>
                      {ritual.timeOfDay}
                    </span>
                  )}
                  <span
                    data-testid={`text-ritual-status-${ritual.id}`}
                    className={ritual.active ? 'text-green-500' : 'text-slate-600'}
                  >
                    {ritual.active ? 'Active' : 'Inactive'}
                  </span>
                  {userRole === 'sub' && ritual.active && ritual.assignedBy && <PulseIndicator show className="ml-1" />}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  data-testid={`button-toggle-ritual-${ritual.id}`}
                  variant="ghost"
                  size="sm"
                  className={ritual.active ? 'text-green-500 hover:text-green-400' : 'text-slate-600 hover:text-slate-400'}
                  onClick={() => handleToggleActive(ritual)}
                  disabled={updateRitualMutation.isPending}
                >
                  {ritual.active ? <Check size={16} /> : <X size={16} />}
                </Button>
                <RoleGatedAction allowed={userRole === 'dom'} tooltipText="Only your Dom can delete rituals">
                  <Button
                    data-testid={`button-delete-ritual-${ritual.id}`}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-400"
                    onClick={() => handleDelete(ritual.id)}
                    disabled={deleteRitualMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </Button>
                </RoleGatedAction>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}