import React, { useState, useEffect } from 'react';
import { Shield, Plus, Clock, Trophy, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction, PulseIndicator } from '@/components/ui/role-gate';
import {
  useEnduranceChallenges,
  useEnduranceChallengesCreated,
  useCreateEnduranceChallenge,
  useUpdateEnduranceChallenge,
  useCreateEnduranceCheckin,
  useAuth,
} from '@/lib/hooks';

function formatTimeRemaining(endsAt: string | Date, now: Date) {
  const end = new Date(endsAt).getTime();
  const diff = end - now.getTime();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, mins, secs };
}

function GatesVisual({ total, completed, missed }: { total: number; completed: number; missed: number }) {
  const maxDisplay = Math.min(total, 30);
  const gates = [];
  for (let i = 1; i <= maxDisplay; i++) {
    if (i <= completed) {
      gates.push(
        <div key={i} className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
          {i}
        </div>
      );
    } else if (i <= completed + missed) {
      gates.push(
        <div key={i} className="w-6 h-6 rounded-full bg-red-600/80 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
          ✕
        </div>
      );
    } else if (i === completed + missed + 1) {
      gates.push(
        <div key={i} className="w-6 h-6 rounded-full border-2 border-amber-500 flex items-center justify-center text-[10px] font-bold text-amber-500 animate-pulse shrink-0">
          {i}
        </div>
      );
    } else {
      gates.push(
        <div key={i} className="w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-600 shrink-0">
          {i}
        </div>
      );
    }
  }
  if (total > maxDisplay) {
    gates.push(
      <div key="more" className="text-slate-500 text-xs shrink-0">+{total - maxDisplay}</div>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {gates}
    </div>
  );
}

export default function EnduranceChallengesPage() {
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';

  const { data: challenges = [] } = useEnduranceChallenges();
  const { data: createdChallenges = [] } = useEnduranceChallengesCreated();
  const createMutation = useCreateEnduranceChallenge();
  const updateMutation = useUpdateEnduranceChallenge();
  const checkinMutation = useCreateEnduranceCheckin();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationHours, setDurationHours] = useState(4);
  const [checkinInterval, setCheckinInterval] = useState(60);
  const [xpPerCheckin, setXpPerCheckin] = useState(15);
  const [autoPunishment, setAutoPunishment] = useState('');

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = () => {
    if (!title.trim()) return;
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      durationHours,
      checkinIntervalMinutes: checkinInterval,
      xpPerCheckin,
      autoPunishment: autoPunishment.trim() || undefined,
    });
    setTitle('');
    setDescription('');
    setDurationHours(4);
    setCheckinInterval(60);
    setXpPerCheckin(15);
    setAutoPunishment('');
    setShowForm(false);
  };

  const handleCheckin = (challengeId: string, gateNumber: number) => {
    checkinMutation.mutate({ challengeId, gateNumber });
  };

  const handleComplete = (id: string) => {
    updateMutation.mutate({ id, status: 'completed', completedAt: new Date().toISOString() });
  };

  const handleFail = (id: string) => {
    updateMutation.mutate({ id, status: 'failed', completedAt: new Date().toISOString() });
  };

  const displayChallenges = userRole === 'dom' ? createdChallenges : challenges;
  const activeChallenges = displayChallenges.filter(c => c.status === 'active');
  const historyChallenges = displayChallenges.filter(c => c.status === 'completed' || c.status === 'failed');

  const personalBestId = historyChallenges
    .filter(c => c.status === 'completed')
    .sort((a, b) => b.durationHours - a.durationHours)[0]?.id;

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <PageBreadcrumb current="Endurance Challenges" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Shield className="text-red-600" size={28} />
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">
            {userRole === 'dom' ? 'Endurance Challenges' : 'Endurance Trials'}
          </h1>
        </div>
        <RoleGatedButton
          data-testid="button-toggle-form"
          allowed={userRole === 'dom'}
          tooltipText="Only your Dom can create challenges"
          variant="outline"
          className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} className="mr-1" /> New Challenge
        </RoleGatedButton>
      </div>
      <p className="text-sm text-slate-400 mb-8" data-testid="text-page-description">
        {userRole === 'dom' ? 'Create long-duration challenges with periodic check-in gates' : 'Survive the challenge — check in at every gate'}
      </p>

      {userRole === 'dom' && showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-4" data-testid="form-create-challenge">
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Title</label>
            <Input
              data-testid="input-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Challenge title"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Description (optional)</label>
            <textarea
              data-testid="input-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the challenge..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-md p-2 min-h-[80px] resize-y"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Duration (hours)</label>
            <select
              data-testid="select-duration"
              value={durationHours}
              onChange={e => setDurationHours(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-md p-2"
            >
              {[1, 2, 4, 8, 12, 24, 48, 72].map(h => (
                <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Check-in Interval (minutes)</label>
            <select
              data-testid="select-interval"
              value={checkinInterval}
              onChange={e => setCheckinInterval(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-md p-2"
            >
              {[15, 30, 60, 120, 240].map(m => (
                <option key={m} value={m}>{m} min{m > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">XP per Check-in</label>
            <Input
              data-testid="input-xp"
              type="number"
              value={xpPerCheckin}
              onChange={e => setXpPerCheckin(Number(e.target.value))}
              min={1}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Auto-Punishment on Failure (optional)</label>
            <Input
              data-testid="input-punishment"
              value={autoPunishment}
              onChange={e => setAutoPunishment(e.target.value)}
              placeholder="e.g. 50 pushups"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="button-launch-challenge"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              Launch Challenge
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

      <div className="mb-8">
        <h2 className="text-sm text-slate-500 uppercase tracking-wider mb-4 font-semibold">Active Challenges</h2>
        <div className="space-y-4">
          {activeChallenges.length === 0 && (
            <div className="text-center text-slate-500 py-8" data-testid="text-empty-active">
              {userRole === 'sub' ? 'No active challenges.' : 'No active challenges. Launch one!'}
            </div>
          )}
          {activeChallenges.map(challenge => {
            const remaining = formatTimeRemaining(challenge.endsAt, now);
            const progress = challenge.totalCheckins > 0
              ? (challenge.completedCheckins / challenge.totalCheckins) * 100
              : 0;
            const nextGate = challenge.completedCheckins + 1;
            const xpEarned = challenge.completedCheckins * challenge.xpPerCheckin;

            return (
              <div
                key={challenge.id}
                className="bg-slate-900 border border-red-600/30 rounded-lg p-4 shadow-[0_0_15px_rgba(220,38,38,0.1)]"
                data-testid={`card-challenge-${challenge.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{challenge.title}</h3>
                    {challenge.description && (
                      <p className="text-sm text-slate-400 mt-1">{challenge.description}</p>
                    )}
                  </div>
                  <PulseIndicator show className="ml-2 mt-1.5" />
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-400" data-testid={`text-progress-${challenge.id}`}>
                      Gate {challenge.completedCheckins}/{challenge.totalCheckins}
                    </span>
                    <span className="text-slate-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-600 h-full rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <GatesVisual
                  total={challenge.totalCheckins}
                  completed={challenge.completedCheckins}
                  missed={challenge.missedCheckins}
                />

                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {remaining ? (
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Clock size={14} className="text-red-500" />
                      <span className="font-mono text-white">
                        {remaining.hours}h {remaining.mins}m {remaining.secs}s
                      </span>
                      <span className="text-slate-500">remaining</span>
                    </div>
                  ) : (
                    <span className="text-amber-500 text-sm font-semibold uppercase tracking-wider">Time expired</span>
                  )}

                  <div className="text-sm text-slate-400">
                    XP earned: <span className="text-green-400 font-semibold">{xpEarned}</span>
                  </div>
                </div>

                {challenge.missedCheckins > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-400 text-sm">
                    <AlertTriangle size={14} />
                    <span>{challenge.missedCheckins} missed check-in{challenge.missedCheckins > 1 ? 's' : ''}</span>
                  </div>
                )}

                {challenge.autoPunishment && challenge.missedCheckins > 0 && (
                  <div className="text-xs text-red-400/70 mt-1 ml-5">
                    Punishment: {challenge.autoPunishment}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  {userRole === 'sub' && (
                    <Button
                      data-testid={`button-checkin-${challenge.id}`}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 text-base"
                      onClick={() => handleCheckin(challenge.id, nextGate)}
                      disabled={checkinMutation.isPending}
                    >
                      CHECK IN — Gate #{nextGate}
                    </Button>
                  )}
                  {userRole === 'dom' && (
                    <>
                      <RoleGatedAction allowed={userRole === 'dom'} tooltipText="">
                        <Button
                          data-testid={`button-complete-${challenge.id}`}
                          variant="outline"
                          className="border-green-600 text-green-500 hover:bg-green-600 hover:text-white"
                          onClick={() => handleComplete(challenge.id)}
                          disabled={updateMutation.isPending}
                        >
                          <CheckCircle size={16} className="mr-1" /> Complete
                        </Button>
                      </RoleGatedAction>
                      <RoleGatedAction allowed={userRole === 'dom'} tooltipText="">
                        <Button
                          data-testid={`button-fail-${challenge.id}`}
                          variant="outline"
                          className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                          onClick={() => handleFail(challenge.id)}
                          disabled={updateMutation.isPending}
                        >
                          <XCircle size={16} className="mr-1" /> Fail
                        </Button>
                      </RoleGatedAction>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm text-slate-500 uppercase tracking-wider mb-4 font-semibold">Challenge History</h2>
        <div className="space-y-3">
          {historyChallenges.length === 0 && (
            <div className="text-center text-slate-500 py-6" data-testid="text-empty-history">
              No completed challenges yet.
            </div>
          )}
          {historyChallenges.map(challenge => {
            const isCompleted = challenge.status === 'completed';
            const isPersonalBest = challenge.id === personalBestId;

            return (
              <div
                key={challenge.id}
                className={`bg-slate-900 border rounded-lg p-4 ${
                  isCompleted ? 'border-green-600/30' : 'border-red-600/30'
                }`}
                data-testid={`card-challenge-${challenge.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">{challenge.title}</h3>
                      {isPersonalBest && (
                        <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                          <Trophy size={12} /> Personal Best
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 mt-1" data-testid={`text-progress-${challenge.id}`}>
                      {challenge.completedCheckins}/{challenge.totalCheckins} check-ins completed
                      {challenge.missedCheckins > 0 && (
                        <span className="text-red-400 ml-2">({challenge.missedCheckins} missed)</span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs uppercase tracking-wider px-2 py-1 rounded border font-semibold ${
                      isCompleted
                        ? 'text-green-500 border-green-500 bg-green-500/20'
                        : 'text-red-500 border-red-500 bg-red-500/20'
                    }`}
                  >
                    {challenge.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {challenge.durationHours}h duration • {challenge.checkinIntervalMinutes}min intervals
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}