import { useRef } from "react";
import SpotlightCard from "./SpotlightCard";
import {
  FiZap,
  FiLock,
  FiImage,
  FiLayers,
  FiSearch,
} from "react-icons/fi";

const features = [
  {
    icon: <FiZap size={22} />,
    title: "Instant Capture",
    desc: "Type, attach, and save in seconds. No friction between thought and note.",
    span: "col-span-1 md:col-span-2 row-span-1",
    accent: "rgba(200, 255, 0, 0.12)",
    iconColor: "text-[var(--color-accent)]",
    image: "https://picsum.photos/seed/notsify-speed/800/400",
  },
  {
    icon: <FiLock size={22} />,
    title: "Private by Default",
    desc: "End-to-end encrypted storage. Your notes stay yours.",
    span: "col-span-1 row-span-1",
    accent: "rgba(100, 180, 255, 0.12)",
    iconColor: "text-blue-400",
  },
  {
    icon: <FiImage size={22} />,
    title: "Rich Media",
    desc: "Embed images, files, and attachments directly inside your notes.",
    span: "col-span-1 row-span-1",
    accent: "rgba(168, 130, 255, 0.12)",
    iconColor: "text-purple-400",
  },
  {
    icon: <FiLayers size={22} />,
    title: "Smart Organization",
    desc: "Auto-sort, tag, and find anything in milliseconds.",
    span: "col-span-1 row-span-1",
    accent: "rgba(255, 140, 100, 0.12)",
    iconColor: "text-orange-400",
  },
  {
    icon: <FiSearch size={22} />,
    title: "Full-Text Search",
    desc: "Every word. Every image. Every note. Find it instantly with powerful search across your entire collection.",
    span: "col-span-1 md:col-span-2 row-span-1",
    accent: "rgba(100, 255, 180, 0.12)",
    iconColor: "text-emerald-400",
  },
];

const BentoGrid = () => {
  const gridRef = useRef(null);

  return (
    <section className="section-padding px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <p className="text-xs font-medium tracking-widest uppercase text-[var(--color-accent)] mb-4">
            Built for focus
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.02em] leading-tight">
            Everything you need,
            <br />
            nothing you don&apos;t.
          </h2>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
          style={{ gridAutoFlow: "dense" }}
        >
          {features.map((feature, i) => (
            <SpotlightCard
              key={i}
              className={`${feature.span} group relative overflow-hidden p-6 md:p-8 min-h-[200px] flex flex-col justify-between`}
              spotlightColor={feature.accent}
            >
              <div className="relative z-10">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${feature.iconColor}`}
                  style={{ background: feature.accent }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-sm">
                  {feature.desc}
                </p>
              </div>

              {feature.image && (
                <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out">
                  <img
                    src={feature.image}
                    alt=""
                    className="w-full h-full object-cover mix-blend-luminosity opacity-20 scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-raised)] via-transparent to-transparent" />
                </div>
              )}
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;