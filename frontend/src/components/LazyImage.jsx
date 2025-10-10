import React, { useState } from "react";

const LazyImage = ({ idx, imageUrl, maxHeight }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      key={idx}
      className="relative overflow-hidden flex justify-center items-center 
                  rounded-xl border border-neutral-700"
      style={{ maxHeight }}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/30">
          <span className="loading loading-spinner text-primary"></span>
        </div>
      )}

      <img
        src={imageUrl}
        alt={`Note Image ${idx + 1}`}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

export default LazyImage;
