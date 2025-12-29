
import React from 'react';
import { Companion } from '../types';

interface CompanionCardProps {
  companion: Companion;
  onRecruit: (c: Companion) => void;
  owned?: boolean;
}

const CompanionCard: React.FC<CompanionCardProps> = ({ companion, onRecruit, owned }) => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group">
      <div className={`h-32 ${companion.colorClass} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-4">
           <span className="bg-white/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
             {companion.category}
           </span>
        </div>
        <div className="text-6xl group-hover:scale-110 transition-transform duration-500 z-10">
          {companion.avatarEmoji}
        </div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{companion.name}</h3>
            <p className="text-xs font-semibold text-slate-400">{companion.roleDescription}</p>
          </div>
          <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-lg">
             <i className="fas fa-star text-amber-500 text-[10px]"></i>
             <span className="text-xs font-bold text-amber-700">{companion.stats.rating}</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px] mb-4">
          {companion.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          {!owned ? (
            <>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-slate-300">Cost</span>
                <span className="text-lg font-black text-slate-800 flex items-center gap-1">
                  {companion.costPoints}
                  <i className="fas fa-coins text-amber-500 text-xs"></i>
                </span>
              </div>
              <button
                onClick={() => onRecruit(companion)}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-100 transition-all active:scale-95"
              >
                Recruit
              </button>
            </>
          ) : (
            <div className="w-full flex justify-between items-center">
              <span className="text-xs font-bold text-green-500 flex items-center gap-2">
                <i className="fas fa-check-circle"></i> Recruited
              </span>
              <button 
                onClick={() => window.location.hash = `#/chat/${companion.id}`}
                className="text-blue-600 text-sm font-bold hover:underline"
              >
                Open Chat <i className="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanionCard;
