import React from 'react';
import { ArrowDown } from 'lucide-react';

const LogicBlock = ({ step, isLast }) => {
  const bgColors = {
    start: 'bg-green-100 border-green-200 text-green-700',
    end: 'bg-gray-800 border-gray-900 text-white',
    process: 'bg-white border-gray-200 text-gray-700',
    decision: 'bg-orange-50 border-orange-200 text-orange-700',
    loop: 'bg-blue-50 border-blue-200 text-blue-700'
  };
  const shape = step.type === 'decision' ? 'rounded-[1.5rem] rotate-3' : 'rounded-2xl';

  return (
    <div className="flex flex-col items-center w-full">
      <div className={`p-5 min-w-[200px] text-center border-2 shadow-sm transition-all hover:scale-105 ${bgColors[step.type] || 'bg-white'} ${shape}`}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60 font-sans">{step.type}</p>
        <p className="text-sm font-bold leading-relaxed font-sans">{step.label}</p>
      </div>
      {!isLast && <ArrowDown className="w-6 h-6 text-gray-200 my-4 animate-bounce" />}
    </div>
  );
};

export default LogicBlock;