
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Companion } from '../types';
import { CATEGORIES } from '../constants';
import CompanionCard from '../components/CompanionCard';

const BotStore: React.FC = () => {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [myBots, setMyBots] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBot, setSelectedBot] = useState<Companion | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    const comps = await mockApi.getCompanions();
    setCompanions(comps.filter(c => c.isActive));
    const subs = await mockApi.getMySubscriptions();
    setMyBots(subs.map(s => s.companion_id));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = companions.filter(c => 
    (activeCategory === 'All' || c.category === activeCategory) &&
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.roleDescription.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const confirmRecruit = async () => {
    if (!selectedBot) return;
    setIsProcessing(true);
    try {
      await mockApi.recruitCompanion(selectedBot.id);
      await loadData();
      setSelectedBot(null);
      alert(`${selectedBot.name} recruited successfully!`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header>
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">AI Companion Store</h2>
        <p className="text-slate-500 font-medium">Find the perfect specialized tutor or guide for your learning journey.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          <button onClick={() => setActiveCategory('All')} className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${activeCategory === 'All' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>All</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${activeCategory === cat ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{cat}</button>
          ))}
        </div>
        <input type="text" placeholder="Search..." className="w-full md:w-80 p-3 bg-slate-50 border-none rounded-2xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(comp => (
          <CompanionCard key={comp.id} companion={comp} onRecruit={setSelectedBot} owned={myBots.includes(comp.id)} />
        ))}
      </div>

      {selectedBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedBot(null)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-md p-8 z-10">
            <h3 className="text-2xl font-black text-center mb-2">Recruit {selectedBot.name}?</h3>
            <p className="text-slate-500 text-center mb-8">Cost: {selectedBot.costPoints} points</p>
            <button onClick={confirmRecruit} disabled={isProcessing} className="w-full bg-blue-600 text-white py-4 rounded-3xl font-black mb-3">
              {isProcessing ? 'Processing...' : 'Confirm'}
            </button>
            <button onClick={() => setSelectedBot(null)} className="w-full py-4 text-slate-400 font-bold">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotStore;
