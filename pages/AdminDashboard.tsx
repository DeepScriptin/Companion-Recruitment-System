
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Companion, UserRole, User } from '../types';
import { CATEGORIES, COLOR_CLASSES, EMOJI_OPTIONS } from '../constants';

const AdminDashboard: React.FC = () => {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [creators, setCreators] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'companions' | 'creators' | 'assignments'>('companions');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Fix: currentUser must be managed as state because getCurrentUser is asynchronous
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    roleDescription: '',
    category: 'English',
    avatarEmoji: '🤖',
    colorClass: 'av-blue',
    costPoints: 0,
    description: '',
    quote: '',
    difyPromptLink: '',
    difyApiKey: '',
    remarks: '',
    isActive: true
  });

  useEffect(() => {
    // Fix: Await the current user profile on mount
    mockApi.getCurrentUser().then(setCurrentUser);
    loadData();
  }, []);

  // Fix: loadData must await async mockApi calls
  const loadData = async () => {
    const comps = await mockApi.getCompanions(true);
    setCompanions(comps);
    const crs = await mockApi.getUsersByRole(UserRole.CREATOR);
    setCreators(crs);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      roleDescription: '',
      category: 'English',
      avatarEmoji: '🤖',
      colorClass: 'av-blue',
      costPoints: 0,
      description: '',
      quote: '',
      difyPromptLink: '',
      difyApiKey: '',
      remarks: '',
      isActive: true
    });
    setEditingId(null);
  };

  const handleEdit = (c: Companion) => {
    setFormData({
      name: c.name,
      roleDescription: c.roleDescription,
      category: c.category,
      avatarEmoji: c.avatarEmoji,
      colorClass: c.colorClass,
      costPoints: c.costPoints,
      description: c.description || '',
      quote: c.quote || '',
      difyPromptLink: c.difyPromptLink || '',
      difyApiKey: c.difyApiKey || '',
      remarks: c.remarks || '',
      isActive: c.isActive
    });
    setEditingId(c.id);
    setIsFormOpen(true);
  };

  // Fix: handleSave must be asynchronous and await API calls
  const handleSave = async () => {
    try {
      if (editingId) {
        await mockApi.updateCompanion(editingId, formData);
      } else {
        await mockApi.createCompanion(formData);
      }
      setIsFormOpen(false);
      resetForm();
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Fix: handleDelete must await the asynchronous deleteCompanion call
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this bot?")) return;
    const result = await mockApi.deleteCompanion(id);
    if (!result.success) {
      alert(result.warning);
    } else {
      loadData();
    }
  };

  // Fix: Guard against null currentUser when calculating permissions
  const canCreate = currentUser && (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN);
  const canDelete = currentUser && currentUser.role === UserRole.SUPER_ADMIN;

  if (!currentUser) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Admin Console</h2>
          <p className="text-slate-500 font-medium">Manage AI companions and creator permissions.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-100 hover:bg-blue-700"
          >
            <i className="fas fa-plus"></i>
            Create New Bot
          </button>
        )}
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
           <button 
             onClick={() => setActiveTab('companions')}
             className={`px-8 py-5 font-bold transition-all border-b-2 ${activeTab === 'companions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
           >
             Companions
           </button>
           {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) && (
             <button 
               onClick={() => setActiveTab('creators')}
               className={`px-8 py-5 font-bold transition-all border-b-2 ${activeTab === 'creators' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
             >
               Creators
             </button>
           )}
        </div>

        <div className="p-6">
          {activeTab === 'companions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase font-black tracking-widest border-b border-slate-100">
                    <th className="px-4 py-4">Bot</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-center">Subscribers</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {companions.map(c => (
                    <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${c.colorClass}`}>
                            {c.avatarEmoji}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{c.name}</p>
                            <p className="text-xs font-semibold text-slate-400">{c.roleDescription}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                         <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600">{c.category}</span>
                      </td>
                      <td className="px-4 py-4">
                        {c.isActive ? (
                          <span className="text-[10px] font-black uppercase text-green-500 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-black text-slate-700">{c.stats.currentSubscribers}</span>
                      </td>
                      <td className="px-4 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleEdit(c)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        {canDelete && (
                          <button 
                            onClick={() => handleDelete(c.id)}
                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'creators' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map(u => (
                <div key={u.id} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col justify-between">
                   <div className="flex items-center space-x-4 mb-6">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-xl text-slate-400 shadow-sm">
                        <i className="fas fa-user-tie"></i>
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{u.username}</p>
                        <p className="text-xs font-bold text-slate-400">{u.email}</p>
                      </div>
                   </div>
                   <button className="w-full bg-white border border-slate-200 py-3 rounded-2xl font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all">
                     View Assignments
                   </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Companion Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsFormOpen(false)}></div>
          <div className="bg-white rounded-[48px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl z-10 animate-in slide-in-from-bottom-10 duration-500 flex flex-col">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-3xl font-black text-slate-800">{editingId ? 'Edit Bot' : 'Create New Bot'}</h3>
                <button onClick={() => setIsFormOpen(false)} className="w-12 h-12 rounded-2xl hover:bg-slate-100 transition-all">
                  <i className="fas fa-times text-slate-400"></i>
                </button>
             </div>
             
             <div className="p-8 overflow-y-auto flex-1 space-y-10 custom-scrollbar">
                {/* Basic Section */}
                <section>
                  <h4 className="text-xs uppercase font-black text-blue-600 tracking-widest mb-4">Core Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Bot Name</label>
                      <input 
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Primary Role</label>
                      <input 
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500"
                        value={formData.roleDescription}
                        onChange={e => setFormData({...formData, roleDescription: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Category</label>
                      <select 
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Recruitment Cost (Points)</label>
                      <input 
                        type="number"
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500"
                        value={formData.costPoints}
                        onChange={e => setFormData({...formData, costPoints: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </section>

                {/* Visuals */}
                <section>
                  <h4 className="text-xs uppercase font-black text-blue-600 tracking-widest mb-4">Identity & Visuals</h4>
                  <div className="flex flex-wrap gap-8 items-start">
                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1 block">Avatar Emoji</label>
                      <div className="flex flex-wrap gap-2 max-w-sm">
                        {EMOJI_OPTIONS.map(e => (
                          <button 
                            key={e} 
                            onClick={() => setFormData({...formData, avatarEmoji: e})}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${formData.avatarEmoji === e ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 hover:bg-slate-200'}`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1 block">Theme Color</label>
                      <div className="flex flex-wrap gap-2 max-w-sm">
                        {COLOR_CLASSES.map(c => (
                          <button 
                            key={c.value} 
                            onClick={() => setFormData({...formData, colorClass: c.value})}
                            className={`w-12 h-12 rounded-xl transition-all ${c.value} ${formData.colorClass === c.value ? 'ring-4 ring-blue-600 ring-offset-2' : 'hover:scale-105'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Technical Integration */}
                <section className="bg-slate-900 rounded-[40px] p-8 text-white space-y-6">
                   <h4 className="text-xs uppercase font-black text-blue-400 tracking-widest mb-4">Dify.ai Workflow Integration</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Workflow Link</label>
                        <input 
                          placeholder="https://dify.ai/workflow/..."
                          className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 text-sm"
                          value={formData.difyPromptLink}
                          onChange={e => setFormData({...formData, difyPromptLink: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">API Key (Encrypted)</label>
                        <input 
                          type="password"
                          placeholder="sk-..."
                          className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 text-sm"
                          value={formData.difyApiKey}
                          onChange={e => setFormData({...formData, difyApiKey: e.target.value})}
                        />
                      </div>
                   </div>
                   <p className="text-[10px] text-slate-500 leading-relaxed max-w-xl italic">
                     Integrating with Dify allows this bot to leverage sophisticated multi-agent workflows. The API key is encrypted using AES-256 before storage.
                   </p>
                </section>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Internal Remarks</label>
                  <textarea 
                    rows={3}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500"
                    value={formData.remarks}
                    onChange={e => setFormData({...formData, remarks: e.target.value})}
                  />
                </div>
             </div>

             <div className="p-8 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center space-x-3">
                   <input 
                     type="checkbox" 
                     id="isActive" 
                     className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-slate-300" 
                     checked={formData.isActive}
                     onChange={e => setFormData({...formData, isActive: e.target.checked})}
                   />
                   <label htmlFor="isActive" className="text-sm font-bold text-slate-600">Visible in Store</label>
                </div>
                <div className="flex space-x-4">
                   <button onClick={() => setIsFormOpen(false)} className="px-8 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-600">Cancel</button>
                   <button 
                     onClick={handleSave}
                     className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
                   >
                     {editingId ? 'Update Bot' : 'Publish Bot'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
