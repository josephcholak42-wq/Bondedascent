import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Lock, Unlock, Plus, Check, X, AlertTriangle, Link2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction, PulseIndicator } from '@/components/ui/role-gate';
import { useSealedOrders, useSealedOrdersCreated, useCreateSealedOrder, useUpdateSealedOrder, useAuth, useStats } from '@/lib/hooks';

export default function ProtocolLockboxPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useAuth();
  const { data: stats } = useStats();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: orders = [] } = useSealedOrders();
  const { data: createdOrders = [] } = useSealedOrdersCreated();
  const createMutation = useCreateSealedOrder();
  const updateMutation = useUpdateSealedOrder();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [unlockAt, setUnlockAt] = useState('');
  const [xpCost, setXpCost] = useState(25);
  const [chainOrder, setChainOrder] = useState('');
  const [previousOrderId, setPreviousOrderId] = useState('');
  const [confirmUnsealId, setConfirmUnsealId] = useState<string | null>(null);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  function formatCountdown(unlockAtDate: Date | string) {
    const target = new Date(unlockAtDate);
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds, total: diff };
  }

  const handleCreate = () => {
    if (!title.trim() || !content.trim() || !unlockAt) return;
    createMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      unlockAt: new Date(unlockAt).toISOString(),
      xpCost: xpCost || 25,
      chainOrder: chainOrder ? parseInt(chainOrder) : undefined,
      previousOrderId: previousOrderId || undefined,
    });
    setTitle('');
    setContent('');
    setUnlockAt('');
    setXpCost(25);
    setChainOrder('');
    setPreviousOrderId('');
    setShowForm(false);
  };

  const handleEmergencyUnseal = (orderId: string) => {
    updateMutation.mutate({ id: orderId, emergencyUnsealed: true });
    setConfirmUnsealId(null);
  };

  const handleComplete = (orderId: string) => {
    updateMutation.mutate({ id: orderId, completed: true });
  };

  const displayOrders = userRole === 'dom' ? createdOrders : orders;

  const getOrderStatus = (order: typeof displayOrders[0]) => {
    if (order.completed) return 'completed';
    if (order.emergencyUnsealed) return 'emergency';
    const countdown = formatCountdown(order.unlockAt);
    if (!countdown) return 'unlocked';
    return 'sealed';
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <PageBreadcrumb current="Protocol Lockbox" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Shield className="text-red-600" size={28} />
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider" data-testid="text-page-title">
            {userRole === 'dom' ? 'Protocol Lockbox' : 'Sealed Orders'}
          </h1>
        </div>
        <RoleGatedButton
          data-testid="button-toggle-form"
          allowed={userRole === 'dom'}
          tooltipText="Only your Dom can create sealed orders"
          variant="outline"
          className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} className="mr-1" /> New Order
        </RoleGatedButton>
      </div>
      <p className="text-sm text-slate-400 mb-8" data-testid="text-page-description">
        {userRole === 'dom' ? 'Create sealed orders that unlock on a schedule' : 'Orders sealed by your Dom — revealed when the time comes'}
      </p>

      {userRole === 'dom' && showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-4" data-testid="form-create-order">
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Title</label>
            <Input
              data-testid="input-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Order title"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Content</label>
            <textarea
              data-testid="input-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="The sealed instructions (hidden until unlock)"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-md p-2 min-h-[100px] text-sm resize-y"
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Unlock Date & Time</label>
            <Input
              data-testid="input-unlock-at"
              type="datetime-local"
              value={unlockAt}
              onChange={e => setUnlockAt(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">XP Cost for Emergency Unseal</label>
            <Input
              data-testid="input-xp-cost"
              type="number"
              value={xpCost}
              onChange={e => setXpCost(parseInt(e.target.value) || 25)}
              className="bg-slate-800 border-slate-700 text-white"
              min={0}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Chain Order (Optional)</label>
              <Input
                data-testid="input-chain-order"
                type="number"
                value={chainOrder}
                onChange={e => setChainOrder(e.target.value)}
                placeholder="e.g. 1, 2, 3..."
                className="bg-slate-800 border-slate-700 text-white"
                min={1}
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 uppercase tracking-wider block mb-1">Previous Order (Optional)</label>
              <select
                data-testid="select-previous-order"
                value={previousOrderId}
                onChange={e => setPreviousOrderId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-md p-2 text-sm"
              >
                <option value="">None</option>
                {createdOrders.map(o => (
                  <option key={o.id} value={o.id}>{o.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="button-seal-order"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              <Lock size={16} className="mr-2" />
              Seal Order
            </Button>
            <Button
              data-testid="button-cancel-form"
              variant="ghost"
              className="text-slate-400"
              onClick={() => setShowForm(false)}
            >
              <X size={16} className="mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {confirmUnsealId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-amber-600/50 rounded-lg p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold uppercase tracking-wider">Emergency Unseal</h3>
            </div>
            <p className="text-slate-300 text-sm">
              This will reveal the sealed order immediately. This action costs XP and cannot be undone.
            </p>
            <div className="bg-slate-800 rounded p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Your XP:</span>
                <span className="text-white font-mono">{stats?.xp ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Cost:</span>
                <span className="text-amber-500 font-mono">
                  -{displayOrders.find(o => o.id === confirmUnsealId)?.xpCost ?? 25} XP
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
                onClick={() => handleEmergencyUnseal(confirmUnsealId)}
                disabled={updateMutation.isPending}
              >
                <Unlock size={16} className="mr-2" />
                Confirm Unseal
              </Button>
              <Button
                variant="ghost"
                className="text-slate-400"
                onClick={() => setConfirmUnsealId(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {displayOrders.length === 0 && (
          <div className="text-center text-slate-500 py-12" data-testid="text-empty-state">
            {userRole === 'sub' ? 'No sealed orders yet.' : 'No sealed orders created yet. Create your first one!'}
          </div>
        )}
        {displayOrders.map((order, idx) => {
          const status = getOrderStatus(order);
          const countdown = formatCountdown(order.unlockAt);
          const hasPrevious = order.previousOrderId;
          const hasChain = order.chainOrder;

          const borderClass = status === 'completed'
            ? 'border-slate-800 opacity-60'
            : status === 'sealed'
            ? 'border-purple-900/50 shadow-[0_0_15px_rgba(88,28,135,0.15)]'
            : status === 'emergency'
            ? 'border-amber-600/40'
            : 'border-green-900/40';

          return (
            <React.Fragment key={order.id}>
              {hasPrevious && (
                <div className="flex justify-center -my-2">
                  <Link2 size={16} className="text-purple-500/50" />
                </div>
              )}
              <div
                className={`bg-slate-900 border rounded-lg p-4 ${borderClass}`}
                data-testid={`card-order-${order.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {status === 'sealed' && <Lock size={18} className="text-purple-400" />}
                    {status === 'unlocked' && <Unlock size={18} className="text-green-400" />}
                    {status === 'emergency' && <AlertTriangle size={18} className="text-amber-400" />}
                    {status === 'completed' && <Check size={18} className="text-slate-500" />}
                    <h3 className="text-white font-semibold text-lg" data-testid={`text-title-${order.id}`}>
                      {order.title}
                    </h3>
                    {hasChain && (
                      <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                        <Link2 size={10} />
                        #{order.chainOrder}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {status === 'sealed' && (
                      <span className="text-xs uppercase tracking-wider px-2 py-1 rounded border border-purple-600/40 text-purple-400 bg-purple-500/10">
                        Sealed
                      </span>
                    )}
                    {status === 'unlocked' && (
                      <span className="text-xs uppercase tracking-wider px-2 py-1 rounded border border-green-600/40 text-green-400 bg-green-500/10">
                        Unlocked
                      </span>
                    )}
                    {status === 'emergency' && (
                      <span className="text-xs uppercase tracking-wider px-2 py-1 rounded border border-amber-600/40 text-amber-400 bg-amber-500/10">
                        Emergency
                      </span>
                    )}
                    {status === 'completed' && (
                      <span className="text-xs uppercase tracking-wider px-2 py-1 rounded border border-slate-700 text-slate-500 bg-slate-800">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {userRole === 'dom' && (
                  <p className="text-slate-300 text-sm mt-2 bg-slate-800/50 rounded p-3 border border-slate-700/50" data-testid={`text-content-${order.id}`}>
                    {order.content}
                  </p>
                )}

                {userRole === 'sub' && (status === 'unlocked' || status === 'emergency' || status === 'completed') && (
                  <p className="text-slate-300 text-sm mt-2 bg-slate-800/50 rounded p-3 border border-slate-700/50" data-testid={`text-content-${order.id}`}>
                    {order.content}
                  </p>
                )}

                {status === 'sealed' && countdown && (
                  <div className="flex items-center gap-4 mt-3" data-testid={`text-countdown-${order.id}`}>
                    <Lock size={14} className="text-purple-500/60" />
                    <div className="flex gap-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-400 font-mono">{countdown.days}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">days</div>
                      </div>
                      <div className="text-slate-600 text-xl">:</div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-400 font-mono">{countdown.hours}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">hrs</div>
                      </div>
                      <div className="text-slate-600 text-xl">:</div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-amber-400 font-mono">{countdown.minutes}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">min</div>
                      </div>
                      <div className="text-slate-600 text-xl">:</div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-amber-400 font-mono">{countdown.seconds}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">sec</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3">
                  {userRole === 'sub' && status === 'sealed' && (
                    <Button
                      data-testid={`button-emergency-unseal-${order.id}`}
                      variant="outline"
                      size="sm"
                      className="border-amber-600/50 text-amber-400 hover:bg-amber-600/20 hover:text-amber-300"
                      onClick={() => setConfirmUnsealId(order.id)}
                      disabled={updateMutation.isPending}
                    >
                      <AlertTriangle size={14} className="mr-1.5" />
                      Emergency Unseal ({order.xpCost} XP)
                    </Button>
                  )}
                  {userRole === 'sub' && status === 'unlocked' && (
                    <Button
                      data-testid={`button-complete-order-${order.id}`}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleComplete(order.id)}
                      disabled={updateMutation.isPending}
                    >
                      <Check size={14} className="mr-1.5" />
                      Mark Complete
                    </Button>
                  )}
                  {userRole === 'sub' && status === 'emergency' && (
                    <Button
                      data-testid={`button-complete-order-${order.id}`}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleComplete(order.id)}
                      disabled={updateMutation.isPending}
                    >
                      <Check size={14} className="mr-1.5" />
                      Mark Complete
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                  <span>Unlocks: {new Date(order.unlockAt).toLocaleString()}</span>
                  {order.xpCost > 0 && status === 'sealed' && (
                    <span className="text-amber-500/60">Emergency: {order.xpCost} XP</span>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
