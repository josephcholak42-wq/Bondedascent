import React, { useState, useEffect } from 'react';
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
  HandMetal, Ear, Hand
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function BondedAscentApp() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isVelvetMode, setIsVelvetMode] = useState(false);
  const [isCrisisMode, setIsCrisisMode] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [xp, setXp] = useState(35);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New Dare available on the Wheel", type: "info" },
    { id: 2, text: "Mistress requested a photo log", type: "alert" }
  ]);

  // --- MODULE STATES ---
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);
  const [checkInStep, setCheckInStep] = useState(0);
  const [checkInData, setCheckInData] = useState({ mood: 5, obedience: 5, notes: '' });

  const [tasks, setTasks] = useState([
    { id: 1, text: 'Morning Protocol', done: true },
    { id: 2, text: 'Hydration Check', done: true },
    { id: 3, text: 'Posture Check', done: false },
    { id: 4, text: 'Evening Reflection', done: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    if (tasks.find(t => t.id === id && !t.done)) {
      setXp(curr => Math.min(curr + 5, 100));
      // Achievement notification
      if (tasks.filter(t => t.done).length + 1 === tasks.length) {
        addNotification("Daily Protocol Complete! +20 Bonus XP");
        setXp(curr => Math.min(curr + 20, 100));
      }
    }
  };

  const addNotification = (text: string) => {
    setNotifications(prev => [{ id: Date.now(), text, type: 'info' }, ...prev].slice(0, 5));
  };

  const spinWheel = () => {
    setIsSpinning(true);
    setWheelResult(null);
    setTimeout(() => {
      setIsSpinning(false);
      const dares = ["Send a photo holding your breath", "Write a poem about obedience", "30 min plank", "No speaking for 1 hour", "Wear the collar for 2 hours", "Cold shower", "Request permission to speak"];
      const result = dares[Math.floor(Math.random() * dares.length)];
      setWheelResult(result);
      addNotification(`New Dare: ${result}`);
    }, 2000);
  };

  const submitCheckIn = () => {
     setModal(null);
     setCheckInStep(0);
     setCheckInData({ mood: 5, obedience: 5, notes: '' });
     setXp(curr => Math.min(curr + 15, 100)); // Bonus XP
     addNotification("Check-in submitted. Reward granted.");
  };

  // --- RENDER CONTENT SWITCHER ---
  const renderContent = () => {
    if (activeView === 'dashboard') {
      return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* NOTIFICATION TOASTS (Compact Inline) */}
          {notifications.length > 0 && (
            <div className="space-y-2">
              {notifications.map(n => (
                <div key={n.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                  <Info size={14} className="text-red-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{n.text}</span>
                  <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="ml-auto opacity-50 hover:opacity-100"><X size={12}/></button>
                </div>
              ))}
            </div>
          )}

          {/* HEADER CARD */}
          <div className="flex flex-col items-center gap-6 pt-4">
             <div className="flex items-center gap-8 relative">
                <div className="text-center relative">
                   <div className="w-20 h-20 rounded-full border-2 border-red-600 p-1 mb-2 bg-black shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                      <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200" className="w-full h-full rounded-full object-cover opacity-80" alt="User" />
                   </div>
                   <div className="text-sm font-bold text-white uppercase tracking-wider">You</div>
                </div>
                {/* Connection Wire */}
                <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-red-900 to-transparent relative opacity-50">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full shadow-[0_0_15px_red] animate-pulse" />
                </div>
                <div className="text-center relative">
                   <div className="w-20 h-20 rounded-full border-2 border-red-900 p-1 mb-2 bg-black">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" className="w-full h-full rounded-full object-cover grayscale opacity-90" alt="Mistress" />
                   </div>
                   <div className="text-sm font-bold text-white uppercase tracking-wider">Mistress</div>
                </div>
             </div>
             
             <button onClick={() => setModal('bond')} className="w-full max-sm px-6 py-4 rounded-full flex justify-between items-center group active:scale-95 transition-all cursor-pointer bg-gradient-to-b from-red-700 to-red-950 border-t border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                <div className="flex items-center gap-3">
                   <Anchor size={20} className="text-white drop-shadow-md" />
                   <span className="font-black uppercase text-sm tracking-wider text-white">Level 1 <span className="opacity-70 font-bold text-[10px] ml-1">Emerging Bond</span></span>
                </div>
                <ChevronRight size={20} className="text-white opacity-70 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>

          {/* MODE TOGGLE */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dashboard Controls</h3>
             <button 
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
            // STANDARD GRID
            <div className="space-y-6 animate-in fade-in">
               <div className="grid grid-cols-4 gap-3">
                  <QuickAction icon={<Clock />} label="Balance" color="yellow" onClick={() => setModal('balance')} />
                  <QuickAction icon={<Settings />} label="Config" color="slate" onClick={() => setActiveView('profile')} />
                  <QuickAction icon={<Award />} label="Badges" color="green" onClick={() => setModal('badges')} />
                  <QuickAction icon={<Zap />} label="Timers" color="red" onClick={() => setModal('countdowns')} />
               </div>

               <div className="bg-gradient-to-b from-slate-900 to-black border border-white/5 shadow-xl p-1 rounded-2xl">
                  <div className="bg-slate-950/50 p-5 rounded-xl">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Daily Protocols</h3>
                    <div className="space-y-3">
                       {tasks.map(task => (
                          <div 
                            key={task.id} 
                            onClick={() => toggleTask(task.id)} 
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
                    </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <BigButton icon={<Dices />} label="Wheel of Dares" sub="Spin for a task" onClick={() => setModal('wheel')} color="text-purple-500" />
                  <BigButton icon={<MessageSquare />} label="Daily Check-In" sub="Submit Report" color="text-blue-500" onClick={() => setModal('checkin')} />
               </div>
            </div>
          ) : (
            // VELVET SANCTUARY
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
    
    // --- PROFILE VIEW ---
    if (activeView === 'profile') {
      return (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
           <div className="text-center pt-4">
              <div className="w-24 h-24 mx-auto rounded-full p-1 border-2 border-slate-700 mb-4 bg-black">
                 <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                    <User size={40} className="text-slate-600" />
                 </div>
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Profile</h2>
              <div className="flex items-center justify-center gap-2 mt-2 bg-black/40 w-fit mx-auto px-4 py-1 rounded-full border border-white/10">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_lime]" />
                 <span className="text-xs font-bold text-green-500 uppercase">Connected</span>
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
                onClick={() => setIsCrisisMode(!isCrisisMode)} 
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 shadow-inner cursor-pointer ${isCrisisMode ? 'bg-red-600 shadow-[0_0_10px_red]' : 'bg-slate-900 border border-slate-700'}`}
              >
                 <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isCrisisMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
           </div>

           <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Dynamic Management</h3>
              <ProfileItem icon={<Activity size={20} />} label="Desired Changes" onClick={() => setActiveView('desired_changes')} />
              <ProfileItem icon={<Camera size={20} />} label="Secrets Exchange" onClick={() => setActiveView('secrets')} />
              <ProfileItem icon={<Award size={20} />} label="Play Sessions" onClick={() => setActiveView('play_sessions')} />
              <ProfileItem icon={<MessageSquare size={20} />} label="Conflict Resolution" onClick={() => setActiveView('conflict')} />
              <ProfileItem icon={<Zap size={20} />} label="Punishments & Rewards" onClick={() => setActiveView('punishments')} />
           </div>

           <div className="space-y-3 pb-8">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Account</h3>
              <ProfileItem icon={<LogOut size={20} />} label="Log Out" onClick={() => alert('Logged out')} />
              <ProfileItem icon={<Trash2 size={20} />} label="Delete Account" className="text-red-500 border-red-900/30 hover:bg-red-950/50" />
           </div>
        </div>
      );
    }

    if (['desired_changes', 'secrets', 'play_sessions', 'conflict', 'punishments'].includes(activeView)) {
       const viewDetails = {
          desired_changes: [
             { title: "Increase Morning Protocol", sub: "Priority: High" },
             { title: "Add Cold Showers", sub: "Status: Proposed" },
             { title: "Reduce Screentime", sub: "Mistress Approved" }
          ],
          secrets: [
             { title: "The Locked Drawer", sub: "Shared yesterday" },
             { title: "Childhood Ambition", sub: "Mistress only" },
             { title: "Hidden Expense", sub: "Awaiting confession" }
          ],
          play_sessions: [
             { title: "Wednesday Night Training", sub: "Duration: 2h" },
             { title: "Weekend Retreat", sub: "Status: Planned" },
             { title: "Spontaneous Scene", sub: "Completed" }
          ],
          conflict: [
             { title: "Communication Gap", sub: "Resolution in progress" },
             { title: "Protocol Violation", sub: "Punishment served" },
             { title: "Expectation Reset", sub: "Scheduled for Friday" }
          ],
          punishments: [
             { title: "24h Silence", sub: "Active" },
             { title: "Extra Protocol Duties", sub: "3 days remaining" },
             { title: "Access Revoked", sub: "Completed" }
          ]
       };

      return (
        <div className="animate-in slide-in-from-right duration-500">
           <button onClick={() => setActiveView('profile')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 uppercase text-xs font-bold tracking-widest cursor-pointer"><ChevronRight className="rotate-180" size={14} /> Back to Profile</button>
           <h2 className="text-2xl font-black text-white uppercase mb-6">{activeView.replace('_', ' ')}</h2>
           <div className="space-y-4">
              {(viewDetails[activeView as keyof typeof viewDetails] || []).map((item, i) => (
                 <div key={i} className="p-4 bg-slate-900/50 border border-white/5 rounded-xl flex justify-between items-center group hover:border-red-500/30 transition-all">
                    <div>
                       <div className="font-bold text-slate-200 uppercase tracking-wide text-sm">{item.title}</div>
                       <div className="text-xs text-slate-500 font-mono">{item.sub}</div>
                    </div>
                    <ChevronRight size={14} className="text-slate-700 group-hover:text-red-500" />
                 </div>
              ))}
           </div>
        </div>
      );
    }

    if (activeView === 'resume') {
       return (
          <div className="animate-in slide-in-from-right duration-500 space-y-6">
             <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-3">
                <Terminal size={24} className="text-red-600" /> Submission Log
             </h2>
             <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                   <div key={i} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:bg-black/60 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-red-500">
                            <FileText size={18} />
                         </div>
                         <div>
                            <div className="text-sm font-bold text-white uppercase tracking-wider">Log Entry #{1024 - i}</div>
                            <div className="text-[10px] text-slate-500">Protocol completed successfully</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] font-mono text-slate-600">Feb 0{i}, 2026</div>
                         <div className="text-[10px] font-bold text-green-500 uppercase">+10 XP</div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       )
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
                     className="w-full bg-black/50 border border-slate-800 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-pink-500/50 min-h-[150px]"
                     placeholder="Write your thoughts here..."
                   />
                </div>
                <Button className="w-full bg-pink-900/50 border border-pink-500/30 text-pink-200 hover:bg-pink-800/50">Save Journal Entry</Button>
             </div>
             <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Previous Entries</h3>
                {[1,2].map(i => (
                   <div key={i} className="bg-black/40 border border-white/5 p-4 rounded-xl">
                      <div className="text-[10px] font-mono text-pink-500 mb-1">Feb 0{7-i}, 2026</div>
                      <div className="text-sm text-slate-400 line-clamp-2 italic">"I feel like my discipline is improving, though I struggled with the morning posture check today. I will strive to be more present tomorrow..."</div>
                   </div>
                ))}
             </div>
          </div>
       )
    }

    if (activeView === 'stats') {
       return (
          <div className="animate-in slide-in-from-right duration-500 space-y-8">
             <h2 className="text-2xl font-black text-white uppercase mb-6 flex items-center gap-3">
                <Activity size={24} className="text-emerald-500" /> Bond Statistics
             </h2>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl text-center">
                   <div className="text-2xl font-black text-white">92%</div>
                   <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Obedience Score</div>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl text-center">
                   <div className="text-2xl font-black text-white">14</div>
                   <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Day Streak</div>
                </div>
             </div>

             <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Activity Timeline</h3>
                <div className="h-32 flex items-end gap-2 px-2">
                   {[40, 65, 30, 85, 95, 55, 75].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-red-950 to-red-600 rounded-t-sm" style={{ height: `${h}%` }} />
                   ))}
                </div>
                <div className="flex justify-between mt-2 px-2 text-[8px] text-slate-600 font-mono uppercase">
                   <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
             </div>

             <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Breakdown</h3>
                {[
                   { label: 'Protocols', val: 88, color: 'bg-red-500' },
                   { label: 'Journaling', val: 100, color: 'bg-emerald-500' },
                   { label: 'Responsiveness', val: 72, color: 'bg-blue-500' }
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
       )
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
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      {/* CRISIS MODE OVERLAY */}
      {isCrisisMode && (
        <div className="fixed inset-0 z-[100] bg-red-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <ShieldAlert size={80} className="text-white mb-6 animate-pulse" />
          <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-4 text-center drop-shadow-lg">Crisis Mode Active</h1>
          <p className="text-red-200 text-center max-w-md mb-12 text-lg font-bold">All protocols suspended.<br/>Focus on grounding and safety.</p>
          <button 
            onClick={() => setIsCrisisMode(false)} 
            className="px-8 py-4 bg-white text-red-900 font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_white] hover:scale-105 transition-transform cursor-pointer"
          >
            Deactivate
          </button>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
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

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* HEADER */}
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
            {/* User Status Pill */}
            <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
               <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_lime]" />
               <span className="text-xs font-bold text-slate-400 uppercase hidden sm:inline">Connected</span>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 pb-28 md:pb-8 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* SAFEWORD BAR */}
            <button 
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

        {/* MOBILE NAVIGATION */}
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

      {/* --- MODAL SYSTEM --- */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-black border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <button onClick={() => setModal(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer z-50"><X size={24}/></button>
                
                {modal === 'safeword' && <div className="text-center p-4"><ShieldAlert size={64} className="mx-auto text-yellow-500 mb-6 animate-bounce" /><h2 className="text-2xl font-black text-white uppercase mb-4">Safeword Triggered</h2><p className="text-slate-400 mb-8">Alert sent to Partner. App paused.</p><button onClick={() => setModal(null)} className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase rounded-lg cursor-pointer">Resume</button></div>}
                
                {modal === 'bond' && <div className="text-center p-4"><Anchor size={48} className="mx-auto text-red-600 mb-4" /><h2 className="text-xl font-black text-white uppercase">Level 1</h2><p className="text-red-400 font-bold uppercase text-xs mb-6">Emerging Bond</p><div className="w-full h-4 bg-black rounded-full overflow-hidden border border-white/20 mb-2"><div className="h-full bg-red-600" style={{ width: `${xp}%` }} /></div><div className="flex justify-between text-[10px] text-slate-500 uppercase"><span>0 XP</span><span>{xp} / 100</span><span>Level 2</span></div></div>}
                
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
                      onClick={spinWheel} 
                      disabled={isSpinning}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      {isSpinning ? 'Spinning...' : 'Spin Now'}
                    </button>
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
                              max={10} 
                              step={1} 
                              onValueChange={(vals) => setCheckInData(p => ({...p, mood: vals[0]}))}
                              className="flex-1"
                            />
                            <Smile size={16} className="text-slate-600" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <Label className="text-slate-300">Obedience Level</Label>
                            <span className="text-xs font-mono text-blue-400">{checkInData.obedience}/10</span>
                          </div>
                          <Slider 
                            defaultValue={[checkInData.obedience]} 
                            max={10} 
                            step={1} 
                            onValueChange={(vals) => setCheckInData(p => ({...p, obedience: vals[0]}))}
                          />
                        </div>

                        <Button onClick={() => setCheckInStep(1)} className="w-full bg-blue-600 hover:bg-blue-500 text-white mt-4">Next Step</Button>
                      </div>
                    )}

                    {checkInStep === 1 && (
                       <div className="space-y-4 animate-in slide-in-from-right">
                          <div>
                            <Label className="text-slate-300 mb-2 block">Notes / Confessions</Label>
                            <textarea 
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 min-h-[100px]"
                              placeholder="Anything to report..."
                              value={checkInData.notes}
                              onChange={(e) => setCheckInData(p => ({...p, notes: e.target.value}))}
                            />
                          </div>
                          <div className="flex gap-2">
                             <Button variant="outline" onClick={() => setCheckInStep(0)} className="flex-1 border-slate-700 text-slate-400">Back</Button>
                             <Button onClick={submitCheckIn} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">Submit Report</Button>
                          </div>
                       </div>
                    )}
                  </div>
                )}

                {modal === 'badges' && (
                  <div className="p-4 text-center">
                     <Award size={48} className="mx-auto text-green-500 mb-4" />
                     <h2 className="text-xl font-bold text-white uppercase mb-6">Earned Badges</h2>
                     <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center gap-2">
                           <div className="w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                              <Star size={24} fill="currentColor" />
                           </div>
                           <span className="text-[10px] uppercase font-bold text-yellow-500">First Steps</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                           <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                              <Flame size={24} fill="currentColor" />
                           </div>
                           <span className="text-[10px] uppercase font-bold text-red-500">Fast Burner</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                           <div className="w-16 h-16 rounded-full bg-pink-500/20 border border-pink-500 flex items-center justify-center text-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.2)]">
                              <HeartPulse size={24} fill="currentColor" />
                           </div>
                           <span className="text-[10px] uppercase font-bold text-pink-500">Committed</span>
                        </div>
                     </div>
                  </div>
                )}

                {modal === 'vault' && (
                   <div className="p-4 text-center">
                      <Box size={48} className="mx-auto text-indigo-500 mb-4" />
                      <h2 className="text-xl font-bold text-white uppercase mb-6">The Vault</h2>
                      <p className="text-sm text-slate-400 mb-8">Rewards are unlocked by your Mistress based on your XP.</p>
                      
                      <div className="space-y-3">
                         <div className="flex items-center gap-4 p-3 rounded-lg border border-indigo-500/30 bg-indigo-900/10">
                            <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-400"><Film size={20} /></div>
                            <div className="text-left flex-1">
                               <div className="text-xs font-bold text-indigo-300 uppercase">Private Video</div>
                               <div className="text-[10px] text-indigo-400/50">Unlocked at Level 5</div>
                            </div>
                            <Lock size={16} className="text-indigo-500/50" />
                         </div>
                         <div className="flex items-center gap-4 p-3 rounded-lg border border-indigo-500/30 bg-indigo-900/10">
                            <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-400"><Gift size={20} /></div>
                            <div className="text-left flex-1">
                               <div className="text-xs font-bold text-indigo-300 uppercase">Wish Granted</div>
                               <div className="text-[10px] text-indigo-400/50">Unlocked at Level 10</div>
                            </div>
                            <Lock size={16} className="text-indigo-500/50" />
                         </div>
                      </div>
                   </div>
                )}

                {modal === 'training' && (
                   <div className="p-4 text-center">
                      <FlameKindling size={48} className="mx-auto text-red-500 mb-4" />
                      <h2 className="text-xl font-bold text-white uppercase mb-4">Fire Training</h2>
                      <div className="space-y-4">
                         <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 text-left">
                            <div className="text-xs font-bold text-red-500 uppercase mb-1">Session Target</div>
                            <div className="text-sm text-slate-200 font-mono">Heat tolerance: 3 mins</div>
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                            <Button variant="default" className="bg-red-600 hover:bg-red-500" onClick={() => addNotification("Training protocol started")}><Play size={14} className="mr-2" /> Start</Button>
                            <Button variant="outline" className="border-slate-800"><RefreshCw size={14} className="mr-2" /> Reset</Button>
                         </div>
                      </div>
                   </div>
                )}

                {modal === 'scene' && (
                  <div className="p-4 space-y-6">
                    <div className="text-center">
                       <Sparkles size={48} className="mx-auto text-purple-400 mb-4" />
                       <h2 className="text-xl font-bold text-white uppercase">Scene Sync</h2>
                    </div>
                    <div className="space-y-4 bg-slate-900/30 p-4 rounded-xl border border-white/5">
                       <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-slate-400">
                          <span>Connection</span>
                          <span className="text-green-500">Linked</span>
                       </div>
                       <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-slate-400">
                          <span>Protocol</span>
                          <span className="text-purple-400">Heavy Impact</span>
                       </div>
                       <Button className="w-full bg-purple-600 hover:bg-purple-500">Initiate Protocol</Button>
                    </div>
                  </div>
                )}

                {modal === 'ladders' && (
                  <div className="p-4 space-y-6">
                    <div className="text-center">
                       <Activity size={48} className="mx-auto text-rose-500 mb-4" />
                       <h2 className="text-xl font-bold text-white uppercase">Protocol Ladder</h2>
                    </div>
                    <div className="space-y-3">
                       {[
                         { label: "Novice Protocol", xp: "0", status: "Complete" },
                         { label: "Intermediate Rigor", xp: "100", status: "Active" },
                         { label: "Elite Compliance", xp: "500", status: "Locked" }
                       ].map((step, i) => (
                         <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-black/20">
                           <div className="text-left">
                              <div className="text-xs font-bold text-slate-200 uppercase">{step.label}</div>
                              <div className="text-[9px] text-slate-500 font-mono">{step.xp} XP Requirement</div>
                           </div>
                           <div className={`text-[9px] font-bold uppercase ${step.status === 'Complete' ? 'text-green-500' : step.status === 'Active' ? 'text-rose-500' : 'text-slate-700'}`}>
                              {step.status}
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {modal === 'logbook' && (
                  <div className="p-4 space-y-6">
                    <div className="text-center">
                       <BookHeart size={48} className="mx-auto text-pink-400 mb-4" />
                       <h2 className="text-xl font-bold text-white uppercase">The Logbook</h2>
                    </div>
                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-left space-y-4">
                       <div>
                          <Label className="text-[10px] uppercase font-bold text-slate-500">Summary of Submissions</Label>
                          <div className="text-sm text-slate-200 mt-1">Total Logs: 42</div>
                       </div>
                       <div>
                          <Label className="text-[10px] uppercase font-bold text-slate-500">Last Reflection</Label>
                          <div className="text-sm italic text-slate-400 mt-1">"The cold shower protocol was challenging but rewarding."</div>
                       </div>
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
                       <button className="flex flex-col items-center gap-2 p-4 bg-slate-900/50 border border-white/5 rounded-xl hover:border-pink-500/50 transition-all">
                          <Coffee size={24} className="text-pink-400" />
                          <span className="text-[10px] font-bold uppercase text-slate-300">Hydrate</span>
                       </button>
                       <button className="flex flex-col items-center gap-2 p-4 bg-slate-900/50 border border-white/5 rounded-xl hover:border-pink-500/50 transition-all">
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
                               <button 
                                 className="w-10 h-6 bg-slate-900 rounded-full p-1 relative border border-white/10"
                                 onClick={() => addNotification(`${item.label} toggled`)}
                               >
                                  <div className="w-4 h-4 bg-slate-600 rounded-full" />
                               </button>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {modal === 'balance' && (
                  <div className="p-4 space-y-6 text-center">
                    <Clock size={48} className="mx-auto text-yellow-500 mb-2" />
                    <h2 className="text-xl font-bold text-white uppercase">Balance Sheet</h2>
                    <div className="bg-black/40 p-6 rounded-2xl border border-yellow-500/20 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 uppercase font-bold">Credits</span>
                        <span className="text-xl font-black text-yellow-500">1,250</span>
                      </div>
                      <div className="h-0.5 bg-white/5 w-full" />
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Pending Debts</span>
                          <span>-200</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Mistress Tax</span>
                          <span>-50</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black">Transfer to Mistress</Button>
                  </div>
                )}
                
                {['countdowns'].includes(modal) && (
                   <div className="text-center py-8">
                      <Target size={48} className="mx-auto text-red-500 mb-4" />
                      <h2 className="text-2xl font-black text-white uppercase mb-4">{modal.replace('_', ' ')}</h2>
                      <p className="text-slate-400 px-8 text-sm">Module initialized. Awaiting partner connection to synchronize data.</p>
                      <Button variant="outline" onClick={() => setModal(null)} className="mt-6 border-slate-800">Close</Button>
                   </div>
                )}
           </div>
        </div>
      )}
    </div>
  );
}

// --- HELPER COMPONENTS ---

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
