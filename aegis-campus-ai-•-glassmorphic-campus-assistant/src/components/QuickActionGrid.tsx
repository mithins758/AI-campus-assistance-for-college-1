import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Bell, 
  ArrowUpRight, 
  Sparkles,
  Compass,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { RoleMode, ActiveView } from '../types';

interface QuickActionGridProps {
  role: RoleMode;
  onSelectAction: (view: ActiveView, initialSearchQuery?: string) => void;
  nextClassName?: string;
  nextClassTime?: string;
  nextClassRoom?: string;
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  role,
  onSelectAction,
  nextClassName = 'CS202: Data Structures Lab',
  nextClassTime = 'in 23 mins',
  nextClassRoom = 'Lab 204 (Block B)',
}) => {
  const userName = role === 'student' ? 'Sarah Jenkins' : 'Prof. Rajesh Sharma';
  const userSubtitle = role === 'student' 
    ? 'B.Tech Computer Science · Year 3 · Section B' 
    : 'HOD · Dept. of Artificial Intelligence & Systems';

  const cards = [
    {
      id: 'classroom-finder',
      view: 'map' as ActiveView,
      icon: <MapPin className="w-5 h-5 text-cyan-400" />,
      accentGlow: 'hover:border-cyan-400/40 hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.25)]',
      iconBg: 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300',
      title: 'Find Classroom / Lab',
      kicker: 'Indoor & Block Wayfinding',
      description: 'Search 48+ halls, BCA Linux lab, Newton electronics, or library study pods with floor-level guides.',
      metaInfo: 'Interactive 3D / Floor Map · Real-time Pathfinding',
      badgeText: '6 Blocks Active',
      actionPrompt: 'Where is the BCA Computer Lab?',
    },
    {
      id: 'schedule-attendance',
      view: 'schedule' as ActiveView,
      icon: <Calendar className="w-5 h-5 text-emerald-400" />,
      accentGlow: 'hover:border-emerald-400/40 hover:shadow-[0_0_30px_-5px_rgba(52,211,153,0.25)]',
      iconBg: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300',
      title: role === 'student' ? "Today's Schedule & Attendance" : "Teaching Lectures & Consultations",
      kicker: role === 'student' ? `Next class ${nextClassTime}` : 'Next review at 11:00 AM',
      description: role === 'student' 
        ? `${nextClassName} at ${nextClassRoom}. Aggregate attendance 86.4%.` 
        : 'PhD Thesis Milestone Review in Cabin B-214, followed by Open Office Hours.',
      metaInfo: role === 'student' ? 'Overall 86.4% · 3 Classes Safe to Bunk' : '2 Lectures · 1 Lab Session Today',
      badgeText: role === 'student' ? 'Next in 23m' : 'Period 2 Active',
      actionPrompt: 'Show my attendance summary',
    },
    {
      id: 'faculty-directory',
      view: 'faculty' as ActiveView,
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      accentGlow: 'hover:border-indigo-400/40 hover:shadow-[0_0_30px_-5px_rgba(129,140,248,0.25)]',
      iconBg: 'bg-indigo-500/15 border-indigo-400/30 text-indigo-300',
      title: 'Faculty Cabin & Office Hours',
      kicker: 'Live Cabin Presence',
      description: 'Check real-time in-cabin status for professors, view consultation office hours, and book 1-click meeting slots.',
      metaInfo: 'Prof. Sharma: In Cabin · Dr. Patel: In Hall 402',
      badgeText: 'Live Sensor Node',
      actionPrompt: 'Find Prof. Sharma’s email & cabin',
    },
    {
      id: 'campus-notices',
      view: 'notices' as ActiveView,
      icon: <Bell className="w-5 h-5 text-amber-400" />,
      accentGlow: 'hover:border-amber-400/40 hover:shadow-[0_0_30px_-5px_rgba(251,191,36,0.25)]',
      iconBg: 'bg-amber-500/15 border-amber-400/30 text-amber-300',
      title: 'Campus Notices & CIA Exams',
      kicker: '4 Urgent Updates',
      description: 'CIA-2 exam schedules, Genesis Hackathon registrations, Wi-Fi certificates, and Autumn placement drives.',
      metaInfo: 'CIA-2 Commences Oct 12 · Hall Tickets Live',
      badgeText: 'CIA-2 Timetable',
      actionPrompt: 'When is the next CIA exam?',
    },
  ];

  return (
    <section className="w-full">
      {/* Dynamic Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-cyan-400/90 mb-1.5 tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI CAMPUS CONCIERGE & SIMS INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Welcome back, <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">{userName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
            <span>{userSubtitle}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">Campus Quad Sensor Online</span>
          </p>
        </div>

        {/* Live Status Bar */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono tabular-nums text-slate-200">10:07 AM</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-emerald-400 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Class Period 2
          </span>
        </div>
      </div>

      {/* Grid of Interactive Frosted Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => onSelectAction(card.view, card.actionPrompt)}
            className={`group relative p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 ${card.accentGlow} transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden`}
          >
            {/* Ambient subtle card glow */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${card.iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 group-hover:text-white transition-colors">
                  <span>{card.badgeText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* Text Kicker */}
              <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400/80 mb-1">
                {card.kicker}
              </p>

              {/* Title */}
              <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors leading-snug mb-2">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                {card.description}
              </p>
            </div>

            {/* Unboxed Metadata (Zero-pill discipline) */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">{card.metaInfo}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
