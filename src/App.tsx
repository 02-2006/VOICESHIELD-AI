import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { DetectionScanner } from './components/DetectionScanner';
import { AnalysisResults } from './components/AnalysisResults';
import { LiveStreamInterceptor } from './components/LiveStreamInterceptor';
import { VoiceCaptchaModal } from './components/VoiceCaptchaModal';
import { ExplainableAIDashboard } from './components/ExplainableAIDashboard';
import { HistoryDashboard } from './components/HistoryDashboard';
import { ModelBenchmarksHub } from './components/ModelBenchmarksHub';
import { AudioAnalysisResult, HistoryRecord } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('detect');
  const [currentResult, setCurrentResult] = useState<AudioAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCaptchaOpen, setIsCaptchaOpen] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    // Initial sample audit logs for demonstration
    return [
      {
        id: 'scan_init_01',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        fileName: 'ceo_voice_authorization.wav',
        duration: 3.2,
        prediction: 'FAKE',
        confidence: 96.5,
        threatScore: 92.4,
        riskLevel: 'HIGH',
        rawnet2Spoof: 0.94,
        aasistSpoof: 0.91,
      },
      {
        id: 'scan_init_02',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        fileName: 'employee_support_call.wav',
        duration: 2.8,
        prediction: 'REAL',
        confidence: 94.2,
        threatScore: 12.1,
        riskLevel: 'LOW',
        rawnet2Spoof: 0.14,
        aasistSpoof: 0.10,
      }
    ];
  });

  const handleAnalysisComplete = (result: AudioAnalysisResult) => {
    setCurrentResult(result);
    // Add to history
    const newRecord: HistoryRecord = {
      id: result.id,
      timestamp: result.timestamp,
      fileName: result.fileName,
      duration: result.durationSeconds,
      prediction: result.prediction,
      confidence: result.confidence,
      threatScore: result.threatScore,
      riskLevel: result.riskLevel,
      rawnet2Spoof: result.models.rawnet2.spoof,
      aasistSpoof: result.models.aasist.spoof,
      audioUrl: result.audioUrl,
    };
    setHistory((prev) => [newRecord, ...prev]);

    // If CAPTCHA is recommended due to borderline score, alert
    if (result.isCaptchaRequired) {
      setTimeout(() => {
        setIsCaptchaOpen(true);
      }, 800);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the audit logs?')) {
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navbar with telemetry */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'detect' && (
          <div className="space-y-8 animate-fadeIn">
            {!currentResult && (
              <LandingHero
                onStartDetection={() => {
                  const scannerEl = document.getElementById('scanner-section');
                  scannerEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                onSelectTab={setActiveTab}
              />
            )}

            <div id="scanner-section" className="space-y-8">
              <DetectionScanner
                onAnalysisComplete={handleAnalysisComplete}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
                onRequestCaptcha={() => setIsCaptchaOpen(true)}
              />

              {currentResult && (
                <div className="animate-fadeIn">
                  <AnalysisResults
                    result={currentResult}
                    onLaunchCaptcha={() => setIsCaptchaOpen(true)}
                    onNavigateToDiagnostics={() => setActiveTab('forensics')}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stream' && (
          <div className="animate-fadeIn">
            <LiveStreamInterceptor />
          </div>
        )}

        {activeTab === 'captcha' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Voice CAPTCHA Verification Center</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multi-factor acoustic liveness challenge for zero-trust voice authentication.
                </p>
              </div>
              <button
                onClick={() => setIsCaptchaOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-600/20"
              >
                Launch Dynamic Challenge
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-extrabold text-slate-900 text-base mb-2">Why Voice CAPTCHA?</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  When synthetic voice cloning attacks or audio noise yield ambiguous confidence levels (between 40% and 70%), static voice biometrics are insufficient.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  VoiceShield AI dynamically synthesizes randomized phonetic phrases that an attacker cannot pre-render without suffering real-time generative latency penalties.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-extrabold text-slate-900 text-base mb-2">Defense Mechanism</h3>
                <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                  <li><strong>Organic Jitter Verification:</strong> Validates subconscious physiological micro-tremors in the human vocal folds.</li>
                  <li><strong>Generative Latency Gate:</strong> Discards responses showing diffusion model computation delays (&gt;500ms).</li>
                  <li><strong>Phonetic Cadence Matching:</strong> Detects unnatural vocoder syllable stretching.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forensics' && (
          <div className="animate-fadeIn">
            <ExplainableAIDashboard
              currentResult={currentResult}
              onSelectScanner={() => setActiveTab('detect')}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-fadeIn">
            <HistoryDashboard
              history={history}
              onClearHistory={handleClearHistory}
              onSelectRecord={(rec) => {
                // Find or view
                setActiveTab('detect');
              }}
            />
          </div>
        )}

        {activeTab === 'benchmarks' && (
          <div className="animate-fadeIn">
            <ModelBenchmarksHub />
          </div>
        )}
      </main>

      {/* Dynamic Voice CAPTCHA Modal */}
      <VoiceCaptchaModal
        isOpen={isCaptchaOpen}
        onClose={() => setIsCaptchaOpen(false)}
        onSuccess={() => {
          setIsCaptchaOpen(false);
          alert('Voice CAPTCHA successfully verified! Human acoustic liveness confirmed.');
        }}
      />
    </div>
  );
}
