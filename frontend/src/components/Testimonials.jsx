import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Designer at Vercel",
    quote:
      "Notsify replaced three separate apps for me. The speed is unreal, and the interface disappears which is exactly what I want from a notes tool.",
    avatar: "https://picsum.photos/seed/sarah-chen/200/200",
    rating: 5,
  },
  {
    name: "Marcus Rivera",
    role: "Engineering Lead at Linear",
    quote:
      "I switched from Notion six months ago. The minimal approach forces me to write better notes. No bloat, just pure focus.",
    avatar: "https://picsum.photos/seed/marcus-r/200/200",
    rating: 5,
  },
  {
    name: "Aiko Tanaka",
    role: "Freelance Illustrator",
    quote:
      "Being able to attach reference images directly into my notes without any friction changed how I organize client briefs. It just works.",
    avatar: "https://picsum.photos/seed/aiko-t/200/200",
    rating: 5,
  },
  {
    name: "David Okonkwo",
    role: "Startup Founder",
    quote:
      "We use Notsify across our team for meeting notes and decision logs. The search is fast enough that we actually find things again.",
    avatar: "https://picsum.photos/seed/david-o/200/200",
    rating: 5,
  },
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () =>
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  const t = testimonials[current];

  return (
    <section className="section-padding px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative">
            <div className="relative w-full aspect-[4/5] max-w-md mx-auto md:mx-0 rounded-3xl overflow-hidden">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-full h-full object-cover grayscale opacity-90 mix-blend-luminosity scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-transparent to-transparent opacity-60" />
            </div>

            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-[var(--color-surface)] shadow-2xl">
              <img
                src={`https://picsum.photos/seed/notsify-note-${current}/200/200`}
                alt=""
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          </div>

          <div>
            <div className="flex gap-1 mb-6">
              {Array.from({ length: t.rating }).map((_, i) => (
                <FiStar
                  key={i}
                  size={16}
                  className="text-[var(--color-accent)] fill-[var(--color-accent)]"
                />
              ))}
            </div>

            <blockquote className="text-xl md:text-2xl lg:text-3xl font-medium leading-snug tracking-tight mb-8">
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            <div className="mb-8">
              <p className="font-semibold text-base">{t.name}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t.role}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)] transition-all cursor-pointer bg-transparent"
                aria-label="Previous testimonial"
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)] transition-all cursor-pointer bg-transparent"
                aria-label="Next testimonial"
              >
                <FiChevronRight size={18} />
              </button>
              <span className="text-xs text-[var(--color-text-muted)] ml-2 tabular-nums">
                {String(current + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;