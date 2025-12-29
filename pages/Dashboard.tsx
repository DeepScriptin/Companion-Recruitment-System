
import React from 'react';
import { mockApi } from '../services/mockApi';
import { UserRole } from '../types';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const user = mockApi.getCurrentUser();
  const companions = mockApi.getCompanions(true);
  const mySubs = mockApi.getMySubscriptions();

  if (!user) return null;

  const renderSuperAdminStats = () => {
    const totalActiveSubs = companions.reduce((acc, c) => acc + c.stats.currentSubscribers, 0);
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total System Bots</p>
          <p className="text-4xl font-black text-slate-800">{companions.length}</p>
          <div className="mt-4 flex items-center text-green-500 text-xs font-bold">
            <i className="fas fa-arrow-up mr-1"></i> 12% from last month
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active Subscriptions</p>
          <p className="text-4xl font-black text-slate-800">{totalActiveSubs}</p>
          <div className="mt-4 flex items-center text-blue-500 text-xs font-bold">
            <i className="fas fa-users mr-1"></i> Live tracking enabled
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">System Revenue (Points)</p>
          <p className="text-4xl font-black text-slate-800">125k</p>
          <div className="mt-4 flex items-center text-amber-500 text-xs font-bold">
            <i className="fas fa-coins mr-1"></i> Virtual economy stable
          </div>
        </div>
      </div>
    );
  };

  const renderCreatorStats = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-black text-slate-800 mb-2">Assigned Bots</h4>
            <p className="text-slate-500 font-medium">You are currently managing {companions.length} companion bots.</p>
            <Link to="/admin" className="mt-4 inline-block bg-purple-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-purple-100">
              Go to Workspace
            </Link>
          </div>
          <div className="text-6xl text-purple-100">
            <i className="fas fa-pen-nib"></i>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-black text-slate-800 mb-2">Subscriber Growth</h4>
            <p className="text-slate-500 font-medium">Your bots gained 4 new users this week!</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold text-green-600 uppercase">Trending High</span>
            </div>
          </div>
          <div className="text-6xl text-blue-100">
            <i className="fas fa-chart-line"></i>
          </div>
        </div>
      </div>
    );
  };

  const renderStudentDashboard = () => {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[48px] text-white relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h3 className="text-4xl font-black mb-4">Hello, {user.username}! 👋</h3>
            <p className="text-blue-100 text-lg font-medium max-w-lg">
              You're doing great. You've earned {user.learningPoints} points so far. What would you like to learn today?
            </p>
            <div className="mt-8 flex gap-4">
              <Link to="/" className="bg-white text-blue-600 px-8 py-4 rounded-3xl font-black shadow-xl hover:scale-105 transition-transform">
                Browse Store
              </Link>
              <Link to="/my-bots" className="bg-blue-500/30 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-3xl font-black hover:bg-blue-500/50 transition-all">
                My Companions
              </Link>
            </div>
          </div>
          <div className="absolute bottom-8 right-12 text-9xl opacity-20 hidden lg:block">
             <i className="fas fa-graduation-cap"></i>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <h4 className="text-xl font-black text-slate-800 mb-6">Learning Activity</h4>
            <div className="space-y-6">
              {[
                { label: 'Vocabulary Mastery', progress: 85, color: 'bg-blue-500' },
                { label: 'Math Logic', progress: 40, color: 'bg-amber-500' },
                { label: 'Science Exploration', progress: 15, color: 'bg-green-500' }
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-slate-600">{item.label}</span>
                    <span className="text-sm font-black text-slate-800">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <h4 className="text-xl font-black text-slate-800 mb-6">Recent Bots</h4>
             <div className="space-y-4">
                {mySubs.length > 0 ? mySubs.slice(0, 3).map(sub => (
                  <Link key={sub.id} to={`/chat/${sub.companionId}`} className="flex items-center p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${sub.companion.colorClass}`}>
                      {sub.companion.avatarEmoji}
                    </div>
                    <div className="ml-4">
                      <p className="font-bold text-slate-800">{sub.companion.name}</p>
                      <p className="text-[10px] font-black uppercase text-blue-500">Active Now</p>
                    </div>
                  </Link>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 font-bold text-sm">No bots recruited yet.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Personal Dashboard</h2>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            {user.role === UserRole.STUDENT ? 'Your Learning Hub' : 'Management Center'}
          </h1>
        </div>
        <div className="text-right hidden sm:block">
           <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Current Date</p>
           <p className="text-lg font-bold text-slate-800">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </header>

      {user.role === UserRole.SUPER_ADMIN && renderSuperAdminStats()}
      {user.role === UserRole.CREATOR && renderCreatorStats()}
      {user.role === UserRole.STUDENT && renderStudentDashboard()}
      {user.role === UserRole.ADMIN && renderSuperAdminStats()}

      {user.role !== UserRole.STUDENT && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h4 className="text-xl font-black text-slate-800 mb-6">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-4">
                 <Link to="/admin" className="p-6 bg-blue-50 rounded-3xl border border-blue-100 hover:bg-blue-100 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                       <i className="fas fa-robot"></i>
                    </div>
                    <p className="font-black text-blue-800 text-lg">Manage Bots</p>
                    <p className="text-xs font-bold text-blue-600">Edit, create, delete</p>
                 </Link>
                 {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) && (
                   <Link to="/admin" className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 hover:bg-indigo-100 transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                         <i className="fas fa-users-cog"></i>
                      </div>
                      <p className="font-black text-indigo-800 text-lg">User Access</p>
                      <p className="text-xs font-bold text-indigo-600">Permissions & roles</p>
                   </Link>
                 )}
              </div>
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h4 className="text-xl font-black text-slate-800 mb-6">System Logs</h4>
              <div className="space-y-4">
                 {[
                   { msg: 'Companion "Sophie" updated', time: '2h ago', icon: 'fa-sync' },
                   { msg: 'New recruitment for "David"', time: '4h ago', icon: 'fa-user-plus' },
                   { msg: 'System backup completed', time: 'Yesterday', icon: 'fa-database' }
                 ].map((log, i) => (
                   <div key={i} className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
                            <i className={`fas ${log.icon}`}></i>
                         </div>
                         <p className="text-sm font-bold text-slate-600">{log.msg}</p>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase">{log.time}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
