import React, { useState } from "react";
import LandingNavbar from "./LandingNavbar.jsx";
import Footer from "./Footer.jsx";
import { useScrollReveal } from "../hooks/useScrollReveal.js";
import { FiSend, FiCheck } from "react-icons/fi";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const ContactPage = () => {
  const pageRef = useScrollReveal();
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactData, setContactData] = useState({ name: "", email: "", message: "" });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [captchaToken, setCaptchaToken] = useState("");

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactData.email || !contactData.message) return;
    
    if (!captchaToken) {
      setError("Please complete the captcha verification.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE",
          "h-captcha-response": captchaToken,
          ...contactData,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setContactSubmitted(true);
      } else {
        setError(result.message || "Failed to send message. Please try again.");
      }
    } catch (err) {
      setError("Network error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen flex flex-col bg-[#050505] text-white">
      <LandingNavbar />

      <main className="flex-1 section-padding max-w-3xl mx-auto px-6 w-full pt-20 md:pt-24">
        <div className="text-center pt-8 mb-12">
          <div className="reveal mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-6" style={{ background: "var(--color-accent)", opacity: 0.6 }} />
            <span className="text-xs font-mono font-semibold uppercase tracking-[0.25em]" style={{ color: "var(--color-accent)" }}>
              Get In Touch
            </span>
            <span className="h-px w-6" style={{ background: "var(--color-accent)", opacity: 0.6 }} />
          </div>
          <h1 className="reveal reveal-delay-1 text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
            We'd love to hear from you.
          </h1>
          <p className="reveal reveal-delay-2 text-base text-white/60">
            Have a question, feature request, or feedback? Drop us a note below.
          </p>
        </div>

        <div className="bezel mb-20">
          <div className="bezel-inner p-8 md:p-12">
            {contactSubmitted ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/30 text-[var(--color-accent)] flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Message Received!</h2>
                <p className="text-sm text-white/60">Thank you for reaching out. Our team will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono uppercase text-white/60 mb-2">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactData.name}
                      onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 focus:border-[var(--color-accent)]/50 focus:outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-white/60 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactData.email}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 focus:border-[var(--color-accent)]/50 focus:outline-none transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-white/60 mb-2">Message</label>
                  <textarea
                    rows={5}
                    required
                    value={contactData.message}
                    onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 focus:border-[var(--color-accent)]/50 focus:outline-none transition-colors"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>
                
                <div className="flex justify-center my-4 overflow-hidden rounded-lg">
                  <HCaptcha
                    sitekey={import.meta.env.VITE_HCAPTCHA_SITEKEY || "50b2fe65-b00b-4b9e-ad62-3ba471098be2"}
                    reCaptchaCompat={false}
                    theme="dark"
                    onVerify={(token) => {
                      setCaptchaToken(token);
                      setError(null);
                    }}
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-xs font-semibold text-center mb-4">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-between text-xs uppercase font-bold tracking-wider py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                  <span className="btn-icon"><FiSend size={14} /></span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
