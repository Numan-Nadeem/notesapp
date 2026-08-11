import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { FiEdit3, FiGrid, FiShield } from "react-icons/fi";

const accordionData = [
  {
    icon: <FiEdit3 size={20} />,
    title: "Write without boundaries",
    content:
      "A distraction-free editor that adapts to your flow. Markdown support, inline images, and auto-save mean you never lose a thought.",
    image: "https://picsum.photos/seed/notsify-editor/600/400",
    color: "var(--color-accent)",
  },
  {
    icon: <FiGrid size={20} />,
    title: "Organize visually",
    content:
      "See your notes as cards, lists, or grids. Drag to reorder. Pin what matters. Let your brain work the way it wants to.",
    image: "https://picsum.photos/seed/notsify-organize/600/400",
    color: "#64b4ff",
  },
  {
    icon: <FiShield size={20} />,
    title: "Keep it locked down",
    content:
      "Two-factor auth, encrypted storage, and rotating refresh tokens. Enterprise-grade security on a personal scale.",
    image: "https://picsum.photos/seed/notsify-security/600/400",
    color: "#a882ff",
  },
];

const HorizontalAccordion = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRefs = useRef([]);
  const containerRef = useRef(null);

  useEffect(() => {
    panelRefs.current.forEach((panel, i) => {
      if (!panel) return;
      const isActive = i === activeIndex;

      gsap.to(panel, {
        flex: isActive ? "1 1 45%" : "0 1 60px",
        duration: 0.5,
        ease: "power3.inOut",
      });

      gsap.to(panel.querySelector(".accordion-content"), {
        opacity: isActive ? 1 : 0,
        duration: isActive ? 0.4 : 0.2,
        delay: isActive ? 0.15 : 0,
        ease: "power2.out",
      });

      gsap.to(panel.querySelector(".accordion-image"), {
        scale: isActive ? 1 : 1.1,
        opacity: isActive ? 1 : 0,
        duration: 0.6,
        ease: "power3.out",
      });
    });
  }, [activeIndex]);

  return (
    <section className="section-padding px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <p className="text-xs font-medium tracking-widest uppercase text-[var(--color-accent)] mb-4">
            How it works
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.02em] leading-tight">
            Designed around
            <br />
            three principles.
          </h2>
        </div>

        <div
          ref={containerRef}
          className="flex flex-col md:flex-row gap-3 min-h-[400px] md:min-h-[480px]"
        >
          {accordionData.map((item, i) => (
            <div
              key={i}
              ref={(el) => (panelRefs.current[i] = el)}
              onClick={() => setActiveIndex(i)}
              className="relative rounded-2xl overflow-hidden cursor-pointer bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)] flex flex-col md:flex-initial"
              style={{
                flex: i === activeIndex ? "1 1 45%" : "0 1 60px",
              }}
            >
              <div className="absolute inset-0 z-0">
                <img
                  src={item.image}
                  alt=""
                  className="accordion-image w-full h-full object-cover mix-blend-luminosity opacity-0"
                />
                <div className="absolute inset-0 bg-[rgba(8,8,12,0.75)]" />
              </div>

              <div className="relative z-10 p-6 md:p-8 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4 md:mb-0 md:mb-auto">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      color: item.color,
                      background: `color-mix(in srgb, ${item.color} 12%, transparent)`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-base font-semibold whitespace-nowrap md:whitespace-normal">
                    {item.title}
                  </h3>
                </div>

                <div className="accordion-content opacity-0 mt-4 md:mt-8">
                  <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm md:text-base mb-6">
                    {item.content}
                  </p>
                  <div
                    className="inline-flex items-center gap-2 text-sm font-medium"
                    style={{ color: item.color }}
                  >
                    Learn more
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HorizontalAccordion;