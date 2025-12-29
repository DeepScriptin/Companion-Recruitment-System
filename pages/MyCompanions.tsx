
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Companion } from '../types';
import CompanionCard from '../components/CompanionCard';

const MyCompanions: React.FC = () => {
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSubs(mockApi.getMySubscriptions());
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
       <header>
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Your Companions</h2>
        <p className="text-slate-500 font-medium">Manage and interact with the AI bots you've recruited.</p>
      </header>

      {subs.length === 0 ? (
        <div className="py-20 text-center glass rounded-[48px] border border-slate-100">
           <div className="text-8xl mb-6 opacity-20">
             <i className="fas fa-robot"></i>
           </div>
           <h3 className="text-2xl font-black text-slate-400 mb-6">No companions recruited yet</h3>
           <a 
             href="#/" 
             className="inline-block bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
           >
             Visit Store
           </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subs.map(s => (
            <CompanionCard 
              key={s.id} 
              companion={s.companion} 
              onRecruit={() => {}} 
              owned={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCompanions;
