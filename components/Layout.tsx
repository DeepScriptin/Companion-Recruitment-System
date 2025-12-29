
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { UserRole, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    mockApi.getCurrentUser().then(setUser);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await mockApi.logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'fa-house' },
    { path: '/store', label: 'Bot Store', icon: 'fa-store' },
    { path: '/my-bots', label: 'My Companions', icon: 'fa-robot' },
    { path: '/admin', label: 'Admin Panel', icon: 'fa-shield-halved', roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CREATOR] },
  ];

  const filteredNav = navItems.filter(item => !item.roles || item.roles.includes(user.role));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 glass fixed h-screen z-40 flex flex-col border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-xl font-extrabold text-blue-600">COMPANION AI</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {filteredNav.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center space-x-3 p-3 rounded-xl font-semibold ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
              <i className={`fas ${item.icon} w-5`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="bg-white p-4 rounded-3xl shadow-sm space-y-3">
            <div className="font-bold text-sm truncate">{user.username}</div>
            <div className="text-[10px] font-black uppercase text-blue-600">{user.role.replace('_', ' ')}</div>
            <div className="flex justify-between items-center text-xs font-black">
              <span>Points:</span>
              <span className="text-blue-800">{user.learningPoints}</span>
            </div>
            <button onClick={handleLogout} className="w-full text-xs font-bold text-slate-400 hover:text-red-500 py-2">Sign Out</button>
          </div>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
};

export default Layout;
