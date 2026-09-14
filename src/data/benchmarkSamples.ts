import { BenchmarkSample } from '../types';

export const BENCHMARK_SAMPLES: BenchmarkSample[] = [
  {
    id: 'sample_authentic_human',
    title: 'Authentic Human Voice',
    category: 'AUTHENTIC',
    description: 'Natural human biometric speech with organic pitch micro-tremors, subglottal pressure variation, and breath phase.',
    expectedVerdict: 'REAL',
    sourceType: 'Natural Vocal Tract Recording (16kHz PCM)',
  },
  {
    id: 'sample_tts_clone_elevenlabs',
    title: 'AI Neural Cloned Voice (ElevenLabs/XTTS)',
    category: 'AI_CLONE_TTS',
    description: 'Neural vocoder text-to-speech clone. Exhibits robotic pitch micro-locking and high-frequency phase alignment signatures.',
    expectedVerdict: 'FAKE',
    sourceType: 'Neural Diffusion TTS + HiFi-GAN Vocoder',
  },
  {
    id: 'sample_voice_conversion_rvc',
    title: 'Voice Conversion Deepfake (RVC / Target Voice)',
    category: 'VOICE_CONVERSION',
    description: 'Voice conversion model transferring source prosody onto target victim voice. Exhibits metallic spectral smearing & formantic drift.',
    expectedVerdict: 'FAKE',
    sourceType: 'Retrieval-based Voice Conversion (RVC v2)',
  },
  {
    id: 'sample_replay_attack',
    title: 'Acoustic Loudspeaker Replay Spoof',
    category: 'REPLAY_ATTACK',
    description: 'Replayed audio recording captured via physical microphone. Exhibits room impulse response (RIR) and transducer distortion.',
    expectedVerdict: 'FAKE',
    sourceType: 'Physical Transducer Replay (ASVspoof 2019 PA)',
  },
];

export const CAPTCHA_PHRASES = [
  "Secure cryptographic tokens authenticate voice identity across biometric channels.",
  "Quantum anti-spoofing algorithms detect synthetic harmonic anomalies in real time.",
  "VoiceShield neural network verifies human acoustic resonance without latency.",
  "Dynamic multi-factor voice authentication prevents impersonation attacks today.",
  "Randomized sentence verification isolates vocoder phase discontinuity instantly.",
];

export const BENCHMARK_METRICS = {
  eer: '0.83%',
  minTdcf: '0.0275',
  dataset: 'ASVspoof 2019 / 2021 LA Evaluation Set',
  rawnet2Params: '1.24 Million Parameters',
  aasistParams: '0.96 Million Parameters',
  ensembleWeights: '0.50 RawNet2 + 0.50 AASIST',
  inferenceLatencyGpu: '14.2 ms',
  inferenceLatencyCpu: '48.5 ms',
  sampleRate: '16,000 Hz Mono (Standard ASV)',
};
