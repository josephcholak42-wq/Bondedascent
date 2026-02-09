import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Target, Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction, PulseIndicator, ActionBadge } from '@/components/ui/role-gate';
import { useDesiredChanges, useCreateDesiredChange, useUpdateDesiredChange, useAuth } from '@/lib/hooks';

const categoryColors: Record<string, string> = {
  behavior: 'bg-blue-500/20 text-blue-500',
  communication: 'bg-purple-500/20 text-purple-500',
  physical: 'bg-pink-500/20 text-pink-500',
  emotional: 'bg-amber-500/20 text-amber-500',
  other: 'bg-slate-400/20 text-slate-400',
};

const statusStyles: Record<string, string> = {
  active: 'text-white',
  achieved: 'text-green-500',
  dismissed: 'text-slate-600',
};

export default function DesiredChangesPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: changes = [] } = useDesiredChanges();
  const createMutation = useCreateDesiredChange();
  const updateMutation = useUpdateDesiredChange();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('behavior');
  const [showForm, setShowForm] = useState(false);

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

  const handleStatusUpdate = (id: string, status: string) => {
    updateMutation.mutate({ id, status });
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

      <RoleGatedButton
        data-testid="button-toggle-form"
        allowed={userRole === 'dom'}
        tooltipText="Only your Dom can request changes"
        className="mb-6 bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
        onClick={() => setShowForm(!showForm)}
      >
        <Plus size={16} className="mr-2" />
        Request Change
      </RoleGatedButton>

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
            <option value="communication">Communication</option>
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
                      className="text-green-500 hover:text-green-400"
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
