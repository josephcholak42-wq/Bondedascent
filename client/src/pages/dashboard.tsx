import React, { useState } from 'react';
import { useLocation } from "wouter";
import { 
  Lock, Key, Shield, AlertCircle, CheckCircle, 
  FileText, User, ChevronRight, Activity, 
  Clock, Flame, Menu, X, Terminal, Fingerprint,
  Camera, DollarSign, Send, BookOpen, Anchor, 
  CreditCard, Gift, Mail, Star, Heart, 
  Sliders, Map, Film, Target, Box, Home,
  PieChart, Award, Zap, Settings,
  LogOut, Trash2, Bell, ShieldAlert,
  Moon, Sun, RefreshCw, MessageSquare, RotateCcw,
  Dices, List, Play, Pause, AlertTriangle, Smile, Meh, Frown, 
  Music, Eye, Coffee, Thermometer, Info, HeartPulse,
  FlameKindling, Sparkles, BookHeart, UserRoundCheck, 
  HandMetal, Ear, Hand, Gavel, FileSignature, Timer,
  Unlock, Ban, Search, Check, XCircle, Loader2, Plus
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  useAuth, useLogout, useSwitchRole, useStats,
  useTasks, useCreateTask, useToggleTask, useDeleteTask,
  useCheckIns, useCreateCheckIn,
  useSpinDare, useCompleteDare, useDares,
  useRewards, useCreateReward,
  usePunishments, useCreatePunishment,
  useJournal, useCreateJournal,
  useNotifications, useDismissNotification,
  useActivityLog,
  usePartner, usePartnerStats, useGeneratePairCode, useJoinPairCode, useUnlinkPartner,
  usePartnerTasks, useCreatePartnerTask, usePartnerCheckIns, useReviewPartnerCheckIn,
  useCreatePartnerPunishment, useCreatePartnerReward, usePartnerActivity,
} from '@/lib/hooks';

export default function BondedAscentApp() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isVelvetMode, setIsVelvetMode] = useState(false);
  const [isCrisisMode, setIsCrisisMode] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);
  const [checkInStep, setCheckInStep] = useState(0);
  const [checkInData, setCheckInData] = useState({ mood: 5, obedience: 5, notes: '' });
  const [newTaskText, setNewTaskText] = useState('');
  const [newRewardName, setNewRewardName] = useState('');
  const [newPunishmentName, setNewPunishmentName] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [pairCodeInput, setPairCodeInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [pairError, setPairError] = useState<string | null>(null);
  const [pairSuccess, setPairSuccess] = useState<string | null>(null);

  const { data: user } = useAuth();
  const logoutMutation = useLogout();
  const switchRoleMutation = useSwitchRole();
  const { data: stats } = useStats();
  const { data: tasks = [] } = useTasks();
  const createTaskMutation = useCreateTask();
  const toggleTaskMutation = useToggleTask();
  const deleteTaskMutation = useDeleteTask();
  const { data: checkIns = [] } = useCheckIns();
  const createCheckInMutation = useCreateCheckIn();
  const spinDareMutation = useSpinDare();
  const completeDareMutation = useCompleteDare();
  const { data: dares = [] } = useDares();
  const { data: rewards = [] } = useRewards();
  const createRewardMutation = useCreateReward();
  const { data: punishments = [] } = usePunishments();
  const createPunishmentMutation = useCreatePunishment();
  const { data: journalEntries = [] } = useJournal();
  const createJournalMutation = useCreateJournal();
  const { data: notifications = [] } = useNotifications();
  const dismissNotificationMutation = useDismissNotification();
  const { data: activityLog = [] } = useActivityLog();

  const { data: partner } = usePartner();
  const { data: partnerStats } = usePartnerStats();
  const generatePairCodeMutation = useGeneratePairCode();
  const joinPairCodeMutation = useJoinPairCode();
  const unlinkPartnerMutation = useUnlinkPartner();
  const { data: partnerTasks = [] } = usePartnerTasks();
  const createPartnerTaskMutation = useCreatePartnerTask();
  const { data: partnerCheckIns = [] } = usePartnerCheckIns();
  const reviewPartnerCheckInMutation = useReviewPartnerCheckIn();
  const createPartnerPunishmentMutation = useCreatePartnerPunishment();
  const createPartnerRewardMutation = useCreatePartnerReward();
  const { data: partnerActivity = [] } = usePartnerActivity();

  const userRole = (user?.role || 'sub') as 'sub' | 'dom';
  const xp = stats?.xp ?? 0;
  const level = stats?.level ?? 1;
  const xpMax = 100 * level;
  const xpPercent = Math.min(Math.round((xp / xpMax) * 100), 100);

  const handleToggleTask = (taskId: string) => {
    toggleTaskMutation.mutate(taskId);
  };

  const handleCreateTask = () => {
    if (!newTaskText.trim()) return;
    createTaskMutation.mutate({ text: newTaskText });
    setNewTaskText('');
  };

  const handleSpinWheel = () => {
    setIsSpinning(true);
    setWheelResult(null);
    setTimeout(async () => {
      try {
        const dare = await spinDareMutation.mutateAsync();
        setWheelResult(dare.text);
      } catch {
        setWheelResult("Failed to spin. Try again.");
      }
      setIsSpinning(false);
    }, 2000);
  };

  const handleSubmitCheckIn = async () => {
    await createCheckInMutation.mutateAsync({
      mood: checkInData.mood,
      obedience: checkInData.obedience,
      notes: checkInData.notes || undefined,
    });
    setModal(null);
    setCheckInStep(0);
    setCheckInData({ mood: 5, obedience: 5, notes: '' });
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation('/auth');
  };

  const handleSwitchRole = async () => {
    const newRole = userRole === 'sub' ? 'dom' : 'sub';
    await switchRoleMutation.mutateAsync(newRole);
    setActiveView('dashboard');
  };

  const handleCreateReward = () => {
    if (!newRewardName.trim()) return;
    createRewardMutation.mutate({ name: newRewardName });
    setNewRewardName('');
  };

  const handleCreatePunishment = (name: string) => {
    createPunishmentMutation.mutate({ name });
  };

  const handleSaveJournal = () => {
    if (!journalContent.trim()) return;
    createJournalMutation.mutate(journalContent);
    setJournalContent('');
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return '';
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const DomDashboard = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col items-center gap-6 pt-4">
        <div className="flex items-center gap-8 relative">
          <div className="text-center relative">
            <div className="w-20 h-20 rounded-full border-2 border-red-600 p-1 mb-2 bg-black shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <Shield size={32} className="text-red-500" />
              </div>
            </div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">{user?.username} (Dom)</div>
          </div>
          <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-red-900 to-transparent relative opacity-50">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full shadow-[0_0_15px_red] animate-pulse" />
          </div>
          <div className="text-center relative">
            <div className="w-20 h-20 rounded-full border-2 border-slate-700 p-1 mb-2 bg-black">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <Heart size={32} className={partner ? "text-red-400" : "text-slate-600"} />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{partner ? partner.username : 'Not Paired'}</div>
          </div>
        </div>
        
        {!partner ? (
          <button onClick={() => setModal('pair')} className="w-full max-w-sm px-6 py-4 rounded-full flex justify-between items-center group active:scale-95 transition-all cursor-pointer bg-gradient-to-b from-red-700 to-red-950 border-t border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            <div className="flex items-center gap-3">
              <Anchor size={20} className="text-white drop-shadow-md" />
              <span className="font-black uppercase text-sm tracking-wider text-white">Connect to your Sub</span>
            </div>
            <ChevronRight size={20} className="text-white opacity-70 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <div className="w-full max-w-sm flex gap-4">
            <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 p-4 rounded-xl text-center">
              <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Compliance</div>
              <div data-testid="text-compliance" className="text-2xl font-black text-green-500">{partnerStats?.complianceRate ?? 0}%</div>
            </div>
            <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 p-4 rounded-xl text-center">
              <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Sub Level</div>
              <div data-testid="text-level" className="text-2xl font-black text-red-500">Lv {partnerStats?.level ?? 1}</div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-red-600" style={{ width: `${partnerStats ? Math.min(Math.round(((partnerStats.xp ?? 0) / (100 * (partnerStats.level ?? 1))) * 100), 100) : 0}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Control Panel</h3>
        <button 
          data-testid="button-dom-velvet-toggle"
          onClick={() => setIsVelvetMode(!isVelvetMode)} 
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase transition-all shadow-lg cursor-pointer
            ${isVelvetMode 
              ? 'bg-red-950 border-red-500 text-red-400 shadow-[0_0_10px_rgba(220,38,38,0.2)]' 
              : 'bg-slate-900 border-slate-700 text-slate-400'}`}
        >
          {isVelvetMode ? <Moon size={12} /> : <Sun size={12} />}
          {isVelvetMode ? 'Velvet Mode' : 'Standard'}
        </button>
      </div>

      {!isVelvetMode ? (
        <div className="space-y-6 animate-in fade-in">
          {partner ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <BigButton icon={<List />} label="Assign Tasks" sub={`${partnerTasks.length} protocols`} color="text-blue-500" onClick={() => setModal('dom_tasks')} />
                <BigButton icon={<Gift />} label="Grant Reward" sub={`${rewards.length} rewards`} color="text-purple-500" onClick={() => setModal('dom_rewards')} />
                <BigButton icon={<Gavel />} label="Punish" sub="Assign Penalty" color="text-red-600" onClick={() => setModal('dom_punish')} />
                <BigButton icon={<MessageSquare />} label="Review Logs" sub={`${partnerCheckIns.filter(c => c.status === 'pending').length} Pending`} color="text-emerald-500" onClick={() => setModal('dom_review')} />
              </div>

              <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{partner.username}'s Activity</h3>
                  <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Live
                  </div>
                </div>
                <div className="space-y-3">
                  {partnerActivity.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex gap-3 items-start text-xs text-slate-300">
                      <span className="font-mono text-slate-600 min-w-[50px]">{formatTime(log.createdAt)}</span>
                      <div className="mt-0.5">
                        {log.action.includes('task') ? <CheckCircle size={12} className="text-green-500" /> :
                         log.action.includes('dare') ? <Dices size={12} className="text-purple-500" /> :
                         <FileText size={12} className="text-blue-500" />}
                      </div>
                      <span>{log.detail || log.action}</span>
                    </div>
                  ))}
                  {partnerActivity.length === 0 && (
                    <div className="text-xs text-slate-600 text-center py-4">No activity yet</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl bg-black/20">
              <Heart size={48} className="mx-auto text-slate-700 mb-4" />
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">No Sub Connected</div>
              <div className="text-xs text-slate-600 mb-6">Generate an invite code or have your sub enter yours to link accounts.</div>
              <Button data-testid="button-connect-sub" onClick={() => setModal('pair')} className="bg-red-600 hover:bg-red-500">Connect Partner</Button>
            </div>
          )}

          <div className="bg-gradient-to-r from-red-950/30 to-slate-950 border border-red-900/30 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ShieldAlert size={28} className="text-red-500" />
              <div>
                <div className="font-bold text-white text-sm uppercase tracking-wider">Force Crisis Mode</div>
                <div className="text-[10px] text-slate-500">Override Sub's interface immediately</div>
              </div>
            </div>
            <Button data-testid="button-crisis" variant="destructive" size="sm" onClick={() => setIsCrisisMode(true)}>ACTIVATE</Button>
          </div>
        </div>
      ) : (
        <div className="relative h-[450px] w-full flex items-center justify-center animate-in zoom-in-95 duration-700">
          <div className="absolute inset-0 bg-red-900/10 blur-[80px] rounded-full pointer-events-none" />
          <button className="w-28 h-28 rounded-full bg-gradient-to-br from-red-800 to-black border-2 border-red-500/30 shadow-[0_0_40px_rgba(220,38,38,0.3)] flex flex-col items-center justify-center z-20 hover:scale-105 transition-transform group cursor-pointer">
            <Shield className="text-white mb-1 group-hover:text-red-200" size={32} />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Command</span>
          </button>
          
          <div className="absolute w-[260px] h-[260px] border border-white/5 rounded-full pointer-events-none" />
          <SanctuaryNode icon={<List />} label="Protocols" angle={270} color="bg-blue-600" onClick={() => setModal('dom_tasks')} />
          <SanctuaryNode icon={<Eye />} label="Observe" angle={315} color="bg-emerald-600" onClick={() => setModal('dom_review')} />
          <SanctuaryNode icon={<Gavel />} label="Punish" angle={0} color="bg-red-600" onClick={() => setModal('dom_punish')} />
          <SanctuaryNode icon={<Gift />} label="Reward" angle={45} color="bg-purple-600" onClick={() => setModal('dom_rewards')} />
          <SanctuaryNode icon={<Target />} label="Training" angle={90} color="bg-rose-600" onClick={() => setModal('training')} />
          <SanctuaryNode icon={<Film />} label="Scene" angle={135} color="bg-pink-600" onClick={() => setModal('scene')} />
          <SanctuaryNode icon={<Sliders />} label="Sensory" angle={180} color="bg-slate-700" onClick={() => setModal('sensory')} />
          <SanctuaryNode icon={<ShieldAlert />} label="Crisis" angle={225} color="bg-yellow-600" onClick={() => setIsCrisisMode(true)} />
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (userRole === 'dom' && activeView === 'dashboard') {
      return <DomDashboard />;
    }

    if (activeView === 'dashboard') {
      return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-center gap-6 pt-4">
            <div className="flex items-center gap-8 relative">
              <div className="text-center relative">
                <div className="w-20 h-20 rounded-full border-2 border-red-600 p-1 mb-2 bg-black shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <Heart size={32} className="text-red-500" />
                  </div>
                </div>
                <div className="text-sm font-bold text-white uppercase tracking-wider">{user?.username}</div>
              </div>
              <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-red-900 to-transparent relative opacity-50">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full shadow-[0_0_15px_red] animate-pulse" />
              </div>
              <div className="text-center relative">
                <div className="w-20 h-20 rounded-full border-2 border-red-900 p-1 mb-2 bg-black">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <Shield size={32} className="text-slate-600" />
                  </div>
                </div>
                <div className="text-sm font-bold text-white uppercase tracking-wider">Dominant</div>
              </div>
            </div>
            
            <button onClick={() => setModal('bond')} className="w-full max-w-sm px-6 py-4 rounded-full flex justify-between items-center group active:scale-95 transition-all cursor-pointer bg-gradient-to-b from-red-700 to-red-950 border-t border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              <div className="flex items-center gap-3">
                <Anchor size={20} className="text-white drop-shadow-md" />
                <span className="font-black uppercase text-sm tracking-wider text-white">Level {level} <span className="opacity-70 font-bold text-[10px] ml-1">{xp}/{xpMax} XP</span></span>
              </div>
              <ChevronRight size={20} className="text-white opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dashboard Controls</h3>
            <button 
              data-testid="button-velvet-toggle"
              onClick={() => setIsVelvetMode(!isVelvetMode)} 
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase transition-all shadow-lg cursor-pointer
                ${isVelvetMode 
                  ? 'bg-red-950 border-red-500 text-red-400 shadow-[0_0_10px_rgba(220,38,38,0.2)]' 
                  : 'bg-slate-900 border-slate-700 text-slate-400'}`}
            >
              {isVelvetMode ? <Moon size={12} /> : <Sun size={12} />}
              {isVelvetMode ? 'Velvet Mode' : 'Standard'}
            </button>
          </div>

          {!isVelvetMode ? (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-4 gap-3">
                <QuickAction icon={<Clock />} label="Balance" color="yellow" onClick={() => setModal('balance')} />
                <QuickAction icon={<Settings />} label="Config" color="slate" onClick={() => setActiveView('profile')} />
                <QuickAction icon={<Award />} label="Badges" color="green" onClick={() => setModal('badges')} />
                <QuickAction icon={<Zap />} label="Timers" color="red" onClick={() => setModal('countdowns')} />
              </div>

              <div className="bg-gradient-to-b from-slate-900 to-black border border-white/5 shadow-xl p-1 rounded-2xl">
                <div className="bg-slate-950/50 p-5 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Daily Protocols</h3>
                    <span className="text-[10px] text-slate-600 font-mono">{tasks.filter(t => t.done).length}/{tasks.length}</span>
                  </div>
                  <div className="space-y-3">
                    {tasks.map(task => (
                      <div 
                        key={task.id} 
                        data-testid={`card-task-${task.id}`}
                        onClick={() => handleToggleTask(task.id)} 
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all group
                          ${task.done 
                            ? 'bg-slate-900/30 border-green-900/30 opacity-50' 
                            : 'bg-gradient-to-b from-slate-900 to-black border-slate-800 hover:border-red-900/50 hover:shadow-lg'}`}
                      >
                        <span className={`text-sm font-bold ${task.done ? 'text-green-500 line-through' : 'text-slate-200'}`}>{task.text}</span>
                        {task.done 
                          ? <CheckCircle size={20} className="text-green-500" /> 
                          : <div className="w-5 h-5 rounded-full border-2 border-slate-700 group-hover:border-red-500 transition-colors" />}
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">No protocols assigned yet</div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <input
                      data-testid="input-new-task"
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
                      placeholder="Add new protocol..."
                      className="flex-1 bg-black/40 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                    />
                    <Button data-testid="button-add-task" size="sm" onClick={handleCreateTask} disabled={createTaskMutation.isPending} className="bg-red-600 hover:bg-red-500">
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <BigButton icon={<Dices />} label="Wheel of Dares" sub={`${dares.length} dares`} onClick={() => setModal('wheel')} color="text-purple-500" />
                <BigButton icon={<MessageSquare />} label="Daily Check-In" sub="Submit Report" color="text-blue-500" onClick={() => setModal('checkin')} />
              </div>
            </div>
          ) : (
            <div className="relative h-[450px] w-full flex items-center justify-center animate-in zoom-in-95 duration-700">
              <div className="absolute inset-0 bg-red-900/10 blur-[80px] rounded-full pointer-events-none" />
              <button className="w-28 h-28 rounded-full bg-gradient-to-br from-red-800 to-black border-2 border-red-500/30 shadow-[0_0_40px_rgba(220,38,38,0.3)] flex flex-col items-center justify-center z-20 hover:scale-105 transition-transform group cursor-pointer">
                <Home className="text-white mb-1 group-hover:text-red-200" size={32} />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Explore</span>
              </button>
              
              <div className="absolute w-[260px] h-[260px] border border-white/5 rounded-full pointer-events-none" />
              <SanctuaryNode icon={<Target />} label="Training" angle={270} color="bg-red-600" onClick={() => setModal('training')} />
              <SanctuaryNode icon={<Film />} label="Scene" angle={315} color="bg-purple-600" onClick={() => setModal('scene')} />
              <SanctuaryNode icon={<Activity />} label="Ladders" angle={0} color="bg-rose-600" onClick={() => setModal('ladders')} />
              <SanctuaryNode icon={<FileText />} label="Logbook" angle={45} color="bg-pink-600" onClick={() => setModal('logbook')} />
              <SanctuaryNode icon={<Sliders />} label="Sensory" angle={90} color="bg-slate-700" onClick={() => setModal('sensory')} />
              <SanctuaryNode icon={<Box />} label="Vault" angle={135} color="bg-indigo-600" onClick={() => setModal('vault')} />
              <SanctuaryNode icon={<Heart />} label="Aftercare" angle={180} color="bg-pink-500" onClick={() => setModal('aftercare')} />
              <SanctuaryNode icon={<Star />} label="Worship" angle={225} color="bg-amber-600" onClick={() => setModal('worship')} />
            </div>
          )}
        </div>
      );
    }
    
    if (activeView === 'profile') {
      return (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
          <div className="text-center pt-4">
            <div className="w-24 h-24 mx-auto rounded-full p-1 border-2 border-slate-700 mb-4 bg-black">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                <User size={40} className="text-slate-600" />
              </div>
            </div>
            <h2 data-testid="text-username" className="text-3xl font-black text-white uppercase tracking-tighter">{user?.username}</h2>
            <div className="flex items-center justify-center gap-2 mt-2 bg-black/40 w-fit mx-auto px-4 py-1 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_lime]" />
              <span className="text-xs font-bold text-green-500 uppercase">Connected as {userRole.toUpperCase()}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-950/50 to-black border border-red-900/50 p-6 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-5">
              <div className="bg-red-900/30 p-3 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.2)]"><ShieldAlert size={24} className="text-red-500" /></div>
              <div>
                <div className="font-bold text-red-500 text-lg uppercase tracking-wide">Crisis Mode</div>
                <div className="text-xs text-red-400/50 font-mono">Pause all tasks & XP</div>
              </div>
            </div>
            <button 
              data-testid="button-crisis-toggle"
              onClick={() => setIsCrisisMode(!isCrisisMode)} 
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 shadow-inner cursor-pointer ${isCrisisMode ? 'bg-red-600 shadow-[0_0_10px_red]' : 'bg-slate-900 border border-slate-700'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isCrisisMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Partner Bond</h3>
            {partner ? (
              <div className="bg-gradient-to-r from-red-950/30 to-black border border-red-900/30 p-5 rounded-2xl">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center">
                    <Heart size={20} className="text-red-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white uppercase tracking-wider text-sm">{partner.username}</div>
                    <div className="text-[10px] text-red-400/60 font-mono uppercase">{partner.role} — Level {partner.level}</div>
                  </div>
                </div>
                <Button
                  data-testid="button-unlink"
                  variant="outline"
                  size="sm"
                  className="w-full border-red-900/50 text-red-400 hover:bg-red-950/50 mt-2"
                  onClick={async () => { await unlinkPartnerMutation.mutateAsync(); }}
                  disabled={unlinkPartnerMutation.isPending}
                >
                  {unlinkPartnerMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : 'Dissolve Bond'}
                </Button>
              </div>
            ) : (
              <ProfileItem icon={<Anchor size={20} />} label="Connect to Partner" onClick={() => setModal('pair')} />
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Dynamic Management</h3>
            <ProfileItem icon={<Zap size={20} />} label="Punishments & Rewards" onClick={() => setActiveView('punishments')} />
          </div>

          <div className="space-y-3 pb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Account</h3>
            <ProfileItem icon={<RefreshCw size={20} />} label={`Switch to ${userRole === 'sub' ? 'Dom' : 'Sub'} View`} onClick={handleSwitchRole} />
            <ProfileItem icon={<LogOut size={20} />} label="Log Out" onClick={handleLogout} />
          </div>
        </div>
      );
    }

    if (activeView === 'punishments') {
      return (
        <div className="animate-in slide-in-from-right duration-500 space-y-6">
          <button onClick={() => setActiveView('profile')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 uppercase text-xs font-bold tracking-widest cursor-pointer"><ChevronRight className="rotate-180" size={14} /> Back to Profile</button>
          <h2 className="text-2xl font-black text-white uppercase mb-6">Punishments & Rewards</h2>
          
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Active Punishments</h3>
          <div className="space-y-2">
            {punishments.map(p => (
              <div key={p.id} className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-200 uppercase tracking-wide text-sm">{p.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{p.status}</div>
                </div>
                <Gavel size={14} className="text-red-500" />
              </div>
            ))}
            {punishments.length === 0 && <div className="text-xs text-slate-600 text-center py-4">No punishments assigned</div>}
          </div>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2 mt-6">Rewards</h3>
          <div className="space-y-2">
            {rewards.map(r => (
              <div key={r.id} className="p-4 bg-purple-950/20 border border-purple-900/30 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-200 uppercase tracking-wide text-sm">{r.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{r.unlocked ? 'Unlocked' : `Unlock at Level ${r.unlockLevel}`}</div>
                </div>
                <Gift size={14} className={r.unlocked ? 'text-purple-400' : 'text-slate-600'} />
              </div>
            ))}
            {rewards.length === 0 && <div className="text-xs text-slate-600 text-center py-4">No rewards yet</div>}
          </div>
        </div>
      );
    }

    if (activeView === 'resume') {
      return (
        <div className="animate-in slide-in-from-right duration-500 space-y-6">
          <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-3">
            <Terminal size={24} className="text-red-600" /> Activity Log
          </h2>
          <div className="space-y-3">
            {activityLog.slice(0, 20).map((log) => (
              <div key={log.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:bg-black/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-red-500">
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white uppercase tracking-wider">{log.action.replace(/_/g, ' ')}</div>
                    <div className="text-[10px] text-slate-500">{log.detail || ''}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-600">{formatTime(log.createdAt)}</div>
                </div>
              </div>
            ))}
            {activityLog.length === 0 && (
              <div className="text-center py-12 text-slate-600 text-xs uppercase tracking-widest">No activity recorded yet</div>
            )}
          </div>
        </div>
      );
    }

    if (activeView === 'journal') {
      return (
        <div className="animate-in slide-in-from-right duration-500 space-y-6">
          <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-3">
            <BookOpen size={24} className="text-pink-600" /> Reflection Journal
          </h2>
          <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl">
            <div className="mb-6">
              <Label className="text-slate-400 mb-2 block uppercase text-[10px] font-bold tracking-widest">Today's Reflection</Label>
              <textarea 
                data-testid="input-journal"
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                className="w-full bg-black/50 border border-slate-800 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-pink-500/50 min-h-[150px]"
                placeholder="Write your thoughts here..."
              />
            </div>
            <Button 
              data-testid="button-save-journal"
              onClick={handleSaveJournal} 
              disabled={createJournalMutation.isPending || !journalContent.trim()}
              className="w-full bg-pink-900/50 border border-pink-500/30 text-pink-200 hover:bg-pink-800/50"
            >
              {createJournalMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : 'Save Journal Entry'}
            </Button>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Previous Entries</h3>
            {journalEntries.map(entry => (
              <div key={entry.id} className="bg-black/40 border border-white/5 p-4 rounded-xl">
                <div className="text-[10px] font-mono text-pink-500 mb-1">{new Date(entry.createdAt!).toLocaleDateString()}</div>
                <div className="text-sm text-slate-400 line-clamp-3 italic">"{entry.content}"</div>
              </div>
            ))}
            {journalEntries.length === 0 && (
              <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">No journal entries yet</div>
            )}
          </div>
        </div>
      );
    }

    if (activeView === 'stats') {
      return (
        <div className="animate-in slide-in-from-right duration-500 space-y-8">
          <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-3">
            <Activity size={24} className="text-emerald-500" /> Bond Statistics
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl text-center">
              <div data-testid="text-compliance-rate" className="text-2xl font-black text-white">{stats?.complianceRate ?? 0}%</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Compliance</div>
            </div>
            <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl text-center">
              <div data-testid="text-total-checkins" className="text-2xl font-black text-white">{stats?.totalCheckIns ?? 0}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Check-Ins</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
              <div className="text-xl font-black text-red-500">{stats?.completedTasks ?? 0}</div>
              <div className="text-[8px] text-slate-500 uppercase font-bold">Tasks Done</div>
            </div>
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
              <div className="text-xl font-black text-purple-500">{stats?.completedDares ?? 0}</div>
              <div className="text-[8px] text-slate-500 uppercase font-bold">Dares Done</div>
            </div>
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
              <div className="text-xl font-black text-pink-500">{stats?.totalJournalEntries ?? 0}</div>
              <div className="text-[8px] text-slate-500 uppercase font-bold">Journal</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Breakdown</h3>
            {[
              { label: 'Protocols', val: stats?.complianceRate ?? 0, color: 'bg-red-500' },
              { label: 'Journal Entries', val: Math.min((stats?.totalJournalEntries ?? 0) * 10, 100), color: 'bg-emerald-500' },
              { label: 'Dares Completed', val: stats?.totalDares ? Math.round(((stats?.completedDares ?? 0) / stats.totalDares) * 100) : 0, color: 'bg-blue-500' }
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">{stat.label}</span>
                  <span className="text-white">{stat.val}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${stat.color}`} style={{ width: `${stat.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 opacity-50 border-2 border-dashed border-white/10 rounded-3xl bg-black/20 m-4 animate-in fade-in">
        <Key size={64} className="mb-6 text-slate-600" />
        <h2 className="text-3xl font-black uppercase text-slate-700">Module Active</h2>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden relative selection:bg-red-900 selection:text-white">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      {isCrisisMode && (
        <div className="fixed inset-0 z-[100] bg-red-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <ShieldAlert size={80} className="text-white mb-6 animate-pulse" />
          <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-4 text-center drop-shadow-lg">Crisis Mode Active</h1>
          <p className="text-red-200 text-center max-w-md mb-12 text-lg font-bold">All protocols suspended.<br/>Focus on grounding and safety.</p>
          <button 
            data-testid="button-deactivate-crisis"
            onClick={() => setIsCrisisMode(false)} 
            className="px-8 py-4 bg-white text-red-900 font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_white] hover:scale-105 transition-transform cursor-pointer"
          >
            Deactivate
          </button>
        </div>
      )}

      <aside className="w-24 bg-black border-r border-white/10 hidden md:flex flex-col items-center py-8 z-20 shadow-2xl relative">
        <div className="mb-10 p-4 bg-slate-900 rounded-2xl border border-white/5 shadow-inner">
          <Lock className="text-red-600 drop-shadow-[0_0_8px_red]" size={28} />
        </div>
        <div className="flex flex-col gap-8 w-full px-2">
          <SidebarIcon icon={<Home />} active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <SidebarIcon icon={<Terminal />} active={activeView === 'resume'} onClick={() => setActiveView('resume')} />
          <SidebarIcon icon={<BookOpen />} active={activeView === 'journal'} onClick={() => setActiveView('journal')} />
          <SidebarIcon icon={<Activity />} active={activeView === 'stats'} onClick={() => setActiveView('stats')} />
          <div className="mt-auto pt-8 border-t border-white/10 w-full flex justify-center">
            <SidebarIcon icon={<Settings />} active={activeView === 'profile'} onClick={() => setActiveView('profile')} />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 p-4 z-10 sticky top-0">
          <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-black text-white tracking-tighter uppercase drop-shadow-md">
                Bonded<span className="text-red-600">Ascent</span>
              </div>
              {isVelvetMode && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/30 text-red-500 border border-red-500/50 uppercase tracking-widest animate-pulse">
                  Velvet Mode
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_lime]" />
              <span data-testid="text-role-badge" className="text-xs font-bold text-slate-400 uppercase hidden sm:inline">{userRole}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pb-28 md:pb-8 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {notifications.length > 0 && (
              <div className="space-y-2">
                {notifications.slice(0, 5).map(n => (
                  <div key={n.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                    <Info size={14} className="text-red-500 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex-1">{n.text}</span>
                    <button data-testid={`button-dismiss-${n.id}`} onClick={() => dismissNotificationMutation.mutate(n.id)} className="ml-auto opacity-50 hover:opacity-100 cursor-pointer shrink-0"><X size={12}/></button>
                  </div>
                ))}
              </div>
            )}

            <button 
              data-testid="button-safeword"
              onClick={() => setModal('safeword')} 
              className="w-full bg-gradient-to-r from-yellow-900/20 to-transparent border-l-4 border-yellow-500 p-4 rounded-r-xl flex items-center gap-4 hover:bg-yellow-900/30 transition-all group relative overflow-hidden cursor-pointer"
            >
              <div className="bg-yellow-500/10 p-2 rounded-full group-hover:scale-110 transition-transform z-10">
                <ShieldAlert size={24} className="text-yellow-500" />
              </div>
              <div className="text-left z-10">
                <div className="font-bold text-yellow-500 text-sm uppercase tracking-wider">Safeword / Emergency</div>
                <div className="text-[10px] text-yellow-500/50">Tap to immediately pause everything</div>
              </div>
              <ChevronRight className="ml-auto text-yellow-500/50 z-10" size={20} />
            </button>

            {renderContent()}
          </div>
        </div>

        <div className="md:hidden absolute bottom-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 p-2 pb-6 flex justify-around items-end z-30">
          <MobileNavIcon icon={<Home />} label="Home" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <div 
            onClick={() => setActiveView('profile')} 
            className={`mb-2 w-14 h-14 rounded-full border-2 border-slate-800 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${activeView === 'profile' ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_red]' : 'bg-slate-900 text-slate-400'}`}
          >
            <Menu size={26} />
          </div>
          <MobileNavIcon icon={<Activity />} label="Stats" active={activeView === 'stats'} onClick={() => setActiveView('stats')} />
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-black border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <button data-testid="button-close-modal" onClick={() => setModal(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer z-50"><X size={24}/></button>
            
            {modal === 'safeword' && (
              <div className="text-center p-4">
                <ShieldAlert size={64} className="mx-auto text-yellow-500 mb-6 animate-bounce" />
                <h2 className="text-2xl font-black text-white uppercase mb-4">Safeword Triggered</h2>
                <p className="text-slate-400 mb-8">Alert sent to Partner. App paused.</p>
                <button data-testid="button-resume" onClick={() => setModal(null)} className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase rounded-lg cursor-pointer">Resume</button>
              </div>
            )}
            
            {modal === 'pair' && (
              <div className="p-4 space-y-6">
                <div className="text-center mb-4">
                  <Anchor size={48} className="mx-auto text-red-500 mb-2" />
                  <h2 className="text-xl font-black text-white uppercase">Connect to Partner</h2>
                  <p className="text-xs text-slate-500 mt-2">Link your accounts using an invite code</p>
                </div>

                {pairError && (
                  <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle size={14} /> {pairError}
                  </div>
                )}
                {pairSuccess && (
                  <div className="bg-green-900/20 border border-green-500/30 p-3 rounded-lg text-xs text-green-400 flex items-center gap-2">
                    <CheckCircle size={14} /> {pairSuccess}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="bg-slate-900/50 border border-white/5 p-5 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Option 1: Generate a Code</div>
                    <p className="text-[10px] text-slate-500">Share this code with your partner so they can connect to you.</p>
                    {generatedCode ? (
                      <div className="text-center">
                        <div className="text-3xl font-black text-red-500 tracking-[0.3em] bg-black/40 py-3 rounded-lg border border-red-500/30">{generatedCode}</div>
                        <p className="text-[10px] text-slate-600 mt-2">Expires in 30 minutes</p>
                      </div>
                    ) : (
                      <Button
                        data-testid="button-generate-code"
                        className="w-full bg-red-600 hover:bg-red-500"
                        onClick={async () => {
                          setPairError(null);
                          try {
                            const result = await generatePairCodeMutation.mutateAsync();
                            setGeneratedCode(result.code);
                          } catch (e: any) {
                            setPairError(e?.message || 'Failed to generate code');
                          }
                        }}
                        disabled={generatePairCodeMutation.isPending}
                      >
                        {generatePairCodeMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : 'Generate Invite Code'}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] text-slate-600 uppercase font-bold">or</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="bg-slate-900/50 border border-white/5 p-5 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Option 2: Enter a Code</div>
                    <p className="text-[10px] text-slate-500">Enter the code your partner shared with you.</p>
                    <div className="flex gap-2">
                      <input
                        data-testid="input-pair-code"
                        type="text"
                        value={pairCodeInput}
                        onChange={(e) => setPairCodeInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && pairCodeInput.trim() && (async () => {
                          setPairError(null);
                          try {
                            const result = await joinPairCodeMutation.mutateAsync(pairCodeInput.trim());
                            setPairSuccess(`Bonded with ${result.partnerUsername}!`);
                            setPairCodeInput('');
                            setTimeout(() => { setModal(null); setPairSuccess(null); }, 2000);
                          } catch (e: any) {
                            setPairError(e?.message || 'Failed to join');
                          }
                        })()}
                        placeholder="XXXXXX"
                        maxLength={6}
                        className="flex-1 bg-black/40 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white text-center font-mono tracking-widest focus:outline-none focus:border-red-500/50 uppercase"
                      />
                      <Button
                        data-testid="button-join-code"
                        className="bg-red-600 hover:bg-red-500"
                        onClick={async () => {
                          if (!pairCodeInput.trim()) return;
                          setPairError(null);
                          try {
                            const result = await joinPairCodeMutation.mutateAsync(pairCodeInput.trim());
                            setPairSuccess(`Bonded with ${result.partnerUsername}!`);
                            setPairCodeInput('');
                            setTimeout(() => { setModal(null); setPairSuccess(null); }, 2000);
                          } catch (e: any) {
                            setPairError(e?.message || 'Failed to join');
                          }
                        }}
                        disabled={joinPairCodeMutation.isPending || !pairCodeInput.trim()}
                      >
                        {joinPairCodeMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : 'Join'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modal === 'dom_tasks' && (
              <div className="p-4 space-y-6 overflow-y-auto">
                <div className="text-center mb-4">
                  <List size={48} className="mx-auto text-blue-500 mb-2" />
                  <h2 className="text-xl font-bold text-white uppercase">Assign Protocols</h2>
                  {partner && <p className="text-xs text-slate-500 mt-1">Assigning to {partner.username}</p>}
                </div>
                {!partner ? (
                  <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">Connect to a partner first</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input 
                        data-testid="input-dom-task"
                        type="text" 
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && newTaskText.trim() && (() => { createPartnerTaskMutation.mutate({ text: newTaskText }); setNewTaskText(''); })()}
                        placeholder="New Task Description..." 
                        className="flex-1 bg-black/40 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                      />
                      <Button data-testid="button-dom-add-task" className="bg-blue-600 hover:bg-blue-500" onClick={() => { if (newTaskText.trim()) { createPartnerTaskMutation.mutate({ text: newTaskText }); setNewTaskText(''); } }} disabled={createPartnerTaskMutation.isPending}>
                        <Check size={16} />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-500 font-bold tracking-widest pl-1">{partner.username}'s Protocols</Label>
                      {partnerTasks.map(t => (
                        <div key={t.id} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-white/5">
                          <span className={`text-sm text-slate-300 ${t.done ? 'line-through opacity-50' : ''}`}>{t.text}</span>
                          {t.done ? <CheckCircle size={16} className="text-green-500" /> : <Clock size={16} className="text-slate-600" />}
                        </div>
                      ))}
                      {partnerTasks.length === 0 && <div className="text-xs text-slate-600 text-center py-4">No protocols assigned yet</div>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {modal === 'dom_rewards' && (
              <div className="p-4 space-y-6 overflow-y-auto">
                <div className="text-center mb-4">
                  <Gift size={48} className="mx-auto text-purple-500 mb-2" />
                  <h2 className="text-xl font-bold text-white uppercase">Grant Rewards</h2>
                  {partner && <p className="text-xs text-slate-500 mt-1">For {partner.username}</p>}
                </div>
                {!partner ? (
                  <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">Connect to a partner first</div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {rewards.map((r) => (
                        <div key={r.id} className="flex justify-between items-center p-3 bg-slate-900/50 border border-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-full text-purple-400"><Star size={14} /></div>
                            <span className="text-sm font-bold text-slate-300">{r.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{r.unlocked ? 'Unlocked' : `Lv ${r.unlockLevel}`}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        data-testid="input-reward-name"
                        type="text"
                        value={newRewardName}
                        onChange={(e) => setNewRewardName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && newRewardName.trim() && (() => { createPartnerRewardMutation.mutate({ name: newRewardName }); setNewRewardName(''); })()}
                        placeholder="New reward name..."
                        className="flex-1 bg-black/40 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                      <Button data-testid="button-create-reward" className="bg-purple-600 hover:bg-purple-500" onClick={() => { if (newRewardName.trim()) { createPartnerRewardMutation.mutate({ name: newRewardName }); setNewRewardName(''); } }} disabled={createPartnerRewardMutation.isPending}>
                        <Plus size={16} />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {modal === 'dom_punish' && (
              <div className="p-4 space-y-6">
                <div className="text-center mb-4">
                  <Gavel size={48} className="mx-auto text-red-600 mb-2" />
                  <h2 className="text-xl font-bold text-white uppercase">Discipline</h2>
                  {partner && <p className="text-xs text-slate-500 mt-1">For {partner.username}</p>}
                </div>
                {!partner ? (
                  <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">Connect to a partner first</div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {['Corner Time', 'Writing Lines', 'Cold Shower', 'Privilege Revoked'].map((p, i) => (
                        <button 
                          key={i} 
                          data-testid={`button-punish-${i}`}
                          onClick={() => { createPartnerPunishmentMutation.mutate({ name: p }); setModal(null); }}
                          className="p-4 bg-red-950/20 border border-red-900/30 hover:bg-red-900/40 hover:border-red-500/50 rounded-xl text-center transition-all group cursor-pointer"
                        >
                          <div className="text-red-500 font-bold text-xs uppercase mb-1 group-hover:text-white transition-colors">{p}</div>
                          <div className="text-[9px] text-red-500/50">Assign Immediately</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        data-testid="input-punishment-name"
                        type="text"
                        value={newPunishmentName}
                        onChange={(e) => setNewPunishmentName(e.target.value)}
                        placeholder="Custom punishment..."
                        className="flex-1 bg-black/40 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                      />
                      <Button 
                        data-testid="button-custom-punish"
                        className="bg-red-600 hover:bg-red-500" 
                        onClick={() => { if (newPunishmentName.trim()) { createPartnerPunishmentMutation.mutate({ name: newPunishmentName }); setNewPunishmentName(''); setModal(null); } }}
                        disabled={createPartnerPunishmentMutation.isPending}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {modal === 'dom_review' && (
              <div className="p-4 space-y-6 overflow-y-auto">
                <div className="text-center mb-4">
                  <FileSignature size={48} className="mx-auto text-emerald-500 mb-2" />
                  <h2 className="text-xl font-bold text-white uppercase">Review Check-Ins</h2>
                  {partner && <p className="text-xs text-slate-500 mt-1">{partner.username}'s submissions</p>}
                </div>
                {!partner ? (
                  <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">Connect to a partner first</div>
                ) : (
                  <div className="space-y-4">
                    {partnerCheckIns.filter(c => c.status === 'pending').map((rev) => (
                      <div key={rev.id} className="bg-slate-900/50 border border-white/5 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-2 items-center">
                            <span className="px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-400 text-[10px] font-bold uppercase">Check-In</span>
                            <span className="text-[10px] text-slate-500">{formatTime(rev.createdAt)}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-black/30 p-2 rounded"><span className="text-slate-500">Mood:</span> <span className="text-white font-bold">{rev.mood}/10</span></div>
                          <div className="bg-black/30 p-2 rounded"><span className="text-slate-500">Obedience:</span> <span className="text-white font-bold">{rev.obedience}/10</span></div>
                        </div>
                        {rev.notes && <p className="text-sm text-slate-300 italic">"{rev.notes}"</p>}
                        <div className="flex gap-2">
                          <Button
                            data-testid={`button-approve-${rev.id}`}
                            size="sm"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                            onClick={() => reviewPartnerCheckInMutation.mutate({ checkInId: rev.id, status: 'approved', xpAwarded: 10 })}
                            disabled={reviewPartnerCheckInMutation.isPending}
                          >
                            <Check size={14} className="mr-1" /> Approve (+10 XP)
                          </Button>
                          <Button
                            data-testid={`button-reject-${rev.id}`}
                            size="sm"
                            variant="outline"
                            className="flex-1 border-red-900/50 text-red-400 hover:bg-red-950/50"
                            onClick={() => reviewPartnerCheckInMutation.mutate({ checkInId: rev.id, status: 'rejected', xpAwarded: 0 })}
                            disabled={reviewPartnerCheckInMutation.isPending}
                          >
                            <XCircle size={14} className="mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                    {partnerCheckIns.filter(c => c.status === 'pending').length === 0 && (
                      <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest">No pending reviews</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {modal === 'bond' && (
              <div className="text-center p-4">
                <Anchor size={48} className="mx-auto text-red-600 mb-4" />
                <h2 className="text-xl font-black text-white uppercase">Level {level}</h2>
                <p className="text-red-400 font-bold uppercase text-xs mb-6">{level === 1 ? 'Emerging Bond' : level === 2 ? 'Growing Trust' : 'Deep Connection'}</p>
                <div className="w-full h-4 bg-black rounded-full overflow-hidden border border-white/20 mb-2">
                  <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${xpPercent}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 uppercase">
                  <span>0 XP</span>
                  <span>{xp} / {xpMax}</span>
                  <span>Level {level + 1}</span>
                </div>
              </div>
            )}
            
            {modal === 'wheel' && (
              <div className="text-center p-4">
                <Dices size={48} className={`mx-auto text-purple-500 mb-4 ${isSpinning ? 'animate-spin' : ''}`} />
                <h2 className="text-xl font-bold text-white mb-2">Wheel of Dares</h2>
                
                {wheelResult ? (
                  <div className="my-8 animate-in zoom-in-95">
                    <div className="text-xs text-purple-400 uppercase tracking-widest mb-2">Fate Decided</div>
                    <div className="text-lg font-black text-white border p-4 rounded-xl bg-purple-900/20 border-purple-500/50">{wheelResult}</div>
                  </div>
                ) : (
                  <p className="text-slate-400 my-8 italic">"Let fate decide your next task..."</p>
                )}

                <button 
                  data-testid="button-spin"
                  onClick={handleSpinWheel} 
                  disabled={isSpinning}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {isSpinning ? 'Spinning...' : 'Spin Now'}
                </button>

                {dares.length > 0 && (
                  <div className="mt-6 space-y-2 text-left max-h-40 overflow-y-auto">
                    <Label className="text-xs uppercase text-slate-500 font-bold tracking-widest pl-1">Past Dares</Label>
                    {dares.slice(0, 5).map(d => (
                      <div key={d.id} className="flex justify-between items-center bg-black/30 p-2 rounded-lg text-xs">
                        <span className={`text-slate-300 ${d.completed ? 'line-through opacity-50' : ''}`}>{d.text}</span>
                        {!d.completed && (
                          <button 
                            data-testid={`button-complete-dare-${d.id}`}
                            onClick={() => completeDareMutation.mutate(d.id)} 
                            className="text-purple-400 hover:text-purple-300 text-[10px] uppercase font-bold cursor-pointer"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {modal === 'checkin' && (
              <div className="p-4 space-y-6">
                <div className="text-center mb-6">
                  <MessageSquare size={32} className="mx-auto text-blue-500 mb-2" />
                  <h2 className="text-xl font-bold text-white uppercase">Daily Check-In</h2>
                </div>

                {checkInStep === 0 && (
                  <div className="space-y-6 animate-in slide-in-from-right">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-slate-300">Current Mood</Label>
                        <span className="text-xs font-mono text-blue-400">{checkInData.mood}/10</span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <Frown size={16} className="text-slate-600" />
                        <Slider 
                          defaultValue={[checkInData.mood]} 
                          min={1} max={10} step={1}
                          onValueChange={(v) => setCheckInData(prev => ({ ...prev, mood: v[0] }))}
                          className="flex-1"
                        />
                        <Smile size={16} className="text-slate-600" />
                      </div>
                    </div>
                    <Button data-testid="button-checkin-next" onClick={() => setCheckInStep(1)} className="w-full bg-blue-600 hover:bg-blue-500">Next: Obedience Rating</Button>
                  </div>
                )}

                {checkInStep === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-slate-300">Self-Rated Obedience</Label>
                        <span className="text-xs font-mono text-blue-400">{checkInData.obedience}/10</span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <Ban size={16} className="text-slate-600" />
                        <Slider 
                          defaultValue={[checkInData.obedience]} 
                          min={1} max={10} step={1}
                          onValueChange={(v) => setCheckInData(prev => ({ ...prev, obedience: v[0] }))}
                          className="flex-1"
                        />
                        <CheckCircle size={16} className="text-slate-600" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setCheckInStep(0)} className="flex-1 border-slate-700">Back</Button>
                      <Button data-testid="button-checkin-next2" onClick={() => setCheckInStep(2)} className="flex-1 bg-blue-600 hover:bg-blue-500">Next: Notes</Button>
                    </div>
                  </div>
                )}

                {checkInStep === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right">
                    <div>
                      <Label className="text-slate-300 mb-2 block">Additional Notes</Label>
                      <textarea 
                        data-testid="input-checkin-notes"
                        value={checkInData.notes}
                        onChange={(e) => setCheckInData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full bg-black/40 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm focus:outline-none focus:border-blue-500/50 min-h-[100px]"
                        placeholder="How are you feeling today? Any observations..."
                      />
                    </div>
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
                      <div className="text-xs font-bold text-blue-400 uppercase mb-2">Summary</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Mood: <span className="text-white font-bold">{checkInData.mood}/10</span></div>
                        <div>Obedience: <span className="text-white font-bold">{checkInData.obedience}/10</span></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setCheckInStep(1)} className="flex-1 border-slate-700">Back</Button>
                      <Button 
                        data-testid="button-submit-checkin"
                        onClick={handleSubmitCheckIn} 
                        disabled={createCheckInMutation.isPending}
                        className="flex-1 bg-blue-600 hover:bg-blue-500"
                      >
                        {createCheckInMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : 'Submit Check-In'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {modal === 'badges' && (
              <div className="text-center p-4">
                <Award size={48} className="mx-auto text-green-500 mb-4" />
                <h2 className="text-xl font-bold text-white uppercase mb-6">Achievements</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'First Task', icon: <Check size={20} />, unlocked: (stats?.completedTasks ?? 0) > 0 },
                    { name: 'First Check-In', icon: <MessageSquare size={20} />, unlocked: (stats?.totalCheckIns ?? 0) > 0 },
                    { name: 'First Dare', icon: <Dices size={20} />, unlocked: (stats?.totalDares ?? 0) > 0 },
                    { name: 'Journalist', icon: <BookOpen size={20} />, unlocked: (stats?.totalJournalEntries ?? 0) > 0 },
                    { name: 'Streak 5', icon: <Flame size={20} />, unlocked: (stats?.completedTasks ?? 0) >= 5 },
                    { name: 'Level Up', icon: <Zap size={20} />, unlocked: level >= 2 },
                  ].map((badge, i) => (
                    <div key={i} className={`p-3 rounded-xl border text-center ${badge.unlocked ? 'bg-green-900/20 border-green-500/30' : 'bg-black/20 border-slate-800 opacity-30'}`}>
                      <div className={badge.unlocked ? 'text-green-400' : 'text-slate-600'}>{badge.icon}</div>
                      <div className="text-[9px] font-bold uppercase mt-1 text-slate-400">{badge.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modal === 'aftercare' && (
              <div className="p-4 space-y-6">
                <div className="text-center">
                  <Heart size={48} className="mx-auto text-pink-500 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">Aftercare Protocol</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center gap-2 p-4 bg-slate-900/50 border border-white/5 rounded-xl hover:border-pink-500/50 transition-all cursor-pointer">
                    <Coffee size={24} className="text-pink-400" />
                    <span className="text-[10px] font-bold uppercase text-slate-300">Hydrate</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-slate-900/50 border border-white/5 rounded-xl hover:border-pink-500/50 transition-all cursor-pointer">
                    <Music size={24} className="text-pink-400" />
                    <span className="text-[10px] font-bold uppercase text-slate-300">Soothe</span>
                  </button>
                </div>
              </div>
            )}

            {modal === 'worship' && (
              <div className="p-4 space-y-6">
                <div className="text-center">
                  <Star size={48} className="mx-auto text-amber-500 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">Altar of Worship</h2>
                </div>
                <div className="bg-amber-900/10 border border-amber-500/20 p-6 rounded-2xl text-center">
                  <div className="text-xs text-amber-400/70 uppercase tracking-widest mb-2 font-bold">Daily Devotion</div>
                  <div className="text-sm italic text-amber-200">"Your guidance is my only path."</div>
                  <Button className="mt-6 w-full bg-amber-600 hover:bg-amber-500 text-black font-black uppercase tracking-widest text-xs">Acknowledge</Button>
                </div>
              </div>
            )}

            {modal === 'sensory' && (
              <div className="p-4 space-y-6">
                <div className="text-center">
                  <Sliders size={48} className="mx-auto text-slate-400 mb-4" />
                  <h2 className="text-xl font-bold text-white uppercase">Sensory Override</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: <Music size={14} />, label: "White Noise" },
                    { icon: <Eye size={14} />, label: "Visual Dampening" },
                    { icon: <Thermometer size={14} />, label: "Temp Control" }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-300 uppercase">
                        {item.icon} {item.label}
                      </div>
                      <Switch />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modal === 'balance' && (
              <div className="p-4 space-y-6 text-center">
                <Clock size={48} className="mx-auto text-yellow-500 mb-2" />
                <h2 className="text-xl font-bold text-white uppercase">XP Balance</h2>
                <div className="bg-black/40 p-6 rounded-2xl border border-yellow-500/20 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 uppercase font-bold">Total XP</span>
                    <span className="text-xl font-black text-yellow-500">{xp}</span>
                  </div>
                  <div className="h-0.5 bg-white/5 w-full" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Tasks Completed</span>
                      <span>{stats?.completedTasks ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Check-Ins</span>
                      <span>{stats?.totalCheckIns ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Dares Completed</span>
                      <span>{stats?.completedDares ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {['countdowns', 'training', 'scene', 'ladders', 'logbook', 'vault'].includes(modal!) && (
              <div className="text-center py-8">
                <Target size={48} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-2xl font-black text-white uppercase mb-4">{modal!.replace('_', ' ')}</h2>
                <p className="text-slate-400 px-8 text-sm">Module initialized. Awaiting partner connection to synchronize data.</p>
                <Button variant="outline" onClick={() => setModal(null)} className="mt-6 border-slate-800 cursor-pointer">Close</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarIcon({ icon, active, onClick }: { icon: React.ReactElement<any>, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={`p-3 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 relative group cursor-pointer
        ${active ? 'bg-gradient-to-br from-red-900/50 to-transparent text-white border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}
    >
      {active && <div className="absolute left-0 h-8 w-1 bg-red-500 rounded-r-full" />}
      {React.cloneElement(icon, { size: 24, className: active ? 'drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : '' })}
    </button>
  );
}

function MobileNavIcon({ icon, label, active, onClick }: { icon: React.ReactElement<any>, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 w-16 cursor-pointer">
      <div className={`p-1 transition-colors ${active ? 'text-white drop-shadow-[0_0_8px_white]' : 'text-slate-600'}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <span className={`text-[9px] uppercase font-bold tracking-wider ${active ? 'text-white' : 'text-slate-700'}`}>{label}</span>
    </button>
  );
}

function QuickAction({ icon, label, color, onClick }: { icon: React.ReactElement<any>, label: string, color: 'yellow' | 'slate' | 'green' | 'red', onClick: () => void }) {
  const colors = { 
    yellow: 'text-amber-400 bg-amber-900/20 border-amber-700/50', 
    slate: 'text-slate-300 bg-slate-800/50 border-slate-700', 
    green: 'text-emerald-400 bg-emerald-900/20 border-emerald-700/50', 
    red: 'text-red-500 bg-red-900/20 border-red-700/50' 
  };
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 p-1 hover:scale-105 transition-transform cursor-pointer">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${colors[color]}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
    </button>
  );
}

function BigButton({ icon, label, sub, onClick, color }: { icon: React.ReactElement<any>, label: string, sub: string, onClick?: () => void, color: string }) {
  return (
    <button onClick={onClick} className="bg-gradient-to-b from-slate-800 to-slate-950 border-t border-white/10 border-b border-black shadow-lg active:scale-95 transition-all p-6 rounded-2xl text-center cursor-pointer group flex flex-col items-center justify-center h-32 w-full">
      <div className={`mb-3 ${color} group-hover:scale-110 transition-transform duration-300 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`}>
        {React.cloneElement(icon, { size: 36 })}
      </div>
      <div className="text-sm font-black text-white uppercase tracking-wider">{label}</div>
      <div className="text-[10px] text-slate-500 font-mono">{sub}</div>
    </button>
  );
}

function SanctuaryNode({ icon, label, angle, color, onClick }: { icon: React.ReactElement<any>, label: string, angle: number, color: string, onClick: () => void }) {
  const rad = (angle - 90) * (Math.PI / 180);
  const radius = 130; 
  
  return (
    <button 
      onClick={onClick}
      className={`absolute w-12 h-12 rounded-full ${color} shadow-[0_0_15px_currentColor] flex flex-col items-center justify-center hover:scale-125 hover:z-50 transition-all duration-300 border-2 border-white/20 cursor-pointer`}
      style={{ left: `calc(50% + ${radius * Math.cos(rad)}px)`, top: `calc(50% + ${radius * Math.sin(rad)}px)`, transform: 'translate(-50%, -50%)' }}
    >
      <div className="text-white drop-shadow-md">{React.cloneElement(icon, { size: 18 })}</div>
      <span className="text-[7px] font-black text-white uppercase absolute -bottom-5 w-24 text-center bg-black/80 px-1 py-0.5 rounded backdrop-blur-sm border border-white/10">{label}</span>
    </button>
  );
}

function ProfileItem({ icon, label, onClick, className = '' }: { icon: React.ReactElement<any>, label: string, onClick?: () => void, className?: string }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 to-black border border-white/5 rounded-xl hover:border-white/20 hover:shadow-lg transition-all group cursor-pointer ${className}`}>
      <div className="flex items-center gap-4">
        <div className="text-slate-500 group-hover:text-red-500 transition-colors">{icon}</div>
        <span className="text-sm font-bold text-slate-300 group-hover:text-white uppercase tracking-wide">{label}</span>
      </div>
      <ChevronRight size={16} className="text-slate-700 group-hover:text-white" />
    </button>
  );
}
