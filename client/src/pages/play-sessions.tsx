import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Play, Plus, Clock, Check, Search, Flame, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction, PulseIndicator } from '@/components/ui/role-gate';
import { usePlaySessions, useCreatePlaySession, useUpdatePlaySession, useAuth } from '@/lib/hooks';
import { PREBUILT_SCENES, SCENE_CATEGORIES, type PrebuiltScene } from '@/lib/prebuilt-scenes';

export default function PlaySessionsPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: sessions = [] } = usePlaySessions();
  const createMutation = useCreatePlaySession();
  const updateMutation = useUpdatePlaySession();

  const [sceneSearch, setSceneSearch] = useState('');
  const [sceneCategoryFilter, setSceneCategoryFilter] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState('excited');
  const [intensity, setIntensity] = useState(5);
  const [activitiesInput, setActivitiesInput] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');

  const handleCreateFromPrebuilt = (scene: PrebuiltScene) => {
    createMutation.mutate({
      title: scene.name,
      notes: `Category: ${scene.category}\nSuggested Duration: ${scene.duration}\nActivities: ${scene.activities.join(', ')}`,
      mood: scene.intensity >= 7 ? 'intense' : scene.intensity >= 4 ? 'excited' : 'relaxed',
      intensity: scene.intensity,
      activities: scene.activities,
      status: 'planned',
    });
  };

  const handleCreateCustom = () => {
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
    setShowCustomForm(false);
  };

  const handleComplete = (id: string) => {
    updateMutation.mutate({
      id,
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
  };

  const filteredScenes = PREBUILT_SCENES
    .filter(s => !sceneCategoryFilter || s.category === sceneCategoryFilter)
    .filter(s => !sceneSearch || s.name.toLowerCase().includes(sceneSearch.toLowerCase()) || s.activities.some(a => a.toLowerCase().includes(sceneSearch.toLowerCase())));

  const plannedSessions = sessions.filter(s => s.status !== 'completed');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  function IntensityDots({ level }: { level: number }) {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i < level
                ? level >= 8
                  ? 'bg-red-500'
                  : level >= 5
                  ? 'bg-amber-500'
                  : 'bg-green-500'
                : 'bg-slate-800'
            }`}
          />
        ))}
      </div>
    );
  }

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
            {userRole === 'dom' ? 'Scene Builder' : 'Scheduled Sessions'}
          </h1>
        </div>
      </div>
      <p className="text-sm text-slate-400 mb-8" data-testid="text-page-description">
        {userRole === 'dom' ? 'Browse and build scenes from 100+ prebuilt scenarios' : 'Sessions planned by your Dom'}
      </p>

      {userRole === 'dom' && (
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              data-testid="input-scene-search"
              type="text"
              value={sceneSearch}
              onChange={(e) => setSceneSearch(e.target.value)}
              placeholder="Search scenes or activities..."
              className="w-full bg-black/40 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              style={{ fontSize: '16px' }}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              data-testid="button-scene-cat-all"
              onClick={() => setSceneCategoryFilter(null)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${!sceneCategoryFilter ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              All
            </button>
            {SCENE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                data-testid={`button-scene-cat-${cat.toLowerCase().replace(/\s/g, '-')}`}
                onClick={() => setSceneCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${sceneCategoryFilter === cat ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="max-h-[45vh] overflow-y-auto space-y-1.5 pr-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            {filteredScenes.map((scene, i) => (
              <button
                key={i}
                data-testid={`button-prebuilt-scene-${i}`}
                onClick={() => handleCreateFromPrebuilt(scene)}
                className="w-full flex items-center gap-3 p-3 bg-red-950/10 border border-red-900/20 hover:bg-red-900/30 hover:border-red-500/40 rounded-xl transition-all cursor-pointer group text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-red-400 font-semibold group-hover:text-white transition-colors truncate">
                    {scene.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-slate-600 uppercase">{scene.category}</span>
                    <span className="text-[9px] text-slate-600">•</span>
                    <span className="text-[9px] text-red-500/60 flex items-center gap-0.5">
                      <Clock size={8} />{scene.duration}
                    </span>
                    <span className="text-[9px] text-slate-600">•</span>
                    <IntensityDots level={scene.intensity} />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {scene.activities.slice(0, 4).map((a, j) => (
                      <span key={j} className="text-[8px] bg-slate-800/80 text-slate-500 px-1.5 py-0.5 rounded">
                        {a}
                      </span>
                    ))}
                    {scene.activities.length > 4 && (
                      <span className="text-[8px] text-slate-600">+{scene.activities.length - 4}</span>
                    )}
                  </div>
                </div>
                <Flame size={12} className="text-red-900 group-hover:text-red-400 transition-colors shrink-0" />
              </button>
            ))}
            {filteredScenes.length === 0 && (
              <div className="text-center py-6 text-slate-600 text-xs">
                No scenes match your search
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-3">
            <button
              data-testid="button-toggle-custom-form"
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 cursor-pointer hover:text-slate-300 transition-colors"
            >
              <Plus size={12} />
              Custom Session
              {showCustomForm ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {showCustomForm && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4" data-testid="form-create-session">
                <div>
                  <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Title</label>
                  <Input
                    data-testid="input-title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Session title"
                    className="bg-slate-800 border-slate-700 text-white"
                    style={{ fontSize: '16px' }}
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
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Mood</label>
                    <select
                      data-testid="select-mood"
                      value={mood}
                      onChange={e => setMood(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-md p-2"
                      style={{ fontSize: '16px' }}
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
                      className="w-full accent-red-600 mt-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Activities (comma-separated)</label>
                  <Input
                    data-testid="input-activities"
                    value={activitiesInput}
                    onChange={e => setActivitiesInput(e.target.value)}
                    placeholder="e.g. bondage, roleplay, impact"
                    className="bg-slate-800 border-slate-700 text-white"
                    style={{ fontSize: '16px' }}
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
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    data-testid="button-create-session"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleCreateCustom}
                    disabled={createMutation.isPending}
                  >
                    Create Session
                  </Button>
                  <Button
                    data-testid="button-cancel-form"
                    variant="ghost"
                    className="text-slate-400"
                    onClick={() => setShowCustomForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {plannedSessions.length > 0 && (
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">
            {userRole === 'dom' ? 'Planned Sessions' : 'Upcoming Sessions'}
          </h3>
        )}
        {plannedSessions.map(session => (
          <div
            key={session.id}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4"
            data-testid={`card-session-${session.id}`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wide flex-1 min-w-0 truncate" data-testid={`text-title-${session.id}`}>
                {session.title || 'Untitled Session'}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {userRole === 'sub' && session.status === 'planned' && <PulseIndicator show className="ml-1" />}
                <span
                  className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                    session.status === 'planned' ? 'text-blue-500 border-blue-500 bg-blue-500/20' :
                    session.status === 'active' ? 'text-green-500 border-green-500 bg-green-500/20' :
                    'text-slate-500 border-slate-500 bg-slate-500/20'
                  }`}
                  data-testid={`text-status-${session.id}`}
                >
                  {session.status}
                </span>
              </div>
            </div>

            {session.intensity != null && (
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        session.intensity >= 8 ? 'bg-red-500' : session.intensity >= 5 ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(session.intensity / 10) * 100}%` }}
                      data-testid={`bar-intensity-${session.id}`}
                    />
                  </div>
                  <span className="text-white text-[10px] font-mono w-6 text-right">{session.intensity}/10</span>
                </div>
              </div>
            )}

            {session.activities && session.activities.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2" data-testid={`tags-activities-${session.id}`}>
                {session.activities.map((act, i) => (
                  <span key={i} className="bg-slate-800 text-slate-300 text-[9px] px-2 py-0.5 rounded uppercase">
                    {act}
                  </span>
                ))}
              </div>
            )}

            {session.mood && (
              <div className="text-[10px] text-slate-500 mb-1" data-testid={`text-mood-${session.id}`}>
                Mood: <span className="text-slate-300 capitalize">{session.mood}</span>
              </div>
            )}

            {session.scheduledFor && (
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-2" data-testid={`text-scheduled-${session.id}`}>
                <Clock size={10} />
                {new Date(session.scheduledFor).toLocaleDateString()}
              </div>
            )}

            {session.notes && (
              <div className="text-[10px] text-slate-600 mt-1 line-clamp-2">{session.notes}</div>
            )}

            {session.status !== 'completed' && (
              <RoleGatedAction allowed={userRole === 'dom'} tooltipText="Only your Dom can complete sessions">
                <Button data-testid={`button-complete-${session.id}`} variant="outline" size="sm" className="border-green-600 text-green-500 hover:bg-green-600 hover:text-white mt-3 text-[10px] uppercase tracking-wider" onClick={() => handleComplete(session.id)} disabled={updateMutation.isPending}>
                  <Check size={12} className="mr-1" /> Complete
                </Button>
              </RoleGatedAction>
            )}
          </div>
        ))}

        {completedSessions.length > 0 && (
          <>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-6">
              Completed Sessions
            </h3>
            {completedSessions.map(session => (
              <div
                key={session.id}
                className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-4 opacity-50"
                data-testid={`card-session-${session.id}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-green-500 font-semibold text-sm uppercase tracking-wide line-through flex-1 min-w-0 truncate" data-testid={`text-title-${session.id}`}>
                    {session.title || 'Untitled Session'}
                  </h3>
                  <Check size={16} className="text-green-500 shrink-0 ml-2" />
                </div>
                {session.activities && session.activities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {session.activities.map((act, i) => (
                      <span key={i} className="bg-slate-800/50 text-slate-500 text-[8px] px-1.5 py-0.5 rounded uppercase">{act}</span>
                    ))}
                  </div>
                )}
                {session.completedAt && (
                  <div className="text-[9px] text-slate-600 mt-1" data-testid={`text-completed-at-${session.id}`}>
                    Completed: {new Date(session.completedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {sessions.length === 0 && (
          <div className="text-center text-slate-500 py-12" data-testid="text-empty-state">
            {userRole === 'sub' ? 'No sessions planned yet.' : 'No sessions yet. Browse scenes above or create a custom one!'}
          </div>
        )}
      </div>
    </div>
  );
}
