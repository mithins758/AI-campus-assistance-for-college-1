import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Search, 
  Navigation, 
  Layers, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Maximize2,
  Building,
  Info
} from 'lucide-react';
import { CampusLocation } from '../types';
import { CAMPUS_LOCATIONS, CAMPUS_ASSETS } from '../data/campusData';

interface ClassroomMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCode?: string;
}

export const ClassroomMapModal: React.FC<ClassroomMapModalProps> = ({
  isOpen,
  onClose,
  selectedCode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string>('All');
  const [activeLocation, setActiveLocation] = useState<CampusLocation>(() => {
    if (selectedCode) {
      const match = CAMPUS_LOCATIONS.find((l) => l.code === selectedCode);
      if (match) return match;
    }
    return CAMPUS_LOCATIONS[0]; // BCA Lab by default
  });

  if (!isOpen) return null;

  const blocks = ['All', 'Block A', 'Block B', 'Block C', 'Block D'];

  const filteredLocations = CAMPUS_LOCATIONS.filter((loc) => {
    const matchesBlock = selectedBlock === 'All' || loc.block === selectedBlock;
    const matchesSearch = 
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBlock && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl h-[90vh] max-h-[820px] rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Campus & Classroom Indoor Wayfinding
              </h2>
              <p className="text-xs text-slate-400">
                Interactive floorplans, room capacities & real-time pathfinding
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

        {/* Search & Block Filter Bar */}
        <div className="px-6 py-3 border-b border-white/10 bg-slate-950/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by room name (e.g. BCA Lab, B-204, Library)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          {/* Block Filter Segmented Controls */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {blocks.map((block) => (
              <button
                key={block}
                onClick={() => setSelectedBlock(block)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  selectedBlock === block
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {block}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Split Map + Directory */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Room Directory Cards */}
          <div className="lg:col-span-5 border-r border-white/10 overflow-y-auto p-4 space-y-3 custom-glass-scroll">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
              Select Destination ({filteredLocations.length} Locations)
            </div>

            {filteredLocations.map((loc) => {
              const isSelected = activeLocation.id === loc.id;
              return (
                <div
                  key={loc.id}
                  onClick={() => setActiveLocation(loc)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                      : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{loc.name}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-cyan-300 border border-white/10">
                          {loc.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {loc.block} · Floor {loc.floor}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      Cap: {loc.capacity}
                    </span>
                  </div>

                  {loc.currentActivity && (
                    <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">{loc.currentActivity}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Visual Floor & Pathfinding Canvas */}
          <div className="lg:col-span-7 flex flex-col overflow-y-auto p-5 custom-glass-scroll space-y-5 bg-slate-950/30">
            
            {/* Visual Aerial / Floorplan Showcase */}
            <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden border border-white/15 shadow-xl">
              <img
                src={activeLocation.image || CAMPUS_ASSETS.aerialQuad}
                alt={activeLocation.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Holographic Location Pin Overlay */}
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-xl border border-cyan-400/40 text-xs font-mono text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Node {activeLocation.code}</span>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-0.5">
                  {activeLocation.block} · Floor {activeLocation.floor}
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {activeLocation.name}
                </h3>
              </div>
            </div>

            {/* Turn-by-Turn Navigation Guide */}
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                <Navigation className="w-4 h-4 text-cyan-400" />
                Turn-by-Turn Walking Directions
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {activeLocation.directions}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 font-mono">
                <span>Estimated walk: 2 mins</span>
                <span aria-hidden="true">·</span>
                <span>Distance: ~140 meters</span>
                <span aria-hidden="true">·</span>
                <span>Elevator accessible</span>
              </div>
            </div>

            {/* Specifications & Key Features */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Room Features & Facilities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeLocation.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Need wheelchair assistance? Campus transport line: ext 404</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
