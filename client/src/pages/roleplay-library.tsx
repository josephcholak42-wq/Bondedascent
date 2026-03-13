import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { useState } from 'react';
import { ArrowLeft, Clock, Flame, Theater, Shirt, ShieldAlert, Package, ChevronDown, ChevronUp, Search, Users, MessageSquareQuote, Hand, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PREBUILT_ROLEPLAY_SCRIPTS, ROLEPLAY_CATEGORIES, type RoleplayScript, type RoleplayBeat } from '@/lib/prebuilt-roleplay-scripts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

function intensityColor(intensity: number): string {
  if (intensity <= 3) return '#22c55e';
  if (intensity <= 5) return '#d4a24e';
  if (intensity <= 7) return '#e87640';
  return '#dc2626';
}

function intensityLabel(intensity: number): string {
  if (intensity <= 2) return 'Gentle';
  if (intensity <= 4) return 'Moderate';
  if (intensity <= 6) return 'Intense';
  if (intensity <= 8) return 'Very Intense';
  return 'Extreme';
}

function BeatCard({ beat, index, totalBeats }: { beat: RoleplayBeat; index: number; totalBeats: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="border rounded-lg overflow-hidden transition-all"
      style={{ borderColor: expanded ? '#e87640' : '#1e293b', backgroundColor: expanded ? '#0f0805' : '#0a0a0a' }}
      data-testid={`beat-card-${index}`}
    >
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setExpanded(!expanded)}
        data-testid={`button-expand-beat-${index}`}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ backgroundColor: '#431407', color: '#e87640' }}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{beat.phase}</p>
          <p className="text-slate-500 text-xs truncate">{beat.mood}</p>
        </div>
        <span className="text-slate-500 text-xs shrink-0">{beat.durationNote}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="bg-[#0a0a0a] border border-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#d4a24e' }} />
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#d4a24e' }}>Mood</span>
            </div>
            <p className="text-slate-300 text-sm italic" data-testid={`beat-mood-${index}`}>{beat.mood}</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="bg-[#0a0a0a] border border-red-900/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquareQuote className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-medium uppercase tracking-wider text-red-400">Dom Says</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed" data-testid={`beat-dom-dialogue-${index}`}>{beat.domDialogue}</p>
            </div>

            <div className="bg-[#0a0a0a] border border-red-900/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Hand className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-medium uppercase tracking-wider text-red-400">Dom Does</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed" data-testid={`beat-dom-action-${index}`}>{beat.domAction}</p>
            </div>

            <div className="bg-[#0a0a0a] border border-blue-900/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquareQuote className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-medium uppercase tracking-wider text-blue-400">Sub Says</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed" data-testid={`beat-sub-dialogue-${index}`}>{beat.subDialogue}</p>
            </div>

            <div className="bg-[#0a0a0a] border border-blue-900/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Hand className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-medium uppercase tracking-wider text-blue-400">Sub Does</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed" data-testid={`beat-sub-action-${index}`}>{beat.subAction}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScriptDetail({ script, onBack }: { script: RoleplayScript; onBack: () => void }) {
  const [allExpanded, setAllExpanded] = useState(false);
  const queryClient = useQueryClient();

  const deployMutation = useMutation({
    mutationFn: async () => {
      const durationMatch = script.duration.match(/(\d+)/);
      const dur = durationMatch ? parseInt(durationMatch[1]) : 30;

      const res = await apiRequest('POST', '/api/scene-scripts', {
        title: script.title,
        estimatedDuration: dur,
        category: 'roleplay',
        intensityLevel: script.intensity,
        seriousnessLevel: Math.min(10, Math.max(1, script.intensity)),
        goal: script.summary.slice(0, 200),
        playSessionId: null,
        description: `${script.category} roleplay — ${script.duration}. Setting: ${script.setting.slice(0, 100)}`,
      });
      const created = await res.json();

      for (let i = 0; i < script.beats.length; i++) {
        const beat = script.beats[i];
        const durMatch = beat.durationNote.match(/(\d+)/);
        const stepDur = durMatch ? parseInt(durMatch[1]) * 60 : 120;
        const instruction = [
          `[${beat.phase}]`,
          `MOOD: ${beat.mood}`,
          ``,
          `DOM SAYS: ${beat.domDialogue}`,
          `DOM DOES: ${beat.domAction}`,
          ``,
          `SUB SAYS: ${beat.subDialogue}`,
          `SUB DOES: ${beat.subAction}`,
        ].join('\n');

        await apiRequest('POST', '/api/script-steps', {
          scriptId: created.id,
          instruction,
          durationSeconds: stepDur,
          intensity: script.intensity,
          ambientTone: null,
          stepOrder: i + 1,
        });
      }

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scene-scripts'] });
    },
  });

  return (
    <div className="min-h-screen bg-[#030303] p-4 pb-24 max-w-2xl mx-auto" data-testid="roleplay-detail">
      <PageBreadcrumb current="Roleplay Library" />
      <Button
        variant="ghost"
        className="text-slate-400 mb-4"
        onClick={onBack}
        data-testid="button-back-from-detail"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
      </Button>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: '#431407', color: '#e87640' }}
            data-testid="text-detail-category"
          >
            {script.category}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: intensityColor(script.intensity) }}>
            <Flame className="w-3 h-3" /> {intensityLabel(script.intensity)} ({script.intensity}/10)
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2" data-testid="text-detail-title">{script.title}</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-4" data-testid="text-detail-summary">{script.summary}</p>

        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
          <span className="flex items-center gap-1" data-testid="text-detail-duration">
            <Clock className="w-3.5 h-3.5" /> {script.duration}
          </span>
          <span className="flex items-center gap-1">
            <Theater className="w-3.5 h-3.5" /> {script.beats.length} scenes
          </span>
        </div>

        <Button
          onClick={() => deployMutation.mutate()}
          disabled={deployMutation.isPending || deployMutation.isSuccess}
          className="w-full text-white font-semibold"
          style={{ backgroundColor: deployMutation.isSuccess ? '#166534' : '#e87640' }}
          data-testid="button-deploy-roleplay"
        >
          {deployMutation.isPending ? 'Deploying...' : deployMutation.isSuccess ? 'Deployed to Scene Scripts' : 'Deploy to My Scripts'}
        </Button>
      </div>

      <div className="bg-[#0a0a0a] border border-slate-800 rounded-lg p-4 mb-6" data-testid="section-setting">
        <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
          <Theater className="w-4 h-4" style={{ color: '#e87640' }} /> Setting
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">{script.setting}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-[#0a0a0a] border border-red-900/30 rounded-lg p-4" data-testid="section-dom-attire">
          <h3 className="text-red-400 font-semibold text-sm mb-2 flex items-center gap-2">
            <Shirt className="w-4 h-4" /> Dom Wears
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">{script.domAttire}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-blue-900/30 rounded-lg p-4" data-testid="section-sub-attire">
          <h3 className="text-blue-400 font-semibold text-sm mb-2 flex items-center gap-2">
            <Shirt className="w-4 h-4" /> Sub Wears
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">{script.subAttire}</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-slate-800 rounded-lg p-4 mb-6" data-testid="section-props">
        <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
          <Package className="w-4 h-4" style={{ color: '#e87640' }} /> Props Needed
        </h3>
        <div className="flex flex-wrap gap-2">
          {script.props.map((prop, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full text-xs bg-slate-900 text-slate-300 border border-slate-700"
              data-testid={`prop-${i}`}
            >
              {prop}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-yellow-900/30 rounded-lg p-4 mb-6" data-testid="section-safety">
        <h3 className="text-yellow-500 font-semibold text-sm mb-2 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> Safety Notes
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">{script.safetyNotes}</p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Users className="w-5 h-5" style={{ color: '#e87640' }} /> Scene Breakdown
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 text-xs"
          onClick={() => setAllExpanded(!allExpanded)}
          data-testid="button-toggle-all-beats"
        >
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </Button>
      </div>

      <div className="space-y-2 mb-8">
        {script.beats.map((beat, i) => (
          <BeatCard key={i} beat={beat} index={i} totalBeats={script.beats.length} />
        ))}
      </div>
    </div>
  );
}

export default function RoleplayLibraryPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScript, setSelectedScript] = useState<RoleplayScript | null>(null);

  if (selectedScript) {
    return <ScriptDetail script={selectedScript} onBack={() => setSelectedScript(null)} />;
  }

  const filtered = PREBUILT_ROLEPLAY_SCRIPTS.filter(s => {
    const matchSearch = !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.summary.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'all' || s.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-[#030303] p-4 pb-24 max-w-2xl mx-auto" data-testid="roleplay-library">
      <PageBreadcrumb current="Roleplay Library" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1" data-testid="text-page-title">
          Roleplay Library
        </h1>
        <p className="text-slate-400 text-sm">
          Fully scripted scenes with dialogue, outfits, actions, and detailed direction for both partners.
        </p>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scenes..."
            className="pl-9 bg-slate-900 border-slate-700 text-white"
            data-testid="input-roleplay-search"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'text-white'
              : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-500'
          }`}
          style={selectedCategory === 'all' ? { backgroundColor: '#e87640' } : undefined}
          data-testid="filter-all"
        >
          All
        </button>
        {ROLEPLAY_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? 'text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-500'
            }`}
            style={selectedCategory === cat ? { backgroundColor: '#e87640' } : undefined}
            data-testid={`filter-${cat.toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((script) => (
          <div
            key={script.id}
            className="bg-[#0a0a0a] border border-slate-800 rounded-lg p-4 cursor-pointer hover:border-[#e87640]/40 transition-all active:scale-[0.99]"
            onClick={() => setSelectedScript(script)}
            data-testid={`card-roleplay-${script.id}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg" data-testid={`text-title-${script.id}`}>
                  {script.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: '#431407', color: '#e87640' }}
                  >
                    {script.category}
                  </span>
                  <span className="text-slate-500 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {script.duration}
                  </span>
                  <span className="text-xs flex items-center gap-1" style={{ color: intensityColor(script.intensity) }}>
                    <Flame className="w-3 h-3" /> {script.intensity}/10
                  </span>
                  <span className="text-slate-500 text-xs flex items-center gap-1">
                    <Theater className="w-3 h-3" /> {script.beats.length} scenes
                  </span>
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2" data-testid={`text-summary-${script.id}`}>
              {script.summary}
            </p>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <Shirt className="w-3 h-3 text-red-400" />
                <span className="text-slate-500 text-xs truncate max-w-[140px]">Dom: {script.domAttire.split('.')[0]}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shirt className="w-3 h-3 text-blue-400" />
                <span className="text-slate-500 text-xs truncate max-w-[140px]">Sub: {script.subAttire.split('.')[0]}</span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500" data-testid="text-no-results">
            No roleplay scenes match your search.
          </div>
        )}
      </div>
    </div>
  );
}
