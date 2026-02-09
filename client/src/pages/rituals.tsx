import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Flame, Plus, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction, PulseIndicator, ActionBadge } from '@/components/ui/role-gate';
import { useRituals, useCreateRitual, useUpdateRitual, useDeleteRitual, useAuth } from '@/lib/hooks';

export default function RitualsPage() {
  const [, setLocation] = useLocation();
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

  const handleToggleActive = (ritual: { id: string; active: boolean }) => {
    updateRitualMutation.mutate({ id: ritual.id, active: !ritual.active });
  };

  const handleDelete = (id: string) => {
    deleteRitualMutation.mutate(id);
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
        <Flame className="text-red-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider" data-testid="text-page-title">
            {userRole === 'dom' ? 'Rituals & Protocols' : 'My Rituals'}
          </h1>
          <p className="text-slate-400 text-sm" data-testid="text-page-description">
            {userRole === 'dom' ? 'Protocols for your sub to follow' : 'Protocols assigned by your Dom'}
          </p>
        </div>
      </div>

      <RoleGatedButton
        data-testid="button-toggle-form"
        allowed={userRole === 'dom'}
        tooltipText="Only your Dom can assign rituals"
        className="mb-6 bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
        onClick={() => setShowForm(!showForm)}
      >
        <Plus size={16} className="mr-2" />
        Assign Ritual
      </RoleGatedButton>

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
            {userRole === 'sub' ? 'No rituals assigned yet.' : 'No rituals yet. Create your first one.'}
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
