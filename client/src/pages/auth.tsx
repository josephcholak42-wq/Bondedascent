import React, { useState } from 'react';
import { useLocation } from "wouter";
import { Lock, User, Mail, ArrowRight, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const [role, setRole] = useState<'sub' | 'dom'>('sub');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication - just redirect to dashboard with the selected role state
    // In a real app, this would use an API
    localStorage.setItem('userRole', role);
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-900 to-black rounded-2xl border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.2)]">
              <Lock size={40} className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            Bonded<span className="text-red-600">Ascent</span>
          </h1>
          <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Protocol Management Interface</p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Top light accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />
          
          <div className="flex gap-4 mb-8 p-1 bg-black/40 rounded-xl border border-white/5">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${isLogin ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${!isLogin ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-400 ml-1">Username</Label>
                <div className="relative group">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Enter username"
                    className="w-full bg-black/40 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-slate-400 ml-1">Email / ID</Label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" />
                <input 
                  type="email" 
                  placeholder="protocol@bonded.ascent"
                  className="w-full bg-black/40 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-slate-400 ml-1">Password</Label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Role Selection Mockup */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs uppercase font-bold text-slate-400 ml-1">Select Role Profile</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('sub')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${role === 'sub' ? 'bg-red-900/20 border-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.2)]' : 'bg-black/20 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >
                  <Heart size={16} className={role === 'sub' ? 'text-red-500' : ''} />
                  <span className="text-xs font-bold uppercase">Submissive</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('dom')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${role === 'dom' ? 'bg-red-900/20 border-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.2)]' : 'bg-black/20 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >
                  <Shield size={16} className={role === 'dom' ? 'text-red-500' : ''} />
                  <span className="text-xs font-bold uppercase">Dominant</span>
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full py-6 bg-gradient-to-r from-red-800 to-red-950 hover:from-red-700 hover:to-red-900 border-t border-red-500/30 text-white font-black uppercase tracking-widest rounded-xl shadow-lg group">
              {isLogin ? 'Initiate Session' : 'Create Profile'}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-600 font-mono uppercase">
              Secure Connection • End-to-End Encryption • Protocol v2.4
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
