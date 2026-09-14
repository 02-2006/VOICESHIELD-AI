import React from 'react';
import { 
  Activity, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  ShieldAlert, 
  HelpCircle, 
  BarChart3, 
  Waves,
  Zap,
  Info
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { AudioAnalysisResult } from '../types';
import { SpectrogramVisualizer } from './SpectrogramVisualizer';

interface ExplainableAIDashboardProps {
  currentResult: AudioAnalysisResult | null;
  onSelectScanner: () => void;
}

export const ExplainableAIDashboard: React.FC<ExplainableAIDashboardProps> = ({
  currentResult,
  onSelectScanner
}) => {
  if (!currentResult) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <Activity className="w-12 h-12 text-indigo-500 mx-auto mb-3 opacity-60" />
        <h3 className="text-lg font-bold text-slate-900">No Active Audio Scan Selected</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
          Record speech with your microphone or upload an audio file to view complete deepfake forensic biomarkers and XAI diagnostics.
        </p>
        <button
          onClick={onSelectScanner}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
        >
          Open Voice Scanner
        </button>
      </div>
    );
  }

  const artifacts = currentResult.artifacts;

  // Radar chart data for Acoustic Biomarkers
  const radarData = [
    { subject: 'Vocoder Traces', value: artifacts.vocoderArtifactScore, fullMark: 100 },
    { subject: 'Phase Inconsistency', value: artifacts.phaseDiscontinuity, fullMark: 100 },
    { subject: 'Pitch Jitter Rigidity', value: artifacts.pitchJitterVariance, fullMark: 100 },
    { subject: 'Spectral Cutoff', value: artifacts.spectralCutoffScore, fullMark: 100 },
    { subject: 'Zero-Crossing Spread', value: artifacts.zeroCrossingDispersion, fullMark: 100 },
    { subject: 'Harmonic Distortion', value: Math.min(100, Math.round((30 - artifacts.harmonicToNoiseRatio) * 3.3)), fullMark: 100 },
  ];

  // Model comparison bar data
  const modelComparisonData = [
    {
      name: 'RawNet2 (SincNet)',
      SpoofProbability: Math.round(currentResult.models.rawnet2.spoof * 100),
      GenuineProbability: Math.round(currentResult.models.rawnet2.genuine * 100),
    },
    {
      name: 'AASIST (Graph Attention)',
      SpoofProbability: Math.round(currentResult.models.aasist.spoof * 100),
      GenuineProbability: Math.round(currentResult.models.aasist.genuine * 100),
    },
    {
      name: 'Ensemble 50/50',
      SpoofProbability: currentResult.threatScore,
      GenuineProbability: Math.round(100 - currentResult.threatScore),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bento Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Explainable AI (XAI) Deepfake Forensic Lab
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed physical and neural acoustic signature breakdown for sample: <strong className="text-slate-800">{currentResult.fileName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase font-mono ${
            currentResult.prediction === 'FAKE' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            Verdict: {currentResult.prediction} ({currentResult.confidence}%)
          </span>
        </div>
      </div>

      {/* 2D Spectrogram Bento Module */}
      <SpectrogramVisualizer
        spectrogramMatrix={currentResult.spectrogramMatrix}
        frequencyLabels={currentResult.frequencyLabels}
        timeLabels={currentResult.timeLabels}
        fileName={currentResult.fileName}
        durationSeconds={currentResult.durationSeconds}
      />

      {/* Bento Grid: Radar Biomarkers & Neural Model Probabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart: Acoustic Biomarkers Bento Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Acoustic Biomarkers Radar</h3>
                <p className="text-xs text-slate-500">Multidimensional feature signature against human baseline</p>
              </div>
              <BarChart3 className="w-4 h-4 text-indigo-500" />
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                  <Radar
                    name="Acoustic Metric"
                    dataKey="value"
                    stroke={currentResult.prediction === 'FAKE' ? '#ef4444' : '#10b981'}
                    fill={currentResult.prediction === 'FAKE' ? '#ef4444' : '#10b981'}
                    fillOpacity={0.4}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center font-mono pt-3 border-t border-slate-100">
            Higher values indicate stronger synthetic AI vocoder / replay characteristics
          </div>
        </div>

        {/* Bar Chart: Model Layer Probabilities Bento Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Model Agreement & Ensemble Fusion</h3>
                <p className="text-xs text-slate-500">Cross-validation between RawNet2 SincNet and AASIST GAT</p>
              </div>
              <Layers className="w-4 h-4 text-cyan-500" />
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelComparisonData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '14px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="SpoofProbability" fill="#ef4444" name="Spoof %" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="GenuineProbability" fill="#10b981" name="Genuine %" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center font-mono pt-3 border-t border-slate-100">
            Both models execute independently before 50/50 decision engine weighting
          </div>
        </div>
      </div>

      {/* Forensic Diagnostic Analysis Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-indigo-600">
            <Cpu className="w-4 h-4" />
            <h4 className="font-extrabold text-sm text-slate-900">SincNet Waveform Convolutions</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            RawNet2's 128 learnable sinc bandpass filters inspect glottal pulses directly in the time domain, avoiding STFT time-frequency resolution trade-offs.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 text-cyan-600 mb-2">
            <Layers className="w-4 h-4" />
            <h4 className="font-extrabold text-sm text-slate-900">Graph Attention Messaging</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            AASIST models spectral and temporal dependencies as graph nodes. Edge weights capture artificial phase synchrony found in HiFi-GAN and Tacotron2 vocoders.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="font-extrabold text-sm text-slate-900">ASVspoof 2019/2021 Calibration</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Standardized decision threshold minimizes Equal Error Rate (EER: 0.83%) and min t-DCF (0.0275) for high-security biometric defense.
          </p>
        </div>
      </div>
    </div>
  );
};
