import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Hand, Plus, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePermissionRequests, useCreatePermissionRequest, useUpdatePermissionRequest, useAuth } from '@/lib/hooks';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  approved: 'bg-green-500/20 text-green-500',
  denied: 'bg-red-500/20 text-red-500',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={14} />,
  approved: <Check size={14} />,
  denied: <X size={14} />,
};

export default function PermissionRequestsPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: requests = [] } = usePermissionRequests();
  const createMutation = useCreatePermissionRequest();
  const updateMutation = useUpdatePermissionRequest();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleCreate = () => {
    if (!title.trim()) return;
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
    });
    setTitle('');
    setDescription('');
    setShowForm(false);
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

      <div className="flex items-center gap-3 mb-8">
        <Hand className="text-red-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider" data-testid="text-page-title">
            Permission Requests
          </h1>
          <p className="text-slate-400 text-sm" data-testid="text-page-description">
            {userRole === 'sub' ? 'Ask your Dom for permission' : "Review your sub's requests"}
          </p>
        </div>
      </div>

      {userRole === 'sub' && (
        <Button
          data-testid="button-toggle-form"
          className="mb-6 bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} className="mr-2" />
          Request Permission
        </Button>
      )}

      {showForm && userRole === 'sub' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-3" data-testid="form-create-request">
          <Input
            data-testid="input-request-title"
            placeholder="Request title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <Input
            data-testid="input-request-description"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <div className="flex gap-2">
            <Button
              data-testid="button-submit-request"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              <Check size={16} className="mr-2" />
              Submit
            </Button>
            <Button
              data-testid="button-cancel-request"
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

      <div className="space-y-3">
        {requests.length === 0 && (
          <p className="text-slate-500 text-center py-8" data-testid="text-no-requests">
            {userRole === 'dom' ? "No permission requests from your sub yet." : 'No permission requests yet. Create your first one.'}
          </p>
        )}
        {requests.map((request) => (
          <div
            key={request.id}
            data-testid={`card-request-${request.id}`}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold" data-testid={`text-request-title-${request.id}`}>
                    {request.title}
                  </h3>
                  <span
                    data-testid={`badge-status-${request.id}`}
                    className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 ${statusColors[request.status] || statusColors.pending}`}
                  >
                    {statusIcons[request.status]}
                    {request.status}
                  </span>
                </div>
                {request.description && (
                  <p className="text-slate-400 text-sm" data-testid={`text-request-desc-${request.id}`}>
                    {request.description}
                  </p>
                )}
              </div>
              {userRole === 'dom' && request.status === 'pending' && (
                <div className="flex items-center gap-1">
                  <Button
                    data-testid={`button-approve-request-${request.id}`}
                    variant="ghost"
                    size="sm"
                    className="text-green-500 hover:text-green-400"
                    onClick={() => updateMutation.mutate({ id: request.id, status: 'approved' })}
                    disabled={updateMutation.isPending}
                  >
                    <Check size={16} />
                  </Button>
                  <Button
                    data-testid={`button-deny-request-${request.id}`}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-400"
                    onClick={() => updateMutation.mutate({ id: request.id, status: 'denied' })}
                    disabled={updateMutation.isPending}
                  >
                    <X size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
