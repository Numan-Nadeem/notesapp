import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { login, googleLogin } from "../services/api.js";

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

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gsiReady, setGsiReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const { isAuthenticated, login: contextLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const googleBtnContainerRef = useRef(null);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state?.message]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

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
          setError("Google Sign-In failed — invalid server response");
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            "Google Sign-In failed. Please try again."
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
            text: "continue_with",
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
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(formData);
      if (result.data && result.data.user) {
        contextLogin(result.data.user);
        navigate("/", { replace: true });
      } else {
        setError("Login failed - Invalid response from server");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError(error.response?.data?.error || "Invalid email or password");
      } else {
        setError(error.response?.data?.error || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full" style={{ background: "var(--color-surface)" }}>
      {/* Left Pane: Editorial Image Split */}
      <div className="hidden md:flex relative w-1/2 flex-col justify-end p-12 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
          alt="Abstract fluid texture"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
          style={{ filter: "saturate(1.2)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
        {/* Subtle fade to the right form pane */}
        <div className="absolute inset-y-0 right-0 w-48 lg:w-64 bg-gradient-to-l from-[var(--color-surface)] to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 max-w-xl opacity-0 animate-fade-up [animation-delay:200ms]">
          <span className="eyebrow mb-6">Notsify platform</span>
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-white tracking-tight mb-6">
            Capture thought.<br />Organize chaos.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed font-light">
            An elegant space designed for clarity and deep focus.
            Your ideas deserve a beautiful home.
          </p>
        </div>
      </div>

      {/* Right Pane: Form */}
      <div className="flex w-full md:w-1/2 flex-col justify-center px-6 py-6 lg:px-16 xl:px-24 max-h-[100dvh] overflow-y-auto">
        <a href="#login-form" className="skip-link">Skip to login form</a>
        
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
                Welcome back
              </h2>
            </div>
            <p className="text-sm font-medium ml-9" style={{ color: "var(--color-text-secondary)" }}>
              Sign in to your account to continue
            </p>
          </div>

          <div className="bezel opacity-0 animate-fade-up [animation-delay:200ms]">
            <div className="bezel-inner p-5 sm:p-6 lg:p-8 xl:p-10">
              
              {/* Google Sign-In */}
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
                    <span>{gsiReady ? "Continue with Google" : "Loading..."}</span>
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

              <form id="login-form" className="space-y-3 xl:space-y-5" onSubmit={handleSubmit}>
                {successMessage && (
                  <div className="px-4 py-2.5 rounded-xl text-sm bg-[#c8ff00]/10 border border-[#c8ff00]/20 text-[#c8ff00] mb-4">
                    {successMessage}
                  </div>
                )}

                {error && (
                  <div className="px-4 py-2.5 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
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
                      className="absolute left-4 top-1.5 text-[10px] font-medium uppercase tracking-wider text-white/40 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-[#c8ff00]"
                    >
                      Email address
                    </label>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="peer w-full bg-black/20 border border-white/10 rounded-xl px-4 pt-5 pb-1.5 xl:pt-6 xl:pb-2.5 pr-12 text-sm xl:text-base text-white placeholder-transparent focus:border-[#c8ff00]/50 focus:outline-none transition-colors"
                      placeholder="Password"
                      disabled={loading}
                    />
                    <label
                      htmlFor="password"
                      className="absolute left-4 top-1.5 text-[10px] font-medium uppercase tracking-wider text-white/40 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:text-[10px] peer-focus:top-1.5 peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-[#c8ff00]"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1.5 text-white/40 hover:text-white transition-colors outline-none cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full flex items-center justify-between py-1.5 xl:py-2 pl-5 pr-1.5 xl:pr-2 text-sm xl:text-base font-semibold rounded-full transition-all duration-300 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
                    style={{ background: "var(--color-accent)", color: "#050505" }}
                  >
                    <span>{loading ? "Signing in..." : "Sign in"}</span>
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
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#c8ff00] hover:text-white transition-colors">
                Create one
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
