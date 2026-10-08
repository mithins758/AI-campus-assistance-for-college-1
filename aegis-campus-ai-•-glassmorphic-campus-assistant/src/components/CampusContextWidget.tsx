import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ExternalLink, 
  Wifi, 
  Bus, 
  CloudSun, 
  BookOpen, 
  GraduationCap, 
  Coffee, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { RoleMode, ActiveView } from '../types';

interface CampusContextWidgetProps {
  role: RoleMode;
  onNavigateView: (view: ActiveView) => void;
  onTriggerMapPin: (code: string) => void;
}

export const CampusContextWidget: React.FC<CampusContextWidgetProps> = ({
  role,
  onNavigateView,
  onTriggerMapPin,
}) => {
  // Live countdown timer state (23 minutes 14 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(23 * 60 + 14);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 45 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const portalLinks = [
    { name: 'SIMS ERP Portal', category: 'Academic Grades & Fees', icon: <GraduationCap className="w-4 h-4 text-cyan-400" /> },
    { name: 'Moodle LMS 4.2', category: 'Coursework & Assignments', icon: <BookOpen className="w-4 h-4 text-emerald-400" /> },
    { name: 'Campus-Secure Wi-Fi', category: '802.1x Auth Certificates', icon: <Wifi className="w-4 h-4 text-sky-400" /> },
    { name: 'Library OPAC System', category: '80k Volumes & IEEE Xplore', icon: <ShieldCheck className="w-4 h-4 text-indigo-400" /> },
  ];

  return (
    <aside className="w-full flex flex-col gap-4">
      
      {/* 1. Live Lecture Countdown Widget */}
      <div className="relative p-5 rounded-3xl bg-slate-900/50 backdrop-blur-2xl border border-white/15 shadow-xl overflow-hidden group">
        {/* Glow backdrop */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {role === 'student' ? 'Upcoming Lecture Countdown' : 'Next Faculty Review'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
            On Schedule
          </span>
        </div>

        {/* Big Tabular Countdown Display */}
        <div className="my-2">
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-white tracking-tight flex items-baseline gap-2">
            <span>{formatCountdown(secondsRemaining)}</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {role === 'student' ? 'CS202: Data Structures Lab' : 'PhD Thesis Review Milestone'}
          </p>
        </div>

        {/* Location & Navigation Prompt */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium text-white">Block B · Lab 204</span>
          </div>
          <button
            onClick={() => {
              onNavigateView('map');
              onTriggerMapPin('B-204');
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            <span>Guide Route</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Real-Time Campus Sensor Vibe */}
      <div className="p-4 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-lg space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Campus Live Vibe
        </h4>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Weather */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <CloudSun className="w-3.5 h-3.5 text-amber-400" />
              <span>Quad Weather</span>
            </div>
            <div className="font-semibold text-white">24°C · Sunny</div>
          </div>

          {/* Electric Shuttle */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <Bus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Green Shuttle</span>
            </div>
            <div className="font-semibold text-white">ETA 3m · Main Gate</div>
          </div>
        </div>

        {/* Wi-Fi Bandwidth */}
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <div className="text-white font-medium">Wi-Fi Node: Block B</div>
              <div className="text-[10px] text-slate-400">Low Congestion · 420 Mbps</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
      </div>

      {/* 3. Essential Student Portals & Shortcuts */}
      <div className="p-5 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Quick Portals & ERP
          </h4>
          <span className="text-[11px] text-slate-400">Single Sign-On</span>
        </div>

        <div className="space-y-2">
          {portalLinks.map((link, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
              onClick={() => alert(`Redirecting to secure SSO gateway for: ${link.name}`)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-slate-900/80 border border-white/10 shrink-0">
                  {link.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                    {link.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {link.category}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Cafeteria Highlight Mini-Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 backdrop-blur-xl border border-amber-400/20 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5" />
            Central Food Court Special
          </span>
          <span className="text-[10px] font-mono text-amber-400">Lunch till 3:30 PM</span>
        </div>
        <p className="text-slate-200 text-xs leading-relaxed">
          Today's Chef Pick: Mediterranean Quinoa Bowl with Falafel & Cold Pressed Juices.
        </p>
      </div>

    </aside>
  );
};
