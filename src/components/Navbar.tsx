import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Mic, 
  Radio, 
  Lock, 
  BarChart3, 
  History, 
  Sparkles
} from 'lucide-react';

export type ActiveTab = 
  | 'detect' 
  | 'stream' 
  | 'captcha' 
  | 'forensics' 
  | 'history' 
  | 'benchmarks';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, historyCount }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div 
            id="nav-brand-logo"
            onClick={() => onSelectTab('detect')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">VoiceShield</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold tracking-wider">AI</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Voice Anti-Spoofing & Deepfake Defense</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button
              id="nav-tab-detect"
              onClick={() => onSelectTab('detect')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'detect'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              Voice Scanner
            </button>

            <button
              id="nav-tab-stream"
              onClick={() => onSelectTab('stream')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'stream'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-500" />
              Live Stream
            </button>

            <button
              id="nav-tab-captcha"
              onClick={() => onSelectTab('captcha')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'captcha'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              Voice CAPTCHA
            </button>

            <button
              id="nav-tab-forensics"
              onClick={() => onSelectTab('forensics')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'forensics'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              XAI Diagnostics
            </button>

            <button
              id="nav-tab-history"
              onClick={() => onSelectTab('history')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Audit Logs
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold font-mono">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-benchmarks"
              onClick={() => onSelectTab('benchmarks')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'benchmarks'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
              Benchmarks
            </button>
          </nav>

          {/* Quick Action Badge */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              FastAPI + PyTorch Engine Ready
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => onSelectTab('detect')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'detect' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Mic className="w-3.5 h-3.5" /> Scanner
          </button>
          <button
            onClick={() => onSelectTab('stream')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'stream' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-500" /> Live Stream
          </button>
          <button
            onClick={() => onSelectTab('captcha')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'captcha' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-500" /> CAPTCHA
          </button>
          <button
            onClick={() => onSelectTab('forensics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'forensics' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Diagnostics
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'history' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Logs ({historyCount})
          </button>
          <button
            onClick={() => onSelectTab('benchmarks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'benchmarks' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Benchmarks
          </button>
        </div>
      </div>
    </header>
  );
};
