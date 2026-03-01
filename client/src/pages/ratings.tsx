import { PageBreadcrumb } from '@/components/page-breadcrumb';
import React, { useState } from 'react';
import { Star, BarChart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleGatedButton, RoleGatedAction, PulseIndicator } from '@/components/ui/role-gate';
import { Slider } from '@/components/ui/slider';
import { useRatings, useRatingsReceived, useCreateRating, useAuth, usePartner } from '@/lib/hooks';
import type { Rating } from '@shared/schema';

export default function RatingsPage() {
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: ratingsGiven = [] } = useRatings();
  const { data: ratingsReceived = [] } = useRatingsReceived();
  const createRatingMutation = useCreateRating();
  const { data: partner } = usePartner();

  const [activeTab, setActiveTab] = useState<'given' | 'received'>(userRole === 'sub' ? 'received' : 'given');
  const [showForm, setShowForm] = useState(false);
  const [overall, setOverall] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [obedience, setObedience] = useState(5);
  const [effort, setEffort] = useState(5);
  const [notes, setNotes] = useState('');

  const handleCreate = () => {
    if (!partner?.id) return;
    createRatingMutation.mutate({
      ratedUserId: partner.id,
      overall,
      communication,
      obedience,
      effort,
      notes: notes.trim() || undefined,
    });
    setOverall(5);
    setCommunication(5);
    setObedience(5);
    setEffort(5);
    setNotes('');
    setShowForm(false);
  };

  const activeRatings = activeTab === 'given' ? ratingsGiven : ratingsReceived;

  const avgScore = activeRatings.length > 0
    ? (activeRatings.reduce((sum, r) => sum + r.overall, 0) / activeRatings.length).toFixed(1)
    : '—';

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  const ScoreBar = ({ label, value, testId }: { label: string; value: number | null; testId: string }) => {
    if (value === null || value === undefined) return null;
    return (
      <div className="flex items-center gap-2 text-xs" data-testid={testId}>
        <span className="text-slate-400 w-24 uppercase tracking-wider">{label}</span>
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-600 rounded-full transition-all"
            style={{ width: `${(value / 10) * 100}%` }}
          />
        </div>
        <span className="text-white font-bold w-6 text-right">{value}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <PageBreadcrumb current="Ratings" />

      <div className="flex items-center gap-3 mb-2">
        <Star className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-tighter" data-testid="text-page-title">
          {userRole === 'dom' ? 'Performance Ratings' : 'My Ratings'}
        </h1>
      </div>
      <p className="text-sm text-slate-400 mb-8" data-testid="text-page-description">
        {userRole === 'dom' ? "Rate your sub's performance" : 'Performance ratings from your Dom'}
      </p>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 text-center" data-testid="text-average-score">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Average Score</p>
        <p className="text-3xl font-bold text-white">{avgScore}</p>
        <p className="text-xs text-slate-500">{activeRatings.length} rating{activeRatings.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          data-testid="button-tab-given"
          className={`flex-1 uppercase tracking-wider text-sm ${activeTab === 'given' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'}`}
          onClick={() => setActiveTab('given')}
        >
          <BarChart size={14} className="mr-2" />
          {userRole === 'dom' ? 'My Ratings' : 'Given'}
        </Button>
        <Button
          data-testid="button-tab-received"
          className={`flex-1 uppercase tracking-wider text-sm ${activeTab === 'received' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'}`}
          onClick={() => setActiveTab('received')}
        >
          <Star size={14} className="mr-2" />
          Received
        </Button>
      </div>

      {partner && (
        <RoleGatedButton
          data-testid="button-toggle-form"
          allowed={userRole === 'dom'}
          tooltipText="Only your Dom can rate performance"
          className="mb-6 bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} className="mr-2" />
          New Rating
        </RoleGatedButton>
      )}

      {userRole === 'dom' && showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-4" data-testid="form-create-rating">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Overall ({overall})</label>
            <Slider
              data-testid="slider-overall"
              min={1}
              max={10}
              step={1}
              value={[overall]}
              onValueChange={(v) => setOverall(v[0])}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Communication ({communication})</label>
            <Slider
              data-testid="slider-communication"
              min={1}
              max={10}
              step={1}
              value={[communication]}
              onValueChange={(v) => setCommunication(v[0])}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Obedience ({obedience})</label>
            <Slider
              data-testid="slider-obedience"
              min={1}
              max={10}
              step={1}
              value={[obedience]}
              onValueChange={(v) => setObedience(v[0])}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Devotion ({effort})</label>
            <Slider
              data-testid="slider-effort"
              min={1}
              max={10}
              step={1}
              value={[effort]}
              onValueChange={(v) => setEffort(v[0])}
              className="w-full"
            />
          </div>
          <textarea
            data-testid="textarea-notes"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-md px-3 py-2 text-sm min-h-[80px] resize-none"
          />
          <div className="flex gap-2">
            <Button
              data-testid="button-submit-rating"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createRatingMutation.isPending || !partner}
            >
              <Plus size={16} className="mr-2" />
              Submit Rating
            </Button>
            <Button
              data-testid="button-cancel-rating"
              variant="ghost"
              className="text-slate-400 hover:text-white"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {activeRatings.length === 0 && (
          <p className="text-slate-500 text-center py-8" data-testid="text-no-ratings">No ratings yet.</p>
        )}
        {activeRatings.map((rating) => (
          <div
            key={rating.id}
            data-testid={`card-rating-${rating.id}`}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-500" />
                <span className="text-white font-bold text-lg" data-testid={`text-rating-overall-${rating.id}`}>
                  {rating.overall}/10
                </span>
              </div>
              <span className="text-xs text-slate-500" data-testid={`text-rating-date-${rating.id}`}>
                {formatDate(rating.createdAt)}
              </span>
            </div>
            <ScoreBar label="Communication" value={rating.communication} testId={`bar-communication-${rating.id}`} />
            <ScoreBar label="Obedience" value={rating.obedience} testId={`bar-obedience-${rating.id}`} />
            <ScoreBar label="Effort" value={rating.effort} testId={`bar-effort-${rating.id}`} />
            {rating.notes && (
              <p className="text-slate-400 text-sm mt-2 pt-2 border-t border-slate-800" data-testid={`text-rating-notes-${rating.id}`}>
                {rating.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}