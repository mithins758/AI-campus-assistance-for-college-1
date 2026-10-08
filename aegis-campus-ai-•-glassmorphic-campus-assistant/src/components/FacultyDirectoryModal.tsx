import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { FacultyMember } from '../types';
import { INITIAL_FACULTY_LIST } from '../data/campusData';
import { fetchFacultyLiveStatus, getToken, FacultyLiveStatus } from '../lib/api';

interface FacultyDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleSlot?: (facultyName: string) => void;
}

export const FacultyDirectoryModal: React.FC<FacultyDirectoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedFacultyForBooking, setSelectedFacultyForBooking] = useState<FacultyMember | null>(null);
  const [bookingSlot, setBookingSlot] = useState('Today, 2:30 PM');
  const [bookingPurpose, setBookingPurpose] = useState('Doubt clarification on Deep Learning backprop');
  const [isBookedSuccess, setIsBookedSuccess] = useState(false);
  // Live statuses from the backend (GET /api/faculty/status, JWT required).
  // Null = not attempted/unavailable; [] = connected but no rows.
  const [liveStatus, setLiveStatus] = useState<FacultyLiveStatus[] | null>(null);

  useEffect(() => {
    if (!isOpen || !getToken()) return;
    fetchFacultyLiveStatus()
      .then((rows) => setLiveStatus(rows))
      .catch(() => setLiveStatus(null));
  }, [isOpen]);

  if (!isOpen) return null;

  const liveByName = new Map(
    (liveStatus || []).map((r) => [r.name.trim().toLowerCase(), r])
  );

  const departments = ['All', 'Artificial Intelligence & Systems', 'Computer Science & Engineering', 'Cloud Computing & DevOps', 'Applied Mathematics & Cryptography', 'Robotics & Autonomous Systems'];

  const filteredFaculty = INITIAL_FACULTY_LIST.filter((fac) => {
    const matchesDept = selectedDept === 'All' || fac.department === selectedDept;
    const matchesQuery = 
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.cabin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.coursesTaught.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesQuery;
  });

  const getStatusBadge = (status: FacultyMember['status']) => {
    switch (status) {
      case 'in-cabin':
        return {
          label: 'In Cabin · Available',
          classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'in-lecture':
        return {
          label: 'In Lecture Room',
          classes: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
          dot: 'bg-sky-400',
        };
      case 'in-meeting':
        return {
          label: 'In Meeting',
          classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'on-leave':
        return {
          label: 'On Leave / Off-Campus',
          classes: 'bg-slate-700/50 text-slate-400 border-slate-600/30',
          dot: 'bg-slate-500',
        };
    }
  };

  const handleConfirmBooking = () => {
    setIsBookedSuccess(true);
    setTimeout(() => {
      setIsBookedSuccess(false);
      setSelectedFacultyForBooking(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl max-h-[85vh] rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Faculty Directory & Live Presence Sensor
              </h2>
              <p className="text-xs text-slate-400">
                Live in-cabin status, office hours & 1-click consultation scheduler
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

        {/* Backend live-status banner */}
        {liveStatus && liveStatus.length > 0 && (
          <div className="px-6 py-2 border-b border-emerald-500/20 bg-emerald-500/5 text-[11px] text-emerald-300 flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Live backend connected · {liveStatus.length} faculty status rows · names matching the directory are highlighted
            </span>
          </div>
        )}

        {/* Search & Department Filter */}
        <div className="px-6 py-3 border-b border-white/10 bg-slate-950/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty by name, course code, or cabin..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400/50"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {departments.slice(0, 4).map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {dept === 'All' ? 'All Depts' : dept.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Card Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 custom-glass-scroll">
          {filteredFaculty.map((fac) => {
            // Override with live backend status on exact (case-insensitive) name match.
            const live = liveByName.get(fac.name.trim().toLowerCase());
            const effectiveStatus = (live?.status || fac.status) as FacultyMember['status'];
            const badge = getStatusBadge(effectiveStatus);
            const detail = live
              ? `Live: ${live.status}${live.location ? ` · ${live.location.code} ${live.location.name}` : ''} (updated ${new Date(live.updated_at).toLocaleString()})`
              : fac.statusDetail;
            return (
              <div
                key={fac.id}
                className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Avatar & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/20 shadow-sm">
                        <img
                          src={fac.avatar}
                          alt={fac.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                          {fac.name}
                        </h3>
                        <p className="text-xs text-slate-400">{fac.title}</p>
                        <p className="text-[11px] text-indigo-400">{fac.department}</p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium shrink-0 ${badge.classes}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} ${effectiveStatus === 'in-cabin' ? 'animate-pulse' : ''}`} />
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  {/* Detail text */}
                  <p className="text-xs text-slate-300 mb-3 bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                    {detail}
                  </p>

                  {/* Contact & Cabin info */}
                  <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-slate-300 font-medium">{fac.cabin}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Office Hours: {fac.officeHours}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="text-slate-300">{fac.email}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Trigger Button */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Next free: <strong className="text-slate-200">{fac.nextFreeSlot}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedFacultyForBooking(fac);
                      setBookingSlot(fac.nextFreeSlot);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 text-xs font-semibold transition-all hover:scale-[1.02]"
                  >
                    Book Consultation
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>HOD Office & Dean of Academics available in Block D Executive Suite</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>

      {/* Consultation Booking Dialog Sub-Modal */}
      {selectedFacultyForBooking && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/20 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Schedule Office Consultation
              </h3>
              <button
                onClick={() => setSelectedFacultyForBooking(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isBookedSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-200">Consultation Confirmed!</h4>
                <p className="text-xs text-slate-300">
                  Calendar invitation sent to {selectedFacultyForBooking.email} and your student mailbox.
                </p>
              </div>
            ) : (
              <>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs space-y-1">
                  <div className="text-white font-semibold">{selectedFacultyForBooking.name}</div>
                  <div className="text-slate-400">{selectedFacultyForBooking.cabin}</div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Select Time Slot</label>
                  <select
                    value={bookingSlot}
                    onChange={(e) => setBookingSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-400"
                  >
                    <option value="Today, 2:30 PM">Today, 2:30 PM (Cabin B-214)</option>
                    <option value="Today, 3:15 PM">Today, 3:15 PM (Cabin B-214)</option>
                    <option value="Tomorrow, 11:30 AM">Tomorrow, 11:30 AM</option>
                    <option value="Thursday, 03:00 PM">Thursday, 03:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Reason / Subject</label>
                  <textarea
                    rows={2}
                    value={bookingPurpose}
                    onChange={(e) => setBookingPurpose(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setSelectedFacultyForBooking(null)}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition-all"
                  >
                    Confirm Booking
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
