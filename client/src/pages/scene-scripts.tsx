import { PageBreadcrumb } from '@/components/page-breadcrumb';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, X, ChevronUp, ChevronDown, Play, Eye, Check, ArrowLeft, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import type { SceneScript, ScriptStep } from '@shared/schema';

type LocalStep = {
  id?: string;
  instruction: string;
  durationSeconds: number;
  intensity: number;
  ambientTone: string | null;
  stepOrder: number;
};

const CATEGORIES = ['warmup', 'impact', 'sensory', 'roleplay', 'bondage', 'protocol', 'custom'];
const TONES = ['calm', 'tension', 'intense', 'release'];

function intensityColor(intensity: number): string {
  if (intensity <= 3) return '#1e293b';
  if (intensity <= 6) return '#92400e';
  return '#dc2626';
}

function intensityBg(intensity: number): string {
  if (intensity <= 3) return 'bg-slate-800';
  if (intensity <= 6) return 'bg-amber-900';
  return 'bg-red-700';
}

export default function SceneScriptsPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'builder' | 'preview'>('list');
  const [editingScript, setEditingScript] = useState<SceneScript | null>(null);
  const [title, setTitle] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [category, setCategory] = useState('custom');
  const [steps, setSteps] = useState<LocalStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: scripts = [] } = useQuery<SceneScript[]>({
    queryKey: ['/api/scene-scripts'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  const { data: loadedSteps = [] } = useQuery<ScriptStep[]>({
    queryKey: ['/api/scene-scripts', editingScript?.id, 'steps'],
    queryFn: getQueryFn({ on401: 'throw' }),
    enabled: !!editingScript?.id,
  });

  useEffect(() => {
    if (loadedSteps.length > 0 && editingScript) {
      setSteps(loadedSteps.map(s => ({
        id: s.id,
        instruction: s.instruction,
        durationSeconds: s.durationSeconds,
        intensity: s.intensity,
        ambientTone: s.ambientTone,
        stepOrder: s.stepOrder,
      })).sort((a, b) => a.stepOrder - b.stepOrder));
    }
  }, [loadedSteps, editingScript]);

  const createScript = useMutation({
    mutationFn: async (data: { title: string; estimatedDuration: number; category: string }) => {
      const res = await apiRequest('POST', '/api/scene-scripts', data);
      return res.json();
    },
    onSuccess: (script: SceneScript) => {
      queryClient.invalidateQueries({ queryKey: ['/api/scene-scripts'] });
      setEditingScript(script);
      setTitle(script.title);
      setEstimatedDuration(script.estimatedDuration || 0);
      setCategory(script.category || 'custom');
      setSteps([]);
      setView('builder');
    },
  });

  const updateScript = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; estimatedDuration?: number; category?: string; status?: string }) => {
      const res = await apiRequest('PUT', `/api/scene-scripts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scene-scripts'] });
    },
  });

  const deleteScript = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/scene-scripts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scene-scripts'] });
    },
  });

  const createStep = useMutation({
    mutationFn: async ({ scriptId, ...data }: { scriptId: string; instruction: string; durationSeconds: number; intensity: number; ambientTone?: string | null; stepOrder: number }) => {
      const res = await apiRequest('POST', `/api/script-steps`, { scriptId, ...data });
      return res.json();
    },
    onSuccess: () => {
      if (editingScript) {
        queryClient.invalidateQueries({ queryKey: ['/api/scene-scripts', editingScript.id, 'steps'] });
      }
    },
  });

  const updateStep = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; instruction?: string; durationSeconds?: number; intensity?: number; ambientTone?: string | null; stepOrder?: number }) => {
      const res = await apiRequest('PUT', `/api/script-steps/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      if (editingScript) {
        queryClient.invalidateQueries({ queryKey: ['/api/scene-scripts', editingScript.id, 'steps'] });
      }
    },
  });

  const deleteStep = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/script-steps/${id}`);
    },
    onSuccess: () => {
      if (editingScript) {
        queryClient.invalidateQueries({ queryKey: ['/api/scene-scripts', editingScript.id, 'steps'] });
      }
    },
  });

  const handleCreate = () => {
    createScript.mutate({ title: 'New Script', estimatedDuration: 0, category: 'custom' });
  };

  const handleOpenScript = (script: SceneScript) => {
    setEditingScript(script);
    setTitle(script.title);
    setEstimatedDuration(script.estimatedDuration || 0);
    setCategory(script.category || 'custom');
    setSteps([]);
    setView('builder');
  };

  const handleSaveHeader = () => {
    if (!editingScript) return;
    updateScript.mutate({ id: editingScript.id, title, estimatedDuration, category });
  };

  const handleAddStep = () => {
    if (!editingScript) return;
    const newOrder = steps.length + 1;
    const newStep: LocalStep = { instruction: '', durationSeconds: 60, intensity: 5, ambientTone: null, stepOrder: newOrder };
    createStep.mutate({
      scriptId: editingScript.id,
      instruction: newStep.instruction || 'New step',
      durationSeconds: newStep.durationSeconds,
      intensity: newStep.intensity,
      ambientTone: newStep.ambientTone,
      stepOrder: newOrder,
    });
    setSteps([...steps, newStep]);
  };

  const handleUpdateLocalStep = (index: number, updates: Partial<LocalStep>) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], ...updates };
    setSteps(updated);
  };

  const handleSaveStep = (index: number) => {
    const step = steps[index];
    if (step.id) {
      updateStep.mutate({
        id: step.id,
        instruction: step.instruction,
        durationSeconds: step.durationSeconds,
        intensity: step.intensity,
        ambientTone: step.ambientTone,
        stepOrder: step.stepOrder,
      });
    }
  };

  const handleDeleteStep = (index: number) => {
    const step = steps[index];
    if (step.id) {
      deleteStep.mutate(step.id);
    }
    const updated = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepOrder: i + 1 }));
    setSteps(updated);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const updated = [...steps];
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    const reordered = updated.map((s, i) => ({ ...s, stepOrder: i + 1 }));
    setSteps(reordered);
    reordered.forEach((s) => {
      if (s.id) {
        updateStep.mutate({ id: s.id, stepOrder: s.stepOrder });
      }
    });
  };

  const handleMarkReady = () => {
    if (!editingScript) return;
    updateScript.mutate({ id: editingScript.id, status: 'ready' });
    setEditingScript({ ...editingScript, status: 'ready' });
  };

  const startPreview = useCallback(() => {
    if (steps.length === 0) return;
    setCurrentStep(0);
    setCountdown(steps[0].durationSeconds);
    setView('preview');
  }, [steps]);

  useEffect(() => {
    if (view !== 'preview') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCurrentStep(cs => {
            const next = cs + 1;
            if (next >= steps.length) {
              setView('builder');
              if (timerRef.current) clearInterval(timerRef.current);
              return cs;
            }
            setCountdown(steps[next].durationSeconds);
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [view, steps]);

  const totalDuration = steps.reduce((sum, s) => sum + s.durationSeconds, 0);

  if (view === 'preview' && steps.length > 0) {
    const step = steps[currentStep];
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6" data-testid="preview-mode">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <p className="text-slate-400 text-sm mb-2" data-testid="preview-step-indicator">
              Step {currentStep + 1} of {steps.length}
            </p>
            <p className="text-white text-4xl font-bold mb-6" data-testid="preview-instruction">
              {step.instruction || '(no instruction)'}
            </p>
            <div className="text-6xl font-mono text-red-500 mb-6" data-testid="preview-countdown">
              {countdown}s
            </div>
            {step.ambientTone && (
              <p className="text-slate-400 italic" data-testid="preview-tone">Tone: {step.ambientTone}</p>
            )}
          </div>
          <div className="w-full h-4 rounded-full overflow-hidden mb-8" style={{ backgroundColor: '#1e293b' }}>
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${(step.intensity / 10) * 100}%`,
                backgroundColor: intensityColor(step.intensity),
              }}
              data-testid="preview-intensity-bar"
            />
          </div>
          <div className="flex gap-2 mb-4">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`h-2 rounded-full flex-1 ${i === currentStep ? 'ring-2 ring-white' : ''}`}
                style={{ backgroundColor: intensityColor(s.intensity), opacity: i <= currentStep ? 1 : 0.3 }}
                data-testid={`preview-progress-${i}`}
              />
            ))}
          </div>
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 w-full"
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              setView('builder');
            }}
            data-testid="button-stop-preview"
          >
            STOP PREVIEW
          </Button>
        </div>
      </div>
    );
  }

  if (view === 'builder') {
    return (
      <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto" data-testid="script-builder">
        <PageBreadcrumb current="Scene Scripts" />
        <Button
          variant="ghost"
          className="text-slate-400 mb-4"
          onClick={() => { setView('list'); setEditingScript(null); }}
          data-testid="button-back-to-list"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Scripts
        </Button>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6" data-testid="script-header">
          <div className="space-y-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveHeader}
              placeholder="Script title"
              className="bg-slate-800 border-slate-700 text-white text-lg font-semibold"
              data-testid="input-title"
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-slate-400 block mb-1">Duration (min)</label>
                <Input
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 0)}
                  onBlur={handleSaveHeader}
                  className="bg-slate-800 border-slate-700 text-white"
                  data-testid="input-duration"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setTimeout(handleSaveHeader, 0); }}
                  className="w-full h-9 px-3 rounded-md bg-slate-800 border border-slate-700 text-white text-sm"
                  data-testid="select-category"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">Steps ({steps.length})</h2>
          <Button
            onClick={handleAddStep}
            className="bg-red-700 hover:bg-red-600 text-white"
            data-testid="button-add-step"
          >
            <Plus className="w-4 h-4 mr-1" /> ADD STEP
          </Button>
        </div>

        <div className="space-y-3 mb-6">
          {steps.map((step, index) => (
            <div
              key={step.id || index}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4"
              data-testid={`step-card-${index}`}
            >
              <div className="flex items-start gap-2 mb-3">
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-slate-500 text-xs cursor-grab" data-testid={`step-grip-${index}`}>☰</span>
                  <button
                    onClick={() => handleMoveStep(index, 'up')}
                    disabled={index === 0}
                    className="text-slate-500 hover:text-white disabled:opacity-30 text-xs"
                    data-testid={`button-move-up-${index}`}
                  >▲</button>
                  <button
                    onClick={() => handleMoveStep(index, 'down')}
                    disabled={index === steps.length - 1}
                    className="text-slate-500 hover:text-white disabled:opacity-30 text-xs"
                    data-testid={`button-move-down-${index}`}
                  >▼</button>
                </div>
                <div className="flex-1">
                  <textarea
                    value={step.instruction}
                    onChange={(e) => handleUpdateLocalStep(index, { instruction: e.target.value })}
                    onBlur={() => handleSaveStep(index)}
                    placeholder="Enter instruction..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white text-sm resize-none min-h-[60px]"
                    data-testid={`input-instruction-${index}`}
                  />
                </div>
                <button
                  onClick={() => handleDeleteStep(index)}
                  className="text-slate-500 hover:text-red-500 mt-1"
                  data-testid={`button-delete-step-${index}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3 items-end">
                <div className="w-24">
                  <label className="text-xs text-slate-400 block mb-1">Duration (s)</label>
                  <Input
                    type="number"
                    value={step.durationSeconds}
                    onChange={(e) => handleUpdateLocalStep(index, { durationSeconds: parseInt(e.target.value) || 0 })}
                    onBlur={() => handleSaveStep(index)}
                    className="bg-slate-800 border-slate-700 text-white text-sm"
                    data-testid={`input-step-duration-${index}`}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Intensity ({step.intensity}/10)</label>
                  <div className="relative h-6 rounded-full overflow-hidden bg-slate-800" data-testid={`intensity-slider-${index}`}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(step.intensity / 10) * 100}%`,
                        background: `linear-gradient(to right, #1e293b, #92400e, #dc2626)`,
                      }}
                    />
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={step.intensity}
                      onChange={(e) => handleUpdateLocalStep(index, { intensity: parseInt(e.target.value) })}
                      onMouseUp={() => handleSaveStep(index)}
                      onTouchEnd={() => handleSaveStep(index)}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      data-testid={`range-intensity-${index}`}
                    />
                  </div>
                </div>
                <div className="w-28">
                  <label className="text-xs text-slate-400 block mb-1">Tone</label>
                  <select
                    value={step.ambientTone || ''}
                    onChange={(e) => { handleUpdateLocalStep(index, { ambientTone: e.target.value || null }); setTimeout(() => handleSaveStep(index), 0); }}
                    className="w-full h-9 px-2 rounded-md bg-slate-800 border border-slate-700 text-white text-xs"
                    data-testid={`select-tone-${index}`}
                  >
                    <option value="">none</option>
                    {TONES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {steps.length > 0 && (
          <div className="mb-6" data-testid="timeline-visualization">
            <h3 className="text-slate-400 text-xs uppercase tracking-wide mb-2">Timeline</h3>
            <div className="flex h-8 rounded-lg overflow-hidden border border-slate-800">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="h-full flex items-center justify-center text-[10px] text-white/70 border-r border-slate-700 last:border-r-0 transition-all"
                  style={{
                    width: totalDuration > 0 ? `${(step.durationSeconds / totalDuration) * 100}%` : `${100 / steps.length}%`,
                    backgroundColor: intensityColor(step.intensity),
                    minWidth: '20px',
                  }}
                  title={`Step ${i + 1}: ${step.durationSeconds}s, intensity ${step.intensity}`}
                  data-testid={`timeline-block-${i}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-1">Total: {totalDuration}s ({Math.round(totalDuration / 60)}min)</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={startPreview}
            disabled={steps.length === 0}
            className="bg-slate-800 hover:bg-slate-700 text-white flex-1"
            data-testid="button-preview"
          >
            <Eye className="w-4 h-4 mr-1" /> PREVIEW
          </Button>
          <Button
            onClick={handleMarkReady}
            className="bg-green-800 hover:bg-green-700 text-white flex-1"
            data-testid="button-mark-ready"
          >
            <Check className="w-4 h-4 mr-1" /> MARK READY
          </Button>
          <Button
            onClick={() => { window.location.href = '/play-sessions'; }}
            className="bg-red-700 hover:bg-red-600 text-white flex-1"
            data-testid="button-execute"
          >
            <Play className="w-4 h-4 mr-1" /> EXECUTE
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto" data-testid="script-list">
      <PageBreadcrumb current="Scene Scripts" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white" data-testid="text-page-title">Scene Scripts</h1>
        <Button
          onClick={handleCreate}
          className="bg-red-700 hover:bg-red-600 text-white"
          data-testid="button-create-script"
        >
          <Plus className="w-4 h-4 mr-1" /> CREATE SCRIPT
        </Button>
      </div>

      {scripts.length === 0 ? (
        <div className="text-center py-16 text-slate-500" data-testid="text-empty">
          No scripts yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {scripts.map((script) => (
            <div
              key={script.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4 cursor-pointer hover:border-slate-700 transition-colors"
              onClick={() => handleOpenScript(script)}
              data-testid={`card-script-${script.id}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold" data-testid={`text-script-title-${script.id}`}>
                    {script.title}
                  </h3>
                  <div className="flex gap-3 mt-1 text-sm text-slate-400">
                    {script.estimatedDuration ? (
                      <span data-testid={`text-duration-${script.id}`}>{script.estimatedDuration} min</span>
                    ) : null}
                    {script.category && (
                      <span data-testid={`text-category-${script.id}`}>{script.category}</span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    script.status === 'ready'
                      ? 'bg-green-900 text-green-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                  data-testid={`status-badge-${script.id}`}
                >
                  {script.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}