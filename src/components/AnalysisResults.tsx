import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Cpu, 
  Layers, 
  Activity, 
  Zap, 
  Download, 
  Play, 
  Pause, 
  Clock, 
  FileText, 
  Lock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart2
} from 'lucide-react';
import { AudioAnalysisResult } from '../types';

interface AnalysisResultsProps {
  result: AudioAnalysisResult;
  onLaunchCaptcha: () => void;
  onNavigateToDiagnostics: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  onLaunchCaptcha,
  onNavigateToDiagnostics
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const downloadReportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `VoiceShield_Report_${result.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const isFake = result.prediction === 'FAKE';

  return (
    <div className="space-y-6">
      {/* 1. Primary Verdict Bento Card */}
      <div 
        className={`rounded-3xl p-7 sm:p-8 border shadow-sm transition-all ${
          isFake
            ? 'bg-red-50/80 border-red-200 text-red-950'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div 
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                isFake ? 'bg-red-600 text-white shadow-red-600/25' : 'bg-emerald-600 text-white shadow-emerald-600/25'
              }`}
            >
              {isFake ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-500">
                  Verification Verdict
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase font-mono ${
                  result.riskLevel === 'HIGH' ? 'bg-red-200 text-red-900' : result.riskLevel === 'MEDIUM' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  Risk: {result.riskLevel}
                </span>
                {result.selectedModelRepo && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Model: {result.selectedModelRepo.name.split(' ')[0]} ({result.selectedModelRepo.checkpoint})
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isFake ? 'FAKE / SYNTHETIC VOICE DETECTED' : 'REAL / AUTHENTIC HUMAN VOICE'}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-normal leading-relaxed">
                {result.aiExplanation
                  ? result.aiExplanation
                  : isFake
                    ? 'Acoustic phase analysis and RawNet2/AASIST ensembles detected synthetic neural vocoder artifacts, abnormal pitch rigidity, or loudspeaker replay distortion.'
                    : 'Natural human vocal tract resonance, organic pitch micro-tremors (1.2% - 2.8%), and subglottal airflow dynamics verified.'}
              </p>

              {result.artifacts.speakerReplayScore && result.artifacts.speakerReplayScore > 50 ? (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                  <span>⚠️ Transducer Replay Signature ({result.artifacts.speakerReplayScore}%): Audio played from external phone/laptop speaker into microphone</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Quick Metrics Cluster */}
          <div className="flex items-center gap-4 bg-white/95 p-4 rounded-2xl border border-slate-200/90 shadow-xs self-stretch lg:self-auto justify-around">
            <div className="text-center px-3">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Confidence</span>
              <span className="text-2xl font-black text-slate-900 font-mono">{result.confidence}%</span>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="text-center px-3">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Threat Score</span>
              <span className={`text-2xl font-black font-mono ${isFake ? 'text-red-600' : 'text-emerald-600'}`}>
                {result.threatScore}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </span>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="text-center px-3">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Latency</span>
              <span className="text-2xl font-black text-slate-900 font-mono">{result.totalInferenceTimeMs}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Model Ensemble Architecture Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* RawNet2 Model Bento Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">RawNet2 Model</h4>
                  <p className="text-[10px] text-slate-500 font-mono">SincNet Time-Domain</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {result.models.rawnet2.inferenceTimeMs} ms
              </span>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Spoof Probability</span>
                  <span className="font-mono font-bold text-slate-800">
                    {(result.models.rawnet2.spoof * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${result.models.rawnet2.spoof * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Genuine Score</span>
                <span className="font-mono font-bold text-emerald-600">
                  {(result.models.rawnet2.genuine * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Embedding Score</span>
                <span className="font-mono font-bold text-slate-700">
                  {result.models.rawnet2.embeddingScore}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AASIST Model Bento Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">AASIST Model</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Graph Attention Network</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {result.models.aasist.inferenceTimeMs} ms
              </span>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Spoof Probability</span>
                  <span className="font-mono font-bold text-slate-800">
                    {(result.models.aasist.spoof * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-600 rounded-full transition-all"
                    style={{ width: `${result.models.aasist.spoof * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Genuine Score</span>
                <span className="font-mono font-bold text-emerald-600">
                  {(result.models.aasist.genuine * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Embedding Score</span>
                <span className="font-mono font-bold text-slate-700">
                  {result.models.aasist.embeddingScore}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ensemble Decision Bento Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Ensemble Decision Matrix</h4>
                <p className="text-[10px] text-slate-500 font-mono">0.5 * RN2 + 0.5 * AS</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs font-mono text-slate-700 space-y-2 my-2">
              <div className="flex justify-between">
                <span>0.5 × RawNet2 ({result.models.rawnet2.spoof}):</span>
                <strong>{(0.5 * result.models.rawnet2.spoof).toFixed(3)}</strong>
              </div>
              <div className="flex justify-between">
                <span>0.5 × AASIST ({result.models.aasist.spoof}):</span>
                <strong>{(0.5 * result.models.aasist.spoof).toFixed(3)}</strong>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900">
                <span>Combined Spoof Score:</span>
                <span className={isFake ? 'text-red-600 font-mono' : 'text-emerald-600 font-mono'}>
                  {(result.threatScore / 100).toFixed(3)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Calibrated against ASVspoof LA threshold</span>
          </div>
        </div>
      </div>

      {/* 3. Forensic Acoustic Biomarkers Bento Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Forensic Acoustic Biomarkers</h3>
            <p className="text-xs text-slate-500">Deepfake synthesis artifact indicators across frequency and time domains</p>
          </div>
          <button
            id="btn-view-full-diagnostics"
            onClick={onNavigateToDiagnostics}
            className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
            Full Forensic Lab
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Artifact 1: Vocoder Synthesis Residuals */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-mono text-slate-500 block mb-1">Vocoder Residuals</span>
            <span className="text-xl font-black font-mono text-slate-900">{result.artifacts.vocoderArtifactScore}%</span>
            <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full ${result.artifacts.vocoderArtifactScore > 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${result.artifacts.vocoderArtifactScore}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">HiFi-GAN / VITS traces</p>
          </div>

          {/* Artifact 2: Phase Discontinuity */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-mono text-slate-500 block mb-1">Phase Discontinuity</span>
            <span className="text-xl font-black font-mono text-slate-900">{result.artifacts.phaseDiscontinuity}%</span>
            <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full ${result.artifacts.phaseDiscontinuity > 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${result.artifacts.phaseDiscontinuity}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Inter-band phase alignment</p>
          </div>

          {/* Artifact 3: Pitch Jitter Variance */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-mono text-slate-500 block mb-1">Pitch Jitter Rigidity</span>
            <span className="text-xl font-black font-mono text-slate-900">{result.artifacts.pitchJitterVariance}%</span>
            <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full ${result.artifacts.pitchJitterVariance > 60 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${result.artifacts.pitchJitterVariance}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Vocal fold micro-tremors</p>
          </div>

          {/* Artifact 4: Spectral Cutoff */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-mono text-slate-500 block mb-1">Spectral Cutoff Score</span>
            <span className="text-xl font-black font-mono text-slate-900">{result.artifacts.spectralCutoffScore}%</span>
            <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full ${result.artifacts.spectralCutoffScore > 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${result.artifacts.spectralCutoffScore}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">High-frequency roll-off (4-8kHz)</p>
          </div>
        </div>
      </div>

      {/* 4. Action & Export Bento Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          {result.audioUrl && (
            <>
              <audio
                ref={audioRef}
                src={result.audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              <button
                id="btn-result-play-audio"
                onClick={toggleAudio}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause Audio' : 'Play Audited Audio'}
              </button>
            </>
          )}

          <button
            id="btn-export-report"
            onClick={downloadReportJson}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Forensic JSON
          </button>
        </div>

        {/* Dynamic Voice CAPTCHA recommendation */}
        {result.isCaptchaRequired ? (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-4 py-2 rounded-2xl">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs text-amber-900 font-medium">Borderline Score: Voice CAPTCHA Recommended</span>
            <button
              id="btn-result-launch-captcha"
              onClick={onLaunchCaptcha}
              className="ml-2 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
            >
              Verify CAPTCHA
            </button>
          </div>
        ) : (
          <button
            id="btn-result-challenge"
            onClick={onLaunchCaptcha}
            className="px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs transition-colors flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-amber-600" />
            Run Secondary Voice CAPTCHA Challenge
          </button>
        )}
      </div>
    </div>
  );
};
