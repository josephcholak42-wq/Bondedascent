import React, { useState } from 'react';
import { useLocation } from "wouter";
import { Lock, User, ArrowRight, Shield, Heart, Loader2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLogin, useRegister } from '@/lib/hooks';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const [role, setRole] = useState<'sub' | 'dom'>('sub');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    try {
      if (isLogin) {
        await loginMutation.mutateAsync({ username, password });
      } else {
        await registerMutation.mutateAsync({ username, password, role });
      }
      setLocation('/');
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong';
      const cleaned = msg.replace(/^\d+:\s*/, '').replace(/^"(.*)"$/, '$1');
      try {
        const parsed = JSON.parse(cleaned);
        setError(parsed.message || cleaned);
      } catch {
        setError(cleaned);
      }
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans flex flex-col items-center justify-start px-4 py-8 sm:px-6 sm:py-10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-950/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-zinc-950 to-black rounded-2xl border border-red-900/40 flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.25)]">
              <Lock size={40} className="text-red-500 drop-shadow-[0_0_14px_rgba(220,38,38,0.7)]" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-[0.08em] uppercase mb-2">
            Bonded<span className="text-red-500">Ascent</span>
          </h1>
          <p className="text-slate-400 text-[11px] sm:text-xs uppercase tracking-[0.3em] font-black">After Dark Protocol Interface</p>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-md border border-red-900/30 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-70" />
          
          <div className="flex gap-3 mb-8 p-1 bg-black/60 rounded-xl border border-red-900/25">
            <button 
              data-testid="tab-login"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-[0.12em] rounded-lg transition-all cursor-pointer ${isLogin ? 'bg-zinc-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Login
            </button>
            <button 
              data-testid="tab-register"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-[0.12em] rounded-lg transition-all cursor-pointer ${!isLogin ? 'bg-zinc-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Register
            </button>
          </div>

          {error && (
            <div data-testid="text-error" className="mb-6 p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-400 font-bold uppercase tracking-wider text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-black tracking-[0.12em] text-slate-300 ml-1">Username</Label>
              <div className="relative group">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" />
                <input 
                  data-testid="input-username"
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-black/50 border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-500/60 transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase font-black tracking-[0.12em] text-slate-300 ml-1">Password</Label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" />
                <input 
                  data-testid="input-password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-500/60 transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-4 pt-2 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-black tracking-[0.12em] text-slate-300 ml-1">Choose Your Path</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      data-testid="button-role-dom"
                      type="button"
                      onClick={() => setRole('dom')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${role === 'dom' ? 'bg-red-900/30 border-red-500 text-white shadow-[0_0_18px_rgba(220,38,38,0.35)]' : 'bg-black/20 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                    >
                      <Crown size={20} className={role === 'dom' ? 'text-red-500' : ''} />
                      <span className="text-xs font-black uppercase tracking-wider">Dominant</span>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-500/20">Master</span>
                        <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800/40 text-slate-400 border border-slate-500/20">Sub</span>
                      </div>
                    </button>
                    <button
                      data-testid="button-role-sub"
                      type="button"
                      onClick={() => setRole('sub')}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${role === 'sub' ? 'bg-red-900/30 border-red-500 text-white shadow-[0_0_18px_rgba(220,38,38,0.35)]' : 'bg-black/20 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                    >
                      <Heart size={20} className={role === 'sub' ? 'text-red-500' : ''} />
                      <span className="text-xs font-black uppercase tracking-wider">Submissive</span>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-500/20">Sub</span>
                        <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800/40 text-slate-400 border border-slate-500/20">Mistress</span>
                      </div>
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-600 text-center font-mono uppercase mt-1">
                    {role === 'dom' ? 'Profiles: Master & Sub' : 'Profiles: Sub & Mistress'}
                  </p>
                </div>
              </div>
            )}

            <Button 
              data-testid="button-submit"
              type="submit" 
              disabled={isLoading}
              className="w-full py-6 bg-gradient-to-r from-red-800 to-black hover:from-red-700 hover:to-zinc-900 border-t border-red-500/30 text-white font-black uppercase tracking-[0.16em] rounded-xl shadow-lg group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  {isLogin ? 'Initiate Session' : 'Create Profile'}
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              data-testid="link-forgot-password"
              onClick={() => setLocation('/reset-password')}
              className="text-xs text-slate-500 hover:text-red-400 uppercase tracking-wider font-bold transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-600 font-mono uppercase">
              Secure Connection • End-to-End Encryption • Protocol v2.4
            </p>
          </div>
        </div>
      </div>

      <section
        data-testid="featured-content"
        className="w-full max-w-6xl z-10 mt-10 sm:mt-12"
      >
        <div className="rounded-3xl border border-red-900/30 bg-gradient-to-b from-zinc-950/95 to-black/95 p-5 sm:p-8 shadow-[0_0_60px_rgba(120,10,20,0.2)]">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-red-400 font-black">
                Mature Audiences • 18+
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-[0.09em]">
                Featured Content
              </h2>
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-[0.13em]">
              Curated for bold dynamics and after-hours protocols
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <article className="rounded-2xl border border-red-900/35 bg-zinc-900/40 p-4 sm:p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-red-300 font-black mb-2">After Hours</p>
              <h3 className="text-lg text-white font-black tracking-[0.08em] mb-2">Private Scene Drops</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Unlock intense narrative prompts and cinematic visual packs built for mature roleplay sessions.
              </p>
            </article>

            <article className="rounded-2xl border border-red-900/35 bg-zinc-900/40 p-4 sm:p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-red-300 font-black mb-2">Provocation</p>
              <h3 className="text-lg text-white font-black tracking-[0.08em] mb-2">High-Stakes Challenges</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Explore harder missions, stricter protocols, and premium challenge tracks for experienced pairs.
              </p>
            </article>

            <article className="rounded-2xl border border-red-900/35 bg-zinc-900/40 p-4 sm:p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-red-300 font-black mb-2">Vault Access</p>
              <h3 className="text-lg text-white font-black tracking-[0.08em] mb-2">Curated Mature Library</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Build your own private catalog of premium scripts, themes, and media intended for consenting adults.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
