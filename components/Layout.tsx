
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = mockApi.getCurrentUser();
  
  if (!user) return null;

  const handleLogout = () => {
    mockApi.logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'fa-house' },
    { path: '/store', label: 'Bot Store', icon: 'fa-store' },
    { path: '/my-bots', label: 'My Companions', icon: 'fa-robot' },
    { path: '/admin', label: 'Admin Panel', icon: 'fa-shield-halved', roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CREATOR] },
  ];

  const filteredNav = navItems.filter(item => !item.roles || item.roles.includes(user.role));

  const roleColors = {
    [UserRole.SUPER_ADMIN]: 'bg-red-100 text-red-700',
    [UserRole.ADMIN]: 'bg-blue-100 text-blue-700',
    [UserRole.CREATOR]: 'bg-purple-100 text-purple-700',
    [UserRole.STUDENT]: 'bg-green-100 text-green-700'
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 glass fixed h-screen z-40 flex flex-col border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
            COMPANION AI
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Recruitment System</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {filteredNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className={`fas ${item.icon} w-5 text-center`}></i>
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-200">
          <div className="bg-white p-4 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                <i className="fas fa-user"></i>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{user.username}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${roleColors[user.role]}`}>
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-blue-50 p-2.5 rounded-xl border border-blue-100">
               <div className="flex items-center space-x-2">
                 <i className="fas fa-star text-amber-500 text-[10px]"></i>
                 <span className="text-[10px] font-bold text-blue-700 uppercase">Points</span>
               </div>
               <span className="text-xs font-black text-blue-800">{user.learningPoints}</span>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-xs font-bold"
            >
              <i className="fas fa-sign-out-alt"></i>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
