import React, { useState, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Sparkles, Plus, X, Trash2, EyeOff, ChevronDown, ChevronUp, Check, Zap, RotateCcw, Search, Library, Flame, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSensationCards, useCreateSensationCard, useDeleteSensationCard, useSensationSpins, useCreateSensationSpin, useCompleteSensationSpin, useAuth } from '@/lib/hooks';
import { PREBUILT_SENSATIONS, SENSATION_CATEGORIES, type PrebuiltSensation } from '@/lib/prebuilt-sensations';
import type { SensationCard } from '@shared/schema';

const CARD_TYPE_BADGE: Record<string, { className: string; icon?: React.ReactNode; label: string }> = {
  normal: { className: 'bg-slate-700/60 text-slate-300 border-slate-600', label: 'Normal' },
  wild: { className: 'bg-amber-500/20 text-amber-400 border-amber-500/40', icon: <Sparkles size={10} className="mr-1" />, label: 'Wild' },
  blackout: { className: 'bg-purple-900/40 text-purple-400 border-purple-600/40', icon: <EyeOff size={10} className="mr-1" />, label: 'Blackout' },
};

const INTENSITY_COLORS = [
  'text-green-400',
  'text-lime-400',
  'text-yellow-400',
  'text-orange-400',
  'text-red-500',
];

function IntensityDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Flame
          key={i}
          size={10}
          className={i <= level ? INTENSITY_COLORS[level - 1] : 'text-slate-700'}
          fill={i <= level ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

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
  const [showLibrary, setShowLibrary] = useState(false);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [cardType, setCardType] = useState('normal');
  const [durationMinutes, setDurationMinutes] = useState('');

  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryCategory, setLibraryCategory] = useState<string | null>(null);
  const [libraryIntensityFilter, setLibraryIntensityFilter] = useState<number | null>(null);
  const [libraryTypeFilter, setLibraryTypeFilter] = useState<string | null>(null);

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<SensationCard | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [showActiveCards, setShowActiveCards] = useState(true);

  const activeCards = cards.filter(c => c.active);
  const activeCardLabels = new Set(activeCards.map(c => c.label.toLowerCase()));

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

  const filteredLibrary = useMemo(() => {
    return PREBUILT_SENSATIONS.filter(s => {
      if (libraryCategory && s.category !== libraryCategory) return false;
      if (libraryIntensityFilter && s.intensity !== libraryIntensityFilter) return false;
      if (libraryTypeFilter && s.cardType !== libraryTypeFilter) return false;
      if (librarySearch) {
        const q = librarySearch.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [librarySearch, libraryCategory, libraryIntensityFilter, libraryTypeFilter]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of SENSATION_CATEGORIES) {
      counts[cat] = PREBUILT_SENSATIONS.filter(s => s.category === cat).length;
    }
    return counts;
  }, []);

  const parseDurationToMinutes = (duration: string): number | undefined => {
    const lower = duration.toLowerCase();
    const num = parseFloat(duration);
    if (isNaN(num)) return undefined;
    if (lower.includes('hour')) return Math.round(num * 60);
    if (lower.includes('min')) return Math.round(num);
    return Math.round(num);
  };

  const handleAddFromLibrary = (sensation: PrebuiltSensation) => {
    createCardMutation.mutate({
      label: sensation.name,
      description: `Category: ${sensation.category}\nDuration: ${sensation.duration}`,
      intensity: sensation.intensity,
      cardType: sensation.cardType,
      durationMinutes: parseDurationToMinutes(sensation.duration),
    });
  };

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
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 max-w-2xl mx-auto pb-20">
      <PageBreadcrumb current="Sensation Roulette" />

      <div className="flex items-center gap-3 mb-2">
        <RotateCcw className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">
          Sensation Roulette
        </h1>
      </div>
      <p className="text-sm text-slate-400 mb-6">
        {userRole === 'dom' ? 'Load cards from the library or create your own, then spin' : 'Spin the wheel and discover your fate'}
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
          <Zap size={14} className="text-yellow-500" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">Streak:</span>
          <span className="text-white font-bold text-sm" data-testid="text-streak-count">{currentStreak}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
          <Sparkles size={14} className="text-amber-400" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">XP Multi:</span>
          <span className="text-amber-400 font-bold text-sm">{xpMultiplier}x</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
          <RotateCcw size={14} className="text-red-500" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">Cards:</span>
          <span className="text-white font-bold text-sm">{activeCards.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
          <Check size={14} className="text-green-500" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">Completed:</span>
          <span className="text-green-400 font-bold text-sm">{spins.filter(s => s.completed).length}</span>
        </div>
      </div>

      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 mb-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.05),transparent_70%)]" />
        <div className="relative">
          <div className="min-h-[140px] flex items-center justify-center mb-4">
            {isSpinning && displayCard && (
              <div className="animate-pulse">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 min-w-[220px]">
                  <p className="text-white font-semibold text-lg">{displayCard.label}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {badge(displayCard.cardType)}
                    <IntensityDots level={displayCard.intensity} />
                  </div>
                </div>
              </div>
            )}
            {!isSpinning && spinResult && (
              <div data-testid="text-spin-result">
                {spinResult.cardType === 'blackout' && userRole === 'sub' ? (
                  <div className="bg-purple-900/30 border border-purple-600/40 rounded-xl p-6 min-w-[260px]">
                    <EyeOff size={36} className="text-purple-400 mx-auto mb-3" />
                    <p className="text-purple-300 font-bold text-2xl">???</p>
                    <p className="text-purple-400/60 text-sm mt-1 uppercase tracking-wider">Blackout Card</p>
                    <p className="text-purple-400/40 text-xs mt-2">Your Dom knows what awaits...</p>
                  </div>
                ) : spinResult.cardType === 'wild' ? (
                  <div className="bg-amber-900/20 border border-amber-500/40 rounded-xl p-6 min-w-[260px]">
                    <Sparkles size={36} className="text-amber-400 mx-auto mb-3" />
                    <p className="text-amber-400 font-bold text-2xl">DOM'S CHOICE</p>
                    <p className="text-white text-lg mt-2">{spinResult.label}</p>
                    {spinResult.description && <p className="text-slate-400 text-sm mt-1">{spinResult.description}</p>}
                    <div className="mt-3 flex items-center justify-center gap-3">
                      {badge('wild')}
                      <IntensityDots level={spinResult.intensity} />
                    </div>
                    {spinResult.durationMinutes && (
                      <p className="text-xs text-slate-500 mt-2 flex items-center justify-center gap-1">
                        <Clock size={10} /> {spinResult.durationMinutes} min
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 min-w-[260px]">
                    <p className="text-white font-bold text-2xl">{spinResult.label}</p>
                    {spinResult.description && <p className="text-slate-400 text-sm mt-2">{spinResult.description}</p>}
                    <div className="mt-3 flex items-center justify-center gap-3">
                      {badge(spinResult.cardType)}
                      <IntensityDots level={spinResult.intensity} />
                    </div>
                    {spinResult.durationMinutes && (
                      <p className="text-xs text-slate-500 mt-2 flex items-center justify-center gap-1">
                        <Clock size={10} /> {spinResult.durationMinutes} min
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            {!isSpinning && !spinResult && (
              <div className="text-center">
                <RotateCcw size={48} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 uppercase tracking-wider text-sm">
                  {activeCards.length === 0 ? 'Load cards from the library to begin' : 'Ready to spin'}
                </p>
                {activeCards.length > 0 && (
                  <p className="text-slate-600 text-xs mt-1">{activeCards.length} card{activeCards.length !== 1 ? 's' : ''} in the deck</p>
                )}
              </div>
            )}
          </div>

          <Button
            data-testid="button-spin"
            className="bg-red-600 hover:bg-red-700 text-white text-lg uppercase tracking-wider px-10 py-3 h-auto shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] transition-shadow"
            disabled={activeCards.length === 0 || isSpinning}
            onClick={handleSpin}
          >
            <RotateCcw size={20} className={`mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? 'Spinning...' : 'SPIN'}
          </Button>

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
      </div>

      {userRole === 'dom' && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Button
              data-testid="button-toggle-library"
              className={`uppercase tracking-wider text-sm ${showLibrary ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
              onClick={() => { setShowLibrary(!showLibrary); setShowForm(false); }}
            >
              <Library size={16} className="mr-2" />
              Sensation Library ({PREBUILT_SENSATIONS.length})
            </Button>
            <Button
              data-testid="button-toggle-custom"
              className={`uppercase tracking-wider text-sm ${showForm ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
              onClick={() => { setShowForm(!showForm); setShowLibrary(false); }}
            >
              <Plus size={16} className="mr-2" />
              Custom Card
            </Button>
          </div>

          {showLibrary && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4">
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  data-testid="input-library-search"
                  placeholder="Search sensations..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  data-testid="button-category-all"
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${!libraryCategory ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  onClick={() => setLibraryCategory(null)}
                >
                  All ({PREBUILT_SENSATIONS.length})
                </button>
                {SENSATION_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    data-testid={`button-category-${cat.toLowerCase().replace(/\s/g, '-')}`}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${libraryCategory === cat ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    onClick={() => setLibraryCategory(libraryCategory === cat ? null : cat)}
                  >
                    {cat} ({categoryCounts[cat]})
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider self-center mr-1">Intensity:</span>
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    data-testid={`button-intensity-${i}`}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${libraryIntensityFilter === i ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    onClick={() => setLibraryIntensityFilter(libraryIntensityFilter === i ? null : i)}
                  >
                    {i}/5
                  </button>
                ))}
                <span className="text-[10px] text-slate-500 uppercase tracking-wider self-center mx-1">Type:</span>
                {(['normal', 'wild', 'blackout'] as const).map(t => (
                  <button
                    key={t}
                    data-testid={`button-type-${t}`}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${libraryTypeFilter === t ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    onClick={() => setLibraryTypeFilter(libraryTypeFilter === t ? null : t)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-500 mb-2">
                {filteredLibrary.length} sensation{filteredLibrary.length !== 1 ? 's' : ''} found
                {(librarySearch || libraryCategory || libraryIntensityFilter || libraryTypeFilter) && (
                  <button
                    data-testid="button-clear-filters"
                    className="ml-2 text-red-400 hover:text-red-300 underline"
                    onClick={() => { setLibrarySearch(''); setLibraryCategory(null); setLibraryIntensityFilter(null); setLibraryTypeFilter(null); }}
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-1.5 scrollbar-thin">
                {filteredLibrary.map((sensation, idx) => {
                  const alreadyAdded = activeCardLabels.has(sensation.name.toLowerCase());
                  return (
                    <button
                      key={idx}
                      data-testid={`button-add-prebuilt-${idx}`}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${alreadyAdded ? 'bg-green-900/10 border-green-800/30 opacity-60' : 'bg-slate-800/50 border-slate-700/50 hover:border-red-600/40 hover:bg-slate-800 active:scale-[0.98]'} cursor-pointer`}
                      onClick={() => !alreadyAdded && handleAddFromLibrary(sensation)}
                      disabled={alreadyAdded || createCardMutation.isPending}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${alreadyAdded ? 'text-green-400' : 'text-white'} leading-tight`}>
                            {sensation.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[10px] bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {sensation.category}
                            </span>
                            {badge(sensation.cardType)}
                            <IntensityDots level={sensation.intensity} />
                            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                              <Clock size={8} /> {sensation.duration}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          {alreadyAdded ? (
                            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded uppercase font-bold">Added</span>
                          ) : (
                            <span className="text-[10px] bg-red-600/20 text-red-400 px-2 py-1 rounded uppercase font-bold group-hover:bg-red-600 group-hover:text-white">+ Add</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {showForm && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Create Custom Card</h3>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Label</label>
                <Input
                  data-testid="input-card-label"
                  placeholder="e.g. Blindfolded taste test"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Description</label>
                <Input
                  data-testid="input-card-description"
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                  Intensity: {intensity}/5
                </label>
                <div className="flex items-center gap-3">
                  <input
                    data-testid="input-card-intensity"
                    type="range"
                    min={1}
                    max={5}
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="flex-1 accent-red-600"
                  />
                  <IntensityDots level={intensity} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Type</label>
                <div className="flex gap-2">
                  {(['normal', 'wild', 'blackout'] as const).map(t => (
                    <button
                      key={t}
                      data-testid={`select-type-${t}`}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${cardType === t ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                      onClick={() => setCardType(t)}
                    >
                      {t === 'wild' && <Sparkles size={10} className="inline mr-1" />}
                      {t === 'blackout' && <EyeOff size={10} className="inline mr-1" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Duration (minutes, optional)</label>
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
                  className="bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
                  onClick={handleCreate}
                  disabled={createCardMutation.isPending}
                >
                  <Plus size={16} className="mr-2" />
                  Add Card
                </Button>
                <Button
                  data-testid="button-cancel-custom"
                  variant="ghost"
                  className="text-slate-400 hover:text-white"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <button
          className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-t-xl"
          onClick={() => setShowActiveCards(!showActiveCards)}
          data-testid="button-toggle-active-cards"
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-bold uppercase tracking-wider text-sm">Active Deck</span>
            <span className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full font-bold">{activeCards.length}</span>
          </div>
          {showActiveCards ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {showActiveCards && (
          <div className="bg-slate-900/50 border border-t-0 border-slate-800 rounded-b-xl p-3 space-y-1.5">
            {activeCards.length === 0 && (
              <p className="text-slate-500 text-center py-6 text-sm">
                {userRole === 'dom' ? 'No cards yet. Browse the library or create a custom card.' : 'No cards loaded yet. Your Dom will add some.'}
              </p>
            )}
            {activeCards.map((card) => (
              <div
                key={card.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 flex items-center justify-between"
                data-testid={`card-sensation-${card.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-white font-semibold text-sm">{card.label}</span>
                    {badge(card.cardType)}
                    <IntensityDots level={card.intensity} />
                    {card.durationMinutes && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                        <Clock size={8} /> {card.durationMinutes}min
                      </span>
                    )}
                  </div>
                  {card.description && (
                    <p className="text-slate-500 text-xs truncate">{card.description}</p>
                  )}
                </div>
                {userRole === 'dom' && (
                  <Button
                    data-testid={`button-delete-card-${card.id}`}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0 ml-2"
                    onClick={() => deleteCardMutation.mutate(card.id)}
                    disabled={deleteCardMutation.isPending}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <button
          className="w-full p-4 flex items-center justify-between text-left"
          onClick={() => setShowHistory(!showHistory)}
          data-testid="button-toggle-history"
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-bold uppercase tracking-wider text-sm">Spin History</span>
            <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full font-bold">{spins.length}</span>
          </div>
          {showHistory ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {showHistory && (
          <div className="border-t border-slate-800 p-4 space-y-2">
            {spins.length === 0 && (
              <p className="text-slate-500 text-center py-4 text-sm">No spins yet. Load some cards and start spinning!</p>
            )}
            {[...spins]
              .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
              .slice(0, 30)
              .map((spin) => (
                <div
                  key={spin.id}
                  className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3"
                  data-testid={`card-spin-${spin.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white text-sm font-medium">{spin.result}</span>
                      {badge(spin.cardType)}
                      {spin.completed ? (
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold uppercase">Done</span>
                      ) : (
                        <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">Pending</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                      {spin.xpAwarded > 0 && <span className="text-amber-400">+{spin.xpAwarded} XP</span>}
                      <span>Streak: {spin.streakCount}</span>
                      <span>{new Date(spin.createdAt!).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {!spin.completed && (
                    <Button
                      data-testid={`button-complete-spin-${spin.id}`}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs flex-shrink-0 ml-2"
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
