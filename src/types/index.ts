export type PredictionType = 'REAL' | 'FAKE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PretrainedModelRepo {
  id: string;
  name: string;
  repo: string;
  checkpoint: string;
  architecture: string;
  evaluationSet: string;
  eer: string;
  minTdcf: string;
  parameters: string;
  description: string;
}

export interface ModelOutput {
  genuine: number; // 0.0 - 1.0
  spoof: number;   // 0.0 - 1.0
  inferenceTimeMs: number;
  embeddingScore?: number;
}

export interface AcousticArtifacts {
  vocoderArtifactScore: number;       // 0-100: Artifacts from HiFi-GAN / WaveGlow / VITS
  phaseDiscontinuity: number;         // 0-100: Phase inconsistency across frequency bins
  pitchJitterVariance: number;        // 0-100: Robotic / unnaturally steady pitch
  spectralCutoffScore: number;        // 0-100: Abrupt cutoff above 4kHz / 6kHz
  harmonicToNoiseRatio: number;       // dB or normalized
  spectralFlux: number;               // Rate of spectral change
  zeroCrossingDispersion: number;     // Dispersion of ZCR
  speakerReplayScore?: number;        // 0-100: Loudspeaker playback / replay attack indicator
}

export interface AudioAnalysisResult {
  id: string;
  timestamp: string;
  fileName: string;
  fileSizeBytes: number;
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  
  prediction: PredictionType;
  confidence: number;       // 0 - 100%
  threatScore: number;      // 0 - 100
  riskLevel: RiskLevel;
  
  models: {
    rawnet2: ModelOutput;
    aasist: ModelOutput;
  };
  
  ensembleWeights: {
    rawnet2Weight: number; // 0.5
    aasistWeight: number;  // 0.5
  };
  
  artifacts: AcousticArtifacts;
  selectedModelRepo?: PretrainedModelRepo;
  aiExplanation?: string;
  
  // Waveform and Spectrogram data for visualization
  waveformPoints: number[];
  spectrogramMatrix: number[][]; // [timeBins][frequencyBins]
  timeLabels: string[];
  frequencyLabels: string[];
  
  totalInferenceTimeMs: number;
  audioUrl?: string;
  isCaptchaRequired: boolean;
  notes?: string;
}

export interface StreamChunkResult {
  chunkIndex: number;
  timestampMs: number;
  spoofProbability: number;
  threatLevel: RiskLevel;
  audioLevel: number;
  isSpoofDetected: boolean;
}

export interface VoiceCaptchaChallenge {
  id: string;
  challengeText: string;
  expectedPhonemeSequence: string[];
  issuedAt: number;
  expiresInSeconds: number;
  difficulty: 'STANDARD' | 'HIGH_SECURITY';
}

export interface CaptchaVerificationResult {
  verified: boolean;
  textMatchScore: number;
  biometricLivenessScore: number;
  combinedSpoofScore: number;
  verdict: 'PASSED' | 'FAILED' | 'RETRY_REQUIRED';
  details: string;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  fileName: string;
  duration: number;
  prediction: PredictionType;
  confidence: number;
  threatScore: number;
  riskLevel: RiskLevel;
  rawnet2Spoof: number;
  aasistSpoof: number;
  audioUrl?: string;
}

export interface BenchmarkSample {
  id: string;
  title: string;
  category: 'AUTHENTIC' | 'AI_CLONE_TTS' | 'VOICE_CONVERSION' | 'REPLAY_ATTACK';
  description: string;
  expectedVerdict: PredictionType;
  sourceType: string;
  sampleUrl?: string;
  audioDataGenerator?: (ctx: AudioContext) => AudioBuffer;
}
