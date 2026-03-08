import React, { useState } from 'react';
import { useLocation } from "wouter";
import { Lock, User, ArrowLeft, ArrowRight, CheckCircle, Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'username' | 'token' | 'done'>('username');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username) {
      setError('Please enter your username');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest('POST', '/api/auth/forgot-password', { username });
      const data = await res.json();
      setToken(data.token);
      setStep('token');
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong';
      const cleaned = msg.replace(/^\d+:\s*/, '').replace(/^"(.*)"$/, '$1');
      try {
        const parsed = JSON.parse(cleaned);
        setError(parsed.message || cleaned);
      } catch {
        setError(cleaned);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('POST', '/api/auth/reset-password', { token, newPassword });
      setStep('done');
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong';
      const cleaned = msg.replace(/^\d+:\s*/, '').replace(/^"(.*)"$/, '$1');
      try {
        const parsed = JSON.parse(cleaned);
        setError(parsed.message || cleaned);
      } catch {
        setError(cleaned);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-900/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-900 to-black rounded-2xl border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.2)]">
              <KeyRound size={40} className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">
            Password <span className="text-red-600">Reset</span>
          </h1>
          <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Recovery Protocol</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />

          {error && (
            <div data-testid="text-reset-error" className="mb-6 p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-400 font-bold uppercase tracking-wider text-center">
              {error}
            </div>
          )}

          {step === 'username' && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-sm text-slate-400">Enter your username to get a reset code.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-400 ml-1">Username</Label>
                <div className="relative group">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" />
                  <input
                    data-testid="input-reset-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full bg-black/40 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              <Button
                data-testid="button-request-reset"
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-gradient-to-r from-red-800 to-red-950 hover:from-red-700 hover:to-red-900 border-t border-red-500/30 text-white font-black uppercase tracking-widest rounded-xl shadow-lg group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    Get Reset Code
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                  </>
                )}
              </Button>
            </form>
          )}

          {step === 'token' && (
            <form onSubmit={handleResetPassword} className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="text-center mb-4">
                <div className="inline-block px-4 py-2 bg-red-950/40 border border-red-500/30 rounded-xl mb-3">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wider">Reset code verified</p>
                </div>
                <p className="text-sm text-slate-400">Now enter your new password.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-400 ml-1">New Password</Label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" />
                  <input
                    data-testid="input-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-400 ml-1">Confirm Password</Label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" />
                  <input
                    data-testid="input-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-slate-600"
                  />
                </div>
              </div>

              <Button
                data-testid="button-reset-password"
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-gradient-to-r from-red-800 to-red-950 hover:from-red-700 hover:to-red-900 border-t border-red-500/30 text-white font-black uppercase tracking-widest rounded-xl shadow-lg group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                  </>
                )}
              </Button>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
              <CheckCircle size={64} className="mx-auto text-red-500" />
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">Password Reset</h3>
                <p className="text-sm text-slate-400">Your password has been changed. You can now log in with your new password.</p>
              </div>
              <Button
                data-testid="button-back-to-login"
                onClick={() => setLocation('/auth')}
                className="w-full py-6 bg-gradient-to-r from-red-800 to-red-950 hover:from-red-700 hover:to-red-900 border-t border-red-500/30 text-white font-black uppercase tracking-widest rounded-xl shadow-lg"
              >
                Back to Login
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              data-testid="link-back-to-login"
              onClick={() => setLocation('/auth')}
              className="text-xs text-slate-500 hover:text-red-400 uppercase tracking-wider font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <ArrowLeft size={12} />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
