import React, { useState, useEffect, useRef } from 'react';
import { 
  LogOut, Code, Plus, X, AlignLeft, FolderPlus, BarChart3, Trophy, 
  Mail, Lock, Eye, EyeOff, Globe, Github, Tags, Play, ArrowLeft, 
  Clock, Square, Activity, Lightbulb, RefreshCw, Zap, GitGraph, 
  BrainCircuit, ArrowDown, MousePointer2, Cpu, Hash, ChevronRight
} from 'lucide-react';

const BACKEND_URL = "http://localhost:8000";

const LANGUAGES = ['C', 'C++', 'Java', 'Python', 'Go', 'Rust', 'JavaScript'];
const TIER_NAMES = [ "Unrated", "Bronze V", "Bronze IV", "Bronze III", "Bronze II", "Bronze I", "Silver V", "Silver IV", "Silver III", "Silver II", "Silver I", "Gold V", "Gold IV", "Gold III", "Gold II", "Gold I", "Platinum V", "Platinum IV", "Platinum III", "Platinum II", "Platinum I", "Diamond V", "Diamond IV", "Diamond III", "Diamond II", "Diamond I", "Ruby V", "Ruby IV", "Ruby III", "Ruby II", "Ruby I", "Master" ];
const TIER_COLORS = { Bronze: "text-amber-700", Silver: "text-slate-400", Gold: "text-yellow-500", Platinum: "text-emerald-400", Diamond: "text-sky-400", Ruby: "text-rose-500", Unrated: "text-gray-400" };

const SOLVED_TAGS = [
  { key: 'math', name: '수학', icon: <Hash className="w-4 h-4" /> },
  { key: 'implementation', name: '구현', icon: <Cpu className="w-4 h-4" /> },
  { key: 'greedy', name: '그리디', icon: <Zap className="w-4 h-4" /> },
  { key: 'dp', name: '다이나믹 프로그래밍', icon: <Code className="w-4 h-4" /> },
];

// ==========================================
// 1. 하위 컴포넌트 (Sub-components)
// ==========================================

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

const Complexity3DGraph = ({ isModal = false, highlightComplexity = "" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    let renderer, animationId, handleResize;
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.async = true;
    script.onload = () => initThree();
    document.head.appendChild(script);

    function initThree() {
      if (!containerRef.current) return;
      const THREE = window.THREE;
      if (!THREE) return;
      
      const width = containerRef.current.clientWidth;
      const height = isModal ? 280 : 400;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(isModal ? 0xffffff : 0xf9fafb);
      
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(12, 12, 22);
      camera.lookAt(0, 5, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      containerRef.current.appendChild(renderer.domElement);
      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      
      const graphGroup = new THREE.Group();
      scene.add(graphGroup);

      const complexities = [
        { name: 'O(1)', color: 0x10b981, fn: (n) => 1 },
        { name: 'O(log n)', color: 0x3b82f6, fn: (n) => Math.log2(n + 1) },
        { name: 'O(n)', color: 0xf59e0b, fn: (n) => n },
        { name: 'O(n log n)', color: 0xef4444, fn: (n) => n * Math.log2(n + 1) },
        { name: 'O(n^2)', color: 0x8b5cf6, fn: (n) => n * n }
      ];

      complexities.forEach((comp, idx) => {
        const isHighlighted = String(highlightComplexity).toLowerCase() === comp.name.toLowerCase();
        const material = new THREE.LineBasicMaterial({ 
          color: comp.color, linewidth: isHighlighted ? 5 : 1, transparent: true, opacity: highlightComplexity ? (isHighlighted ? 1.0 : 0.1) : 0.6
        });
        const points = [];
        for (let n = 0; n <= 10; n += 0.2) {
          const val = comp.fn(n);
          if (val < 25) points.push(new THREE.Vector3(n * 2 - 10, val * 0.6 - 5, idx * 1.5 - 3));
        }
        graphGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
        if (isHighlighted && points.length > 0) {
          const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshBasicMaterial({ color: comp.color }));
          sphere.position.copy(points[points.length - 1]);
          graphGroup.add(sphere);
        }
      });

      let isDragging = false, prevPos = { x: 0, y: 0 };
      containerRef.current.addEventListener('mousedown', () => { isDragging = true; });
      containerRef.current.addEventListener('mousemove', (e) => {
        if (!isDragging) { prevPos = { x: e.offsetX, y: e.offsetY }; return; }
        const delta = { x: e.offsetX - prevPos.x, y: e.offsetY - prevPos.y };
        const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler((delta.y * Math.PI) / 180 * 0.5, (delta.x * Math.PI) / 180 * 0.5, 0, 'XYZ'));
        graphGroup.quaternion.multiplyQuaternions(rot, graphGroup.quaternion);
        prevPos = { x: e.offsetX, y: e.offsetY };
      });
      window.addEventListener('mouseup', () => { isDragging = false; });

      function animate() { 
        animationId = requestAnimationFrame(animate); 
        if (!isDragging) graphGroup.rotation.y += 0.005;
        if (renderer && scene && camera) renderer.render(scene, camera); 
      }
      animate();

      handleResize = () => {
        if (!containerRef.current || !renderer || !camera) return;
        const w = containerRef.current.clientWidth, h = isModal ? 280 : 400;
        camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);
    }
    return () => {
      if (handleResize) window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer) renderer.dispose();
    };
  }, [isModal, highlightComplexity]);

  return (
    <div className={`relative w-full ${isModal ? 'h-[280px]' : 'h-[400px]'} bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-inner cursor-grab active:cursor-grabbing`}>
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-4 right-4 pointer-events-none">
        <div className="bg-gray-900/5 backdrop-blur px-3 py-1.5 rounded-full border border-black/5 flex items-center gap-2">
            <MousePointer2 className="w-3 h-3 text-gray-400" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-sans font-black">Drag to rotate</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. 페이지 컴포넌트 (Page Components)
// ==========================================

const LoginPage = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[95vh] px-4 animate-in fade-in duration-700 bg-gradient-to-b from-white to-gray-50">
      <div className="text-center mb-10">
        <div className="w-28 h-28 rounded-[2.5rem] bg-red-600 flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform cursor-pointer">
          <Code className="text-white w-14 h-14 -rotate-3" />
        </div>
        <h2 className="text-5xl font-black text-gray-900 tracking-tighter uppercase font-mono">co:code</h2>
        <p className="text-[14px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-3">Sejong AI Tutor</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-[3.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.1)] p-10 border border-gray-100 relative overflow-hidden">
        <div className="flex bg-gray-50 p-1.5 rounded-[1.8rem] mb-10 relative shadow-inner">
          <div className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-3px)] bg-white rounded-[1.5rem] shadow-sm transition-transform duration-300 ease-out ${authMode === 'signup' ? 'translate-x-full' : 'translate-x-0'}`} />
          <button onClick={() => setAuthMode('signin')} className={`flex-1 py-3.5 text-sm font-black relative z-10 transition-colors ${authMode === 'signin' ? 'text-gray-900' : 'text-gray-400'}`}>Sign In</button>
          <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3.5 text-sm font-black relative z-10 transition-colors ${authMode === 'signup' ? 'text-gray-900' : 'text-gray-400'}`}>Sign Up</button>
        </div>
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-2.5 px-2 text-left">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-500 transition-colors" />
              <input type="email" placeholder="name@sejong.ac.kr" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-red-100 focus:bg-white rounded-[1.5rem] outline-none font-bold text-gray-700 transition-all shadow-inner" />
            </div>
          </div>
          <div className="space-y-2.5 px-2 text-left">
            <div className="flex justify-between items-center px-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label></div>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-500 transition-colors" />
              <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-14 pr-14 py-5 bg-gray-50 border-2 border-transparent focus:border-red-100 focus:bg-white rounded-[1.5rem] outline-none font-bold text-gray-700 transition-all shadow-inner" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
            </div>
          </div>
          <button onClick={() => onAuthSuccess({ uid: 'mock_uid_123', name: '세종인', email })} className="w-full bg-red-600 text-white font-black py-5.5 rounded-[1.8rem] shadow-xl shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition-all text-lg tracking-tight uppercase mt-6 font-sans font-black">Enter Lab</button>
        </div>
      </div>
    </div>
  );
};

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
              <div className="bg-red-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors font-black text-red-600 group-hover:text-white uppercase font-sans">{(proj.language || "P")[0]}</div>
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
          <section className="space-y-6 text-left px-2">
            <div className="flex items-center gap-3"><Tags className="w-6 h-6 text-red-600" /><h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">Algorithm Tags</h2></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 font-sans">
              {SOLVED_TAGS.map(tag => (
                <button key={tag.key} onClick={() => {}} className={`flex items-center gap-3 px-5 py-4 rounded-[1.5rem] border transition-all ${activeTag === tag.key ? 'bg-red-600 text-white border-red-600 shadow-xl' : 'bg-white text-gray-500 border-gray-100 hover:border-red-200'}`}>
                  <div className={`p-2 rounded-xl ${activeTag === tag.key ? 'bg-white/20' : 'bg-gray-50'}`}>{tag.icon}</div>
                  <span className="text-[11px] font-black uppercase tracking-tight">{tag.name}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="space-y-6 text-left px-2">
            <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">Recommended Problems</h2>
            <div className="grid gap-4">
              {[
                { id: 1018, title: '체스판 다시 칠하기', tier: 7, tags: ['브루트포스'] },
                { id: 1920, title: '수 찾기', tier: 7, tags: ['자료구조', '이분탐색'] },
                { id: 11047, title: '동전 0', tier: 7, tags: ['그리디'] }
              ].map(prob => (
                <div key={prob.id} className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 hover:border-red-200 hover:shadow-2xl transition-all flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center border-2 border-gray-50 bg-gray-50 font-black ${getTierInfo(prob.tier).color}`}>{getTierInfo(prob.tier).name[0]}</div>
                    <div className="text-left font-sans"><h4 className="text-lg font-bold text-gray-800">{prob.title}</h4><div className="flex gap-2 mt-2">{prob.tags.map(t => <span key={t} className="text-[9px] font-black text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 shadow-sm">#{t}</span>)}</div></div>
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
                <span className="text-[10px] text-gray-500 font-bold uppercase ml-4">BOJ Problem-{currentProblem?.id}</span>
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
              <section className="space-y-4 text-left">
                 <div className="flex items-center justify-between">
                    <h3 className="font-black text-gray-800 text-xs uppercase tracking-tighter flex items-center gap-2"><Lightbulb className="w-4 h-4 text-yellow-500" /> AI Advisor</h3>
                    <button onClick={onAnalyze} disabled={hintLoading} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-black disabled:opacity-50 flex items-center gap-2 font-sans font-black">{hintLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} 분석</button>
                 </div>
                 {hint ? (
                    <div className="p-6 bg-yellow-50/40 rounded-2xl border border-yellow-100/50 text-sm text-gray-600 leading-relaxed font-medium text-left font-sans">
                       <p className="mb-4 whitespace-pre-wrap">{hint}</p>
                       {detectedComplexity && (
                         <div className="mt-4 pt-4 border-t border-yellow-200/50 flex justify-between items-center">
                            <span className="text-[9px] font-black text-yellow-700 uppercase tracking-widest">Complexity</span>
                            <span className="text-xs font-black bg-white px-2 py-1 rounded-lg shadow-sm border border-yellow-100 text-red-600 font-mono">{detectedComplexity}</span>
                         </div>
                       )}
                    </div>
                 ) : <div className="text-center py-10 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100 text-gray-300 font-sans font-black"><p className="text-[11px] font-bold uppercase">Ready for Analysis</p></div>}
              </section>
              <section className="space-y-4 text-center">
                 <div className="flex items-center justify-between">
                    <h3 className="font-black text-gray-800 text-xs uppercase tracking-tighter flex items-center gap-2"><GitGraph className="w-4 h-4 text-indigo-500" /> Flow Chart</h3>
                    <button onClick={onGenerateLogic} disabled={logicLoading} className="bg-white p-2 rounded-xl border border-gray-200 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${logicLoading ? 'animate-spin' : ''}`} /></button>
                 </div>
                 <div className="flex flex-col items-center w-full">
                    {logicSteps ? logicSteps.map((step, idx) => (
                       <LogicBlock key={idx} step={step} isLast={idx === logicSteps.length - 1} />
                    )) : <div className="text-center py-10 text-gray-300 uppercase text-[10px] font-black font-sans">No logic data</div>}
                 </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. 메인 앱 컴포넌트 (Main App Component)
// ==========================================

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('login');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedLang, setSelectedLang] = useState('Python');
  const [currentProblem, setCurrentProblem] = useState(null);
  const [time, setTime] = useState(0);
  const [code, setCode] = useState('');
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [detectedComplexity, setDetectedComplexity] = useState("");
  const [logicSteps, setLogicSteps] = useState(null);
  const [logicLoading, setLogicLoading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [message, setMessage] = useState(null);

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLang, setNewProjectLang] = useState('Python');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const timerRef = useRef(null);

  // 1. 초기 로드 및 인증 확인 (Mock)
  useEffect(() => {
    const savedUser = localStorage.getItem('cocode_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setActiveTab('project_selection');
    }
  }, []);

  // 2. 프로젝트 불러오기
  const fetchProjects = async (uid) => {
    try {
      const resp = await fetch(`${BACKEND_URL}/projects`, { headers: { "x-user-id": uid } });
      const data = await resp.json();
      setProjects(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (user) fetchProjects(user.uid);
  }, [user]);

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const finalizeResult = (isSuccess) => {
    setShowResultModal(false);
    setActiveTab('dashboard');
    showMessage(isSuccess ? "성공!" : "다음 기회에!", isSuccess ? "success" : "info");
  };

  const getTierInfo = (tierValue) => {
    const name = TIER_NAMES[Math.max(0, tierValue)] || "Unrated";
    const group = name.split(' ')[0];
    return { name, color: TIER_COLORS[group] || "text-gray-400" };
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-16 overflow-x-hidden selection:bg-red-100">
      {user && (
        <header className="flex items-center justify-between px-12 py-8 bg-white/80 border-b border-gray-100 sticky top-0 z-[100] backdrop-blur-xl">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('project_selection')}>
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Code className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">co:code</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sejong AI Tutor</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="px-6 py-3 bg-gray-50 rounded-[1.5rem] flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-all border border-transparent shadow-sm">
              <div className={`text-[10px] font-black px-3 py-1 rounded-xl bg-white border border-gray-100 text-yellow-500`}>Gold V</div>
              <span className="text-sm font-black text-gray-800">{user.name}</span>
            </div>
            <button onClick={() => {localStorage.removeItem('cocode_user'); setUser(null); setActiveTab('login');}} className="text-gray-400 hover:text-red-600 transition-colors p-2"><LogOut className="w-7 h-7" /></button>
          </div>
        </header>
      )}

      <main>
        {activeTab === 'login' && (
          <LoginPage onAuthSuccess={(u) => { 
            localStorage.setItem('cocode_user', JSON.stringify(u));
            setUser(u); 
            setActiveTab('project_selection'); 
          }} />
        )}
        
        {activeTab === 'project_selection' && (
          <ProjectSelectionPage 
            projects={projects} 
            onSelectProject={(p) => { setSelectedProject(p); setSelectedLang(p.language); setActiveTab('dashboard'); }} 
            onOpenNewModal={() => setShowNewProjectModal(true)} 
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage 
            selectedProject={selectedProject} 
            activeTag="math" 
            tags={[]} 
            onBack={() => setActiveTab('project_selection')}
            onStartPractice={(prob) => {
              setCurrentProblem(prob); setActiveTab('practice'); setTime(0); setCode(''); setHint(''); setDetectedComplexity(""); setLogicSteps(null);
              if (timerRef.current) clearInterval(timerRef.current);
              timerRef.current = setInterval(() => setTime(prev => prev + 1), 1000);
              window.open(`https://www.acmicpc.net/problem/${prob.id}`, '_blank');
            }}
            getTierInfo={getTierInfo}
          />
        )}

        {activeTab === 'practice' && (
          <PracticePage 
            time={time} code={code} setCode={setCode} selectedLang={selectedLang} currentProblem={currentProblem}
            onStop={() => { if (timerRef.current) clearInterval(timerRef.current); setShowResultModal(true); }}
            onAnalyze={async () => {
                setHintLoading(true);
                try {
                  const resp = await fetch(`${BACKEND_URL}/analysis/hint`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code, language: selectedLang, problemId: currentProblem?.id })
                  });
                  const data = await resp.json();
                  const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                  setHint(parsed.hint); setDetectedComplexity(parsed.complexity);
                } catch (e) { console.error(e); } finally { setHintLoading(false); }
            }}
            onGenerateLogic={async () => {
                setLogicLoading(true);
                try {
                  const resp = await fetch(`${BACKEND_URL}/analysis/logic-map`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code, language: selectedLang, problemId: currentProblem?.id })
                  });
                  const data = await resp.json();
                  const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                  setLogicSteps(parsed.steps);
                } catch (e) { console.error(e); } finally { setLogicLoading(false); }
            }}
            hint={hint} hintLoading={hintLoading} logicSteps={logicSteps} logicLoading={logicLoading} detectedComplexity={detectedComplexity}
          />
        )}
      </main>

      {/* 결과 모달 */}
      {showResultModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" onClick={() => setShowResultModal(false)}></div>
          <div className="relative w-full max-w-3xl bg-white rounded-[4rem] shadow-2xl p-14 text-center overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]"></div>
            <div className="flex flex-col md:flex-row gap-10 items-stretch font-sans font-black">
               <div className="flex-1 flex flex-col justify-center">
                  <div className="bg-red-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce-slow"><Trophy className="w-12 h-12 text-red-600" /></div>
                  <h2 className="text-3xl font-black text-gray-800 tracking-tighter mb-2 uppercase text-center font-mono font-black font-black">Report Card</h2>
                  <p className="text-gray-400 font-bold text-[10px] mb-10 uppercase tracking-[0.3em] text-center font-sans font-black font-black">Your achievement analysis</p>
                  <div className="bg-gray-50 p-8 rounded-[2.5rem] mb-10 border border-gray-100 shadow-inner space-y-5 text-left font-mono font-black font-black">
                     <div className="flex justify-between items-center font-sans font-black font-black font-black font-black"><span className="text-[10px] text-gray-400 uppercase tracking-widest font-sans font-black font-black font-black">Time</span><span className="text-xl font-black text-gray-800 font-mono font-black font-black">{Math.floor(time / 60)}m {time % 60}s</span></div>
                     <div className="flex justify-between items-center font-sans font-black font-black font-black font-black"><span className="text-[10px] text-gray-400 uppercase tracking-widest font-sans font-black font-black font-black">Efficiency</span><span className="text-sm font-black text-indigo-600 font-black font-black font-black">{detectedComplexity || "N/A"}</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => finalizeResult(false)} className="py-5 rounded-2xl bg-gray-100 text-gray-500 font-black text-xs hover:bg-gray-200 transition-all uppercase tracking-widest font-sans font-black font-black">Fail</button>
                    <button onClick={() => finalizeResult(true)} className="py-5 rounded-2xl bg-red-600 text-white font-black text-xs shadow-xl shadow-red-100 hover:bg-red-700 transition-all uppercase tracking-widest transform active:scale-95 font-sans font-black font-black">Success</button>
                  </div>
               </div>
               <div className="flex-1 border-l border-gray-50 pl-0 md:pl-10 flex flex-col justify-center">
                  <h3 className="text-xs font-black text-gray-800 uppercase mb-6 flex items-center justify-center gap-2 tracking-widest font-sans font-black font-black font-black font-black"><BarChart3 className="w-4 h-4 text-blue-500" /> Complexity Insight</h3>
                  <Complexity3DGraph isModal={true} highlightComplexity={detectedComplexity} />
               </div>
            </div>
            <button onClick={() => setShowResultModal(false)} className="mt-12 text-[10px] font-black text-gray-300 hover:text-gray-800 transition-colors uppercase tracking-[0.4em] font-mono">Cancel and Resume</button>
          </div>
        </div>
      )}

      {/* 새 프로젝트 모달 */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300 font-sans font-black font-black">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl" onClick={() => setShowNewProjectModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-8 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300 border border-gray-100">
            <div className="flex justify-between items-center mb-6 px-1">
              <div className="flex flex-col"><h3 className="text-2xl font-black text-gray-800 tracking-tighter uppercase leading-none font-sans font-black font-black">New Project</h3><span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest font-mono font-black font-black font-black">co:code Lab Setup</span></div>
              <button onClick={() => setShowNewProjectModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-800"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 font-sans text-left px-1">
              <div><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1 font-black">Project Name</label><input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="예: 백준 실버 달성 프로젝트" className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-[1rem] focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-700 shadow-inner text-sm transition-all" /></div>
              <div><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1 font-black">Focus Language</label><div className="grid grid-cols-4 gap-1.5 font-mono">{LANGUAGES.map(l => (<button key={l} onClick={() => setNewProjectLang(l)} className={`py-2 rounded-lg text-[9px] font-black border-2 transition-all ${newProjectLang === l ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-400 border-gray-50 hover:border-gray-200'}`}>{l}</button>))}</div></div>
              <div><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block px-1 font-black">Description (Optional)</label><div className="relative text-left font-black"><AlignLeft className="absolute left-4 top-3.5 w-4 h-4 text-gray-300 font-black" /><textarea value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} placeholder="프로젝트의 목표를 적어주세요." className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border-none rounded-[1rem] focus:ring-2 focus:ring-red-500 outline-none font-medium text-gray-600 shadow-inner h-20 resize-none text-sm leading-relaxed" /></div></div>
              <button onClick={async () => {
                try {
                  const resp = await fetch(`${BACKEND_URL}/projects`, {
                    method: "POST", headers: { "Content-Type": "application/json", "x-user-id": user.uid },
                    body: JSON.stringify({ name: newProjectName, language: newProjectLang, description: newProjectDescription })
                  });
                  if (resp.ok) { setShowNewProjectModal(false); fetchProjects(user.uid); showMessage("Project Ready!", "success"); }
                } catch (e) { showMessage("오류 발생", "error"); }
              }} className="w-full bg-red-600 text-white font-black py-4.5 rounded-[1.2rem] shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 mt-1 text-sm tracking-tight uppercase shadow-red-100 transform active:scale-95 font-sans font-black font-black font-black font-black">Create Project</button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="fixed bottom-12 right-12 z-[500] animate-in slide-in-from-bottom-12 duration-500 font-sans font-black">
          <div className={`px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-5 border border-white/10 ${message.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>
            <span className="text-lg font-black tracking-tight">{message.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}