import React, { useState } from 'react';
import { ArrowLeft, Tags, Play } from 'lucide-react';

const DashboardPage = ({ selectedProject, activeTag, setActiveTag, tags, onBack, onStartPractice, getTierInfo }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in">
      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-80 space-y-6 font-sans">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 shadow-red-500/5 text-left">
            <button onClick={onBack} className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-red-600 transition-colors uppercase tracking-widest mb-8"><ArrowLeft className="w-4 h-4" /> Change Project</button>
            <h2 className="text-2xl font-black text-gray-800 tracking-tighter mb-2 truncate">{selectedProject?.name}</h2>
            {selectedProject?.description && <p className="text-xs text-gray-400 font-medium mb-6 leading-relaxed">{selectedProject.description}</p>}
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-2xl mt-8 shadow-inner font-mono text-[11px]"><span className="text-gray-400 uppercase tracking-widest font-sans">Lang</span><span className="text-gray-800 font-black">{selectedProject?.language}</span></div>
          </div>
        </aside>
        <div className="flex-1 space-y-10">
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2 font-sans"><Tags className="w-6 h-6 text-red-600" /><h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">Algorithm Tags</h2></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 font-sans">
              {tags.map(tag => (
                <button key={tag.key} onClick={() => setActiveTag(tag.key)} className={`flex items-center gap-3 px-5 py-4 rounded-[1.5rem] border transition-all ${activeTag === tag.key ? 'bg-red-600 text-white border-red-600 shadow-xl scale-105 z-10' : 'bg-white text-gray-500 border-gray-100 hover:border-red-200'}`}>
                  <div className={`p-2 rounded-xl ${activeTag === tag.key ? 'bg-white/20' : 'bg-gray-50'}`}>{tag.icon}</div>
                  <span className="text-[11px] font-black uppercase tracking-tight">{tag.name}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="space-y-6 font-sans">
            <h2 className="text-xl font-black text-gray-800 px-2 tracking-tight uppercase">Curated Problems</h2>
            <div className="grid gap-4">
              {[
                { id: 1018, title: '체스판 다시 칠하기', tier: 7, tags: ['브루트포스'] },
                { id: 1920, title: '수 찾기', tier: 7, tags: ['자료구조', '이분탐색'] },
                { id: 11047, title: '동전 0', tier: 7, tags: ['그리디'] }
              ].map(prob => (
                <div key={prob.id} className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 hover:border-red-200 hover:shadow-2xl transition-all flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center border-2 border-gray-50 bg-gray-50 font-black ${getTierInfo(prob.tier).color}`}>{getTierInfo(prob.tier).name[0]}</div>
                    <div className="text-left"><h4 className="text-lg font-bold text-gray-800">{prob.title}</h4><div className="flex gap-2 mt-2">{prob.tags.map(t => <span key={t} className="text-[9px] font-black text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 shadow-sm">#{t}</span>)}</div></div>
                  </div>
                  <button onClick={() => onStartPractice(prob)} className="w-14 h-14 bg-gray-900 group-hover:bg-red-600 rounded-3xl flex items-center justify-center transition-all shadow-xl active:scale-95"><Play className="w-6 h-6 text-white fill-current" /></button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;