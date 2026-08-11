import React, { useState } from "react";
import LandingNavbar from "./LandingNavbar.jsx";
import Footer from "./Footer.jsx";
import { useScrollReveal } from "../hooks/useScrollReveal.js";
import { FiChevronDown } from "react-icons/fi";

const FaqPage = () => {
  const pageRef = useScrollReveal();
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "Is Notsify really free to get started?",
      a: "Yes! The free plan gives you full access to create, organize, and search unlimited local notes without any artificial time limits or feature lockouts.",
    },
    {
      q: "How does the real-time cloud sync work?",
      a: "Notsify syncs your notes instantly across all your devices using end-to-end encryption. Changes are saved automatically as you type with zero latency.",
    },
    {
      q: "Can I export my notes if I ever want to leave?",
      a: "Absolutely. You can export your entire workspace into standard Markdown, JSON, or TXT format with one single click. Your data belongs entirely to you.",
    },
    {
      q: "Is my note data private and secure?",
      a: "Security is built into our core foundation. We use AES-256 encryption at rest and TLS 1.3 in transit. We never sell or index your private data for training.",
    },
    {
      q: "Does Notsify support Markdown syntax?",
      a: "Yes! Notsify supports GitHub Flavored Markdown (GFM), inline code blocks, tables, task checklists, and live instant previews.",
    },
    {
      q: "Can I use Notsify offline?",
      a: "Yes, Notsify is built offline-first. You can create and edit notes without an internet connection, and changes automatically sync once you are back online.",
    },
  ];

  return (
    <div ref={pageRef} className="min-h-screen flex flex-col bg-[#050505] text-white">
      <LandingNavbar />

      <main className="flex-1 section-padding max-w-4xl mx-auto px-6 w-full pt-20 md:pt-24">
        <div className="text-center pt-8 mb-16">
          <div className="reveal mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-6" style={{ background: "var(--color-accent)", opacity: 0.6 }} />
            <span className="text-xs font-mono font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--color-accent)" }}>
              FAQ
            </span>
            <span className="h-px w-6" style={{ background: "var(--color-accent)", opacity: 0.6 }} />
          </div>
          <h1 className="reveal reveal-delay-1 text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Frequently asked questions.
          </h1>
          <p className="reveal reveal-delay-2 text-lg text-white/60 max-w-lg mx-auto">
            Everything you need to know about Notsify features, security, and workspace management.
          </p>
        </div>

        <div className="space-y-4 mb-20">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bezel">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="bezel-inner w-full p-6 md:p-7 text-left flex items-center justify-between gap-4 cursor-pointer group"
              >
                <span className="font-semibold text-white text-base md:text-lg">{faq.q}</span>
                <FiChevronDown
                  className={`w-5 h-5 text-[#c8ff00] transition-transform duration-300 ${
                    openFaq === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-6 md:px-7 pb-6 text-sm text-white/70 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FaqPage;
