import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Upload, 
  Play, 
  Pause, 
  FileAudio, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Cpu, 
  Layers, 
  Sparkles,
  Zap,
  RefreshCw,
  Sliders,
  Volume2,
  FileCheck,
  GitBranch,
  Database
} from 'lucide-react';
import { AudioEngine, DEFAULT_PRETRAINED_MODELS } from '../lib/audioEngine';
import { AudioAnalysisResult, BenchmarkSample, PretrainedModelRepo } from '../types';
import { BENCHMARK_SAMPLES } from '../data/benchmarkSamples';

interface DetectionScannerProps {
  onAnalysisComplete: (result: AudioAnalysisResult) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (val: boolean) => void;
  onRequestCaptcha: () => void;
}

export const DetectionScanner: React.FC<DetectionScannerProps> = ({
  onAnalysisComplete,
  isAnalyzing,
  setIsAnalyzing,
  onRequestCaptcha
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeBenchmarkSample, setActiveBenchmarkSample] = useState<BenchmarkSample | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Pretrained Model Repository State
  const [modelRepos, setModelRepos] = useState<PretrainedModelRepo[]>(DEFAULT_PRETRAINED_MODELS);
  const [selectedModelId, setSelectedModelId] = useState<string>('voiceshield-ensemble');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Load Model Repositories on Mount
  useEffect(() => {
    AudioEngine.getPretrainedModels().then((repos) => {
      if (repos && repos.length > 0) {
        setModelRepos(repos);
      }
    });
  }, []);

  const currentRepo = modelRepos.find((m) => m.id === selectedModelId) || modelRepos[0];

  // Analysis Stages Checklist
  const steps = [
    { title: 'Audio Preprocessing', desc: '16kHz mono resampling, silence RMS gate, and peak normalization' },
    { title: `${currentRepo.name.split(' ')[0]} Feature Extraction`, desc: currentRepo.architecture },
    { title: 'Acoustic Biomarker Verification', desc: 'Analyzing glottal pulse, pitch jitter, phase dispersion & vocoder artifacts' },
    { title: 'Calibrated Pretrained Evaluation', desc: `Classification against ${currentRepo.evaluationSet} thresholds` },
  ];

  // Live Canvas Waveform Drawing during mic recording
  const drawLiveWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    // Calculate RMS volume level
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = (dataArray[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / bufferLength);
    setAudioLevel(Math.min(100, Math.round(rms * 250)));

    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#6366f1'; // indigo-500
    ctx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animFrameRef.current = requestAnimationFrame(drawLiveWaveform);
  };

  // Start Microphone Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = AudioEngine.getAudioContext();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const mime = audioChunksRef.current[0]?.type || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        const file = new File([audioBlob], `user_audio_sample_${Date.now()}.wav`, { type: mime });
        setSelectedFile(file);
        setActiveBenchmarkSample(null);
        setAudioPreviewUrl(URL.createObjectURL(audioBlob));

        // Stop tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);

      animFrameRef.current = requestAnimationFrame(drawLiveWaveform);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is required to record live audio. Please grant microphone permission in your browser.');
    }
  };

  // Stop Microphone Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  };

  // Handle File Drop or Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setActiveBenchmarkSample(null);
      setAudioPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setActiveBenchmarkSample(null);
      setAudioPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Load Preset Benchmark Attack Sample
  const handleSelectBenchmark = (sample: BenchmarkSample) => {
    setActiveBenchmarkSample(sample);
    setSelectedFile(null);
    const wavBuffer = AudioEngine.createBenchmarkAudio(sample.category);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    setAudioPreviewUrl(URL.createObjectURL(blob));
  };

  // Execute Full Forensic Analysis Pipeline with Selected Model Repository
  const runAnalysis = async () => {
    if (!selectedFile && !activeBenchmarkSample) {
      alert('Please record audio, upload a file, or select a benchmark sample to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(0);

    try {
      let arrayBuffer: ArrayBuffer;
      let fileName: string;
      let fileSizeBytes: number;

      if (selectedFile) {
        arrayBuffer = await selectedFile.arrayBuffer();
        fileName = selectedFile.name;
        fileSizeBytes = selectedFile.size;
      } else if (activeBenchmarkSample) {
        arrayBuffer = AudioEngine.createBenchmarkAudio(activeBenchmarkSample.category);
        fileName = `${activeBenchmarkSample.title.replace(/\s+/g, '_')}.wav`;
        fileSizeBytes = arrayBuffer.byteLength;
      } else {
        return;
      }

      // Progress animation across steps
      setAnalysisStep(0);
      await new Promise((r) => setTimeout(r, 220));
      setAnalysisStep(1);
      await new Promise((r) => setTimeout(r, 260));
      setAnalysisStep(2);
      await new Promise((r) => setTimeout(r, 240));
      setAnalysisStep(3);
      await new Promise((r) => setTimeout(r, 200));

      const result = await AudioEngine.analyzeAudio(arrayBuffer, fileName, fileSizeBytes, selectedModelId);
      setIsAnalyzing(false);
      onAnalysisComplete(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      setIsAnalyzing(false);
      alert('Error analyzing audio file. Ensure the audio is valid and not corrupted.');
    }
  };

  // Audio Playback toggle
  const togglePlayPreview = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingPreview) {
      audioPlayerRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Bento Header Card: Core Instruction & Status */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Voice Anti-Spoofing Scanner</h2>
          </div>
          <p className="text-xs text-slate-500">
            Submit speech audio to test against pretrained <strong>RawNet2</strong> (SincNet) and <strong>AASIST</strong> (Graph Attention) neural models.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            id="btn-voice-captcha-quick"
            onClick={onRequestCaptcha}
            className="flex-1 md:flex-none px-4 py-2.5 text-xs font-bold rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-600" />
            Launch Voice CAPTCHA
          </button>
        </div>
      </div>

      {/* Pretrained Model Repository Selector Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Active Pretrained Model Repository</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            EER: <strong className="text-emerald-700">{currentRepo.eer}</strong> | min t-DCF: <strong className="text-indigo-700">{currentRepo.minTdcf}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {modelRepos.map((repo) => {
            const isSelected = selectedModelId === repo.id;
            return (
              <button
                key={repo.id}
                id={`btn-model-repo-${repo.id}`}
                onClick={() => setSelectedModelId(repo.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-600/20'
                    : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-slate-900">{repo.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 truncate mb-1">Repo: {repo.repo}</p>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">{repo.description}</p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Params: {repo.parameters}</span>
                  <span className="text-emerald-700 font-bold">EER {repo.eer}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Mode Bento Grid: 3 Asymmetric Modular Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Bento Cell: Live Microphone Ingestion (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Live Microphone Input</h3>
                  <p className="text-[11px] text-slate-500">Record genuine voice or live acoustic feed</p>
                </div>
              </div>
              {isRecording && (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold font-mono animate-pulse flex items-center gap-1.5 border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  REC {Math.floor(recordDuration / 60)}:{String(recordDuration % 60).padStart(2, '0')}
                </span>
              )}
            </div>

            {/* Live Audio Oscilloscope Canvas */}
            <div className="relative w-full h-32 bg-slate-950 rounded-2xl overflow-hidden mb-4 border border-slate-800 flex items-center justify-center shadow-inner">
              <canvas
                ref={canvasRef}
                width={400}
                height={128}
                className="w-full h-full object-cover"
              />
              {!isRecording && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-slate-400 text-xs font-mono">
                  <Mic className="w-5 h-5 text-slate-500 mb-1" />
                  <span>Click start recording to capture mic stream</span>
                </div>
              )}
            </div>

            {/* Audio Level Indicator */}
            {isRecording && (
              <div className="mb-4">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-mono">
                  <span>Input Signal Level</span>
                  <span>{audioLevel}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-75 ${
                      audioLevel > 80 ? 'bg-red-500' : audioLevel > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            {!isRecording ? (
              <button
                id="btn-start-record"
                onClick={startRecording}
                disabled={isAnalyzing}
                className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Start Recording
              </button>
            ) : (
              <button
                id="btn-stop-record"
                onClick={stopRecording}
                className="flex-1 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 animate-pulse"
              >
                <Square className="w-4 h-4 fill-current" />
                Stop & Capture ({recordDuration}s)
              </button>
            )}
          </div>
        </div>

        {/* Middle Bento Cell: File Upload (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Upload Audio File</h3>
                <p className="text-[11px] text-slate-500">Supports .wav, .mp3, .m4a, .ogg, .flac</p>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                dragOver 
                  ? 'border-indigo-500 bg-indigo-50/50' 
                  : selectedFile 
                    ? 'border-emerald-400 bg-emerald-50/30' 
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
              }`}
              onClick={() => document.getElementById('audio-file-input')?.click()}
            >
              <input
                id="audio-file-input"
                type="file"
                accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center py-1">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-xs text-slate-800 truncate max-w-[200px]">{selectedFile.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB (16kHz Target)</p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-2.5">
                  <FileAudio className="w-7 h-7 text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700">Drag & drop speech audio</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">or browse from device</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label
              htmlFor="audio-file-input"
              className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Select File
            </label>
          </div>
        </div>

        {/* Right Bento Cell: Preloaded Benchmark Attack Library (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Preset Benchmarks</h3>
                <p className="text-[11px] text-slate-500">1-Click Attack Samples</p>
              </div>
            </div>

            <div className="space-y-2">
              {BENCHMARK_SAMPLES.map((sample) => {
                const isSelected = activeBenchmarkSample?.id === sample.id;
                return (
                  <button
                    key={sample.id}
                    id={`btn-sample-${sample.id}`}
                    onClick={() => handleSelectBenchmark(sample)}
                    className={`w-full text-left p-2.5 rounded-2xl text-xs transition-all border ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 font-semibold text-indigo-900 shadow-xs'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold truncate max-w-[130px]">{sample.title}</span>
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${
                        sample.expectedVerdict === 'REAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {sample.expectedVerdict}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{sample.sourceType}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Audio Preview & Analysis Action Bento Bar */}
      {(selectedFile || activeBenchmarkSample || audioPreviewUrl) && (
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {audioPreviewUrl && (
              <>
                <audio
                  ref={audioPlayerRef}
                  src={audioPreviewUrl}
                  onEnded={() => setIsPlayingPreview(false)}
                  className="hidden"
                />
                <button
                  id="btn-preview-audio"
                  onClick={togglePlayPreview}
                  className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white flex items-center justify-center shadow-md transition-all shrink-0"
                >
                  {isPlayingPreview ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
              </>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm truncate text-slate-100">
                  {selectedFile ? selectedFile.name : activeBenchmarkSample?.title}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                  16kHz Audio
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Model: <strong className="text-indigo-400">{currentRepo.name}</strong> ({currentRepo.checkpoint})
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto flex items-center gap-3">
            <button
              id="btn-run-analysis"
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Pretrained Models...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Analyze Audio With {currentRepo.name.split(' ')[0]}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Multi-Stage Neural Processing Bento Grid */}
      {isAnalyzing && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center animate-spin">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Processing Voice Biometrics...</h3>
              <p className="text-xs text-slate-500">Evaluating against {currentRepo.repo} ({currentRepo.checkpoint})</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {steps.map((step, idx) => {
              const isDone = analysisStep > idx;
              const isCurrent = analysisStep === idx;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDone
                      ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                      : isCurrent
                        ? 'border-indigo-500 bg-indigo-50/80 text-indigo-950 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-mono shrink-0">
                        {idx + 1}
                      </div>
                    )}
                    <span className="font-bold text-xs">{step.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
