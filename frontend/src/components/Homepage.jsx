import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { getNotes } from "../services/api.js";
import { useScrollReveal } from "../hooks/useScrollReveal.js";
import {
  FiArrowUpRight,
  FiEdit3,
  FiGrid,
  FiSearch,
  FiLayers,
  FiZap,
  FiLock,
  FiImage,
  FiPlus,
  FiFileText,
  FiClock,
  FiImage as FiImageIcon,
  FiCheck,
  FiChevronDown,
  FiSend,
  FiShield,
} from "react-icons/fi";
import LandingNavbar from "./LandingNavbar.jsx";

import vercelSvg from "../assets/svgrepo/vercel.svg";
import figmaSvg from "../assets/svgrepo/figma.svg";
import githubSvg from "../assets/svgrepo/github.svg";
import openaiSvg from "../assets/svgrepo/openai.svg";
import nextjsSvg from "../assets/svgrepo/nextjs.svg";
import vscodeSvg from "../assets/svgrepo/vscode.svg";
import microsoftSvg from "../assets/svgrepo/microsoft.svg";
import appleSvg from "../assets/svgrepo/apple.svg";
import dellSvg from "../assets/svgrepo/dell.svg";

/* ============================================================
   DASHBOARD (logged-in view) — Double-Bezel + scroll reveals
   ============================================================ */

const Dashboard = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useScrollReveal();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotes();
        if (data?.notes) setNotes(data.notes);
      } catch (err) {
        console.error("Failed to load notes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const recentNotes = notes.slice(0, 5);
  const notesWithImages = notes.filter(
    (n) => n.images && n.images.length > 0
  ).length;

  const stats = [
    { label: "Total notes", value: loading ? "—" : notes.length, icon: <FiFileText size={15} />, color: "var(--color-accent)" },
    { label: "With images", value: loading ? "—" : notesWithImages, icon: <FiImageIcon size={15} />, color: "#64b4ff" },
    { label: "This week", value: loading ? "—" : notes.filter((n) => { const d = new Date(n.createdAt); const now = new Date(); return now - d < 7 * 24 * 60 * 60 * 1000; }).length, icon: <FiClock size={15} />, color: "#a882ff" },
    { label: "Quick action", value: null, icon: <FiPlus size={15} />, color: "#64ffb4", link: "/notes" },
  ];

  return (
    <div ref={sectionRef} className="max-w-6xl mx-auto px-6 py-10 md:py-14">
      {/* Header */}
      <div className="mb-8 reveal">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="h-px w-5" style={{ background: "var(--color-accent)", opacity: 0.6 }} />
          <span className="text-xs font-mono font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--color-accent)" }}>
            Dashboard Overview
          </span>
        </div>
        <h1
          className="text-4xl md:text-5xl font-bold tracking-[-0.03em] mt-5 mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Welcome back,{" "}
          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>
            {user?.name?.split(" ")[0] || "there"}.
          </span>
        </h1>
        <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
          {notes.length === 0
            ? "Create your first note to get started."
            : `${notes.length} note${notes.length === 1 ? "" : "s"} in your collection.`}
        </p>
      </div>

      {/* Stats — Asymmetrical Bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`bezel reveal reveal-delay-${i + 1}`}
          >
            <div className="bezel-inner p-5 h-full">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${stat.color}14`, color: stat.color }}
              >
                {stat.icon}
              </div>
              {stat.link ? (
                <Link to={stat.link} style={{ textDecoration: "none" }}>
                  <p
                    className="text-2xl font-bold mb-0.5"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Create note
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {stat.label}
                  </p>
                </Link>
              ) : (
                <>
                  <p className="text-2xl font-bold mb-0.5" style={{ color: "var(--color-text-primary)" }}>
                    {stat.value}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {stat.label}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent notes */}
      <div className="reveal">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Recent notes
          </h2>
          {notes.length > 0 && (
            <Link
              to="/notes"
              className="text-sm font-medium flex items-center gap-1.5"
              style={{ color: "var(--color-accent)", textDecoration: "none" }}
            >
              View all <FiArrowUpRight size={14} />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bezel-inner p-5 animate-pulse"
                style={{ minHeight: "72px" }}
              />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="bezel">
            <div className="bezel-inner p-12 text-center">
              <div className="text-4xl mb-4 opacity-40">📝</div>
              <p className="text-base font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                No notes yet
              </p>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
                Create your first note to see it here.
              </p>
              <Link to="/notes" className="btn-primary">
                Create a note
                <span className="btn-icon"><FiPlus size={14} /></span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {recentNotes.map((note, i) => (
              <div
                key={note._id}
                className={`bezel reveal reveal-delay-${Math.min(i + 1, 5)}`}
              >
                <Link
                  to="/notes"
                  className="bezel-inner flex items-start gap-4 p-5 transition-colors duration-500"
                  style={{
                    color: "var(--color-text-primary)",
                    textDecoration: "none",
                  }}
                >
                  {note.images && note.images.length > 0 ? (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(168,130,255,0.12)", color: "#a882ff" }}
                    >
                      <FiImageIcon size={16} />
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--color-accent-dim)", color: "var(--color-accent)" }}
                    >
                      <FiFileText size={16} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1 truncate">{note.title}</p>
                    <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                      {note.content?.slice(0, 80)}{note.content?.length > 80 ? "..." : ""}
                    </p>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: "var(--color-text-muted)" }}>
                    {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ""}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================
   LANDING PAGE — Ethereal Glass + Asymmetrical Bento
   ============================================================ */

const features = [
  {
    icon: <FiZap size={22} />,
    title: "Instant capture",
    desc: "Type, attach, and save in seconds. No friction between thought and note — just a clean canvas waiting for your ideas.",
    featured: true,
    color: "var(--color-accent)",
    bg: "var(--color-accent-dim)",
  },
  {
    icon: <FiSearch size={18} />,
    title: "Smart search",
    desc: "Full-text search across every note. Find anything in milliseconds.",
    color: "#64b4ff",
    bg: "rgba(100,180,255,0.12)",
  },
  {
    icon: <FiImage size={18} />,
    title: "Rich media",
    desc: "Embed images and files directly inside your notes without leaving the editor.",
    color: "#a882ff",
    bg: "rgba(168,130,255,0.12)",
  },
  {
    icon: <FiLayers size={18} />,
    title: "Auto-organized",
    desc: "Your notes stay structured automatically. Pin what matters.",
    color: "#ffb464",
    bg: "rgba(255,180,100,0.12)",
  },
  {
    icon: <FiLock size={18} />,
    title: "Private by default",
    desc: "Encrypted storage, rotating tokens, zero tracking.",
    color: "#64ffb4",
    bg: "rgba(100,255,180,0.12)",
  },
  {
    icon: <FiEdit3 size={18} />,
    title: "Markdown & Hotkeys",
    desc: "Full Markdown syntax support with intuitive hotkeys for rapid formatting.",
    color: "#ff64b4",
    bg: "rgba(255,100,180,0.12)",
  },
];

const steps = [
  {
    num: "01",
    title: "Input intelligence",
    desc: "Open Notsify and start writing. No setup, no onboarding walls — just a clean canvas waiting for your thoughts.",
    tags: ["Writing", "Auto-save"],
  },
  {
    num: "02",
    title: "Autonomous organization",
    desc: "Your notes stay structured automatically. Attach images, pin what matters, and let the system handle the rest.",
    tags: ["Auto-sort", "Smart tags"],
  },
  {
    num: "03",
    title: "Smart retrieval",
    desc: "Full-text search across your entire collection. Every word indexed, every note reachable in milliseconds.",
    tags: ["Instant search", "Full indexing"],
  },
];

const svgrepoBrands = [
  { name: "Microsoft", icon: microsoftSvg },
  { name: "Apple", icon: appleSvg },
  { name: "Dell", icon: dellSvg },
  { name: "Vercel", icon: vercelSvg },
  { name: "Figma", icon: figmaSvg },
  { name: "GitHub", icon: githubSvg },
  { name: "OpenAI", icon: openaiSvg },
  { name: "Next.js", icon: nextjsSvg },
  { name: "VS Code", icon: vscodeSvg },
];

const LandingPage = () => {
  const pageRef = useScrollReveal();

  return (
    <div ref={pageRef} className="overflow-x-hidden pt-16 md:pt-20">
      <LandingNavbar />

      {/* ===== HERO — Ethereal Glass, centered ===== */}
      <section id="home" className="relative pt-8 pb-6 md:pt-14 md:pb-8 flex flex-col items-center justify-center">
        {/* Radial mesh orbs */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 30% 20%, rgba(200,255,0,0.07), transparent 70%), radial-gradient(ellipse 50% 40% at 70% 30%, rgba(120,80,255,0.06), transparent 60%)",
            filter: "blur(60px)",
          }}
        />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 pt-4">

          <h1
            className="reveal reveal-delay-1 text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.04em] mb-5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Transform thoughts
            <br />
            into{" "}
            <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>
              clarity.
            </span>
          </h1>

          <p
            className="reveal reveal-delay-2 text-lg md:text-xl max-w-xl mx-auto mb-8 leading-relaxed font-light"
            style={{ color: "var(--color-text-secondary)" }}
          >
            A minimal, beautiful space for your notes. Fast, private, and
            effortlessly organized.
          </p>

          <div className="reveal reveal-delay-3 flex flex-wrap items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary">
              Start writing
              <span className="btn-icon"><FiArrowUpRight size={14} /></span>
            </Link>
            <Link to="/login" className="btn-ghost">
              Sign in
              <span className="btn-icon"><FiArrowUpRight size={14} /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== DASHBOARD MOCKUP — Double-Bezel, peeks into hero ===== */}
      <section className="relative pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bezel reveal" style={{ padding: "0.375rem" }}>
            <div
              className="bezel-inner"
              style={{ background: "var(--color-surface-raised)" }}
            >
              {/* Browser chrome */}
              <div
                className="flex items-center gap-3 px-5 py-3"
                style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
              >
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
                </div>
                <div
                  className="flex-1 mx-4 h-7 rounded-lg flex items-center px-3 text-xs"
                  style={{
                    background: "var(--color-surface)",
                    color: "var(--color-text-muted)",
                    border: "1px solid var(--color-border-subtle)",
                  }}
                >
                  notsify.app/notes
                </div>
              </div>

              {/* App layout */}
              <div className="grid md:grid-cols-[200px_1fr] min-h-[340px] md:min-h-[440px]">
                {/* Sidebar */}
                <div
                  className="hidden md:flex flex-col gap-1 p-4"
                  style={{ borderRight: "1px solid var(--color-border-subtle)" }}
                >
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "var(--color-accent-dim)", color: "var(--color-accent)" }}
                  >
                    <FiEdit3 size={14} /> All notes
                  </div>
                  {["Work", "Personal", "Ideas", "Archive"].map((item) => (
                    <div key={item} className="px-3 py-2 rounded-lg text-sm" style={{ color: "var(--color-text-muted)" }}>
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      Recent notes
                    </h3>
                    <div
                      className="px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{ background: "var(--color-accent)", color: "#050505" }}
                    >
                      + New note
                    </div>
                  </div>

                  <div className="grid gap-2.5">
                    {[
                      { title: "Product roadmap Q4", preview: "Key priorities: performance improvements, mobile redesign...", time: "2m ago" },
                      { title: "Meeting notes — design review", preview: "Discussed typography system, color palette decisions...", time: "1h ago" },
                      { title: "App feature ideas", preview: "Dark mode toggle, offline support, markdown shortcuts...", time: "Yesterday" },
                      { title: "Travel itinerary", preview: "Flight details, hotel confirmation, packing list...", time: "3d ago" },
                    ].map((note, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-colors duration-500"
                        style={{
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border-subtle)",
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium mb-1 truncate" style={{ color: "var(--color-text-primary)" }}>
                            {note.title}
                          </p>
                          <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                            {note.preview}
                          </p>
                        </div>
                        <span className="text-xs shrink-0" style={{ color: "var(--color-text-muted)" }}>
                          {note.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR — Animated marquee ===== */}
      <section
        className="py-12 md:py-16 overflow-hidden"
        style={{ borderTop: "1px solid var(--color-border-subtle)", borderBottom: "1px solid var(--color-border-subtle)" }}
      >
        <div className="max-w-5xl mx-auto px-6 text-center mb-10 reveal">
          <p
            className="text-3xl md:text-4xl font-bold mb-2 tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Inspiring experiences
          </p>
          <p className="text-base" style={{ color: "var(--color-text-muted)" }}>
            Trusted by innovators, startup to enterprise
          </p>
        </div>
        <div className="relative reveal reveal-delay-1">
          {/* Fade edges */}
          <div
            className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, var(--color-surface), transparent)" }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, var(--color-surface), transparent)" }}
          />

          {/* Marquee track */}
          <div className="flex animate-marquee items-center" style={{ width: "max-content" }}>
            {[...svgrepoBrands, ...svgrepoBrands].map((brand, i) => (
              <div
                key={i}
                className="flex items-center gap-4 shrink-0 px-10 md:px-16 py-4"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                  <img
                    src={brand.icon}
                    alt={brand.name}
                    className="w-full h-full object-contain filter brightness-0 invert opacity-60"
                  />
                </div>
                <span
                  className="text-2xl md:text-3xl font-bold tracking-tight select-none"
                  style={{ color: "var(--color-text-secondary)", opacity: 0.7 }}
                >
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES — Asymmetrical Bento + Double-Bezel ===== */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="reveal mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-6" style={{ background: "var(--color-accent)", opacity: 0.6 }} />
              <span className="text-xs font-mono font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--color-accent)" }}>
                Core Capabilities
              </span>
              <span className="h-px w-6" style={{ background: "var(--color-accent)", opacity: 0.6 }} />
            </div>
            <h2
              className="reveal reveal-delay-1 text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05] mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Everything you need,
              <br />
              nothing you{" "}
              <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>
                don't.
              </span>
            </h2>
            <p
              className="reveal reveal-delay-2 text-base md:text-lg max-w-xl mx-auto"
              style={{ color: "var(--color-text-secondary)" }}
            >
              A minimal, focused notes app designed for people who care about
              clarity.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Featured card — spans 2 cols + 2 rows */}
            <div
              className="bezel reveal md:col-span-2 lg:row-span-2"
              style={{ minHeight: "320px" }}
            >
              <div className="bezel-inner p-8 md:p-10 h-full flex flex-col justify-between group relative">
                <div className="relative z-10">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: features[0].bg, color: features[0].color }}
                  >
                    {features[0].icon}
                  </div>
                  <h3
                    className="text-xl md:text-2xl font-semibold mb-3"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {features[0].title}
                  </h3>
                  <p
                    className="text-sm md:text-base leading-relaxed max-w-md"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {features[0].desc}
                  </p>
                </div>

                {/* Decorative bars */}
                <div className="hidden md:flex items-end gap-1.5 mt-8 h-20">
                  {[40, 64, 48, 72, 56, 80, 44, 60].map((h, i) => (
                    <div
                      key={i}
                      className="w-2.5 rounded-full transition-all duration-700 group-hover:scale-y-105"
                      style={{
                        height: `${h}px`,
                        background: i === 3 ? "var(--color-accent)" : "var(--color-surface-overlay)",
                        transformOrigin: "bottom",
                      }}
                    />
                  ))}
                </div>

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 20% 80%, rgba(200,255,0,0.05), transparent 50%)" }}
                />
              </div>
            </div>

            {/* Smaller cards */}
            {features.slice(1).map((feature, i) => (
              <div key={i} className={`bezel reveal reveal-delay-${Math.min(i + 1, 5)}`}>
                <div className="bezel-inner p-7 h-full group relative">
                  <div className="relative z-10">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: feature.bg, color: feature.color }}
                    >
                      {feature.icon}
                    </div>
                    <h3
                      className="text-base font-semibold mb-2"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {feature.desc}
                    </p>
                  </div>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 80% 20%, ${feature.bg.replace("0.12", "0.05")}, transparent 50%)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WORK PROCESS ===== */}
      <section
        className="section-padding"
        style={{ borderTop: "1px solid var(--color-border-subtle)" }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="reveal mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-6" style={{ background: "var(--color-accent)", opacity: 0.6 }} />
              <span className="text-xs font-mono font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--color-accent)" }}>
                Workflow & Process
              </span>
              <span className="h-px w-6" style={{ background: "var(--color-accent)", opacity: 0.6 }} />
            </div>
            <h2
              className="reveal reveal-delay-1 text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05] mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Getting started
              <br />
              takes{" "}
              <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>
                seconds.
              </span>
            </h2>
            <p
              className="reveal reveal-delay-2 text-base md:text-lg max-w-xl mx-auto"
              style={{ color: "var(--color-text-secondary)" }}
            >
              No setup wizards. No configuration walls. Just open and write.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {steps.map((step, i) => (
              <div key={step.num} className={`bezel reveal reveal-delay-${i + 1}`}>
                <div className="bezel-inner p-7 md:p-8 h-full group relative">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                      <span
                        className="text-xs font-semibold tracking-[0.15em] uppercase"
                        style={{ color: "var(--color-accent)" }}
                      >
                        Step {step.num}
                      </span>
                      <div
                        className="h-px flex-1"
                        style={{ background: "var(--color-border-subtle)" }}
                      />
                    </div>
                    <h3
                      className="text-lg font-semibold mb-3"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed mb-6"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {step.desc}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: "var(--color-surface-overlay)",
                            color: "var(--color-text-muted)",
                            border: "1px solid var(--color-border-subtle)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA — Double-Bezel full-bleed ===== */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bezel reveal" style={{ padding: "0.5rem" }}>
            <div
              className="bezel-inner relative overflow-hidden p-10 md:p-16 text-center"
            >
              {/* Ambient glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,255,0,0.1) 0%, transparent 60%)",
                }}
              />
              <div className="relative z-10">
                <h2
                  className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.05] mb-5"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Your best ideas
                  <br />
                  deserve{" "}
                  <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400 }}>
                    better tools.
                  </span>
                </h2>
                <p
                  className="text-base md:text-lg max-w-md mx-auto mb-8 leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Join thousands who have already made the switch. Free to start.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link to="/signup" className="btn-primary">
                    Get started free
                    <span className="btn-icon"><FiArrowUpRight size={14} /></span>
                  </Link>
                  <Link to="/login" className="btn-ghost">
                    Sign in
                    <span className="btn-icon"><FiArrowUpRight size={14} /></span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ============================================================
   HOMEPAGE — routes between Dashboard and LandingPage
   ============================================================ */

const Homepage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div
          className="w-6 h-6 border-2 rounded-full animate-spin"
          style={{
            borderColor: "var(--color-border-subtle)",
            borderTopColor: "var(--color-accent)",
          }}
        />
      </div>
    );
  }

  return user ? <Dashboard /> : <LandingPage />;
};

export default Homepage;
