import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Globe, Github, Code } from 'lucide-react';

const LoginPage = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[95vh] px-4 animate-in fade-in duration-700 bg-gradient-to-b from-white to-gray-50">
      <div className="text-center mb-10">
        <img src="/cocode_logo.jpg" alt="co:code" className="w-28 h-28 rounded-[2.5rem] mx-auto mb-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform cursor-pointer object-cover" />
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

          <button onClick={() => onAuthSuccess({ uid: 'mock_uid', name: '세종인', email })} className="w-full bg-red-600 text-white font-black py-5.5 rounded-[1.8rem] shadow-xl shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition-all text-lg tracking-tight uppercase mt-6">Enter Lab</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;