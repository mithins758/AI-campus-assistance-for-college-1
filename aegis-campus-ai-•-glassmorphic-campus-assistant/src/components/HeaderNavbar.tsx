import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  Bell, 
  Search, 
  GraduationCap, 
  Briefcase,
  LayoutDashboard,
  MessageSquare
} from 'lucide-react';
import { RoleMode, ActiveView } from '../types';
import { CAMPUS_ASSETS } from '../data/campusData';
import { BackendUser } from '../lib/api';

interface HeaderNavbarProps {
  role: RoleMode;
  onRoleToggle: (newRole: RoleMode) => void;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  onOpenSearch: () => void;
  unreadCount?: number;
  user?: BackendUser | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  role,
  onRoleToggle,
  activeView,
  onSelectView,
  onOpenSearch,
  unreadCount = 2,
  user = null,
  onOpenAuth,
  onLogout,
}) => {
  const navItems: { id: ActiveView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'chat', label: 'AI Assistant', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'map', label: 'Classrooms & Map', icon: <MapPin className="w-4 h-4" /> },
    { id: 'schedule', label: 'Timetable', icon: <Calendar className="w-4 h-4" /> },
    { id: 'faculty', label: 'Faculty', icon: <Users className="w-4 h-4" /> },
    { id: 'notices', label: 'Notices', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 rounded-2xl bg-slate-900/60 backdrop-blur-2xl border border-white/15 shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
        
        {/* Zone 1: Brand & Status Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => onSelectView('dashboard')} 
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-500 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                Campus AI
              </span>
            </div>
          </button>

          {/* SIMS Live Node Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wide text-[11px]">Live · SIMS Node 04</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-white/15 text-cyan-300 border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === 'notices' && unreadCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500/80 text-[10px] font-bold text-slate-950 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Mode Switch + Search + User Profile) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            title="Search campus resources (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-[11px]">Search...</span>
            <kbd className="hidden lg:inline text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-white/10 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Role Mode Segmented Switch: Student vs Faculty */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-950/70 border border-white/15 shadow-inner">
            <button
              onClick={() => onRoleToggle('student')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                role === 'student'
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Student</span>
            </button>
            <button
              onClick={() => onRoleToggle('faculty')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                role === 'faculty'
                  ? 'bg-gradient-to-r from-violet-500/30 to-indigo-500/30 text-violet-200 border border-violet-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Faculty</span>
            </button>
          </div>

          {/* User Profile / Auth */}
          <div className="flex items-center gap-2 pl-1">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-sm ring-2 ring-cyan-500/20" title={user.email}>
                  <img
                    src={role === 'student' ? CAMPUS_ASSETS.studentAvatar : CAMPUS_ASSETS.profSharmaAvatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden lg:flex flex-col leading-tight">
                  <span className="text-[11px] font-semibold text-white truncate max-w-[120px]">{user.name}</span>
                  <button
                    onClick={onLogout}
                    className="text-[10px] text-slate-400 hover:text-rose-300 text-left transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-sm ring-2 ring-cyan-500/20 opacity-60">
                  <img
                    src={role === 'student' ? CAMPUS_ASSETS.studentAvatar : CAMPUS_ASSETS.profSharmaAvatar}
                    alt={role === 'student' ? 'Student Profile' : 'Faculty Profile'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/30 to-indigo-500/30 hover:from-cyan-500/40 hover:to-indigo-500/40 border border-cyan-400/40 text-[11px] font-semibold text-cyan-200 transition-all"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around gap-1 mt-2 p-1.5 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-white/10">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                isActive
                  ? 'text-cyan-300 bg-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
