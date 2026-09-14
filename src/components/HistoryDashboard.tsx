import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  Play, 
  Pause, 
  Calendar,
  Clock,
  FileAudio
} from 'lucide-react';
import { HistoryRecord } from '../types';

interface HistoryDashboardProps {
  history: HistoryRecord[];
  onClearHistory: () => void;
  onSelectRecord: (record: HistoryRecord) => void;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
  history,
  onClearHistory,
  onSelectRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<'ALL' | 'REAL' | 'FAKE' | 'HIGH_RISK'>('ALL');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterVerdict === 'REAL') return item.prediction === 'REAL';
    if (filterVerdict === 'FAKE') return item.prediction === 'FAKE';
    if (filterVerdict === 'HIGH_RISK') return item.riskLevel === 'HIGH';
    return true;
  });

  const exportCsv = () => {
    if (history.length === 0) return;
    const headers = ['Scan ID', 'Timestamp', 'File Name', 'Prediction', 'Confidence (%)', 'Threat Score (0-100)', 'Risk Level', 'RawNet2 Spoof', 'AASIST Spoof'];
    const rows = history.map(h => [
      h.id,
      h.timestamp,
      `"${h.fileName}"`,
      h.prediction,
      h.confidence,
      h.threatScore,
      h.riskLevel,
      h.rawnet2Spoof,
      h.aasistSpoof
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VoiceShield_Audit_Logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePlayAudio = (record: HistoryRecord) => {
    if (!record.audioUrl) return;
    if (playingId === record.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = record.audioUrl;
        audioRef.current.play();
        setPlayingId(record.id);
      }
    }
  };

  return (
    <div className="space-y-6">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />

      {/* Top Bento Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-800" />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Security Audit & Incident Logs</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable forensic scan history and deepfake detection records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-export-history-csv"
            onClick={exportCsv}
            disabled={history.length === 0}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs transition-colors flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export CSV Log
          </button>

          {history.length > 0 && (
            <button
              id="btn-clear-history"
              onClick={onClearHistory}
              className="px-3.5 py-2.5 rounded-2xl border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search Bento Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search scans by file name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Filter:</span>
          {(['ALL', 'REAL', 'FAKE', 'HIGH_RISK'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterVerdict(v)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors ${
                filterVerdict === v
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {v.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Bento Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-extrabold text-slate-700 text-sm">No Scan Records Found</h4>
            <p className="text-xs text-slate-400 mt-1">
              {history.length === 0 ? 'Run voice detection scans to populate the audit trail.' : 'No scans match your search query.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 font-mono text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Date & Time</th>
                  <th className="py-3.5 px-5">Audio Source</th>
                  <th className="py-3.5 px-5">Prediction</th>
                  <th className="py-3.5 px-5">Confidence</th>
                  <th className="py-3.5 px-5">Threat Score</th>
                  <th className="py-3.5 px-5">Risk Level</th>
                  <th className="py-3.5 px-5">RawNet2 / AASIST</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => {
                  const isFake = item.prediction === 'FAKE';
                  const isPlayingThis = playingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-slate-600 whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <FileAudio className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-bold text-slate-800 truncate max-w-[160px]">{item.fileName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-black text-[10px] uppercase font-mono ${
                          isFake ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isFake ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                          {item.prediction}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 font-mono font-bold text-slate-800">
                        {item.confidence}%
                      </td>

                      <td className="py-3.5 px-5 font-mono font-bold">
                        <span className={isFake ? 'text-red-600' : 'text-emerald-600'}>
                          {item.threatScore}/100
                        </span>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                          item.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' : item.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.riskLevel}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 font-mono text-slate-500 text-[11px]">
                        RN2: {(item.rawnet2Spoof * 100).toFixed(0)}% | AS: {(item.aasistSpoof * 100).toFixed(0)}%
                      </td>

                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {item.audioUrl && (
                            <button
                              onClick={() => handlePlayAudio(item)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Play audio"
                            >
                              {isPlayingThis ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
