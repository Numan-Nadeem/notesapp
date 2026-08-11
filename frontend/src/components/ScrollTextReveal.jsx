import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const words = [
  "We",
  "believe",
  "the",
  "best",
  "software",
  "feels",
  "like",
  "an",
  "extension",
  "of",
  "your",
  "thinking.",
  "No",
  "clutter.",
  "No",
  "lag.",
  "No",
  "compromise.",
  "Just",
  "a",
  "clear",
  "canvas",
  "for",
  "your",
  "mind.",
];

const ScrollTextReveal = () => {
  const containerRef = useRef(null);
  const wordsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      wordsRef.current.forEach((word, i) => {
        if (!word) return;

        gsap.fromTo(
          word,
          { opacity: 0.08 },
          {
            opacity: 1,
            scrollTrigger: {
              trigger: word,
              start: "top 80%",
              end: "top 40%",
              scrub: 1,
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section-padding px-6">
      <div className="max-w-5xl mx-auto">
        <div
          ref={containerRef}
          className="text-center md:text-left"
        >
          <p
            className="text-[clamp(1.5rem,3.5vw,3rem)] font-semibold leading-[1.3] tracking-[-0.02em]"
          >
            {words.map((word, i) => (
              <span
                key={i}
                ref={(el) => (wordsRef.current[i] = el)}
                className="inline-block mr-[0.3em]"
                style={{ opacity: 0.08 }}
              >
                {word}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ScrollTextReveal;