import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Calculator, 
  Users, 
  ChevronRight,
  Sparkles,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { RoleMode, ClassScheduleItem } from '../types';
import { STUDENT_TODAY_SCHEDULE, FACULTY_TODAY_SCHEDULE } from '../data/campusData';

interface ScheduleAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleMode;
  onNavigateToRoom?: (roomCode: string) => void;
}

export const ScheduleAttendanceModal: React.FC<ScheduleAttendanceModalProps> = ({
  isOpen,
  onClose,
  role,
  onNavigateToRoom,
}) => {
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Tue');
  const [scheduleList, setScheduleList] = useState<ClassScheduleItem[]>(
    role === 'student' ? STUDENT_TODAY_SCHEDULE : FACULTY_TODAY_SCHEDULE
  );

  // Simulated attendance adjustments
  const [simulatedMissed, setSimulatedMissed] = useState<number>(0);

  if (!isOpen) return null;

  const days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  // Calculate dynamic aggregate based on simulation
  const baseAttended = 76;
  const baseTotal = 88;
  const totalClasses = baseTotal + simulatedMissed;
  const attendedClasses = baseAttended;
  const simulatedPct = ((attendedClasses / totalClasses) * 100).toFixed(1);

  const toggleStudentClassAttendance = (id: string) => {
    setScheduleList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'completed' ? 'upcoming' : 'completed';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
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
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {role === 'student' ? 'Academic Timetable & Attendance Analytics' : 'Teaching Schedule & Consultation Log'}
              </h2>
              <p className="text-xs text-slate-400">
                Fall Semester 2026 · Real-time SIMS Synchronized
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

        {/* Day Selector & Overview Banner */}
        <div className="px-6 py-4 bg-slate-950/40 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          
          {/* Day Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedDay === day
                    ? 'bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 text-emerald-200 border border-emerald-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Student Attendance Buffer Summary */}
          {role === 'student' ? (
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400">Aggregate: </span>
                <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
                  {simulatedPct}%
                </span>
                <span className="text-[11px] text-slate-500 ml-1">(&gt; 75% Cutoff)</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium text-[11px]">
                Safe: 3 Classes Buffer
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Teaching Load: 14 Hours / Week (Nominal)</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-glass-scroll">
          
          {/* Schedule Class Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {selectedDay === 'Tue' ? "Today's Schedule (Tuesday)" : `${selectedDay} Timetable Schedule`}
            </h3>

            {scheduleList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">P{item.period}</span>
                    <span className="text-xs font-bold text-white uppercase">{item.type}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                        {item.subject}
                      </h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-300 bg-slate-800/80 border border-white/10">
                        {item.subjectCode}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {item.time}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {item.room}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.instructor}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action / Attendance Indicator */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                  {role === 'student' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-200 tabular-nums">
                        {item.attendancePct}%
                      </span>
                      <button
                        onClick={() => toggleStudentClassAttendance(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          item.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : item.status === 'ongoing'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        {item.status === 'completed' ? 'Attended ✓' : item.status === 'ongoing' ? 'Ongoing Class' : 'Upcoming'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => alert(`Roster attendance initialized for ${item.subjectCode}. Verification logged to SIMS.`)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-medium transition-all"
                    >
                      Mark Roster
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Bunk Safety & Attendance Calculator (Student Mode) */}
          {role === 'student' && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <Calculator className="w-4 h-4 text-indigo-400" />
                  What-If Attendance Simulator
                </div>
                <span className="text-[11px] text-slate-400">
                  Calculated against mandatory 75% exam cutoff
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Simulate missing upcoming classes to see when your attendance drops below the 75% threshold:
              </p>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Classes to skip:</span>
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSimulatedMissed(num)}
                      className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all ${
                        simulatedMissed === num
                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-white/10">
                <span className="text-slate-300">
                  Simulated Outcome:{' '}
                  <strong className="text-white font-mono">{attendedClasses} / {totalClasses} classes attended</strong>
                </span>
                <span className={`font-bold font-mono ${parseFloat(simulatedPct) >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simulatedPct}% — {parseFloat(simulatedPct) >= 75 ? 'Eligible for CIA-2 Exams' : '⚠️ Warning: Below 75%'}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Synced with SIMS ERP Node 04 · Last updated 10 mins ago</span>
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
