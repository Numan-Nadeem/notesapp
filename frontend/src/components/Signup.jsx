import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { signup, googleLogin } from "../services/api.js";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [gsiReady, setGsiReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login: contextLogin } = useAuth();
  const navigate = useNavigate();
  const googleBtnContainerRef = useRef(null);

  const handleGoogleCallback = useCallback(
    async (response) => {
      setLoading(true);
      setError("");
      try {
        const result = await googleLogin({ credential: response.credential });
        if (result.data && result.data.user) {
          contextLogin(result.data.user);
          navigate("/", { replace: true });
        } else {
          setError("Google Sign-Up failed — invalid server response");
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            "Google Sign-Up failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [contextLogin, navigate]
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initializeGsi = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        ux_mode: "popup",
      });

      if (googleBtnContainerRef.current) {
        window.google.accounts.id.renderButton(
          googleBtnContainerRef.current,
          {
            type: "standard",
            shape: "rectangular",
            theme: "filled_black",
            size: "large",
            text: "signup_with",
            width: googleBtnContainerRef.current.offsetWidth,
          }
        );
      }

      setGsiReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGsi();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGsi;
    document.head.appendChild(script);

    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [handleGoogleCallback]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Full name is required");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...signupData } = formData;
      await signup(signupData);

      setSuccess("Account created! Redirecting...");
      
      setTimeout(() => {
        navigate("/login", {
          state: {
            message: "Account created successfully! Please log in.",
          },
        });
      }, 1500);
    } catch (error) {
      setError(
        error.response?.data?.error ||
          (error.request
            ? "Cannot reach the server. Please try again."
            : "An unexpected error occurred")
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full" style={{ background: "var(--color-surface)" }}>
      {/* Left Pane: Editorial Image Split */}
      <div className="hidden md:flex relative w-1/2 flex-col justify-end p-12 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2564&auto=format&fit=crop"
          alt="Abstract structural texture"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
          style={{ filter: "saturate(0.8) contrast(1.1)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
        {/* Subtle fade to the right form pane */}
        <div className="absolute inset-y-0 right-0 w-48 lg:w-64 bg-gradient-to-l from-[var(--color-surface)] to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 max-w-xl opacity-0 animate-fade-up [animation-delay:200ms]">
          <span className="eyebrow mb-6">Join the Collective</span>
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-white tracking-tight mb-6">
            Think freely.<br />Work beautifully.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed font-light">
            Start organizing your ideas in an environment engineered for deep, distraction-free focus.
          </p>
        </div>
      </div>

      {/* Right Pane: Form */}
      <div className="flex w-full md:w-1/2 flex-col justify-center px-6 py-4 lg:px-16 xl:px-24 max-h-[100dvh] overflow-y-auto">
        <a href="#signup-form" className="skip-link">Skip to signup form</a>
        
        <div className="w-full max-w-sm md:max-w-md xl:max-w-lg 2xl:max-w-xl mx-auto my-auto py-2 2xl:py-8">
          {/* Header */}
          <div className="mb-5 opacity-0 animate-fade-up [animation-delay:100ms]">
            <div className="flex items-center gap-3 mb-1">
              <Link to="/" className="text-white/40 hover:text-white transition-colors outline-none" aria-label="Go back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>
              <h2 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                Create an account
              </h2>
            </div>
            <p className="text-sm font-medium ml-9" style={{ color: "var(--color-text-secondary)" }}>
              Begin your journey with Notsify
            </p>
          </div>

          <div className="bezel opacity-0 animate-fade-up [animation-delay:200ms]">
            <div className="bezel-inner p-5 sm:p-6 lg:p-8 xl:p-10">
              
              {/* Google Sign-Up */}
              <div className="mb-4">
                <div className="relative w-full" style={{ minHeight: "44px" }}>
                  <div
                    className="w-full flex items-center justify-center gap-3 py-2.5 xl:py-3 px-4 rounded-xl text-sm xl:text-base font-medium transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--color-border-default)",
                      color: "var(--color-text-primary)",
                      cursor: gsiReady ? "pointer" : "not-allowed",
                      opacity: gsiReady ? 1 : 0.5,
                    }}
                  >
                    <GoogleIcon />
                    <span>{gsiReady ? "Sign up with Google" : "Loading..."}</span>
                  </div>
                  <div
                    ref={googleBtnContainerRef}
                    className="absolute inset-0 overflow-hidden rounded-xl"
                    style={{ opacity: 0 }}
                  />
                </div>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t w-full border-white/5" />
                  <span className="absolute px-3 text-[10px] uppercase tracking-widest font-mono text-white/30 bg-[#0c0c0f]">
                    Or Email
                  </span>
                </div>
              </div>

              <form id="signup-form" className="space-y-3 xl:space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="px-4 py-2.5 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="px-4 py-2.5 rounded-xl text-sm bg-[#c8ff00]/10 border border-[#c8ff00]/20 text-[#c8ff00] mb-4">
                    {success}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="peer w-full bg-black/20 border border-white/10 rounded-xl px-4 pt-5 pb-1.5 xl:pt-6 xl:pb-2.5 text-sm xl:text-base text-white placeholder-transparent focus:border-[#c8ff00]/50 focus:outline-none transition-colors"
                      placeholder="Full name"
                      disabled={loading}
                    />
                    <label
                      htmlFor="name"
                      className="absolute left-4 top-1.5 lg:top-2 text-[10px] lg:text-xs font-medium uppercase tracking-wider text-white/40 transition-all peer-placeholder-shown:text-sm lg:peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 lg:peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] lg:peer-focus:text-xs peer-focus:top-1.5 lg:peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-[#c8ff00]"
                    >
                      Full name
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="peer w-full bg-black/20 border border-white/10 rounded-xl px-4 pt-5 pb-1.5 xl:pt-6 xl:pb-2.5 text-sm xl:text-base text-white placeholder-transparent focus:border-[#c8ff00]/50 focus:outline-none transition-colors"
                      placeholder="Email address"
                      disabled={loading}
                    />
                    <label
                      htmlFor="email"
                      className="absolute left-4 top-1.5 lg:top-2 text-[10px] lg:text-xs font-medium uppercase tracking-wider text-white/40 transition-all peer-placeholder-shown:text-sm lg:peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 lg:peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] lg:peer-focus:text-xs peer-focus:top-1.5 lg:peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-[#c8ff00]"
                    >
                      Email address
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <div className="relative w-1/2 flex items-center">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleChange}
                        className="peer w-full bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 pt-5 pb-1.5 xl:pt-6 xl:pb-2.5 text-sm xl:text-base text-white placeholder-transparent focus:border-[#c8ff00]/50 focus:outline-none transition-colors"
                        placeholder="Password"
                        disabled={loading}
                      />
                      <label
                        htmlFor="password"
                        className="absolute left-4 top-1.5 lg:top-2 text-[10px] lg:text-xs font-medium uppercase tracking-wider text-white/40 transition-all peer-placeholder-shown:text-sm lg:peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 lg:peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] lg:peer-focus:text-xs peer-focus:top-1.5 lg:peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-[#c8ff00]"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 p-1 text-white/40 hover:text-white transition-colors outline-none cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>

                    <div className="relative w-1/2 flex items-center">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="peer w-full bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 pt-5 pb-1.5 xl:pt-6 xl:pb-2.5 text-sm xl:text-base text-white placeholder-transparent focus:border-[#c8ff00]/50 focus:outline-none transition-colors"
                        placeholder="Confirm"
                        disabled={loading}
                      />
                      <label
                        htmlFor="confirmPassword"
                        className="absolute left-4 top-1.5 lg:top-2 text-[10px] lg:text-xs font-medium uppercase tracking-wider text-white/40 transition-all peer-placeholder-shown:text-sm lg:peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 lg:peer-placeholder-shown:top-4 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] lg:peer-focus:text-xs peer-focus:top-1.5 lg:peer-focus:top-2 peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-[#c8ff00]"
                      >
                        Confirm
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 p-1 text-white/40 hover:text-white transition-colors outline-none cursor-pointer"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full flex items-center justify-between py-1.5 xl:py-2 pl-5 pr-1.5 xl:pr-2 text-sm xl:text-base font-semibold rounded-full transition-all duration-300 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
                    style={{ background: "var(--color-accent)", color: "#050505" }}
                  >
                    <span>
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </span>
                      ) : (
                        "Join Notsify"
                      )}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:bg-black/15">
                      <ArrowRightIcon />
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-4 text-center opacity-0 animate-fade-up [animation-delay:300ms]">
            <span className="text-sm font-medium text-white/40">
              Already have an account?{" "}
              <Link to="/login" className="text-[#c8ff00] hover:text-white transition-colors">
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
