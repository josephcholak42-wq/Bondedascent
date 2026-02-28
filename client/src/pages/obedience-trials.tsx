import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Shield, Plus, X, Check, Play, Trash2, Clock, Trophy, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction, PulseIndicator } from '@/components/ui/role-gate';
import { useObedienceTrials, useCreateObedienceTrial, useUpdateObedienceTrial, useTrialSteps, useUpdateTrialStep, useAuth } from '@/lib/hooks';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  active: 'bg-blue-500/20 text-blue-500',
  passed: 'bg-green-500/20 text-green-500',
  failed: 'bg-red-500/20 text-red-500',
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ObedienceTrialsPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: trials = [] } = useObedienceTrials();
  const createTrialMutation = useCreateObedienceTrial();
  const updateTrialMutation = useUpdateObedienceTrial();
  const updateStepMutation = useUpdateTrialStep();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState(600);
  const [steps, setSteps] = useState<string[]>([]);
  const [stepInput, setStepInput] = useState('');
  const [autoReward, setAutoReward] = useState('');
  const [autoPunishment, setAutoPunishment] = useState('');
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null);

  const { data: trialSteps = [] } = useTrialSteps(selectedTrialId);

  const activeTrial = useMemo(() => trials.find(t => t.status === 'active' || t.status === 'pending'), [trials]);
  const historyTrials = useMemo(() => trials.filter(t => t.status === 'passed' || t.status === 'failed'), [trials]);

  useEffect(() => {
    if (activeTrial && selectedTrialId !== activeTrial.id) {
      setSelectedTrialId(activeTrial.id);
    }
  }, [activeTrial, selectedTrialId]);

  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!activeTrial || activeTrial.status !== 'active' || !activeTrial.startedAt) {
      setCountdown(null);
      return;
    }
    const calcRemaining = () => {
      const started = new Date(activeTrial.startedAt!).getTime();
      const elapsed = Math.floor((Date.now() - started) / 1000);
      return Math.max(0, activeTrial.timeLimitSeconds - elapsed);
    };
    setCountdown(calcRemaining());
    const interval = setInterval(() => {
      setCountdown(calcRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTrial]);

  const handleAddStep = () => {
    if (!stepInput.trim()) return;
    setSteps([...steps, stepInput.trim()]);
    setStepInput('');
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!title.trim() || steps.length === 0) return;
    createTrialMutation.mutate({
      title: title.trim(),
      timeLimitSeconds: timeLimit,
      steps,
      autoReward: autoReward.trim() || undefined,
      autoPunishment: autoPunishment.trim() || undefined,
    });
    setTitle('');
    setTimeLimit(600);
    setSteps([]);
    setStepInput('');
    setAutoReward('');
    setAutoPunishment('');
    setShowForm(false);
  };

  const handleStart = (trialId: string) => {
    updateTrialMutation.mutate({
      id: trialId,
      status: 'active',
      startedAt: new Date().toISOString(),
    });
  };

  const handleCompleteStep = (stepId: string) => {
    updateStepMutation.mutate({ id: stepId, status: 'completed' });
  };

  const handleResolve = (trialId: string, status: 'passed' | 'failed') => {
    const trial = trials.find(t => t.id === trialId);
    if (!trial) return;
    const score = Math.round(((trial.completedSteps || 0) / (trial.totalSteps || 1)) * 100);
    updateTrialMutation.mutate({
      id: trialId,
      status,
      score,
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <PageBreadcrumb current="Obedience Trials" />

      <div className="flex items-center gap-3 mb-2">
        <Shield className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider" data-testid="text-page-title">
          {userRole === 'dom' ? 'Obedience Trials' : 'Trial Orders'}
        </h1>
      </div>
      <p className="text-sm text-slate-400 mb-8" data-testid="text-page-description">
        {userRole === 'dom' ? 'Create multi-step trial challenges' : 'Complete trial challenges from your Dom'}
      </p>

      <RoleGatedButton
        data-testid="button-toggle-form"
        allowed={userRole === 'dom'}
        tooltipText="Only your Dom can create trials"
        className="mb-6 bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
        onClick={() => setShowForm(!showForm)}
      >
        <Plus size={16} className="mr-2" />
        Create Trial
      </RoleGatedButton>

      {userRole === 'dom' && showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-3" data-testid="form-create-trial">
          <Input
            data-testid="input-trial-title"
            placeholder="Trial title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <select
            data-testid="select-time-limit"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
          >
            <option value={300}>5 minutes</option>
            <option value={600}>10 minutes</option>
            <option value={900}>15 minutes</option>
            <option value={1800}>30 minutes</option>
            <option value={3600}>60 minutes</option>
          </select>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase tracking-wider">Steps</label>
            <div className="flex gap-2">
              <Input
                data-testid="input-step"
                placeholder="Step instruction"
                value={stepInput}
                onChange={(e) => setStepInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button
                data-testid="button-add-step"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white shrink-0"
                onClick={handleAddStep}
              >
                <Plus size={14} className="mr-1" /> Add Step
              </Button>
            </div>
            {steps.length > 0 && (
              <div className="space-y-1">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-800 rounded px-3 py-2 text-sm">
                    <span className="text-red-500 font-bold text-xs">{i + 1}.</span>
                    <span className="text-white flex-1">{step}</span>
                    <button
                      className="text-slate-500 hover:text-red-500"
                      onClick={() => handleRemoveStep(i)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            data-testid="input-auto-reward"
            placeholder="Auto-reward on pass (optional)"
            value={autoReward}
            onChange={(e) => setAutoReward(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <Input
            data-testid="input-auto-punishment"
            placeholder="Auto-punishment on fail (optional)"
            value={autoPunishment}
            onChange={(e) => setAutoPunishment(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />

          <div className="flex gap-2">
            <Button
              data-testid="button-issue-trial"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createTrialMutation.isPending || !title.trim() || steps.length === 0}
            >
              <Shield size={16} className="mr-2" />
              Issue Trial
            </Button>
            <Button
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

      {activeTrial && (
        <div
          data-testid={`card-trial-${activeTrial.id}`}
          className="bg-slate-900 border border-red-600/30 rounded-lg p-4 mb-6"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold">{activeTrial.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider font-bold ${STATUS_COLORS[activeTrial.status]}`}>
                  {activeTrial.status}
                </span>
                {userRole === 'sub' && activeTrial.status === 'active' && <PulseIndicator show className="ml-1" />}
              </div>
              {activeTrial.status === 'active' && countdown !== null && (
                <div className="flex items-center gap-1 text-sm">
                  <Clock size={14} className={countdown <= 60 ? 'text-red-500' : 'text-slate-400'} />
                  <span className={countdown <= 60 ? 'text-red-500 font-bold' : 'text-slate-400'}>
                    {formatTime(countdown)}
                  </span>
                </div>
              )}
            </div>
            {activeTrial.status === 'pending' && (
              <Button
                data-testid={`button-start-trial-${activeTrial.id}`}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white text-xs uppercase tracking-wider"
                onClick={() => handleStart(activeTrial.id)}
              >
                <Play size={14} className="mr-1" /> Start
              </Button>
            )}
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
            <div
              className="bg-red-600 h-2 rounded-full transition-all"
              style={{ width: `${activeTrial.totalSteps ? ((activeTrial.completedSteps || 0) / activeTrial.totalSteps) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mb-3">
            {activeTrial.completedSteps || 0} / {activeTrial.totalSteps} steps completed
          </p>

          <div className="space-y-2 mb-3">
            {trialSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-2 bg-slate-800 rounded px-3 py-2 text-sm">
                <span className="text-red-500 font-bold text-xs">{step.stepOrder}.</span>
                <span className={`flex-1 ${step.status === 'completed' ? 'text-green-400 line-through' : 'text-white'}`}>
                  {step.instruction}
                </span>
                {step.status === 'completed' ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  activeTrial.status === 'active' && userRole === 'sub' && (
                    <Button
                      data-testid={`button-complete-step-${step.id}`}
                      size="sm"
                      variant="ghost"
                      className="text-green-500 hover:text-green-400 h-6 px-2"
                      onClick={() => handleCompleteStep(step.id)}
                      disabled={updateStepMutation.isPending}
                    >
                      <Check size={14} />
                    </Button>
                  )
                )}
              </div>
            ))}
          </div>

          {activeTrial.status === 'active' && userRole === 'dom' && (
            <div className="flex gap-2 pt-3 border-t border-slate-800">
              <Button
                data-testid={`button-pass-${activeTrial.id}`}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white text-xs uppercase tracking-wider"
                onClick={() => handleResolve(activeTrial.id, 'passed')}
                disabled={updateTrialMutation.isPending}
              >
                <Trophy size={14} className="mr-1" /> Pass
              </Button>
              <Button
                data-testid={`button-fail-${activeTrial.id}`}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-wider"
                onClick={() => handleResolve(activeTrial.id, 'failed')}
                disabled={updateTrialMutation.isPending}
              >
                <XCircle size={14} className="mr-1" /> Fail
              </Button>
            </div>
          )}
        </div>
      )}

      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Trial History</h2>
      <div className="space-y-3">
        {historyTrials.length === 0 && (
          <p className="text-slate-500 text-center py-8" data-testid="text-no-trials">
            No completed trials yet.
          </p>
        )}
        {historyTrials.map((trial) => (
          <div
            key={trial.id}
            data-testid={`card-trial-${trial.id}`}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold">{trial.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider font-bold ${STATUS_COLORS[trial.status]}`}>
                  {trial.status}
                </span>
              </div>
              <span className={`text-sm font-bold ${trial.status === 'passed' ? 'text-green-500' : 'text-red-500'}`}>
                {trial.score ?? 0}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {trial.completedAt ? new Date(trial.completedAt).toLocaleDateString() : trial.createdAt ? new Date(trial.createdAt).toLocaleDateString() : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
