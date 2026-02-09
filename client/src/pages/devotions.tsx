import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Heart, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDevotions, useCreateDevotion, useUpdateDevotion, useAuth } from '@/lib/hooks';

const typeColors: Record<string, string> = {
  affirmation: 'bg-pink-400/20 text-pink-400',
  prayer: 'bg-purple-400/20 text-purple-400',
  mantra: 'bg-amber-400/20 text-amber-400',
  gratitude: 'bg-green-400/20 text-green-400',
};

export default function DevotionsPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: devotions = [] } = useDevotions();
  const createMutation = useCreateDevotion();
  const updateMutation = useUpdateDevotion();

  const [type, setType] = useState('affirmation');
  const [content, setContent] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleCreate = () => {
    if (!content.trim()) return;
    createMutation.mutate({
      type,
      content: content.trim(),
    });
    setType('affirmation');
    setContent('');
    setShowForm(false);
  };

  const handleToggleCompleted = (devotion: { id: string; completed: boolean }) => {
    updateMutation.mutate({ id: devotion.id, completed: !devotion.completed });
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

      <div className="flex items-center gap-3 mb-2">
        <Heart className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider" data-testid="text-page-title">
          {userRole === 'dom' ? "Sub's Devotions" : 'Devotions'}
        </h1>
      </div>
      <p className="text-slate-400 text-sm mb-8 ml-10" data-testid="text-page-description">
        {userRole === 'dom' ? "View your sub's expressions of devotion" : 'Express your devotion and commitment'}
      </p>

      {userRole === 'sub' && (
        <Button
          data-testid="button-toggle-form"
          className="mb-6 bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} className="mr-2" />
          New Devotion
        </Button>
      )}

      {userRole === 'sub' && showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-3" data-testid="form-create-devotion">
          <select
            data-testid="select-devotion-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
          >
            <option value="affirmation">Affirmation</option>
            <option value="prayer">Prayer</option>
            <option value="mantra">Mantra</option>
            <option value="gratitude">Gratitude</option>
          </select>
          <textarea
            data-testid="input-devotion-content"
            placeholder="Enter your devotion..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-md px-3 py-2 text-sm min-h-[80px] resize-none"
          />
          <div className="flex gap-2">
            <Button
              data-testid="button-submit-devotion"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              <Check size={16} className="mr-2" />
              Create
            </Button>
            <Button
              data-testid="button-cancel-devotion"
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
        {devotions.length === 0 && (
          <p className="text-slate-500 text-center py-8" data-testid="text-no-devotions">
            {userRole === 'dom' ? "Your sub hasn't created any devotions yet." : 'No devotions yet. Create your first one.'}
          </p>
        )}
        {devotions.map((devotion) => (
          <div
            key={devotion.id}
            data-testid={`card-devotion-${devotion.id}`}
            className={`bg-slate-900 border border-slate-800 rounded-lg p-4 ${devotion.completed ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    data-testid={`badge-type-${devotion.id}`}
                    className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider ${typeColors[devotion.type] || typeColors.affirmation}`}
                  >
                    {devotion.type}
                  </span>
                  {devotion.completed && (
                    <span className="text-xs text-green-500 uppercase tracking-wider" data-testid={`text-completed-${devotion.id}`}>
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-white text-sm" data-testid={`text-devotion-content-${devotion.id}`}>
                  {devotion.content}
                </p>
              </div>
              {userRole === 'sub' && (
                <Button
                  data-testid={`button-toggle-devotion-${devotion.id}`}
                  variant="ghost"
                  size="sm"
                  className={devotion.completed ? 'text-green-500 hover:text-green-400' : 'text-slate-600 hover:text-slate-400'}
                  onClick={() => handleToggleCompleted(devotion)}
                  disabled={updateMutation.isPending}
                >
                  <Check size={16} />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
