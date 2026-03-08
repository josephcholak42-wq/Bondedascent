import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "../lib/queryClient";
import type { Contract } from "@shared/schema";
import { FileText, Plus, Check, X, Clock, AlertTriangle, Shield } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-neutral-800 text-neutral-300",
  negotiating: "bg-amber-950 text-amber-400",
  active: "bg-red-950 text-red-400",
  expired: "bg-slate-700 text-slate-300",
  terminated: "bg-red-900 text-red-300",
};

const STATUS_ICONS: Record<string, typeof FileText> = {
  draft: FileText,
  negotiating: AlertTriangle,
  active: Shield,
  expired: Clock,
  terminated: X,
};

function getDaysRemaining(endDate: string | Date | null): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function SigningCeremony({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  const [showSeal, setShowSeal] = useState(false);
  const [showSealed, setShowSealed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowSeal(true), 300);
    const t2 = setTimeout(() => setShowSealed(true), 1200);
    const t3 = setTimeout(() => onClose(), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
      data-testid="signing-ceremony-overlay"
    >
      <div className="text-center space-y-8">
        <p
          className="text-2xl italic text-slate-300"
          style={{ fontFamily: "Playfair Display, serif" }}
          data-testid="text-creator-name"
        >
          {contract.creatorId}
        </p>
        <p className="text-slate-500 text-sm tracking-widest uppercase">and</p>
        <p
          className="text-2xl italic text-slate-300"
          style={{ fontFamily: "Playfair Display, serif" }}
          data-testid="text-partner-name"
        >
          {contract.partnerId || "Partner"}
        </p>
        <p className="text-slate-500 text-xs tracking-wider" data-testid="text-ceremony-date">
          {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
        <div className="flex justify-center mt-8">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 120,
              height: 120,
              backgroundColor: "#7f1d1d",
              transform: showSeal ? "scale(1)" : "scale(0)",
              transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            data-testid="wax-seal"
          >
            {showSealed && (
              <span
                className="text-red-200 text-sm font-bold tracking-[0.3em] uppercase"
                style={{ fontFamily: "Montserrat, sans-serif" }}
                data-testid="text-sealed"
              >
                SEALED
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContractsPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCeremony, setShowCeremony] = useState(false);
  const [ceremonyContract, setCeremonyContract] = useState<Contract | null>(null);

  const [title, setTitle] = useState("");
  const [terms, setTerms] = useState("");
  const [limitsText, setLimitsText] = useState("");
  const [safeword, setSafeword] = useState("");
  const [duration, setDuration] = useState("30 days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/contracts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      resetForm();
      setView("list");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Record<string, unknown> & { id: string }) => {
      const res = await apiRequest("PUT", `/api/contracts/${id}`, data);
      return res.json();
    },
    onSuccess: (data: Contract) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      if (data.signedByCreator && data.signedByPartner) {
        setCeremonyContract(data);
        setShowCeremony(true);
      }
    },
  });

  function resetForm() {
    setTitle("");
    setTerms("");
    setLimitsText("");
    setSafeword("");
    setDuration("30 days");
    setStartDate("");
    setEndDate("");
    setEditingId(null);
  }

  function handleEdit(contract: Contract) {
    setTitle(contract.title);
    setTerms(contract.terms || "");
    setLimitsText(contract.limits || "");
    setSafeword(contract.safeword || "");
    setDuration(contract.duration || "30 days");
    setStartDate(contract.startDate ? new Date(contract.startDate).toISOString().split("T")[0] : "");
    setEndDate(contract.endDate ? new Date(contract.endDate).toISOString().split("T")[0] : "");
    setEditingId(contract.id);
    setView("form");
  }

  function handleSubmit(status: string) {
    const payload: Record<string, unknown> = {
      title,
      terms: terms || undefined,
      limits: limitsText || undefined,
      safeword: safeword || undefined,
      duration: duration || undefined,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload, status });
    } else {
      createMutation.mutate({ ...payload, status });
    }
  }

  function handleSign(contract: Contract) {
    updateMutation.mutate({ id: contract.id, signedByCreator: true });
  }

  const inputClasses =
    "w-full bg-black border border-red-950 text-slate-200 rounded px-3 py-2 focus:border-red-800 focus:outline-none focus:ring-1 focus:ring-red-900 transition";

  if (view === "form") {
    return (
      <div className="min-h-screen p-6 max-w-2xl mx-auto" style={{ backgroundColor: "#030303" }}>
        {showCeremony && ceremonyContract && (
          <SigningCeremony contract={ceremonyContract} onClose={() => setShowCeremony(false)} />
        )}
        <button
          onClick={() => { resetForm(); setView("list"); }}
          className="text-slate-500 hover:text-slate-300 text-sm mb-6 flex items-center gap-1 transition"
          data-testid="button-back-to-list"
        >
          <X size={14} /> Back to contracts
        </button>

        <h1
          className="text-2xl font-bold text-slate-100 uppercase tracking-[0.2em] mb-8"
          style={{ fontFamily: "Montserrat, sans-serif" }}
          data-testid="text-form-title"
        >
          {editingId ? "EDIT CONTRACT" : "NEW CONTRACT"}
        </h1>

        <div className="space-y-5">
          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClasses}
              placeholder="Contract title..."
              data-testid="input-title"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Terms</label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className={`${inputClasses} min-h-[120px] resize-y`}
              placeholder="Define the terms of this contract..."
              data-testid="input-terms"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Limits</label>
            <textarea
              value={limitsText}
              onChange={(e) => setLimitsText(e.target.value)}
              className={`${inputClasses} min-h-[80px] resize-y`}
              placeholder="Define limits and boundaries..."
              data-testid="input-limits"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Safeword</label>
            <input
              type="text"
              value={safeword}
              onChange={(e) => setSafeword(e.target.value)}
              className={inputClasses}
              placeholder="Safeword..."
              data-testid="input-safeword"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={inputClasses}
              data-testid="select-duration"
            >
              <option value="7 days">7 Days</option>
              <option value="14 days">14 Days</option>
              <option value="30 days">30 Days</option>
              <option value="60 days">60 Days</option>
              <option value="90 days">90 Days</option>
              <option value="6 months">6 Months</option>
              <option value="1 year">1 Year</option>
              <option value="indefinite">Indefinite</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClasses}
                data-testid="input-start-date"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClasses}
                data-testid="input-end-date"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => handleSubmit("draft")}
              disabled={!title.trim() || createMutation.isPending || updateMutation.isPending}
              className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-slate-300 rounded text-sm font-bold uppercase tracking-wider transition disabled:opacity-50"
              data-testid="button-save-draft"
            >
              DRAFT
            </button>
            <button
              onClick={() => handleSubmit("negotiating")}
              disabled={!title.trim() || createMutation.isPending || updateMutation.isPending}
              className="flex-1 py-3 rounded text-sm font-bold uppercase tracking-wider transition disabled:opacity-50 text-red-200 hover:opacity-90"
              style={{ backgroundColor: "#7f1d1d" }}
              data-testid="button-submit-review"
            >
              SUBMIT FOR REVIEW
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto" style={{ backgroundColor: "#030303" }}>
      {showCeremony && ceremonyContract && (
        <SigningCeremony contract={ceremonyContract} onClose={() => setShowCeremony(false)} />
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="text-red-900" size={28} />
          <h1
            className="text-2xl font-bold text-slate-100 uppercase tracking-[0.2em]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
            data-testid="text-page-title"
          >
            CONTRACTS
          </h1>
        </div>
        <button
          onClick={() => { resetForm(); setView("form"); }}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-bold uppercase tracking-wider text-red-200 hover:opacity-90 transition"
          style={{ backgroundColor: "#7f1d1d" }}
          data-testid="button-new-contract"
        >
          <Plus size={16} /> NEW CONTRACT
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-slate-600" data-testid="text-loading">Loading...</div>
      )}

      {!isLoading && contracts.length === 0 && (
        <div className="text-center py-16" data-testid="text-empty-state">
          <FileText className="mx-auto text-slate-700 mb-4" size={48} />
          <p className="text-slate-500 text-sm">No contracts yet. Create your first contract.</p>
        </div>
      )}

      <div className="space-y-4">
        {contracts.map((contract) => {
          const StatusIcon = STATUS_ICONS[contract.status] || FileText;
          const daysLeft = contract.status === "active" ? getDaysRemaining(contract.endDate) : null;
          const statusColor = STATUS_COLORS[contract.status] || STATUS_COLORS.draft;

          return (
            <div
              key={contract.id}
              className="border border-red-950/30 rounded-lg p-5 hover:border-red-900/50 transition cursor-pointer"
              style={{ backgroundColor: "#0a0a0a" }}
              onClick={() => handleEdit(contract)}
              data-testid={`card-contract-${contract.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <StatusIcon size={18} className="text-red-900" />
                  <h3 className="text-slate-200 font-semibold" data-testid={`text-contract-title-${contract.id}`}>
                    {contract.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {daysLeft !== null && (
                    <span className="text-xs text-slate-500 flex items-center gap-1" data-testid={`text-days-remaining-${contract.id}`}>
                      <Clock size={12} /> {daysLeft}d remaining
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium uppercase tracking-wider ${statusColor}`}
                    data-testid={`badge-status-${contract.id}`}
                  >
                    {contract.status}
                  </span>
                </div>
              </div>

              {contract.terms && (
                <p className="text-slate-500 text-sm line-clamp-2 mb-3" data-testid={`text-terms-preview-${contract.id}`}>
                  {contract.terms}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-600">
                {contract.duration && <span>Duration: {contract.duration}</span>}
                {contract.safeword && (
                  <span className="flex items-center gap-1">
                    <AlertTriangle size={10} /> Safeword set
                  </span>
                )}
                <span className="flex items-center gap-1">
                  {contract.signedByCreator ? <Check size={10} className="text-red-700" /> : <X size={10} />}
                  Creator
                </span>
                <span className="flex items-center gap-1">
                  {contract.signedByPartner ? <Check size={10} className="text-red-700" /> : <X size={10} />}
                  Partner
                </span>
              </div>

              {contract.status === "negotiating" && !contract.signedByCreator && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleSign(contract); }}
                  className="mt-3 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded text-red-200 hover:opacity-90 transition"
                  style={{ backgroundColor: "#7f1d1d" }}
                  data-testid={`button-sign-${contract.id}`}
                >
                  SIGN CONTRACT
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}