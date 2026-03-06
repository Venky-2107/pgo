import React from "react";
import { Link } from "react-router-dom";

export default function HeroComp() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background visual layering */}
      <div className="absolute inset-0 -z-20 bg-background"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="container-premium text-center relative z-10 px-4">
        <div className="animate-fade space-y-8">
          <div className="inline-block glass px-6 py-2 rounded-full border-white/5 mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Securing Your Space Infrastructure</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] max-w-5xl mx-auto">
            Elevate Your <span className="text-gradient">PG Living</span> Experience.
          </h1>

          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-medium">
            Next-generation property management with advanced security,
            granular room tracking, and a seamless digital interface.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Link to="/login" className="btn-premium btn-primary px-10 py-4.5 rounded-2xl text-lg font-black tracking-tight shadow-2xl shadow-primary/20 hover:scale-105 active:scale-100 no-underline">
              Experience Now ✨
            </Link>
            <button className="btn-premium glass px-10 py-4.5 rounded-2xl text-lg font-black hover:bg-white/5 transition-all">
              Security Protocol
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="pt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-50">
            <div className="space-y-1">
              <p className="text-2xl font-black">2.5k+</p>
              <p className="text-[10px] uppercase tracking-widest font-black">Verified Nodes</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black">99.9%</p>
              <p className="text-[10px] uppercase tracking-widest font-black">Safety Index</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black">15+</p>
              <p className="text-[10px] uppercase tracking-widest font-black">Cities Linked</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black">4.9/5</p>
              <p className="text-[10px] uppercase tracking-widest font-black">Trust Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--text-muted) 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
    </section>
  );
}