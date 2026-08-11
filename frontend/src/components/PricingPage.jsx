import React from "react";
import { Link } from "react-router";
import { FiCheck, FiArrowUpRight } from "react-icons/fi";
import LandingNavbar from "./LandingNavbar.jsx";
import Footer from "./Footer.jsx";
import { useScrollReveal } from "../hooks/useScrollReveal.js";

const PricingPage = () => {
  const pageRef = useScrollReveal();

  return (
    <div ref={pageRef} className="min-h-screen flex flex-col bg-[#050505] text-white">
      <LandingNavbar />

      <main className="flex-1 section-padding max-w-6xl mx-auto px-6 w-full pt-20 md:pt-24">
        <div className="text-center mb-16 pt-8">
          <div className="reveal mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-6" style={{ background: "var(--color-accent)", opacity: 0.6 }} />
            <span className="text-xs font-mono font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--color-accent)" }}>
              Transparent Pricing
            </span>
            <span className="h-px w-6" style={{ background: "var(--color-accent)", opacity: 0.6 }} />
          </div>
          <h1 className="reveal reveal-delay-1 text-5xl md:text-6xl font-bold tracking-[-0.03em] leading-tight mb-6">
            Simple plans for <br />
            <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>
              ambitious minds.
            </span>
          </h1>
          <p className="reveal reveal-delay-2 text-lg text-white/70 max-w-xl mx-auto">
            Start for free, upgrade when you need AI assistance and instant cloud sync across all your devices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
          {/* Starter Plan */}
          <div className="bezel reveal">
            <div className="bezel-inner p-8 md:p-10 h-full flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--color-accent)] font-semibold">Starter</span>
                <div className="mt-4 mb-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-sm text-white/50">/ forever</span>
                </div>
                <p className="text-sm text-white/60 mb-6">Perfect for personal notes and quick daily thoughts.</p>
                <ul className="space-y-4 mb-8">
                  {["Unlimited local notes", "Instant full-text search", "Markdown formatting", "Standard typography"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                      <FiCheck className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/signup"
                className="btn-ghost text-center justify-center text-xs uppercase font-bold tracking-wider py-3"
              >
                Get Started Free
              </Link>
            </div>
          </div>

          {/* Pro Plan (Featured) */}
          <div className="bezel reveal reveal-delay-1 relative" style={{ border: "1px solid rgba(200, 255, 0, 0.25)" }}>
            <div className="bezel-inner p-8 md:p-10 h-full flex flex-col justify-between relative overflow-hidden" style={{ background: "rgba(200, 255, 0, 0.04)" }}>
              <div className="absolute top-4 right-4 bg-[var(--color-accent)] text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Popular
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--color-accent)] font-semibold">Pro Collective</span>
                <div className="mt-4 mb-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$9</span>
                  <span className="text-sm text-white/50">/ month</span>
                </div>
                <p className="text-sm text-white/60 mb-6">For power users who need cross-device sync and AI summaries.</p>
                <ul className="space-y-4 mb-8">
                  {["Everything in Starter", "Real-time cloud backup", "AI text synthesis & summary", "Custom typography & themes", "Priority 24/7 support"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white">
                      <FiCheck className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/signup"
                className="btn-primary text-xs uppercase font-bold tracking-wider justify-between py-3 whitespace-nowrap"
              >
                <span>Start Free Trial</span>
                <span className="btn-icon"><FiArrowUpRight size={14} /></span>
              </Link>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bezel reveal reveal-delay-2">
            <div className="bezel-inner p-8 md:p-10 h-full flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--color-accent)] font-semibold">Enterprise</span>
                <div className="mt-4 mb-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">Custom</span>
                </div>
                <p className="text-sm text-white/60 mb-6">Tailored security and dedicated support for organizations.</p>
                <ul className="space-y-4 mb-8">
                  {["Dedicated private node", "Custom SSO & SAML 2.0", "Audit log & compliance", "99.99% Uptime SLA", "Dedicated account manager"].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                      <FiCheck className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/contact"
                className="btn-ghost text-center justify-center text-xs uppercase font-bold tracking-wider py-3"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
