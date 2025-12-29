
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { UserRole } from '../types';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      try {
        const user = mockApi.login(email, password);
        if (user.role === UserRole.STUDENT) {
          navigate('/');
        } else {
          navigate('/admin');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  const demoAccounts = [
    { email: 'super@system.com', pass: 'admin123', label: 'Super Admin' },
    { email: 'admin@system.com', pass: 'admin123', label: 'Admin' },
    { email: 'chris@creator.com', pass: 'creator123', label: 'Creator' },
    { email: 'sam@student.com', pass: 'student123', label: 'Student' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
      
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        <div className="hidden lg:block space-y-8">
          <h1 className="text-6xl font-black text-white leading-tight">
            Level Up Your <span className="text-blue-500">Learning</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium">
            Recruit world-class AI companions tailored to your academic success.
          </p>
          <div className="flex gap-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
              <p className="text-2xl font-black text-white">4.9/5</p>
              <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Bot Rating</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
              <p className="text-2xl font-black text-white">2k+</p>
              <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Active Learners</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[48px] p-10 shadow-2xl relative">
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-600 rounded-[32px] rotate-12 flex items-center justify-center text-4xl shadow-2xl animate-bounce">
            🤖
          </div>
          
          <h2 className="text-3xl font-black text-slate-800 mb-2">Welcome Back</h2>
          <p className="text-slate-500 font-bold mb-8">Sign in to manage your companions</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <input 
                type="email"
                required
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <input 
                type="password"
                required
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-3xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100">
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Demo Credentials</p>
             <div className="grid grid-cols-2 gap-3">
                {demoAccounts.map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => { setEmail(acc.email); setPassword(acc.pass); }}
                    className="text-left p-3 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all"
                  >
                    <p className="text-[10px] font-black text-blue-600 uppercase mb-0.5">{acc.label}</p>
                    <p className="text-xs font-bold text-slate-500 truncate">{acc.email}</p>
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
