import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import gsap from "gsap";
import { FiArrowRight, FiPlay } from "react-icons/fi";

const Hero = () => {
  const { user } = useAuth();
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const badgeRef = useRef(null);
  const orbRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 }
      )
        .fromTo(
          titleRef.current.children,
          { opacity: 0, y: 60, rotateX: 15 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.9, stagger: 0.12 },
          "-=0.3"
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.4"
        )
        .fromTo(
          ctaRef.current.children,
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 },
          "-=0.3"
        );

      gsap.to(orbRef.current, {
        y: -20,
        x: 10,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div
          ref={orbRef}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(200,255,0,0.15) 0%, rgba(200,255,0,0.05) 40%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          }}
        />
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 text-center">
        <div ref={badgeRef} className="mb-8 opacity-0">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide uppercase text-[var(--color-accent)] border border-[rgba(200,255,0,0.2)] bg-[rgba(200,255,0,0.06)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
            Your thoughts, organized
          </span>
        </div>

        <h1
          ref={titleRef}
          className="text-[clamp(2.75rem,5.5vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.03em] mb-8"
          style={{ perspective: "1000px" }}
        >
          <span className="block overflow-hidden">
            <span className="block">Capture ideas.</span>
          </span>
          <span className="block overflow-hidden">
            <span className="block text-gradient">
              Shape them{" "}
              <span className="inline-block w-[3.2em] h-[0.85em] rounded-full align-middle mx-2 overflow-hidden align-bottom align-middle relative top-[0.05em]">
                <img
                  src="https://picsum.photos/seed/notsify-shape/400/120"
                  alt=""
                  className="w-full h-full object-cover grayscale opacity-80 mix-blend-luminosity"
                />
              </span>{" "}
              into clarity.
            </span>
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-[var(--color-text-secondary)] text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed font-light"
        >
          {user
            ? `Welcome back, ${user.name || user.email}. Ready to create something great?`
            : "A minimal, beautiful space for your notes. Fast, private, and effortlessly organized."}
        </p>

        <div ref={ctaRef} className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/notes" className="btn-primary">
            {user ? "Open My Notes" : "Start Writing"}
            <FiArrowRight size={16} />
          </Link>
          {!user && (
            <Link to="/signup" className="btn-ghost">
              <FiPlay size={14} />
              See how it works
            </Link>
          )}
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-xs tracking-widest uppercase text-[var(--color-text-muted)]">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-[var(--color-text-muted)] to-transparent" />
      </div>
    </section>
  );
};

export default Hero;