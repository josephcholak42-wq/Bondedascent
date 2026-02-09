import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Play, Plus, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction, PulseIndicator } from '@/components/ui/role-gate';
import { usePlaySessions, useCreatePlaySession, useUpdatePlaySession, useAuth } from '@/lib/hooks';

export default function PlaySessionsPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: sessions = [] } = usePlaySessions();
  const createMutation = useCreatePlaySession();
  const updateMutation = useUpdatePlaySession();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState('excited');
  const [intensity, setIntensity] = useState(5);
  const [activitiesInput, setActivitiesInput] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');

  const handleCreate = () => {
    if (!title.trim()) return;
    const activities = activitiesInput
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);
    createMutation.mutate({
      title: title.trim(),
      notes: notes.trim() || undefined,
      mood,
      intensity,
      activities: activities.length > 0 ? activities : undefined,
      status: 'planned',
      scheduledFor: scheduledFor || undefined,
    });
    setTitle('');
    setNotes('');
    setMood('excited');
    setIntensity(5);
    setActivitiesInput('');
    setScheduledFor('');
    setShowForm(false);
  };

  const handleComplete = (id: string) => {
    updateMutation.mutate({
      id,
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'text-blue-500 border-blue-500';
      case 'active': return 'text-green-500 border-green-500';
      case 'completed': return 'text-slate-500 border-slate-500';
      default: return 'text-slate-400 border-slate-400';
    }
  };

  const statusBg = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-500/20';
      case 'active': return 'bg-green-500/20';
      case 'completed': return 'bg-slate-500/20';
      default: return 'bg-slate-500/20';
    }
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

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Play className="text-red-600" size={28} />
          <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">
            {userRole === 'dom' ? 'Play Sessions' : 'Scheduled Sessions'}
          </h1>
        </div>
        <RoleGatedButton
          data-testid="button-toggle-form"
          allowed={userRole === 'dom'}
          tooltipText="Only your Dom can plan sessions"
          variant="outline"
          className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} className="mr-1" /> Plan Session
        </RoleGatedButton>
      </div>
      <p className="text-sm text-slate-400 mb-8" data-testid="text-page-description">
        {userRole === 'dom' ? 'Plan and manage sessions' : 'Sessions planned by your Dom'}
      </p>

      {userRole === 'dom' && showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-4" data-testid="form-create-session">
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Title</label>
            <Input
              data-testid="input-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Session title"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Notes</label>
            <textarea
              data-testid="input-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Session notes..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-md p-2 min-h-[80px] resize-y"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Mood</label>
            <select
              data-testid="select-mood"
              value={mood}
              onChange={e => setMood(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-md p-2"
            >
              <option value="excited">Excited</option>
              <option value="nervous">Nervous</option>
              <option value="relaxed">Relaxed</option>
              <option value="intense">Intense</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">
              Intensity: {intensity}/10
            </label>
            <input
              data-testid="input-intensity"
              type="range"
              min={1}
              max={10}
              value={intensity}
              onChange={e => setIntensity(Number(e.target.value))}
              className="w-full accent-red-600"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Activities (comma-separated)</label>
            <Input
              data-testid="input-activities"
              value={activitiesInput}
              onChange={e => setActivitiesInput(e.target.value)}
              placeholder="e.g. bondage, roleplay, impact"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Scheduled For</label>
            <Input
              data-testid="input-scheduled-for"
              type="date"
              value={scheduledFor}
              onChange={e => setScheduledFor(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="button-create-session"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              Create Session
            </Button>
            <Button
              data-testid="button-cancel-form"
              variant="ghost"
              className="text-slate-400"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sessions.length === 0 && (
          <div className="text-center text-slate-500 py-12" data-testid="text-empty-state">
            {userRole === 'sub' ? 'No sessions planned yet.' : 'No play sessions yet. Create your first one!'}
          </div>
        )}
        {sessions.map(session => (
          <div
            key={session.id}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4"
            data-testid={`card-session-${session.id}`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white font-semibold text-lg" data-testid={`text-title-${session.id}`}>
                {session.title || 'Untitled Session'}
              </h3>
              <span
                className={`text-xs uppercase tracking-wider px-2 py-1 rounded border ${statusColor(session.status)} ${statusBg(session.status)}`}
                data-testid={`text-status-${session.id}`}
              >
                {session.status}
              </span>
              {userRole === 'sub' && session.status === 'planned' && <PulseIndicator show className="ml-1" />}
            </div>

            {session.mood && (
              <div className="text-sm text-slate-400 mb-1" data-testid={`text-mood-${session.id}`}>
                Mood: <span className="text-white capitalize">{session.mood}</span>
              </div>
            )}

            {session.intensity != null && (
              <div className="mb-2">
                <div className="text-sm text-slate-400 mb-1">Intensity</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-600 h-full rounded-full transition-all"
                      style={{ width: `${(session.intensity / 10) * 100}%` }}
                      data-testid={`bar-intensity-${session.id}`}
                    />
                  </div>
                  <span className="text-white text-sm font-mono w-6 text-right">{session.intensity}</span>
                </div>
              </div>
            )}

            {session.activities && session.activities.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2" data-testid={`tags-activities-${session.id}`}>
                {session.activities.map((act, i) => (
                  <span key={i} className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded">
                    {act}
                  </span>
                ))}
              </div>
            )}

            {session.scheduledFor && (
              <div className="flex items-center gap-1 text-sm text-slate-500 mb-2" data-testid={`text-scheduled-${session.id}`}>
                <Clock size={14} />
                {new Date(session.scheduledFor).toLocaleDateString()}
              </div>
            )}

            {session.status !== 'completed' && (
              <RoleGatedAction allowed={userRole === 'dom'} tooltipText="Only your Dom can complete sessions">
                <Button data-testid={`button-complete-${session.id}`} variant="outline" size="sm" className="border-green-600 text-green-500 hover:bg-green-600 hover:text-white mt-2" onClick={() => handleComplete(session.id)} disabled={updateMutation.isPending}>
                  <Check size={14} className="mr-1" /> Complete
                </Button>
              </RoleGatedAction>
            )}

            {session.completedAt && (
              <div className="text-xs text-slate-600 mt-2" data-testid={`text-completed-at-${session.id}`}>
                Completed: {new Date(session.completedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}