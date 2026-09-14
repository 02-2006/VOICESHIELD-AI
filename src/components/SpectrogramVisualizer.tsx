import React, { useRef, useEffect, useState } from 'react';
import { Layers, Eye, RefreshCw, ZoomIn, ZoomOut, Flame } from 'lucide-react';

interface SpectrogramVisualizerProps {
  spectrogramMatrix: number[][]; // [timeBins][freqBins]
  frequencyLabels: string[];
  timeLabels: string[];
  fileName?: string;
  durationSeconds?: number;
}

export const SpectrogramVisualizer: React.FC<SpectrogramVisualizerProps> = ({
  spectrogramMatrix,
  frequencyLabels,
  timeLabels,
  fileName = 'audio_sample.wav',
  durationSeconds = 2.5
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [colorMap, setColorMap] = useState<'inferno' | 'viridis' | 'grayscale'>('inferno');
  const [hoverData, setHoverData] = useState<{ freq: string; time: string; intensity: number } | null>(null);

  // Inferno colormap lookup (Deep purple -> Red -> Orange -> Yellow)
  const getInfernoColor = (val: number): [number, number, number] => {
    // val 0.0 - 1.0
    const r = Math.min(255, Math.floor(255 * Math.pow(val, 0.7) * 1.3));
    const g = Math.min(255, Math.floor(255 * Math.pow(val, 1.6) * 1.1));
    const b = Math.min(255, Math.floor(255 * (1 - Math.abs(val - 0.4) * 2) * 0.9));
    return [Math.max(10, r), Math.max(5, g), Math.max(20, b)];
  };

  // Viridis colormap lookup (Purple -> Teal -> Yellow)
  const getViridisColor = (val: number): [number, number, number] => {
    const r = Math.min(255, Math.floor(255 * (val * 0.9 + 0.1)));
    const g = Math.min(255, Math.floor(255 * Math.sin(val * Math.PI * 0.8)));
    const b = Math.min(255, Math.floor(255 * (1 - val * 0.7)));
    return [r, g, b];
  };

  const getGrayscaleColor = (val: number): [number, number, number] => {
    const c = Math.floor(val * 255);
    return [c, c, c];
  };

  useEffect(() => {
    if (!canvasRef.current || !spectrogramMatrix || spectrogramMatrix.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numTimeBins = spectrogramMatrix.length;
    const numFreqBins = spectrogramMatrix[0].length;

    const width = canvas.width;
    const height = canvas.height;

    const cellWidth = width / numTimeBins;
    const cellHeight = height / numFreqBins;

    ctx.clearRect(0, 0, width, height);

    for (let t = 0; t < numTimeBins; t++) {
      for (let f = 0; f < numFreqBins; f++) {
        const rawVal = spectrogramMatrix[t][f] || 0;
        const normalized = Math.max(0, Math.min(1, rawVal / 100));

        let [r, g, b] = [0, 0, 0];
        if (colorMap === 'inferno') {
          [r, g, b] = getInfernoColor(normalized);
        } else if (colorMap === 'viridis') {
          [r, g, b] = getViridisColor(normalized);
        } else {
          [r, g, b] = getGrayscaleColor(normalized);
        }

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        // Flip vertically so low frequencies (0Hz) are at the bottom
        const y = height - (f + 1) * cellHeight;
        ctx.fillRect(t * cellWidth, y, Math.ceil(cellWidth), Math.ceil(cellHeight));
      }
    }

    // Draw horizontal grid lines for 2kHz, 4kHz, 6kHz, 8kHz
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [spectrogramMatrix, colorMap]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !spectrogramMatrix || spectrogramMatrix.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const numTimeBins = spectrogramMatrix.length;
    const numFreqBins = spectrogramMatrix[0].length;

    const tIdx = Math.floor((x / rect.width) * numTimeBins);
    const fIdx = numFreqBins - 1 - Math.floor((y / rect.height) * numFreqBins);

    if (tIdx >= 0 && tIdx < numTimeBins && fIdx >= 0 && fIdx < numFreqBins) {
      const val = spectrogramMatrix[tIdx][fIdx];
      const freqHz = Math.round((fIdx / numFreqBins) * 8000);
      const timeSec = ((tIdx / numTimeBins) * durationSeconds).toFixed(2);
      setHoverData({
        freq: `${freqHz} Hz`,
        time: `${timeSec}s`,
        intensity: Math.round(val)
      });
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h3 className="font-extrabold text-white text-base">High-Resolution STFT Spectrogram (0 - 8000 Hz)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Short-Time Fourier Transform revealing harmonic density, phase alignment & vocoder cutoff
          </p>
        </div>

        {/* Color Palette Toggle */}
        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setColorMap('inferno')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              colorMap === 'inferno' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inferno
          </button>
          <button
            onClick={() => setColorMap('viridis')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              colorMap === 'viridis' ? 'bg-teal-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Viridis
          </button>
          <button
            onClick={() => setColorMap('grayscale')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              colorMap === 'grayscale' ? 'bg-slate-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mono
          </button>
        </div>
      </div>

      {/* Main Canvas with Frequency Axis Labels */}
      <div className="relative flex gap-3">
        {/* Y-Axis Frequency scale */}
        <div className="flex flex-col justify-between text-[10px] font-mono text-slate-400 py-1 select-none text-right w-12">
          <span>8.0 kHz</span>
          <span>6.0 kHz</span>
          <span>4.0 kHz</span>
          <span>2.0 kHz</span>
          <span>0 Hz</span>
        </div>

        {/* Canvas Surface */}
        <div className="relative flex-1 h-56 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
          <canvas
            ref={canvasRef}
            width={600}
            height={220}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverData(null)}
            className="w-full h-full object-fill cursor-crosshair"
          />

          {/* Hover Tooltip */}
          {hoverData && (
            <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-slate-200 pointer-events-none shadow-md">
              <span className="text-indigo-400">Freq: {hoverData.freq}</span> |{' '}
              <span className="text-emerald-400">Time: {hoverData.time}</span> |{' '}
              <span className="text-amber-400">Power: {hoverData.intensity} dB</span>
            </div>
          )}
        </div>
      </div>

      {/* X-Axis Time Labels */}
      <div className="flex justify-between text-[10px] font-mono text-slate-400 pl-14 pr-2 mt-2 select-none">
        <span>0.0s</span>
        <span>{(durationSeconds * 0.25).toFixed(1)}s</span>
        <span>{(durationSeconds * 0.5).toFixed(1)}s</span>
        <span>{(durationSeconds * 0.75).toFixed(1)}s</span>
        <span>{durationSeconds.toFixed(1)}s</span>
      </div>

      {/* Spectrogram Forensic Interpretation Notes */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
        <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
          <span className="font-bold text-slate-200 block mb-0.5">High-Frequency Truncation</span>
          <span>Synthetic vocoders (HiFi-GAN, WaveGlow) often show sharp energy loss above 6kHz.</span>
        </div>
        <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
          <span className="font-bold text-slate-200 block mb-0.5">Formant Glitches</span>
          <span>Voice conversion systems exhibit temporal smearing and discontinuous spectral tracks.</span>
        </div>
        <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
          <span className="font-bold text-slate-200 block mb-0.5">Room Impulse Distortion</span>
          <span>Replay attacks show high reverberation floors and speaker cabinet resonances.</span>
        </div>
      </div>
    </div>
  );
};
