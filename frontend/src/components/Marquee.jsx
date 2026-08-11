const partners = [
  "Vercel",
  "Stripe",
  "Linear",
  "Figma",
  "Notion",
  "Arc",
  "Raycast",
  "Supabase",
  "Planetscale",
  "Resend",
  "Clerk",
  "Tailwind",
];

const Marquee = () => {
  return (
    <section className="py-24 overflow-hidden border-y border-[var(--color-border-subtle)]">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <p className="text-xs font-medium tracking-widest uppercase text-[var(--color-text-muted)] text-center">
          Trusted by teams who care about craft
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[var(--color-surface)] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--color-surface)] to-transparent z-10" />

        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {[...partners, ...partners].map((name, i) => (
            <div
              key={i}
              className="flex items-center justify-center px-8 md:px-12 shrink-0"
            >
              <span className="text-xl md:text-2xl font-bold text-[var(--color-text-muted)] opacity-40 hover:opacity-70 transition-opacity duration-300 whitespace-nowrap tracking-tight select-none">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Marquee;