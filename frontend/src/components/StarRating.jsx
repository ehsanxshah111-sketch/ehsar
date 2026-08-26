import React from "react";

/**
 * value: current rating (0-5, decimals allowed for display-only averages)
 * onChange: if provided, renders as an interactive picker
 * size: pixel size of each star
 */
const StarRating = ({ value = 0, onChange, size = 16 }) => {
  const interactive = typeof onChange === "function";
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="inline-flex gap-0.5">
      {stars.map((n) => {
        const filled = n <= Math.round(value);
        const Star = (
          <svg
            key={n}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? "#b08d57" : "none"}
            stroke="#b08d57"
            strokeWidth="1.2"
          >
            <path d="M12 2.5l2.9 6.4 6.9.7-5.2 4.7 1.5 6.9L12 17.6l-6.1 3.6 1.5-6.9L2.2 9.6l6.9-.7z" />
          </svg>
        );
        return interactive ? (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange(n)}
            className="leading-none"
          >
            {Star}
          </button>
        ) : (
          Star
        );
      })}
    </div>
  );
};

export default StarRating;
