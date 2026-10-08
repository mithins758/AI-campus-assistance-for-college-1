import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  FileText, 
  Download, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { CampusNotice } from '../types';
import { CAMPUS_NOTICES } from '../data/campusData';

interface NoticesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoticesModal: React.FC<NoticesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Notices' },
    { id: 'exams', label: 'CIA Exams' },
    { id: 'academics', label: 'Academics & IT' },
    { id: 'events', label: 'Hackathons & Fests' },
    { id: 'placements', label: 'Placements' },
  ];

  const filteredNotices = CAMPUS_NOTICES.filter((n) => {
    if (selectedCategory === 'all') return true;
    return n.category === selectedCategory;
  });

  const handleDownload = (id: string, name: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      // Simulate file download
      const element = document.createElement('a');
      const file = new Blob([`Official Campus Notice Document\nFile: ${name}\nPublished by SIMS Academic Node 04\nDate: October 2026`], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = name;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[85vh] rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Official Campus Notices & CIA-2 Exam Timetable
              </h2>
              <p className="text-xs text-slate-400">
                Verified bulletins published by the Office of the Registrar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Bar */}
        <div className="px-6 py-3 border-b border-white/10 bg-slate-950/40 flex items-center gap-2 overflow-x-auto shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Notice Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-glass-scroll">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all space-y-3 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {notice.urgency === 'high' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                        <AlertCircle className="w-3 h-3" />
                        Urgent
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-mono tabular-nums">
                      {notice.date}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {notice.title}
                  </h3>
                </div>

                {notice.attachmentName && (
                  <button
                    onClick={() => handleDownload(notice.id, notice.attachmentName!)}
                    disabled={downloadingId === notice.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-all shrink-0"
                  >
                    <Download className={`w-3.5 h-3.5 ${downloadingId === notice.id ? 'animate-bounce text-cyan-400' : ''}`} />
                    <span>{downloadingId === notice.id ? 'Downloading...' : 'PDF'}</span>
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {notice.description}
              </p>

              {/* Special Detailed Table if CIA Exam Notice */}
              {notice.category === 'exams' && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    CIA-2 Timetable Quick Matrix (Session: 09:30 AM – 11:30 AM)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="text-slate-400 text-[10px]">Mon, Oct 12</div>
                      <div className="font-semibold text-white">Algorithms & DS</div>
                      <div className="text-cyan-400 text-[11px] font-mono">Hall 301 · Block B</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="text-slate-400 text-[10px]">Wed, Oct 14</div>
                      <div className="font-semibold text-white">Operating Systems</div>
                      <div className="text-cyan-400 text-[11px] font-mono">Hall 302 · Block B</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="text-slate-400 text-[10px]">Fri, Oct 16</div>
                      <div className="font-semibold text-white">Computer Networks</div>
                      <div className="text-cyan-400 text-[11px] font-mono">Hall 301 · Block B</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Notices are signed cryptographically with SIMS PKI Certificate</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
