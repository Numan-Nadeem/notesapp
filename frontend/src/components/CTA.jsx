import { Link } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { FiArrowRight } from "react-icons/fi";

const CTA = () => {
  const { user } = useAuth();

  return (
    <section className="section-padding px-6">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)] rounded-3xl" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(200,255,0,0.1) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-tight mb-6">
              Your best ideas
              <br />
              deserve better tools.
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg max-w-lg mx-auto mb-10 leading-relaxed">
              {user
                ? "Head to your notes and keep building something great."
                : "Join thousands who have already made the switch. Free to start, no credit card required."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/notes" className="btn-primary">
                {user ? "Go to Notes" : "Get Started Free"}
                <FiArrowRight size={16} />
              </Link>
              {!user && (
                <Link to="/login" className="btn-ghost">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;