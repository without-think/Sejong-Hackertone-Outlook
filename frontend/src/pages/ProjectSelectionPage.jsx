import React from 'react';
import { Plus, ChevronRight } from 'lucide-react';

const ProjectSelectionPage = ({ projects, onSelectProject, onOpenNewModal }) => {
  return (
    <div className="max-w-6xl mx-auto py-16 px-6 animate-in fade-in slide-in-from-bottom-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-gray-800 tracking-tighter mb-4 uppercase text-gray-900 font-sans">Projects</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs font-sans">코딩 목표에 맞는 프로젝트를 선택하세요.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <button onClick={onOpenNewModal} className="group h-[320px] bg-white border-4 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center gap-4 hover:border-red-200 transition-all active:scale-95">
          <div className="bg-gray-50 p-6 rounded-full group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner"><Plus className="w-10 h-10" /></div>
          <span className="font-black text-gray-400 group-hover:text-red-600 uppercase tracking-widest text-xs font-sans">New Project</span>
        </button>
        {projects.map(proj => (
          <div key={proj.id} onClick={() => onSelectProject(proj)} className="group relative h-[320px] bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-2 transition-all cursor-pointer flex flex-col justify-between overflow-hidden">
            <div className="relative z-10 text-left">
              <div className="bg-red-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors font-black text-red-600 group-hover:text-white uppercase">{(proj.language || "P")[0]}</div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight leading-tight group-hover:text-red-600 transition-colors font-sans">{proj.name}</h3>
              {proj.description && <p className="text-xs text-gray-400 mt-2 line-clamp-2 font-medium leading-relaxed font-sans">{proj.description}</p>}
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3 font-sans">{proj.language} focus</p>
            </div>
            <div className="relative z-10 flex items-center justify-between font-sans">
              <div className="bg-gray-50 px-3 py-1 rounded-full text-[10px] font-bold text-gray-400">{proj.problemCount || 0} Problems</div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectSelectionPage;