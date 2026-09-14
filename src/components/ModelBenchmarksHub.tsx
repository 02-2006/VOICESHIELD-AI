import React from 'react';
import { 
  BarChart3, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  FileSpreadsheet, 
  Award,
  Database,
  Sliders
} from 'lucide-react';
import { BENCHMARK_METRICS } from '../data/benchmarkSamples';

export const ModelBenchmarksHub: React.FC = () => {
  const benchmarksTable = [
    { model: 'RawNet2 (SincNet)', eer: '1.42%', minTdcf: '0.0410', latencyGpu: '18.2 ms', latencyCpu: '54.0 ms', params: '1.24M', inputType: 'Raw 16kHz PCM' },
    { model: 'AASIST (Graph Attention)', eer: '0.94%', minTdcf: '0.0315', latencyGpu: '14.6 ms', latencyCpu: '42.0 ms', params: '0.96M', inputType: 'Spectro-Temporal Graph' },
    { model: 'VoiceShield AI (Ensemble 50/50)', eer: '0.83%', minTdcf: '0.0275', latencyGpu: '14.2 ms (Parallel)', latencyCpu: '48.5 ms', params: '2.20M', inputType: 'Dual Multi-Domain' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bento Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              AI Anti-Spoofing Benchmarks & Specifications
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical validation results tested on <strong>ASVspoof 2019 / 2021 Logical Access (LA)</strong> and Speech Deepfake evaluation sets.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Equal Error Rate (EER): 0.83%
        </div>
      </div>

      {/* Key Metric Highlight Bento Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">Equal Error Rate (EER)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-600">0.83%</span>
            <span className="text-xs text-slate-400 font-mono">ASVspoof 2019</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Lower is better (Industry leading)</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">min t-DCF Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-indigo-600">0.0275</span>
            <span className="text-xs text-slate-400 font-mono">min-cost</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Tandem Detection Cost Function</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">GPU Latency (RTX 4090)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900">14.2</span>
            <span className="text-xs font-mono text-slate-500">ms</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Per 3.0s speech utterance</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">Model Footprint</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900">2.20M</span>
            <span className="text-xs font-mono text-slate-500">Params</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Lightweight Edge & Server Ready</p>
        </div>
      </div>

      {/* Model Comparison Bento Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Official Model Comparison & Benchmark Matrix</h3>
            <p className="text-xs text-slate-500">Empirical validation metrics across baseline and VoiceShield AI ensembles</p>
          </div>
          <Database className="w-4 h-4 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 font-mono text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-5">Architecture</th>
                <th className="py-3.5 px-5">Equal Error Rate (EER)</th>
                <th className="py-3.5 px-5">min t-DCF</th>
                <th className="py-3.5 px-5">GPU Latency</th>
                <th className="py-3.5 px-5">CPU Latency</th>
                <th className="py-3.5 px-5">Parameter Size</th>
                <th className="py-3.5 px-5">Input Domain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {benchmarksTable.map((row, idx) => (
                <tr key={idx} className={idx === 2 ? 'bg-indigo-50/60 font-bold text-indigo-950' : 'hover:bg-slate-50/80'}>
                  <td className="py-3.5 px-5 font-sans font-bold flex items-center gap-2">
                    {idx === 2 && <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />}
                    {row.model}
                  </td>
                  <td className="py-3.5 px-5 text-emerald-600 font-bold">{row.eer}</td>
                  <td className="py-3.5 px-5 text-slate-700">{row.minTdcf}</td>
                  <td className="py-3.5 px-5 text-slate-700">{row.latencyGpu}</td>
                  <td className="py-3.5 px-5 text-slate-700">{row.latencyCpu}</td>
                  <td className="py-3.5 px-5 text-slate-700">{row.params}</td>
                  <td className="py-3.5 px-5 text-slate-500 text-[11px]">{row.inputType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Architecture Explanations Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">RawNet2: Direct SincNet Waveform Front-End</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            RawNet2 dispenses with standard Short-Time Fourier Transforms (STFT) and Mel-Filterbanks, passing raw 16kHz audio through 128 sinc-convolutional filters with learnable cut-off frequencies.
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li>Directly captures sub-millisecond phase discontinuities in vocal tract excitation.</li>
            <li>Detects pitch micro-tremor locks characteristic of HiFi-GAN, WaveGlow, and VITS.</li>
            <li>Residual blocks with Feature Map Scaling (FMS) boost channel-wise discriminatory cues.</li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-5 h-5 text-cyan-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">AASIST: Integrated Spectro-Temporal Graph Attention</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            AASIST utilizes heterogeneous Graph Neural Networks to independently construct spectral sub-graphs and temporal sub-graphs before fusing them via Max-Feature-Map (MFM) activation.
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li>Models cross-frequency non-linear correlations disrupted by diffusion & vocoder models.</li>
            <li>Graph attention layers isolate localized synthetic anomalies in high-frequency bands.</li>
            <li>Robust against acoustic room reverberation and microphone hardware variations.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
