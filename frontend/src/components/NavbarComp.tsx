import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavbarComp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-3 bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-xl' : 'py-6 bg-transparent'}`}>
      <div className="container-premium flex items-center justify-between py-0 px-4 md:px-8">
        <Link to="/" className="text-3xl font-black tracking-tighter text-white no-underline flex items-center gap-1 group">
          PGO<span className="text-primary group-hover:rotate-12 transition-transform">.</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors no-underline">Home</Link>
          <button className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors">Properties</button>
          <button className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors">Safety</button>
          <button className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors">About</button>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to={user.role === 'admin' ? '/admin' : '/owner'} className="btn-premium glass px-4 py-2 text-[10px] uppercase font-black tracking-widest no-underline">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-premium bg-error/10 text-error hover:bg-error/20 px-4 py-2 text-[10px] uppercase font-black tracking-widest border border-error/10">
                Exit
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-white no-underline hover:text-primary transition-colors">Login</Link>
              <Link to="/login" className="btn-premium btn-primary px-6 py-2.5 rounded-xl no-underline">
                List Property
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 glass rounded-xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className={`w-5 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`w-5 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-5 h-0.5 bg-white transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed top-0 left-0 w-full h-screen bg-background/95 backdrop-blur-2xl z-40 transition-all duration-500 md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-black no-underline text-white">HOME</Link>
          <button onClick={() => setMobileMenuOpen(false)} className="text-3xl font-black text-white">PROPERTIES</button>
          <button onClick={() => setMobileMenuOpen(false)} className="text-3xl font-black text-white">SAFETY</button>
          <div className="w-12 h-0.5 bg-primary/20 mt-4 mb-4"></div>
          {user ? (
            <div className="flex flex-col gap-4 w-full px-12">
              <Link to={user.role === 'admin' ? '/admin' : '/owner'} onClick={() => setMobileMenuOpen(false)} className="btn-premium btn-primary w-full py-4 text-xl text-center no-underline">DASHBOARD</Link>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="btn-premium glass w-full py-4 text-xl text-error uppercase font-black">LOGOUT</button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-premium btn-primary px-10 py-4 text-xl no-underline">SIGN IN</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
