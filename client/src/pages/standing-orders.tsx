import React, { useState, useMemo } from 'react';
import { FileSignature, Plus, Trash2, Check, X, Search, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGatedButton, RoleGatedAction, PulseIndicator, ActionBadge } from '@/components/ui/role-gate';
import { useStandingOrders, useCreateStandingOrder, useUpdateStandingOrder, useDeleteStandingOrder, useAuth } from '@/lib/hooks';
import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { PREBUILT_STANDING_ORDERS, STANDING_ORDER_CATEGORIES } from '@/lib/prebuilt-standing-orders';

const priorityColors: Record<string, string> = {
  urgent: 'text-red-500',
  high: 'text-orange-500',
  standard: 'text-yellow-500',
  low: 'text-slate-400',
};

const priorityBgColors: Record<string, string> = {
  urgent: 'bg-red-500/20 text-red-500',
  high: 'bg-orange-500/20 text-orange-500',
  standard: 'bg-yellow-500/20 text-yellow-500',
  low: 'bg-slate-400/20 text-slate-400',
};

export default function StandingOrdersPage() {
  const { data: user } = useAuth();
  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const { data: orders = [] } = useStandingOrders();
  const createMutation = useCreateStandingOrder();
  const updateMutation = useUpdateStandingOrder();
  const deleteMutation = useDeleteStandingOrder();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('standard');
  const [showForm, setShowForm] = useState(false);
  const [showPrebuilt, setShowPrebuilt] = useState(false);
  const [prebuiltCategory, setPrebuiltCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrebuilt = useMemo(() => {
    let items = PREBUILT_STANDING_ORDERS;
    if (prebuiltCategory !== 'All') {
      items = items.filter((o) => o.category === prebuiltCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (o) => o.name.toLowerCase().includes(q) || o.category.toLowerCase().includes(q)
      );
    }
    return items;
  }, [prebuiltCategory, searchQuery]);

  const handleCreate = () => {
    if (!title.trim()) return;
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });
    setTitle('');
    setDescription('');
    setPriority('standard');
    setShowForm(false);
  };

  const handleQuickAssign = (order: { name: string; category: string; priority: string }) => {
    createMutation.mutate({
      title: order.name,
      description: `Category: ${order.category}`,
      priority: order.priority,
    });
  };

  const handleToggleActive = (order: { id: string; active: boolean }) => {
    updateMutation.mutate({ id: order.id, active: !order.active });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 max-w-2xl mx-auto">
      <PageBreadcrumb current="Standing Orders" />

      <div className="flex items-center gap-3 mb-8">
        <FileSignature className="text-red-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider" data-testid="text-page-title">
            Standing Orders
          </h1>
          <p className="text-slate-400 text-sm" data-testid="text-page-description">
            {userRole === 'dom' ? 'Permanent directives for your sub' : 'Orders issued by your Dom'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <RoleGatedButton
          data-testid="button-toggle-form"
          allowed={userRole === 'dom'}
          tooltipText="Only your Dom can issue orders"
          className="bg-red-600 hover:bg-red-700 text-white uppercase tracking-wider"
          onClick={() => { setShowForm(!showForm); setShowPrebuilt(false); }}
        >
          <Plus size={16} className="mr-2" />
          Issue Order
        </RoleGatedButton>
        <RoleGatedButton
          data-testid="button-toggle-prebuilt"
          allowed={userRole === 'dom'}
          tooltipText="Only your Dom can issue orders"
          className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 uppercase tracking-wider"
          onClick={() => { setShowPrebuilt(!showPrebuilt); setShowForm(false); }}
        >
          <BookOpen size={16} className="mr-2" />
          Browse Library
          {showPrebuilt ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
        </RoleGatedButton>
      </div>

      {showForm && userRole === 'dom' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 space-y-3" data-testid="form-create-order">
          <Input
            data-testid="input-order-title"
            placeholder="Order title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <Input
            data-testid="input-order-description"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <select
            data-testid="select-order-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
          >
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="standard">Standard</option>
            <option value="low">Low</option>
          </select>
          <div className="flex gap-2">
            <Button
              data-testid="button-submit-order"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              <Check size={16} className="mr-2" />
              Create
            </Button>
            <Button
              data-testid="button-cancel-order"
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

      {showPrebuilt && userRole === 'dom' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6" data-testid="panel-prebuilt-orders">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              data-testid="input-search-prebuilt"
              placeholder="Search standing orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4" data-testid="filter-category-pills">
            <button
              data-testid="pill-category-all"
              onClick={() => setPrebuiltCategory('All')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                prebuiltCategory === 'All'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              All
            </button>
            {STANDING_ORDER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                data-testid={`pill-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setPrebuiltCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  prebuiltCategory === cat
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredPrebuilt.length === 0 && (
              <p className="text-slate-500 text-center py-4 text-sm" data-testid="text-no-prebuilt-results">
                No matching orders found.
              </p>
            )}
            {filteredPrebuilt.map((order, idx) => (
              <div
                key={`${order.category}-${idx}`}
                data-testid={`prebuilt-order-${idx}`}
                className="flex items-center justify-between gap-3 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 hover:border-red-600/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{order.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{order.category}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${priorityBgColors[order.priority] || priorityBgColors.standard}`}>
                      {order.priority}
                    </span>
                  </div>
                </div>
                <Button
                  data-testid={`button-assign-prebuilt-${idx}`}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs shrink-0"
                  onClick={() => handleQuickAssign(order)}
                  disabled={createMutation.isPending}
                >
                  <Plus size={14} className="mr-1" />
                  Assign
                </Button>
              </div>
            ))}
          </div>

          <p className="text-slate-600 text-xs mt-3 text-center">
            {filteredPrebuilt.length} order{filteredPrebuilt.length !== 1 ? 's' : ''} available
          </p>
        </div>
      )}

      <div className="space-y-3">
        {orders.length === 0 && (
          <p className="text-slate-500 text-center py-8" data-testid="text-no-orders">
            {userRole === 'sub' ? 'No standing orders from your Dom yet.' : 'No standing orders yet. Create your first one.'}
          </p>
        )}
        {orders.map((order) => (
          <div
            key={order.id}
            data-testid={`card-order-${order.id}`}
            className={`bg-slate-900 border rounded-lg p-4 ${order.active ? 'border-red-600/30' : 'border-slate-800 opacity-60'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold" data-testid={`text-order-title-${order.id}`}>
                    {order.title}
                  </h3>
                  <span
                    data-testid={`badge-priority-${order.id}`}
                    className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider ${priorityBgColors[order.priority] || priorityBgColors.standard}`}
                  >
                    {order.priority}
                  </span>
                  {order.assignedBy && (
                    <span className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded" data-testid={`badge-assigned-${order.id}`}>
                      Partner Assigned
                    </span>
                  )}
                </div>
                {order.description && (
                  <p className="text-slate-400 text-sm mb-2" data-testid={`text-order-desc-${order.id}`}>
                    {order.description}
                  </p>
                )}
                <span
                  data-testid={`text-order-status-${order.id}`}
                  className={`text-xs ${order.active ? 'text-green-500' : 'text-slate-600'}`}
                >
                  {order.active ? 'Active' : 'Inactive'}
                </span>
                {userRole === 'sub' && order.assignedBy && order.active && <PulseIndicator show className="ml-1" />}
              </div>
              <div className="flex items-center gap-1">
                <RoleGatedAction allowed={userRole === 'dom'} tooltipText="Only your Dom can toggle orders">
                  <Button
                    data-testid={`button-toggle-order-${order.id}`}
                    variant="ghost"
                    size="sm"
                    className={order.active ? 'text-green-500 hover:text-green-400' : 'text-slate-600 hover:text-slate-400'}
                    onClick={() => handleToggleActive(order)}
                    disabled={updateMutation.isPending}
                  >
                    {order.active ? <Check size={16} /> : <X size={16} />}
                  </Button>
                </RoleGatedAction>
                <RoleGatedAction allowed={userRole === 'dom'} tooltipText="Only your Dom can delete orders">
                  <Button
                    data-testid={`button-delete-order-${order.id}`}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-400"
                    onClick={() => handleDelete(order.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </Button>
                </RoleGatedAction>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
