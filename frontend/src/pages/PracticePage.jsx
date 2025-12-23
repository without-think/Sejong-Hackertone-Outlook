import React from 'react';
import { Clock, Square, Activity, Lightbulb, RefreshCw, Zap, GitGraph, BrainCircuit } from 'lucide-react';
import LogicBlock from '../components/LogicBlock';

const PracticePage = ({ 
  time, code, setCode, selectedLang, currentProblem, onStop, onAnalyze, onGenerateLogic, 
  hint, hintLoading, logicSteps, logicLoading, detectedComplexity 
}) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-8 h-full font-sans">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-[1.5rem] flex items-center justify-center animate-pulse shadow-inner"><Clock className="w-8 h-8" /></div>
              <div className="text-left">
                <div className="text-4xl font-black text-gray-800 tabular-nums font-mono">{Math.floor(time / 60).toString().padStart(2, '0')}:{(time % 60).toString().padStart(2, '0')}</div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Live Training Session</p>
              </div>
            </div>
            <button onClick={onStop} className="bg-gray-900 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95 uppercase tracking-widest text-xs"><Square className="w-4 h-4 fill-white" /> 연습 종료</button>
          </div>

          <div className="bg-gray-900 rounded-[3rem] overflow-hidden shadow-2xl h-[650px] flex flex-col border border-gray-800 relative">
            <div className="bg-gray-800/50 px-10 py-5 flex justify-between items-center backdrop-blur-md shrink-0 font-mono">
              <div className="flex gap-3"><div className="w-3.5 h-3.5 rounded-full bg-red-500/80" /><div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80" /><div className="w-3.5 h-3.5 rounded-full bg-green-500/80" /></div>
              <div className="flex items-center gap-3">
                <Activity className="w-3 h-3 text-green-400" />
                <span className="text-white text-[9px] font-black uppercase tracking-widest">{selectedLang} Editor</span>
                <span className="text-[10px] font-mono text-gray-500 font-bold uppercase ml-4">BOJ Problem-{currentProblem?.id}</span>
              </div>
            </div>
            <textarea 
              className="flex-1 bg-transparent p-10 text-gray-300 font-mono text-lg leading-relaxed outline-none resize-none selection:bg-red-500/30 border-none overflow-y-auto" 
              placeholder="이곳에 코드를 직접 작성하세요..." 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const start = e.target.selectionStart;
                  const end = e.target.selectionEnd;
                  const val = e.target.value;
                  e.target.value = val.substring(0, start) + "    " + val.substring(end);
                  e.target.selectionStart = e.target.selectionEnd = start + 4;
                  setCode(e.target.value);
                }
              }}
              spellCheck="false" 
            />
          </div>
        </div>

        <div className="w-full lg:w-[420px] space-y-8 flex flex-col font-sans">
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[600px]">
            <div className="flex border-b border-gray-100 bg-gray-50/30 font-black">
               <button className="flex-1 py-4 font-black text-xs uppercase tracking-widest bg-white text-gray-900 border-b-2 border-red-500">AI Studio</button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto space-y-10">
              <section className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="font-black text-gray-800 text-xs uppercase tracking-tighter flex items-center gap-2"><Lightbulb className="w-4 h-4 text-yellow-500" /> AI Advisor</h3>
                    <button onClick={onAnalyze} disabled={hintLoading} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-black disabled:opacity-50 flex items-center gap-2">{hintLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} 분석</button>
                 </div>
                 {hint ? (
                    <div className="p-6 bg-yellow-50/40 rounded-2xl border border-yellow-100/50 text-sm text-gray-600 leading-relaxed font-medium text-left">
                       <p className="mb-4 whitespace-pre-wrap">{hint}</p>
                       {detectedComplexity && (
                         <div className="mt-4 pt-4 border-t border-yellow-200/50 flex justify-between items-center">
                            <span className="text-[9px] font-black text-yellow-700 uppercase tracking-widest">Complexity</span>
                            <span className="text-xs font-black bg-white px-2 py-1 rounded-lg shadow-sm border border-yellow-100 text-red-600 font-mono">{detectedComplexity}</span>
                         </div>
                       )}
                    </div>
                 ) : <div className="text-center py-10 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100 text-gray-300"><p className="text-[11px] font-bold uppercase">Ready for Analysis</p></div>}
              </section>
              <section className="space-y-4 text-center">
                 <div className="flex items-center justify-between">
                    <h3 className="font-black text-gray-800 text-xs uppercase tracking-tighter flex items-center gap-2"><GitGraph className="w-4 h-4 text-indigo-500" /> Flow Chart</h3>
                    <button onClick={onGenerateLogic} disabled={logicLoading} className="bg-white p-2 rounded-xl border border-gray-200 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${logicLoading ? 'animate-spin' : ''}`} /></button>
                 </div>
                 <div className="flex flex-col items-center w-full">
                    {logicSteps ? logicSteps.map((step, idx) => (
                       <LogicBlock key={idx} step={step} isLast={idx === logicSteps.length - 1} />
                    )) : <div className="text-center py-10 text-gray-300 uppercase text-[10px] font-black">No logic data</div>}
                 </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticePage;