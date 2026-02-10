import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Sparkles, Plus, X, Trash2, EyeOff, ChevronDown, ChevronUp, Check, Zap, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction } from '@/components/ui/role-gate';
import { useSensationCards, useCreateSensationCard, useDeleteSensationCard, useSensationSpins, useCreateSensationSpin, useCompleteSensationSpin, useAuth } from '@/lib/hooks';
import type { SensationCard } from '@shared/schema';

const CARD_TYPE_BADGE: Record<string, { className: string; icon?: React.ReactNode; label: string }> = {
  normal: { className: 'bg-slate-700/60 text-slate-300 border-slate-600', label: 'Normal' },
  wild: { className: 'bg-amber-500/20 text-amber-400 border-amber-500/40', icon: <Sparkles size={10} className="mr-1" />, label: 'Wild' },
  blackout: { className: 'bg-purple-900/40 text-purple-400 border-purple-600/40', icon: <EyeOff size={10} className="mr-1" />, label: 'Blackout' },
};

export default function SensationRoulettePage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';

  const { data: cards = [] } = useSensationCards();
  const { data: spins = [] } = useSensationSpins();
  const createCardMutation = useCreateSensationCard();
  const deleteCardMutation = useDeleteSensationCard();
  const createSpinMutation = useCreateSensationSpin();
  const completeSpinMutation = useCompleteSensationSpin();

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [cardType, setCardType] = useState('normal');
  const [durationMinutes, setDurationMinutes] = useState('');

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<SensationCard | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showHistory, setShowHistory] = useState(false);

  const activeCards = cards.filter(c => c.active);

  const completedSpins = spins.filter(s => s.completed);
  const currentStreak = (() => {
    let streak = 0;
    const sorted = [...spins].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    for (const s of sorted) {
      if (s.completed) streak++;
      else break;
    }
    return streak;
  })();
  const xpMultiplier = Math.min(1 + Math.floor(currentStreak / 3) * 0.5, 5);

  const handleCreate = () => {
    if (!label.trim()) return;
    createCardMutation.mutate({
      label: label.trim(),
      description: description.trim() || undefined,
      intensity,
      cardType,
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
    });
    setLabel('');
    setDescription('');
    setIntensity(3);
    setCardType('normal');
    setDurationMinutes('');
    setShowForm(false);
  };

  const handleSpin = () => {
    if (activeCards.length === 0) return;
    setIsSpinning(true);
    setSpinResult(null);
    const resultCard = activeCards[Math.floor(Math.random() * activeCards.length)];
    let count = 0;
    const interval = setInterval(() => {
      setDisplayIndex(prev => (prev + 1) % activeCards.length);
      count++;
      if (count > 20) {
        clearInterval(interval);
        setIsSpinning(false);
        setSpinResult(resultCard);
        createSpinMutation.mutate({ cardId: resultCard.id, result: resultCard.label, cardType: resultCard.cardType });
      }
    }, 100 + count * 15);
    intervalRef.current = interval;
  };

  const badge = (type: string) => {
    const b = CARD_TYPE_BADGE[type] || CARD_TYPE_BADGE.normal;
    return (
      <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded border ${b.className}`}>
        {b.icon}{b.label}
      </span>
    );
  };

  const displayCard = isSpinning && activeCards.length > 0 ? activeCards[displayIndex % activeCards.length] : null;

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

      <div className="flex items-center gap-3 mb-2">
        <RotateCcw className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">
          Sensation Roulette
        </h1>
      </div>
      <p className="text-sm text-slate-400 mb-8">
        {userRole === 'dom' ? 'Load cards and watch the wheel spin' : 'Spin the wheel and discover your fate'}
      </p>

      {/* Streak & XP Multiplier */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-2">
          <Zap size={16} className="text-yellow-500" />
          <span className="text-sm text-slate-400 uppercase tracking-wider">Streak:</span>
          <span className="text-white font-bold" data-testid="text-streak-count">{currentStreak}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          <span className="text-sm text-slate-400 uppercase tracking-wider">XP Multi:</span>
          <span className="text-amber-400 font-bold">{xpMultiplier}x</span>
        </div>
      </div>

      {/* Spin Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8 text-center">
        <div className="min-h-[120px] flex items-center justify-center mb-4">
          {isSpinning && displayCard && (
            <div className="animate-pulse">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 min-w-[200px]">
                <p className="text-white font-semibold text-lg">{displayCard.label}</p>
                {badge(displayCard.cardType)}
              </div>
            </div>
          )}
          {!isSpinning && spinResult && (
            <div data-testid="text-spin-result">
              {spinResult.cardType === 'blackout' && userRole === 'sub' ? (
                <div className="bg-purple-900/30 border border-purple-600/40 rounded-lg p-6 min-w-[240px]">
                  <EyeOff size={32} className="text-purple-400 mx-auto mb-2" />
                  <p className="text-purple-300 font-bold text-2xl">???</p>
                  <p className="text-purple-400/60 text-sm mt-1 uppercase tracking-wider">Blackout Card</p>
                </div>
              ) : spinResult.cardType === 'wild' ? (
                <div className="bg-amber-900/20 border border-amber-500/40 rounded-lg p-6 min-w-[240px]">
                  <Sparkles size={32} className="text-amber-400 mx-auto mb-2" />
                  <p className="text-amber-400 font-bold text-2xl">DOM'S CHOICE</p>
                  <p className="text-white text-lg mt-2">{spinResult.label}</p>
                  {spinResult.description && <p className="text-slate-400 text-sm mt-1">{spinResult.description}</p>}
                  <div className="mt-2 flex items-center justify-center gap-2">
                    {badge('wild')}
                    <span className="text-xs text-slate-500">Intensity: {spinResult.intensity}/5</span>
                  </div>
                  {spinResult.durationMinutes && (
                    <p className="text-xs text-slate-500 mt-1">{spinResult.durationMinutes} min</p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 min-w-[240px]">
                  <p className="text-white font-bold text-2xl">{spinResult.label}</p>
                  {spinResult.description && <p className="text-slate-400 text-sm mt-2">{spinResult.description}</p>}
                  <div className="mt-2 flex items-center justify-center gap-2">
                    {badge(spinResult.cardType)}
                    <span className="text-xs text-slate-500">Intensity: {spinResult.intensity}/5</span>
                  </div>
                  {spinResult.durationMinutes && (
                    <p className="text-xs text-slate-500 mt-1">{spinResult.durationMinutes} min</p>
                  )}
                </div>
              )}
            </div>
          )}
          {!isSpinning && !spinResult && (
            <p className="text-slate-500 uppercase tracking-wider text-sm">
              {activeCards.length === 0 ? 'No cards loaded yet' : 'Ready to spin'}
            </p>
          )}
        </div>

        <Button
          data-testid="button-spin"
          className="bg-red-600 hover:bg-red-700 text-white text-lg uppercase tracking-wider px-8 py-3 h-auto"
          disabled={activeCards.length === 0 || isSpinning}
          onClick={handleSpin}
        >
          <RotateCcw size={20} className={`mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
          {isSpinning ? 'Spinning...' : 'SPIN'}
        </Button>

        {/* Complete button for most recent uncompleted spin */}
        {spinResult && spins.length > 0 && (() => {
          const latestSpin = [...spins].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0];
          if (latestSpin && !latestSpin.completed) {
            return (
              <Button
                data-testid={`button-complete-spin-${latestSpin.id}`}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white uppercase tracking-wider"
                onClick={() => completeSpinMutation.mutate(latestSpin.id)}
                disabled={completeSpinMutation.isPending}
              >
                <Check size={16} className="mr-2" />
                Complete (+XP)
              </Button>
            );
          }
          return null;
        })()}
      </div>

      {/* Card Management */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Cards</h2>
          <RoleGatedButton
            data-testid="button-toggle-form"
            allowed={userRole === 'dom'}
            tooltipText="Only your Dom can add cards"
            className="bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={16} className="mr-1" />
            Add Card
          </RoleGatedButton>
        </div>

        {userRole === 'dom' && showForm && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-4 space-y-3">
            <div>
              <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Label</label>
              <Input
                data-testid="input-card-label"
                placeholder="Card label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Description</label>
              <Input
                data-testid="input-card-description"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">
                Intensity: {intensity}/5
              </label>
              <input
                data-testid="input-card-intensity"
                type="range"
                min={1}
                max={5}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Type</label>
              <select
                data-testid="select-card-type"
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-md p-2"
              >
                <option value="normal">Normal</option>
                <option value="wild">Wild</option>
                <option value="blackout">Blackout</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Duration (minutes, optional)</label>
              <Input
                data-testid="input-card-duration"
                type="number"
                placeholder="e.g. 10"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                data-testid="button-add-card"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleCreate}
                disabled={createCardMutation.isPending}
              >
                <Plus size={16} className="mr-2" />
                Add Card
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

        <div className="space-y-2">
          {activeCards.length === 0 && (
            <p className="text-slate-500 text-center py-4">
              {userRole === 'dom' ? 'No cards yet. Add your first sensation card.' : 'No cards loaded yet.'}
            </p>
          )}
          {activeCards.map((card) => (
            <div
              key={card.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between"
              data-testid={`card-sensation-${card.id}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold">{card.label}</span>
                  {badge(card.cardType)}
                  <span className="text-xs text-slate-500">Intensity: {card.intensity}/5</span>
                  {card.durationMinutes && (
                    <span className="text-xs text-slate-500">{card.durationMinutes}min</span>
                  )}
                </div>
                {card.description && (
                  <p className="text-slate-400 text-sm">{card.description}</p>
                )}
              </div>
              {userRole === 'dom' && (
                <Button
                  data-testid={`button-delete-card-${card.id}`}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  onClick={() => deleteCardMutation.mutate(card.id)}
                  disabled={deleteCardMutation.isPending}
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Spin History */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <button
          className="w-full p-4 flex items-center justify-between text-left"
          onClick={() => setShowHistory(!showHistory)}
          data-testid="button-toggle-history"
        >
          <span className="text-white font-bold uppercase tracking-wider text-sm">Spin History</span>
          {showHistory ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {showHistory && (
          <div className="border-t border-slate-800 p-4 space-y-2">
            {spins.length === 0 && (
              <p className="text-slate-500 text-center py-2 text-sm">No spins yet.</p>
            )}
            {[...spins]
              .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
              .slice(0, 20)
              .map((spin) => (
                <div
                  key={spin.id}
                  className="flex items-center justify-between bg-slate-800/50 rounded p-3"
                  data-testid={`card-spin-${spin.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">{spin.result}</span>
                      {badge(spin.cardType)}
                      {spin.completed ? (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Done</span>
                      ) : (
                        <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">Pending</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      {spin.xpAwarded > 0 && <span>+{spin.xpAwarded} XP</span>}
                      <span>Streak: {spin.streakCount}</span>
                      <span>{new Date(spin.createdAt!).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {!spin.completed && (
                    <Button
                      data-testid={`button-complete-spin-${spin.id}`}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs"
                      onClick={() => completeSpinMutation.mutate(spin.id)}
                      disabled={completeSpinMutation.isPending}
                    >
                      <Check size={12} className="mr-1" />
                      Complete
                    </Button>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
