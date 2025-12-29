
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { geminiService } from '../services/geminiService';
import { Companion } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const comp = mockApi.getCompanion(id);
      if (comp) {
        setCompanion(comp);
        // Initial greeting
        setMessages([{
          id: 'welcome',
          sender: 'bot',
          text: `Hi there! I'm ${comp.name}. ${comp.quote} How can I help you today?`,
          timestamp: new Date()
        }]);
      }
    }
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || !companion) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const botResponse = await geminiService.chat(
      companion.name,
      companion.roleDescription,
      inputValue
    );

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: botResponse || "I'm sorry, I couldn't process that.",
      timestamp: new Date()
    }]);
    setIsTyping(false);
  };

  if (!companion) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
      <p className="font-bold">Searching for bot...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex items-center space-x-4">
          <Link to="/my-bots" className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">
            <i className="fas fa-arrow-left"></i>
          </Link>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${companion.colorClass}`}>
            {companion.avatarEmoji}
          </div>
          <div>
            <h3 className="font-black text-slate-800">{companion.name}</h3>
            <p className="text-[10px] font-black uppercase text-green-500 flex items-center gap-1.5 tracking-widest">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
           <button className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100">
             <i className="fas fa-info-circle"></i>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 px-4 py-6 scroll-smooth custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-5 rounded-[28px] shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'glass text-slate-800 rounded-tl-none border border-slate-100'
            }`}>
              <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
              <p className={`text-[10px] mt-2 font-bold ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="glass px-6 py-4 rounded-[28px] rounded-tl-none border border-slate-100">
                <div className="flex space-x-1.5">
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                </div>
             </div>
          </div>
        )}
        <div ref={chatEndRef}></div>
      </div>

      <div className="bg-white p-4 rounded-[40px] shadow-2xl border border-slate-100 relative group">
        <div className="flex items-center space-x-4">
          <button className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all flex-shrink-0">
             <i className="fas fa-paperclip"></i>
          </button>
          <input
            type="text"
            placeholder={`Message ${companion.name}...`}
            className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-slate-800"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 flex-shrink-0"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
