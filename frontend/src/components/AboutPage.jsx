import React from "react";
import { Link } from "react-router";
import LandingNavbar from "./LandingNavbar.jsx";
import Footer from "./Footer.jsx";
import { useScrollReveal } from "../hooks/useScrollReveal.js";
import { FiArrowUpRight } from "react-icons/fi";

const AboutPage = () => {
  const pageRef = useScrollReveal();

  return (
    <div ref={pageRef} className="min-h-screen flex flex-col bg-[#050505] text-white">
      <LandingNavbar />

      <main className="flex-1 section-padding max-w-6xl mx-auto px-6 w-full pt-20 md:pt-24">
        <div className="pt-8 mb-16">
          <div className="reveal mb-4 flex items-center gap-3">
            <span className="h-px w-6" style={{ background: "var(--color-accent)", opacity: 0.6 }} />
            <span className="text-xs font-mono font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--color-accent)" }}>
              Our Philosophy
            </span>
          </div>
          <h1 className="reveal reveal-delay-1 text-5xl md:text-6xl font-bold tracking-tight mb-8 leading-tight">
            Engineered for deep, <br />
            <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>
              distraction-free focus.
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6 text-white/70 text-lg leading-relaxed">
            <p>
              Most modern productivity tools are bloated with feature noise, notification popups, and complex hierarchy. We built Notsify to strip away everything non-essential.
            </p>
            <p>
              Your thoughts flow fastest when the editor gets out of your way. Notsify combines tactile micro-interactions with an ethereal dark environment where ideas take root effortlessly.
            </p>
            <p>
              Whether you are drafting technical specs, organizing daily notes, or brainstorming your next company, Notsify provides the speed and clarity you need.
            </p>

            <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8 mt-8">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-[var(--color-accent)]">100K+</p>
                <p className="text-xs text-white/50 uppercase font-mono mt-1">Notes Created</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-white">&lt; 5ms</p>
                <p className="text-xs text-white/50 uppercase font-mono mt-1">Search Speed</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-white">100%</p>
                <p className="text-xs text-white/50 uppercase font-mono mt-1">Private</p>
              </div>
            </div>
          </div>

          <div className="bezel">
            <div className="bezel-inner p-8 md:p-10 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs font-mono text-white/40 ml-2">manifesto.md</span>
              </div>
              <div className="space-y-5 font-mono text-sm text-white/80 leading-relaxed">
                <p className="text-[var(--color-accent)] text-base font-bold"># The Notsify Manifesto</p>
                <p>1. Fast over complex.</p>
                <p>2. Physical tactile feel over flat static software.</p>
                <p>3. Privacy is not a setting — it is our architecture.</p>
                <p>4. Your thoughts deserve zero friction.</p>
                <p>5. Built for makers, thinkers, and builders.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bezel mb-16">
          <div className="bezel-inner p-10 text-center flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to elevate your note-taking?</h2>
            <p className="text-white/60 mb-6 max-w-md">Experience the speed and simplicity of Notsify today.</p>
            <Link
              to="/signup"
              className="btn-primary text-xs uppercase font-bold tracking-wider py-3"
            >
              Get Started Now
              <span className="btn-icon"><FiArrowUpRight size={14} /></span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
