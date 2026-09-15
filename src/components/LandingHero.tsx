import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Layers, 
  Radio, 
  Lock, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  Zap,
  Flame,
  Volume2,
  Award,
  TrendingDown,
  Clock
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface LandingHeroProps {
  onStartDetection: () => void;
  onSelectTab: (tab: ActiveTab) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartDetection,
  onSelectTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Bento Row: Main Hero Showcase + Live Telemetry Bento Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Hero Card (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-50/70 via-blue-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.12]">
              Detect AI Voice Cloning Attacks <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600">
                In Real-Time Neural Streams
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed font-normal max-w-2xl">
              VoiceShield AI is a forensic audio biometric defense engine combining <strong>RawNet2 SincNet</strong> time-domain convolutions and <strong>AASIST</strong> spectro-temporal graph attention networks to neutralize deepfakes, TTS vocoders, and replay attacks with sub-millisecond precision.
            </p>
          </div>

          {/* Action CTAs in Bento Footer */}
          <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-slate-100">
            <button
              id="hero-btn-start-detect"
              onClick={onStartDetection}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Start Voice Detection
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-btn-live-stream"
              onClick={() => onSelectTab('stream')}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-emerald-400" />
              Live Interceptor
            </button>
          </div>
        </div>

        {/* Live Neural Telemetry Bento Card (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30 pointer-events-none" />

          <div className="relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <span className="text-[11px] font-mono uppercase text-indigo-400 font-bold tracking-wider">
                Neural Performance
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 text-[10px] font-mono border border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Equal Error Rate (EER)</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">0.83%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
                </div>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">ASVspoof 2019/2021 LA Benchmark</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">min t-DCF</span>
                  <span className="text-lg font-black font-mono text-indigo-300">0.0275</span>
                  <span className="text-[10px] text-slate-500 block">Min-Cost</span>
                </div>
                <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">GPU Latency</span>
                  <span className="text-lg font-black font-mono text-cyan-300">14.2ms</span>
                  <span className="text-[10px] text-slate-500 block">RTX 4090</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Ensemble Model Size</span>
            <span className="text-slate-200 font-bold">2.20M Params</span>
          </div>
        </div>
      </div>

      {/* Middle Bento Row: 3-Cell Threat & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bento Cell 1: The Threat */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mb-2">The Threat Vector</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Diffusion and neural vocoder voice cloning tools (ElevenLabs, XTTS, RVC, VITS) can impersonate executives, banking users, and government officials with under 3 seconds of audio.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-red-600 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Zero-Shot Neural Synthesis
          </div>
        </div>

        {/* Bento Cell 2: The Solution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mb-2">The Dual-Engine Solution</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              RawNet2's 128 sinc filters catch phase jitter in raw waveforms, while AASIST graph neural networks uncover cross-frequency harmonic inconsistencies, achieving a combined <strong>0.83% Equal Error Rate</strong>.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-indigo-600 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            RawNet2 + AASIST Fusion
          </div>
        </div>

        {/* Bento Cell 3: Dynamic Voice CAPTCHA */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mb-2">Dynamic Voice CAPTCHA</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When confidence is borderline (0.40 &lt; score &lt; 0.70), dynamic random challenge phrases isolate human vocal tract micro-tremors from generative latency.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-amber-600 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Zero-Trust Acoustic Challenge
          </div>
        </div>
      </div>

      {/* Bottom Bento Row: End-to-End Pipeline Bento Strip */}
      <div className="bg-slate-900 text-white rounded-3xl p-7 sm:p-8 border border-slate-800 shadow-lg">
        <div className="max-w-2xl mb-6">
          <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider">System Architecture</span>
          <h3 className="text-xl sm:text-2xl font-black mt-1">Multi-Domain Anti-Spoofing Pipeline</h3>
          <p className="text-xs text-slate-400 mt-1">
            Every audio sample follows a deterministic 7-stage forensic pipeline from raw microphone capture to ensemble classification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/70 hover:border-slate-600 transition-colors">
            <div className="text-[10px] font-mono text-indigo-400 mb-1">STAGE 01 - 02</div>
            <h4 className="font-bold text-sm text-slate-100">Audio Ingestion & 16kHz DSP</h4>
            <p className="text-xs text-slate-400 mt-1">Validation, WAV decoding, mono summation, 16kHz linear interpolation & RMS energy gate.</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/70 hover:border-slate-600 transition-colors">
            <div className="text-[10px] font-mono text-indigo-400 mb-1">STAGE 03 - 04</div>
            <h4 className="font-bold text-sm text-slate-100">RawNet2 Waveform Convolutions</h4>
            <p className="text-xs text-slate-400 mt-1">128 SincNet learnable bandpass filters & Residual GRU layers analyzing raw time-domain glottal pulses.</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/70 hover:border-slate-600 transition-colors">
            <div className="text-[10px] font-mono text-indigo-400 mb-1">STAGE 05 - 06</div>
            <h4 className="font-bold text-sm text-slate-100">AASIST Graph Attention</h4>
            <p className="text-xs text-slate-400 mt-1">Heterogeneous spectral-temporal graph message passing to detect vocoder phase alignment flaws.</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/70 hover:border-slate-600 transition-colors">
            <div className="text-[10px] font-mono text-indigo-400 mb-1">STAGE 07</div>
            <h4 className="font-bold text-sm text-slate-100">50/50 Ensemble Decision</h4>
            <p className="text-xs text-slate-400 mt-1">Formula fusion: 0.5 * RN2 + 0.5 * AS, Threat Scoring (0-100), and automated Voice CAPTCHA gating.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
