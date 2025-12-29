
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { UserRole, User, Companion } from '../types';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [mySubs, setMySubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const u = await mockApi.getCurrentUser();
      if (u) {
        setUser(u);
        const comps = await mockApi.getCompanions(true);
        const subs = await mockApi.getMySubscriptions();
        setCompanions(comps);
        setMySubs(subs);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center font-bold">Loading dashboard...</div>;
  if (!user) return null;

  const renderSuperAdminStats = () => {
    const totalActiveSubs = companions.reduce((acc, c) => acc + (c.stats?.current_subscribers || 0), 0);
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total System Bots</p>
          <p className="text-4xl font-black text-slate-800">{companions.length}</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active Subscriptions</p>
          <p className="text-4xl font-black text-slate-800">{totalActiveSubs}</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">System Revenue</p>
          <p className="text-4xl font-black text-slate-800">125k</p>
        </div>
      </div>
    );
  };

  const renderStudentDashboard = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[48px] text-white relative overflow-hidden">
        <h3 className="text-4xl font-black mb-4">Hello, {user.username}! 👋</h3>
        <p className="text-blue-100 text-lg font-medium max-w-lg">
          You have {user.learningPoints} points. Ready to learn?
        </p>
        <div className="mt-8 flex gap-4">
          <Link to="/store" className="bg-white text-blue-600 px-8 py-4 rounded-3xl font-black">Browse Store</Link>
          <Link to="/my-bots" className="bg-blue-500/30 text-white border border-white/20 px-8 py-4 rounded-3xl font-black">My Companions</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <h4 className="text-xl font-black text-slate-800 mb-6">Learning Activity</h4>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl font-bold text-slate-600">Vocabulary mastery tracking enabled.</div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <h4 className="text-xl font-black text-slate-800 mb-6">Recent Bots</h4>
           <div className="space-y-4">
              {mySubs.slice(0, 3).map(sub => (
                <Link key={sub.id} to={`/chat/${sub.companion_id}`} className="flex items-center p-3 rounded-2xl hover:bg-slate-50">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${sub.companion.color_class}`}>
                    {sub.companion.avatar_emoji}
                  </div>
                  <div className="ml-4 font-bold text-slate-800">{sub.companion.name}</div>
                </Link>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-4xl font-black text-slate-800">
        {user.role === UserRole.STUDENT ? 'Your Learning Hub' : 'Management Center'}
      </h1>
      {user.role === UserRole.STUDENT ? renderStudentDashboard() : renderSuperAdminStats()}
    </div>
  );
};

export default Dashboard;
