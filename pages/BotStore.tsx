
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCompanions(mockApi.getCompanions().filter(c => c.isActive));
    setMyBots(mockApi.getMySubscriptions().map(s => s.companionId));
  };

  const filtered = companions.filter(c => 
    (activeCategory === 'All' || c.category === activeCategory) &&
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.roleDescription.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRecruit = (bot: Companion) => {
    setSelectedBot(bot);
  };

  const confirmRecruit = () => {
    if (!selectedBot) return;
    setIsProcessing(true);
    try {
      mockApi.recruitCompanion(selectedBot.id);
      loadData();
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

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
              activeCategory === 'All' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Subjects
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                activeCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Search by name or expertise..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(comp => (
          <CompanionCard 
            key={comp.id} 
            companion={comp} 
            onRecruit={handleRecruit} 
            owned={myBots.includes(comp.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="text-6xl mb-4 text-slate-200">
              <i className="fas fa-ghost"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-400">No bots found matching your criteria</h3>
          </div>
        )}
      </div>

      {/* Recruitment Modal */}
      {selectedBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedBot(null)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl shadow-xl ${selectedBot.colorClass}`}>
              {selectedBot.avatarEmoji}
            </div>
            <h3 className="text-2xl font-black text-center mb-2">Recruit {selectedBot.name}?</h3>
            <p className="text-slate-500 text-center text-sm mb-8">
              Recruiting this companion will deduct <span className="font-bold text-slate-900">{selectedBot.costPoints} points</span> from your balance.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={confirmRecruit}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-4 rounded-3xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm Recruitment'}
              </button>
              <button
                onClick={() => setSelectedBot(null)}
                className="w-full py-4 rounded-3xl font-bold text-slate-500 hover:text-slate-800 transition-all"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotStore;
