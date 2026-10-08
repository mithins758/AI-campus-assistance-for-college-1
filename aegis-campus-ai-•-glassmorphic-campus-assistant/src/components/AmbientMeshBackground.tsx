import React from 'react';

export const AmbientMeshBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Base deep background */}
      <div className="absolute inset-0 bg-slate-950" />

      {/* Subtle futuristic cyber grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Floating Ambient Mesh Blobs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/25 blur-[130px] animate-blob-1" />
      <div className="absolute top-1/4 -right-32 w-[550px] h-[550px] rounded-full bg-cyan-500/20 blur-[140px] animate-blob-2" />
      <div className="absolute -bottom-32 left-1/3 w-[650px] h-[650px] rounded-full bg-violet-600/20 blur-[150px] animate-blob-3" />
      <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/15 blur-[120px] animate-blob-1" />

      {/* Subtle top spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[350px] bg-gradient-to-b from-sky-400/10 via-transparent to-transparent blur-3xl" />
    </div>
  );
};
