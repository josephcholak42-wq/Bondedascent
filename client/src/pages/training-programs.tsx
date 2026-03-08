import { PageBreadcrumb } from '@/components/page-breadcrumb';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { useAuth } from '@/lib/hooks';
import type { TrainingProgram, TrainingDay, TrainingEnrollment } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PREBUILT_PROGRAMS = [
  {
    title: 'Obedience Foundations',
    description: 'A 7-day introduction to the core principles of obedience and structure.',
    durationDays: 7,
    category: 'foundations',
    days: Array.from({ length: 7 }, (_, i) => ({
      dayNumber: i + 1,
      title: `Day ${i + 1}: ${['Awareness', 'Posture & Presence', 'Active Listening', 'Prompt Response', 'Patience', 'Consistency', 'Integration'][i]}`,
      objectives: [
        'Practice mindful awareness of your actions and reactions throughout the day.',
        'Maintain proper posture and present yourself with intention in every interaction.',
        'Listen fully before responding. Repeat back instructions to confirm understanding.',
        'Respond promptly to all requests without hesitation or delay.',
        'Practice patience in moments of waiting. Accept timing that is not your own.',
        'Maintain all previous lessons consistently throughout the day.',
        'Integrate all foundations into a unified daily practice.',
      ][i],
    })),
  },
  {
    title: 'Deepening Submission',
    description: 'A 14-day program to deepen trust, surrender, and connection.',
    durationDays: 14,
    category: 'intermediate',
    days: Array.from({ length: 14 }, (_, i) => ({
      dayNumber: i + 1,
      title: `Day ${i + 1}`,
      objectives: `Focus on deepening your practice through structured exercises and reflection. Today's theme: ${['Trust Building', 'Vulnerability', 'Surrender', 'Gratitude', 'Service', 'Devotion', 'Endurance', 'Communication', 'Anticipation', 'Ritual', 'Discipline', 'Connection', 'Reflection', 'Commitment'][i]}.`,
    })),
  },
  {
    title: 'Complete Protocol Training',
    description: 'A comprehensive 30-day protocol covering all aspects of structured submission.',
    durationDays: 30,
    category: 'advanced',
    days: Array.from({ length: 30 }, (_, i) => ({
      dayNumber: i + 1,
      title: `Day ${i + 1}`,
      objectives: `Complete protocol training day ${i + 1}. Focus on mastery and refinement of all learned principles.`,
    })),
  },
];

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div data-testid="progress-bar-track" className="w-full h-2 rounded-full" style={{ backgroundColor: '#1a1a1a' }}>
      <div
        data-testid="progress-bar-fill"
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: '#dc143c' }}
      />
    </div>
  );
}

function ProgramsList({
  programs,
  enrollments,
  userRole,
  onCreateClick,
  onEnroll,
  onViewTraining,
  onSeedProgram,
}: {
  programs: TrainingProgram[];
  enrollments: TrainingEnrollment[];
  userRole: string;
  onCreateClick: () => void;
  onEnroll: (programId: string) => void;
  onViewTraining: (enrollment: TrainingEnrollment) => void;
  onSeedProgram: (index: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 data-testid="text-programs-heading" className="text-xl font-bold" style={{ color: '#e0e0e0' }}>Training Programs</h2>
        {userRole === 'dom' && (
          <Button
            data-testid="button-create-program"
            onClick={onCreateClick}
            className="font-bold tracking-wider"
            style={{ backgroundColor: '#dc143c', color: '#fff' }}
          >
            CREATE PROGRAM
          </Button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {PREBUILT_PROGRAMS.map((p, i) => (
          <Button
            key={i}
            data-testid={`button-seed-program-${i}`}
            variant="outline"
            size="sm"
            onClick={() => onSeedProgram(i)}
            style={{ borderColor: '#333', color: '#aaa', backgroundColor: '#111' }}
          >
            + {p.title}
          </Button>
        ))}
      </div>

      {programs.length === 0 && (
        <div data-testid="text-no-programs" className="text-center py-12" style={{ color: '#555' }}>
          No training programs yet. Create one or use a prebuilt template above.
        </div>
      )}

      <div className="grid gap-4">
        {programs.map((program) => {
          const enrollment = enrollments.find((e) => e.programId === program.id);
          return (
            <div
              key={program.id}
              data-testid={`card-program-${program.id}`}
              className="rounded-lg p-5 border"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#222' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 data-testid={`text-program-title-${program.id}`} className="text-lg font-bold" style={{ color: '#e0e0e0' }}>
                    {program.title}
                  </h3>
                  <div className="flex gap-3 mt-1 text-sm" style={{ color: '#888' }}>
                    <span data-testid={`text-program-duration-${program.id}`}>{program.durationDays} days</span>
                    {program.category && <span data-testid={`text-program-category-${program.id}`}>• {program.category}</span>}
                  </div>
                </div>
                <span
                  data-testid={`text-program-status-${program.id}`}
                  className="text-xs font-bold uppercase px-2 py-1 rounded"
                  style={{
                    backgroundColor: program.status === 'active' ? 'rgba(220,20,60,0.15)' : 'rgba(100,100,100,0.15)',
                    color: program.status === 'active' ? '#dc143c' : '#666',
                  }}
                >
                  {program.status}
                </span>
              </div>
              {program.description && (
                <p data-testid={`text-program-desc-${program.id}`} className="text-sm mb-3" style={{ color: '#777' }}>
                  {program.description}
                </p>
              )}
              {enrollment && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs" style={{ color: '#888' }}>
                    <span>Day {enrollment.currentDay} of {program.durationDays}</span>
                    <span>{Math.round(((enrollment.currentDay - 1) / program.durationDays) * 100)}%</span>
                  </div>
                  <ProgressBar current={enrollment.currentDay - 1} total={program.durationDays} />
                  <Button
                    data-testid={`button-view-training-${program.id}`}
                    size="sm"
                    className="mt-2 font-bold"
                    style={{ backgroundColor: '#dc143c', color: '#fff' }}
                    onClick={() => onViewTraining(enrollment)}
                  >
                    CONTINUE TRAINING
                  </Button>
                </div>
              )}
              {!enrollment && program.status === 'active' && (
                <Button
                  data-testid={`button-enroll-${program.id}`}
                  size="sm"
                  className="mt-2 font-bold"
                  style={{ backgroundColor: '#222', color: '#dc143c', border: '1px solid #dc143c' }}
                  onClick={() => onEnroll(program.id)}
                >
                  ENROLL
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgramBuilder({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [category, setCategory] = useState('');
  const [days, setDays] = useState<{ title: string; objectives: string }[]>([]);
  const [programId, setProgramId] = useState<string | null>(null);
  const qc = useQueryClient();

  const createProgramMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; durationDays: number; category: string }) => {
      const res = await apiRequest('POST', '/api/training-programs', data);
      return res.json() as Promise<TrainingProgram>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/training-programs'] });
    },
  });

  const createDayMutation = useMutation({
    mutationFn: async (data: { programId: string; dayNumber: number; title: string; objectives: string }) => {
      const res = await apiRequest('POST', `/api/training-days`, data);
      return res.json() as Promise<TrainingDay>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/training-programs'] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('PUT', `/api/training-programs/${id}`, { status: 'active' });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/training-programs'] });
    },
  });

  const handleGenerateDays = () => {
    setDays(
      Array.from({ length: durationDays }, (_, i) => ({
        title: `Day ${i + 1}`,
        objectives: '',
      }))
    );
  };

  const handleSaveProgram = async () => {
    if (!title.trim()) return;
    const program = await createProgramMutation.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      durationDays,
      category: category.trim() || 'general',
    });
    setProgramId(program.id);
    for (let i = 0; i < days.length; i++) { const day = days[i];
      await createDayMutation.mutateAsync({
        programId: program.id,
        dayNumber: i + 1,
        title: day.title,
        objectives: day.objectives,
      });
    }
  };

  const handleActivate = async () => {
    if (!programId) return;
    await activateMutation.mutateAsync(programId);
    onCreated();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button data-testid="button-back-to-list" variant="ghost" onClick={onBack} style={{ color: '#888' }}>
          ← Back
        </Button>
        <h2 data-testid="text-builder-heading" className="text-xl font-bold" style={{ color: '#e0e0e0' }}>Program Builder</h2>
      </div>

      <div className="space-y-4 rounded-lg p-5 border" style={{ backgroundColor: '#0d0d0d', borderColor: '#222' }}>
        <div>
          <label className="text-sm font-bold mb-1 block" style={{ color: '#aaa' }}>Title</label>
          <Input
            data-testid="input-program-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Program title..."
            style={{ backgroundColor: '#111', borderColor: '#333', color: '#e0e0e0' }}
          />
        </div>
        <div>
          <label className="text-sm font-bold mb-1 block" style={{ color: '#aaa' }}>Description</label>
          <textarea
            data-testid="input-program-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the program..."
            rows={3}
            className="w-full rounded-md px-3 py-2 text-sm"
            style={{ backgroundColor: '#111', borderColor: '#333', color: '#e0e0e0', border: '1px solid #333' }}
          />
        </div>
        <div className="flex gap-4">
          <div>
            <label className="text-sm font-bold mb-1 block" style={{ color: '#aaa' }}>Duration</label>
            <select
              data-testid="select-duration"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="rounded-md px-3 py-2 text-sm"
              style={{ backgroundColor: '#111', borderColor: '#333', color: '#e0e0e0', border: '1px solid #333' }}
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-bold mb-1 block" style={{ color: '#aaa' }}>Category</label>
            <Input
              data-testid="input-program-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. foundations, advanced"
              style={{ backgroundColor: '#111', borderColor: '#333', color: '#e0e0e0' }}
            />
          </div>
        </div>
        {days.length === 0 && (
          <Button
            data-testid="button-generate-days"
            onClick={handleGenerateDays}
            className="font-bold"
            style={{ backgroundColor: '#222', color: '#dc143c', border: '1px solid #333' }}
          >
            Generate Day Cards
          </Button>
        )}
      </div>

      {days.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold" style={{ color: '#ccc' }}>Day-by-Day Editor</h3>
          {days.map((day, i) => (
            <div
              key={i}
              data-testid={`card-day-editor-${i + 1}`}
              className="rounded-lg p-4 border"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#222' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                  style={{ backgroundColor: '#dc143c', color: '#fff' }}
                >
                  {i + 1}
                </span>
                <Input
                  data-testid={`input-day-title-${i + 1}`}
                  value={day.title}
                  onChange={(e) => {
                    const updated = [...days];
                    updated[i] = { ...updated[i], title: e.target.value };
                    setDays(updated);
                  }}
                  placeholder="Day title..."
                  style={{ backgroundColor: '#111', borderColor: '#333', color: '#e0e0e0' }}
                />
              </div>
              <textarea
                data-testid={`input-day-objectives-${i + 1}`}
                value={day.objectives}
                onChange={(e) => {
                  const updated = [...days];
                  updated[i] = { ...updated[i], objectives: e.target.value };
                  setDays(updated);
                }}
                placeholder="Objectives for this day..."
                rows={2}
                className="w-full rounded-md px-3 py-2 text-sm"
                style={{ backgroundColor: '#111', borderColor: '#333', color: '#e0e0e0', border: '1px solid #333' }}
              />
            </div>
          ))}

          {!programId && (
            <Button
              data-testid="button-save-program"
              onClick={handleSaveProgram}
              disabled={createProgramMutation.isPending || createDayMutation.isPending}
              className="w-full font-bold tracking-wider"
              style={{ backgroundColor: '#dc143c', color: '#fff' }}
            >
              {createProgramMutation.isPending || createDayMutation.isPending ? 'SAVING...' : 'SAVE PROGRAM'}
            </Button>
          )}

          {programId && (
            <Button
              data-testid="button-activate-program"
              onClick={handleActivate}
              disabled={activateMutation.isPending}
              className="w-full font-bold tracking-wider"
              style={{ backgroundColor: '#dc143c', color: '#fff' }}
            >
              {activateMutation.isPending ? 'ACTIVATING...' : 'ACTIVATE'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function ActiveTrainingView({
  enrollment,
  program,
  onBack,
}: {
  enrollment: TrainingEnrollment;
  program: TrainingProgram;
  onBack: () => void;
}) {
  const [showGraduation, setShowGraduation] = useState(false);
  const qc = useQueryClient();

  const { data: days = [] } = useQuery<TrainingDay[]>({
    queryKey: ['/api/training-programs', enrollment.programId, 'days'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  const completeDayMutation = useMutation({
    mutationFn: async () => {
      const nextDay = enrollment.currentDay + 1;
      const isComplete = enrollment.currentDay >= program.durationDays;
      const res = await apiRequest('PUT', `/api/training-enrollments/${enrollment.id}`, {
        currentDay: isComplete ? enrollment.currentDay : nextDay,
        status: isComplete ? 'completed' : 'active',
      });
      return res.json() as Promise<TrainingEnrollment>;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['/api/training-enrollments'] });
      if (updated.status === 'completed') {
        setShowGraduation(true);
      }
    },
  });

  const currentDayData = days.find((d) => d.dayNumber === enrollment.currentDay);
  const isCompleted = enrollment.status === 'completed';

  return (
    <div className="space-y-6 relative">
      {showGraduation && (
        <div
          data-testid="overlay-graduation"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
          onClick={() => {
            setShowGraduation(false);
            onBack();
          }}
        >
          <div className="text-center space-y-4">
            <h1
              data-testid="text-training-complete"
              className="text-5xl font-bold"
              style={{
                fontFamily: 'Georgia, serif',
                color: '#dc143c',
                textShadow: '0 0 40px rgba(220,20,60,0.6), 0 0 80px rgba(220,20,60,0.3)',
              }}
            >
              TRAINING COMPLETE
            </h1>
            <p style={{ color: '#888' }}>You have completed {program.title}</p>
            <p className="text-sm" style={{ color: '#555' }}>Tap anywhere to continue</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button data-testid="button-back-from-training" variant="ghost" onClick={onBack} style={{ color: '#888' }}>
          ← Back
        </Button>
        <h2 data-testid="text-training-heading" className="text-xl font-bold" style={{ color: '#e0e0e0' }}>
          {program.title}
        </h2>
      </div>

      <div className="flex gap-6">
        <div className="flex flex-col items-center" style={{ minWidth: 48 }}>
          {Array.from({ length: program.durationDays }, (_, i) => {
            const dayNum = i + 1;
            const isCompleted = dayNum < enrollment.currentDay;
            const isCurrent = dayNum === enrollment.currentDay && enrollment.status !== 'completed';
            const isAllDone = enrollment.status === 'completed';
            const lit = isCompleted || isAllDone;
            return (
              <React.Fragment key={dayNum}>
                <div
                  data-testid={`node-day-${dayNum}`}
                  className="relative flex items-center justify-center rounded-full text-xs font-bold transition-all"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: lit ? '#dc143c' : '#1a1a1a',
                    color: lit ? '#fff' : '#555',
                    border: isCurrent ? '2px solid #dc143c' : '2px solid transparent',
                    boxShadow: isCurrent ? '0 0 16px rgba(220,20,60,0.6)' : 'none',
                  }}
                >
                  {dayNum}
                </div>
                {dayNum < program.durationDays && (
                  <div
                    style={{
                      width: 2,
                      height: 20,
                      backgroundColor: lit ? '#dc143c' : '#1a1a1a',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex-1 space-y-4">
          {currentDayData && !isCompleted && (
            <div
              data-testid="card-current-day"
              className="rounded-lg p-5 border"
              style={{
                backgroundColor: '#0d0d0d',
                borderColor: '#dc143c',
                boxShadow: '0 0 20px rgba(220,20,60,0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                  style={{ backgroundColor: '#dc143c', color: '#fff' }}
                >
                  {enrollment.currentDay}
                </span>
                <h3 data-testid="text-current-day-title" className="text-lg font-bold" style={{ color: '#e0e0e0' }}>
                  {currentDayData.title}
                </h3>
              </div>
              {currentDayData.objectives && (
                <div
                  data-testid="text-current-day-objectives"
                  className="rounded-md p-4 mb-4 text-sm leading-relaxed"
                  style={{ backgroundColor: '#111', color: '#ccc' }}
                >
                  {currentDayData.objectives}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#666' }}>
                  Day {enrollment.currentDay} of {program.durationDays}
                </span>
                <Button
                  data-testid="button-complete-day"
                  onClick={() => completeDayMutation.mutate()}
                  disabled={completeDayMutation.isPending}
                  className="font-bold tracking-wider"
                  style={{ backgroundColor: '#dc143c', color: '#fff' }}
                >
                  {completeDayMutation.isPending ? 'COMPLETING...' : 'COMPLETE DAY'}
                </Button>
              </div>
            </div>
          )}

          {isCompleted && (
            <div
              data-testid="card-completed"
              className="rounded-lg p-5 border text-center"
              style={{ backgroundColor: '#0d0d0d', borderColor: '#dc143c' }}
            >
              <h3 className="text-lg font-bold mb-2" style={{ color: '#dc143c' }}>Program Completed</h3>
              <p className="text-sm" style={{ color: '#888' }}>You have finished all {program.durationDays} days.</p>
            </div>
          )}

          <ProgressBar current={isCompleted ? program.durationDays : enrollment.currentDay - 1} total={program.durationDays} />
        </div>
      </div>
    </div>
  );
}

type TabView = 'list' | 'builder' | 'training';

export default function TrainingProgramsPage() {
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as string;
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabView>('list');
  const [activeEnrollment, setActiveEnrollment] = useState<TrainingEnrollment | null>(null);

  const { data: programs = [] } = useQuery<TrainingProgram[]>({
    queryKey: ['/api/training-programs'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  const { data: enrollments = [] } = useQuery<TrainingEnrollment[]>({
    queryKey: ['/api/training-enrollments'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  const enrollMutation = useMutation({
    mutationFn: async (programId: string) => {
      const res = await apiRequest('POST', '/api/training-enrollments', { programId, userId: user?.id });
      return res.json() as Promise<TrainingEnrollment>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/training-enrollments'] });
    },
  });

  const seedMutation = useMutation({
    mutationFn: async (index: number) => {
      const seed = PREBUILT_PROGRAMS[index];
      const res = await apiRequest('POST', '/api/training-programs', {
        title: seed.title,
        description: seed.description,
        durationDays: seed.durationDays,
        category: seed.category,
      });
      const program = (await res.json()) as TrainingProgram;
      for (const day of seed.days) {
        await apiRequest('POST', `/api/training-days`, {
          programId: program.id,
          dayNumber: day.dayNumber,
          title: day.title,
          objectives: day.objectives,
        });
      }
      await apiRequest('PUT', `/api/training-programs/${program.id}`, { status: 'active' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/training-programs'] });
    },
  });

  const activeProgram = activeEnrollment ? programs.find((p) => p.id === activeEnrollment.programId) : null;

  const tabs: { key: TabView; label: string; show: boolean }[] = [
    { key: 'list', label: 'Programs', show: true },
    { key: 'builder', label: 'Builder', show: userRole === 'dom' },
    { key: 'training', label: 'Training', show: !!activeEnrollment },
  ];

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#050505' }}>
      <PageBreadcrumb current="Training Programs" />

      <div className="flex gap-2 mb-6 mt-4">
        {tabs.filter((t) => t.show).map((tab) => (
          <button
            key={tab.key}
            data-testid={`tab-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-md text-sm font-bold transition-all"
            style={{
              backgroundColor: activeTab === tab.key ? '#dc143c' : '#111',
              color: activeTab === tab.key ? '#fff' : '#888',
              border: `1px solid ${activeTab === tab.key ? '#dc143c' : '#222'}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <ProgramsList
          programs={programs}
          enrollments={enrollments}
          userRole={userRole}
          onCreateClick={() => setActiveTab('builder')}
          onEnroll={(programId) => enrollMutation.mutate(programId)}
          onViewTraining={(enrollment) => {
            setActiveEnrollment(enrollment);
            setActiveTab('training');
          }}
          onSeedProgram={(index) => seedMutation.mutate(index)}
        />
      )}

      {activeTab === 'builder' && (
        <ProgramBuilder
          onBack={() => setActiveTab('list')}
          onCreated={() => setActiveTab('list')}
        />
      )}

      {activeTab === 'training' && activeEnrollment && activeProgram && (
        <ActiveTrainingView
          enrollment={activeEnrollment}
          program={activeProgram}
          onBack={() => {
            setActiveEnrollment(null);
            setActiveTab('list');
          }}
        />
      )}
    </div>
  );
}
