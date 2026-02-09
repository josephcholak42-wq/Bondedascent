import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Timer, Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction, PulseIndicator } from '@/components/ui/role-gate';
import { useCountdownEvents, useCreateCountdownEvent, useDeleteCountdownEvent, useAuth } from '@/lib/hooks';

function getCountdown(targetDate: string | Date) {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, mins };
}

const categoryColor: Record<string, string> = {
  special: 'text-amber-500 border-amber-500 bg-amber-500/20',
  milestone: 'text-purple-500 border-purple-500 bg-purple-500/20',
  play: 'text-pink-500 border-pink-500 bg-pink-500/20',
  anniversary: 'text-red-500 border-red-500 bg-red-500/20',
};

export default function CountdownEventsPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: events = [] } = useCountdownEvents();
  const createMutation = useCreateCountdownEvent();
  const deleteMutation = useDeleteCountdownEvent();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('special');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = () => {
    if (!title.trim() || !targetDate) return;
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: new Date(targetDate).toISOString(),
      category,
    });
    setTitle('');
    setDescription('');
    setTargetDate('');
    setCategory('special');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
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
          <Timer className="text-red-600" size={28} />
          <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">
            {userRole === 'dom' ? 'Countdown Events' : 'Upcoming Events'}
          </h1>
        </div>
        <RoleGatedButton
          data-testid="button-toggle-form"
          allowed={userRole === 'dom'}
          tooltipText="Only your Dom can create events"
          variant="outline"
          className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} className="mr-1" /> New Event
        </RoleGatedButton>
      </div>
      <p className="text-sm text-slate-400 mb-8" data-testid="text-page-description">
        {userRole === 'dom' ? 'Set deadlines and milestones' : 'Events and deadlines set by your Dom'}
      </p>

      {userRole === 'dom' && showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-4" data-testid="form-create-event">
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Title</label>
            <Input
              data-testid="input-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Event title"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Description</label>
            <Input
              data-testid="input-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Target Date</label>
            <Input
              data-testid="input-target-date"
              type="datetime-local"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Category</label>
            <select
              data-testid="select-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-md p-2"
            >
              <option value="special">Special</option>
              <option value="milestone">Milestone</option>
              <option value="play">Play</option>
              <option value="anniversary">Anniversary</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="button-create-event"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              Create Event
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
        {events.length === 0 && (
          <div className="text-center text-slate-500 py-12" data-testid="text-empty-state">
            {userRole === 'sub' ? 'No upcoming events yet.' : 'No countdown events yet. Create your first one!'}
          </div>
        )}
        {events.map(event => {
          const countdown = getCountdown(event.targetDate);
          const isPassed = !countdown;
          const catStyle = categoryColor[event.category] || categoryColor.special;

          return (
            <div
              key={event.id}
              className={`bg-slate-900 border rounded-lg p-4 ${isPassed ? 'border-slate-800 opacity-60' : 'border-slate-800'}`}
              data-testid={`card-event-${event.id}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-white font-semibold text-lg" data-testid={`text-title-${event.id}`}>
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-sm text-slate-400 mt-1" data-testid={`text-description-${event.id}`}>
                      {event.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs uppercase tracking-wider px-2 py-1 rounded border ${catStyle}`}
                    data-testid={`badge-category-${event.id}`}
                  >
                    {event.category}
                  </span>
                  <RoleGatedAction allowed={userRole === 'dom'} tooltipText="Only your Dom can delete events">
                    <Button data-testid={`button-delete-${event.id}`} variant="ghost" size="sm" className="text-slate-500 hover:text-red-500" onClick={() => handleDelete(event.id)} disabled={deleteMutation.isPending}>
                      <Trash2 size={16} />
                    </Button>
                  </RoleGatedAction>
                </div>
              </div>

              {isPassed ? (
                <div className="flex items-center gap-2 text-slate-500 mt-2" data-testid={`text-passed-${event.id}`}>
                  <Clock size={16} />
                  <span className="uppercase tracking-wider text-sm font-semibold">Passed</span>
                </div>
              ) : (
                <div className="flex items-center gap-4 mt-3" data-testid={`text-countdown-${event.id}`}>
                  <Clock size={16} className="text-red-600" />
                  <div className="flex gap-3">
                    <div className="text-center">
                      <div className="text-xl font-bold text-white font-mono">{countdown.days}</div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">days</div>
                    </div>
                    <div className="text-slate-600 text-xl">:</div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white font-mono">{countdown.hours}</div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">hrs</div>
                    </div>
                    <div className="text-slate-600 text-xl">:</div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-white font-mono">{countdown.mins}</div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">min</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}