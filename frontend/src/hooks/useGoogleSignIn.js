import { useEffect, useRef, useState } from "react";

const GSI_SRC = "https://accounts.google.com/gsi/client";

// GSI clamps the button it renders to this range. Passing a larger width still
// yields a 400px button, so a full-width container ends up only partly covered.
const GSI_MIN_WIDTH = 200;
const GSI_MAX_WIDTH = 400;

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
 * Stretch the rendered (invisible) GSI button so it covers its container
 * exactly. The real button is our only click target — any uncovered strip of
 * the visible button shows no pointer cursor and swallows clicks.
 * GSI's outer wrapper stretches to the container on its own, so the clamped
 * render width only shows up on the button element itself.
 */
const coverContainer = (container) => {
  const rendered = container.firstElementChild;
  if (!rendered) return;

  const target = rendered.querySelector('[role="button"]') ?? rendered;

  // Measure untransformed so repeated calls stay idempotent.
  target.style.transform = "none";
  const outer = container.getBoundingClientRect();
  const inner = target.getBoundingClientRect();
  if (!inner.width || !inner.height) return;

  target.style.transformOrigin = "top left";
  target.style.transform =
    `translate(${outer.left - inner.left}px, ${outer.top - inner.top}px) ` +
    `scale(${outer.width / inner.width}, ${outer.height / inner.height})`;
};

/**
 * Renders a Google Identity Services button into `containerRef` and reports
 * when it is actually present. `onCredential` receives the GSI response and
 * may change identity freely — it is read through a ref.
 *
 * Returns `ready` only once a button exists in the container, so callers can
 * avoid advertising a control that cannot be clicked.
 */
export const useGoogleSignIn = ({
  clientId,
  containerRef,
  onCredential,
  text = "continue_with",
  theme = "filled_black",
}) => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const onCredentialRef = useRef(onCredential);

  // Kept in a ref so a new callback identity never forces a re-initialize.
  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!clientId) {
      setError("Google sign-in is not configured.");
      return;
    }

    let cancelled = false;
    let observer = null;
    let frame = 0;

    const handler = (response) => onCredentialRef.current?.(response);
    activeHandler = handler;

    const render = () => {
      if (cancelled || !window.google?.accounts?.id) return;

      const width = Math.min(
        Math.max(container.offsetWidth || GSI_MAX_WIDTH, GSI_MIN_WIDTH),
        GSI_MAX_WIDTH
      );

      // Re-rendering into a populated container stacks buttons.
      container.replaceChildren();
      window.google.accounts.id.renderButton(container, {
        type: "standard",
        shape: "rectangular",
        theme,
        size: "large",
        text,
        width,
      });

      coverContainer(container);
      setReady(container.childElementCount > 0);

      // GSI inserts the button synchronously today; re-check next frame so a
      // change on their side degrades to a late cover rather than a dead button.
      frame = requestAnimationFrame(() => {
        if (cancelled) return;
        coverContainer(container);
        setReady(container.childElementCount > 0);
      });
    };

    loadGsiScript()
      .then(() => {
        if (cancelled) return;
        ensureInitialized(clientId);
        render();

        if (typeof ResizeObserver !== "undefined") {
          // Breakpoint changes resize the container; keep the click target
          // aligned without re-rendering the button.
          observer = new ResizeObserver(() => coverContainer(container));
          observer.observe(container);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not reach Google. Please try again.");
        setReady(false);
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      if (activeHandler === handler) activeHandler = null;
      window.google?.accounts?.id?.cancel();
      container.replaceChildren();
    };
  }, [clientId, containerRef, text, theme]);

  return { ready, error };
};
