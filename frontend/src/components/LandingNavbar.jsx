import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import { FiArrowUpRight, FiMenu, FiX } from "react-icons/fi";

const LandingNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      {/* Fixed Full-width Top Glass Navbar with Fade-Down Backdrop Blur */}
      <header className="fixed top-0 inset-x-0 z-50 w-full transition-all duration-300">
        {/* Single Unified Fade-Down Glass & Blur layer */}
        <div
          className="absolute inset-x-0 top-0 h-36 pointer-events-none bg-gradient-to-b from-[#050505]/95 via-[#050505]/75 to-transparent backdrop-blur-xl"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0) 100%)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0) 100%)",
          }}
        />

        <div className="relative z-10 px-6 md:px-12 py-4 flex items-center justify-between">
          {/* Extreme Left: ONLY Logo Image */}
        <Link to="/" className="flex items-center group focus:outline-none cursor-pointer">
          <img
            src="/notsify-logo.png"
            alt="Notsify Logo"
            className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-semibold tracking-wide transition-colors duration-200 cursor-pointer ${
                location.pathname === link.href
                  ? "text-[var(--color-accent)]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Extreme Right: Single CTA Button */}
        <div className="hidden md:flex items-center">
          <Link
            to="/signup"
            className="btn-primary text-xs !py-1.5 !px-4"
          >
            Get Started
            <span className="btn-icon !w-5 !h-5"><FiArrowUpRight size={12} /></span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white focus:outline-none cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl md:hidden flex flex-col justify-between p-8 pt-28 animate-fade-in">
          <div className="flex flex-col gap-6 text-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-2xl font-bold transition-colors py-2 cursor-pointer ${
                  location.pathname === link.href ? "text-[var(--color-accent)]" : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary justify-center text-center py-3"
            >
              Get Started Free
              <span className="btn-icon"><FiArrowUpRight size={14} /></span>
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-6 rounded-full font-semibold text-white/80 border border-white/10 text-center"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default LandingNavbar;
