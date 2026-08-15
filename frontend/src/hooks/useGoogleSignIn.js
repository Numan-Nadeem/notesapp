import { useEffect, useRef, useState } from "react";

const GSI_SRC = "https://accounts.google.com/gsi/client";

let scriptPromise = null;
let initializedClientId = null;

// The credential callback registered with GSI must stay stable for the whole
// page lifetime: initialize() keeps only its most recent caller, so
// re-initializing per mount can leave the credential wired to a route that has
// already unmounted. Instead we initialize once and route the response to
// whichever component is currently mounted.
let activeHandler = null;

const loadGsiScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    const script = existing ?? document.createElement("script");

    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => {
      scriptPromise = null;
      reject(new Error("Failed to load Google Identity Services"));
    });

    if (!existing) {
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  return scriptPromise;
};

const ensureInitialized = (clientId) => {
  if (initializedClientId === clientId) return;

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => activeHandler?.(response),
    ux_mode: "popup",
  });

  initializedClientId = clientId;
};

/**
 * Loads the Google Identity Services SDK and initializes it so that
 * `google.accounts.id.prompt()` is ready to be called.
 *
 * Instead of rendering a hidden GSI button and stretching it over a custom
 * button (which breaks intermittently when getBoundingClientRect returns 0×0
 * during animations or background-tab rendering), this hook now simply reports
 * `ready: true` once the SDK is initialized and exposes a `prompt()` function
 * that callers wire to their own button's onClick.
 *
 * Returns `{ ready, error, prompt }`.
 */
export const useGoogleSignIn = ({
  clientId,
  // containerRef is accepted for backwards-compat but no longer used.
  containerRef: _containerRef,
  onCredential,
}) => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const onCredentialRef = useRef(onCredential);

  // Kept in a ref so a new callback identity never forces a re-initialize.
  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId) {
      setError("Google sign-in is not configured.");
      return;
    }

    let cancelled = false;

    const handler = (response) => onCredentialRef.current?.(response);
    activeHandler = handler;

    loadGsiScript()
      .then(() => {
        if (cancelled) return;
        ensureInitialized(clientId);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not reach Google. Please try again.");
        setReady(false);
      });

    return () => {
      cancelled = true;
      if (activeHandler === handler) activeHandler = null;
      window.google?.accounts?.id?.cancel();
    };
  }, [clientId]);

  /**
   * Triggers the Google One Tap / account-chooser popup.
   * Wire this to your custom button's onClick handler.
   */
  const prompt = () => {
    if (!ready || !window.google?.accounts?.id) return;
    window.google.accounts.id.prompt((notification) => {
      // If the prompt was suppressed (e.g. cooldown, user dismissed before),
      // fall back to rendering a temporary button and programmatically clicking
      // it. This handles the edge case where prompt() is throttled by Google.
      if (
        notification.isNotDisplayed() ||
        notification.isSkippedMoment()
      ) {
        // Create a temporary off-screen container, render the real GSI button,
        // and click it to force the popup flow.
        const tmp = document.createElement("div");
        tmp.style.cssText =
          "position:fixed;top:-9999px;left:-9999px;width:400px;height:50px;";
        document.body.appendChild(tmp);
        window.google.accounts.id.renderButton(tmp, {
          type: "standard",
          size: "large",
          width: 400,
        });
        // The rendered button lives inside an iframe; find and click it.
        requestAnimationFrame(() => {
          const btn =
            tmp.querySelector('[role="button"]') ??
            tmp.querySelector("div[tabindex]") ??
            tmp.querySelector("iframe");
          if (btn) btn.click();
          // Clean up after a short delay to let the popup open.
          setTimeout(() => tmp.remove(), 500);
        });
      }
    });
  };

  return { ready, error, prompt };
};
