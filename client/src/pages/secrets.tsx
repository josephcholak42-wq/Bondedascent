import { PageBreadcrumb } from '@/components/page-breadcrumb';
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction, PulseIndicator } from '@/components/ui/role-gate';
import { useSecrets, useSecretsForMe, useCreateSecret, useRevealSecret, useAuth } from '@/lib/hooks';

const TIER_COLORS: Record<string, string> = {
  common: 'bg-slate-400/20 text-slate-400',
  rare: 'bg-blue-400/20 text-blue-400',
  legendary: 'bg-amber-400/20 text-amber-400',
};

export default function SecretsPage() {
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: mySecrets = [] } = useSecrets();
  const { data: sharedSecrets = [] } = useSecretsForMe();
  const createSecretMutation = useCreateSecret();
  const revealSecretMutation = useRevealSecret();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tier, setTier] = useState('common');
  const [showForm, setShowForm] = useState(false);

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) return;
    createSecretMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      tier,
      forUserId: user?.partnerId || undefined,
    });
    setTitle('');
    setContent('');
    setTier('common');
    setShowForm(false);
  };

  const handleReveal = (id: string) => {
    revealSecretMutation.mutate(id);
  };

  const renderSecretCard = (secret: typeof mySecrets[number], isShared: boolean) => (
    <div
      key={secret.id}
      data-testid={`card-secret-${secret.id}`}
      className="bg-slate-900 border border-slate-800 rounded-lg p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold" data-testid={`text-secret-title-${secret.id}`}>
              {secret.title}
            </h3>
            <span
              data-testid={`badge-secret-tier-${secret.id}`}
              className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider font-bold ${TIER_COLORS[secret.tier] || TIER_COLORS.common}`}
            >
              {secret.tier}
            </span>
          </div>
          <div className="mt-2">
            {secret.revealed ? (
              <p className="text-slate-300 text-sm" data-testid={`text-secret-content-${secret.id}`}>
                {secret.content}
              </p>
            ) : (
              <p className="text-slate-600 text-sm font-mono" data-testid={`text-secret-hidden-${secret.id}`}>
                ***
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {secret.revealed ? (
            <Eye size={16} className="text-green-500" data-testid={`icon-revealed-${secret.id}`} />
          ) : (
            <>
              <EyeOff size={16} className="text-slate-600" data-testid={`icon-hidden-${secret.id}`} />
              {!secret.revealed && isShared && userRole === 'dom' && <PulseIndicator show className="ml-1" />}
              {isShared && (
                <RoleGatedAction allowed={userRole === 'dom'} tooltipText="Only your Dom can reveal secrets">
                  <Button
                    data-testid={`button-reveal-secret-${secret.id}`}
                    variant="ghost"
                    size="sm"
                    className="text-amber-400 hover:text-amber-300"
                    onClick={() => handleReveal(secret.id)}
                    disabled={revealSecretMutation.isPending}
                  >
                    <Eye size={16} />
                  </Button>
                </RoleGatedAction>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <PageBreadcrumb current="Secrets" />

      <div className="flex items-center gap-3 mb-2">
        <Lock className="text-red-600" size={28} />
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider" data-testid="text-page-title">
          {userRole === 'dom' ? 'Secrets Vault' : 'Confessions'}
        </h1>
      </div>
      <p className="text-slate-400 text-sm mb-8 ml-10" data-testid="text-page-description">
        {userRole === 'dom' ? 'Extract and manage confessions' : 'Share your secrets with your Dom'}
      </p>

      <Button
        data-testid="button-toggle-form"
        className="mb-6 bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
        onClick={() => setShowForm(!showForm)}
      >
        <Plus size={16} className="mr-2" />
        {userRole === 'dom' ? 'New Secret' : 'New Confession'}
      </Button>

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-3" data-testid="form-create-secret">
          <Input
            data-testid="input-secret-title"
            placeholder="Secret title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <textarea
            data-testid="input-secret-content"
            placeholder="Secret content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <select
            data-testid="select-secret-tier"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
          >
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="legendary">Legendary</option>
          </select>
          <div className="flex gap-2">
            <Button
              data-testid="button-submit-secret"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createSecretMutation.isPending}
            >
              <Star size={16} className="mr-2" />
              Create
            </Button>
            <Button
              data-testid="button-cancel-secret"
              variant="ghost"
              className="text-slate-400 hover:text-white"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2" data-testid="text-section-my-secrets">
            <Lock size={14} className="text-red-600" />
            {userRole === 'dom' ? 'Stored Secrets' : 'My Confessions'}
          </h2>
          <div className="space-y-2">
            {mySecrets.length === 0 ? (
              <p className="text-slate-500 text-center py-4" data-testid="text-no-my-secrets">No secrets created yet.</p>
            ) : (
              mySecrets.map((s) => renderSecretCard(s, false))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2" data-testid="text-section-shared-secrets">
            <Eye size={14} className="text-red-600" />
            {userRole === 'dom' ? 'Confessions Received' : "Dom's Secrets"}
          </h2>
          <div className="space-y-2">
            {sharedSecrets.length === 0 ? (
              <p className="text-slate-500 text-center py-4" data-testid="text-no-shared-secrets">No secrets shared with you yet.</p>
            ) : (
              sharedSecrets.map((s) => renderSecretCard(s, true))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
