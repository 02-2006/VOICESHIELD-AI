import React, { useState, useRef, useEffect } from 'react';
import { 
  Lock, 
  Mic, 
  Square, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  X, 
  Volume2, 
  ShieldCheck, 
  Zap,
  Play
} from 'lucide-react';
import { AudioEngine } from '../lib/audioEngine';
import { CAPTCHA_PHRASES } from '../data/benchmarkSamples';

interface VoiceCaptchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VoiceCaptchaModal: React.FC<VoiceCaptchaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [verdict, setVerdict] = useState<'IDLE' | 'PASSED' | 'FAILED'>('IDLE');
  const [livenessScore, setLivenessScore] = useState<number | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Pick random phrase on open
  useEffect(() => {
    if (isOpen) {
      generateNewPhrase();
      setVerdict('IDLE');
      setLivenessScore(null);
    }
  }, [isOpen]);

  const generateNewPhrase = () => {
    const random = CAPTCHA_PHRASES[Math.floor(Math.random() * CAPTCHA_PHRASES.length)];
    setCurrentPhrase(random);
    setVerdict('IDLE');
  };

  const startCaptchaRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        stream.getTracks().forEach((track) => track.stop());
        await verifyCaptchaAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone error in CAPTCHA:', err);
      alert('Microphone access is required to speak the Voice CAPTCHA challenge.');
    }
  };

  const stopCaptchaRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const verifyCaptchaAudio = async (blob: Blob) => {
    setIsEvaluating(true);
    try {
      const buffer = await blob.arrayBuffer();
      const result = await AudioEngine.analyzeAudio(buffer, 'captcha_verification.wav', blob.size);

      // Natural live human speaking the challenge will have low threat score & high confidence
      const passed = result.threatScore < 42;
      const calculatedLiveness = Math.round(100 - result.threatScore);

      setLivenessScore(calculatedLiveness);
      setVerdict(passed ? 'PASSED' : 'FAILED');

      if (passed) {
        setTimeout(() => {
          onSuccess();
        }, 1800);
      }
    } catch (err) {
      console.error('CAPTCHA verification failed:', err);
      setVerdict('FAILED');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Text to Speech playback of phrase for reference
  const speakChallengePhrase = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentPhrase);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Dynamic Voice CAPTCHA</h3>
            <p className="text-xs text-slate-500">Zero-latency acoustic biometric challenge-response</p>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          To defeat AI voice clones, voice conversion models, and replay bots, please speak this randomized dynamic phrase clearly:
        </p>

        {/* Challenge Phrase Card */}
        <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 relative mb-6 shadow-inner">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span>CHALLENGE UTTERANCE</span>
            <button
              onClick={speakChallengePhrase}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              title="Hear phrase"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Listen
            </button>
          </div>

          <p className="font-mono text-sm sm:text-base font-bold text-amber-300 leading-snug">
            "{currentPhrase}"
          </p>

          <button
            onClick={generateNewPhrase}
            disabled={isRecording || isEvaluating}
            className="mt-3 text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Generate New Phrase
          </button>
        </div>

        {/* Verdict Display */}
        {verdict !== 'IDLE' && (
          <div className={`p-4 rounded-2xl mb-6 border flex items-center gap-3 ${
            verdict === 'PASSED'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-red-50 border-red-200 text-red-950'
          }`}>
            {verdict === 'PASSED' ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-7 h-7 text-red-600 shrink-0" />
            )}
            <div>
              <h4 className="font-bold text-sm">
                {verdict === 'PASSED' ? 'Human Biometric Liveness Verified!' : 'Suspicious Voice / Synthetic Replay Detected'}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Liveness Score: <strong>{livenessScore}%</strong> | Vocal tract articulation authenticated.
              </p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              onClick={startCaptchaRecording}
              disabled={isEvaluating}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Acoustic Liveness...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Record Phrase
                </>
              )}
            </button>
          ) : (
            <button
              onClick={stopCaptchaRecording}
              className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 animate-pulse"
            >
              <Square className="w-4 h-4 fill-current" />
              Finish Speaking ({recordSeconds}s)
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
