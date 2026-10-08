import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  User, 
  Calendar, 
  Bell, 
  ArrowRight,
  Sparkles,
  Command
} from 'lucide-react';
import { ActiveView } from '../types';
import { CAMPUS_LOCATIONS, INITIAL_FACULTY_LIST, CAMPUS_NOTICES } from '../data/campusData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (view: ActiveView, payload?: any) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const locResults = CAMPUS_LOCATIONS.filter(
    (l) => l.name.toLowerCase().includes(query.toLowerCase()) || l.code.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const facResults = INITIAL_FACULTY_LIST.filter(
    (f) => f.name.toLowerCase().includes(query.toLowerCase()) || f.department.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const noticeResults = CAMPUS_NOTICES.filter(
    (n) => n.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search classrooms, faculty, CIA exams, labs, or commands..."
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/10 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 custom-glass-scroll">
          {/* Classrooms */}
          {locResults.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Classrooms & Facilities
              </div>
              <div className="space-y-1">
                {locResults.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectAction('map', loc.code);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-left transition-all text-xs group"
                  >
                    <div>
                      <span className="font-semibold text-white group-hover:text-cyan-300">
                        {loc.name}
                      </span>
                      <span className="text-slate-400 ml-2 font-mono text-[11px]">
                        {loc.block} · {loc.code}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Faculty */}
          {facResults.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Faculty & Mentors
              </div>
              <div className="space-y-1">
                {facResults.map((fac) => (
                  <button
                    key={fac.id}
                    onClick={() => {
                      onSelectAction('faculty', fac.name);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-left transition-all text-xs group"
                  >
                    <div>
                      <span className="font-semibold text-white group-hover:text-indigo-300">
                        {fac.name}
                      </span>
                      <span className="text-slate-400 ml-2 text-[11px]">
                        {fac.cabin}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notices */}
          {noticeResults.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                Notices & Timetables
              </div>
              <div className="space-y-1">
                {noticeResults.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      onSelectAction('notices');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-left transition-all text-xs group"
                  >
                    <span className="font-semibold text-white group-hover:text-amber-300 truncate">
                      {n.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {locResults.length === 0 && facResults.length === 0 && noticeResults.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching campus records found. Try typing "BCA", "Sharma", or "CIA".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
