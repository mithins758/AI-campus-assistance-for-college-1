import React, { useState, useEffect } from 'react';
import { AmbientMeshBackground } from './components/AmbientMeshBackground';
import { HeaderNavbar } from './components/HeaderNavbar';
import { QuickActionGrid } from './components/QuickActionGrid';
import { AIChatInterface } from './components/AIChatInterface';
import { CampusContextWidget } from './components/CampusContextWidget';
import { ClassroomMapModal } from './components/ClassroomMapModal';
import { ScheduleAttendanceModal } from './components/ScheduleAttendanceModal';
import { FacultyDirectoryModal } from './components/FacultyDirectoryModal';
import { NoticesModal } from './components/NoticesModal';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';
import { RoleMode, ActiveView } from './types';
import { CheckCircle2, Info } from 'lucide-react';
import { fetchMe, getToken, logoutUser, BackendUser } from './lib/api';

export default function App() {
  const [role, setRole] = useState<RoleMode>('student');
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMapCode, setActiveMapCode] = useState<string>('B-204');
  const [initialChatPrompt, setInitialChatPrompt] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [user, setUser] = useState<BackendUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Restore backend session from a stored JWT (if the backend is reachable).
  useEffect(() => {
    if (getToken()) {
      fetchMe()
        .then((u) => setUser(u))
        .catch(() => logoutUser());
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    showToast('Signed out');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRoleToggle = (newRole: RoleMode) => {
    setRole(newRole);
    showToast(newRole === 'student' ? 'Switched to Student Mode' : 'Switched to Faculty Concierge Mode');
  };

  const handleSelectView = (view: ActiveView, initialPrompt?: string) => {
    if (initialPrompt) {
      setInitialChatPrompt(initialPrompt);
    }
    setActiveView(view);
  };

  // Action chips handler dispatched from AI Chat or Quick Actions
  const handleTriggerAction = (actionId: string, payload?: any) => {
    switch (actionId) {
      case 'open_map_bca':
        setActiveMapCode('B-204');
        setActiveView('map');
        break;
      case 'book_sharma':
        setActiveView('faculty');
        break;
      case 'open_notices':
        setActiveView('notices');
        break;
      case 'open_schedule':
        setActiveView('schedule');
        break;
      case 'open_faculty':
        setActiveView('faculty');
        break;
      default:
        if (actionId.startsWith('map_')) {
          setActiveMapCode(actionId.replace('map_', ''));
          setActiveView('map');
        }
        break;
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Ambient Background Layer */}
      <AmbientMeshBackground />

      {/* 2. Glass Navbar Header */}
      <HeaderNavbar
        role={role}
        onRoleToggle={handleRoleToggle}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenSearch={() => setIsSearchOpen(true)}
        unreadCount={2}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* 3. Main Dashboard Body Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
        
        {/* Hero & Quick Action Floating Frosted Glass Cards */}
        <QuickActionGrid
          role={role}
          onSelectAction={(view, prompt) => handleSelectView(view, prompt)}
          nextClassName={role === 'student' ? 'CS202: Data Structures Lab' : 'PhD Thesis Review Milestone'}
          nextClassTime="in 23 mins"
          nextClassRoom="Lab 204 (Block B)"
        />

        {/* Core Layout: Centerpiece Glass AI Chat + Real-Time Context Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Translucent Glass AI Chat Interface (8 cols) */}
          <div className="lg:col-span-8 w-full">
            <AIChatInterface
              role={role}
              onTriggerAction={handleTriggerAction}
              onNavigateView={setActiveView}
              initialPrompt={initialChatPrompt}
            />
          </div>

          {/* Right Floating Context Widget Drawer (4 cols) */}
          <div className="lg:col-span-4 w-full">
            <CampusContextWidget
              role={role}
              onNavigateView={setActiveView}
              onTriggerMapPin={(code) => {
                setActiveMapCode(code);
                setActiveView('map');
              }}
            />
          </div>

        </div>

      </main>

      {/* 4. Footer info */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-t border-white/10 gap-2">
        <div className="flex items-center gap-2">
          <span>Aegis Campus AI · SIMS Node 04</span>
          <span aria-hidden="true">·</span>
          <span>Encrypted Campus Wi-Fi 802.1x</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Security Operations Center: +1 (555) 019-4911</span>
          <span aria-hidden="true">·</span>
          <span>Emergency Evac & Transport Active</span>
        </div>
      </footer>

      {/* Interactive Modals */}
      <ClassroomMapModal
        isOpen={activeView === 'map'}
        onClose={() => setActiveView('dashboard')}
        selectedCode={activeMapCode}
      />

      <ScheduleAttendanceModal
        isOpen={activeView === 'schedule'}
        onClose={() => setActiveView('dashboard')}
        role={role}
        onNavigateToRoom={(room) => {
          setActiveMapCode(room);
          setActiveView('map');
        }}
      />

      <FacultyDirectoryModal
        isOpen={activeView === 'faculty'}
        onClose={() => setActiveView('dashboard')}
      />

      <NoticesModal
        isOpen={activeView === 'notices'}
        onClose={() => setActiveView('dashboard')}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAction={(view, payload) => {
          if (view === 'map' && payload) {
            setActiveMapCode(payload);
          }
          setActiveView(view);
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuth={(u) => {
          setUser(u);
          showToast(`Signed in as ${u.name}`);
        }}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-cyan-400/40 text-xs font-semibold text-white shadow-2xl shadow-cyan-950/50 animate-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
