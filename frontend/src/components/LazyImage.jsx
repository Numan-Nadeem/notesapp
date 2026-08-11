import React, { useState } from "react";

const LazyImage = ({ idx, imageUrl, maxHeight }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      key={idx}
      className="relative overflow-hidden w-full h-full"
      style={{ maxHeight }}
    >
      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center animate-pulse"
          style={{ background: "var(--color-surface-overlay)" }}
        >
          <div
            className="w-5 h-5 border-2 rounded-full animate-spin"
            style={{
              borderColor: "var(--color-border-subtle)",
              borderTopColor: "var(--color-accent)",
            }}
          />
        </div>
      )}

      <img
        src={imageUrl}
        alt=""
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

export default LazyImage;
