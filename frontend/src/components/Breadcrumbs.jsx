import React from "react";
import { Link } from "react-router-dom";

/**
 * items: [{ label, to? }] - the last item is treated as the current page
 * (no link). "Home" is always prepended automatically.
 */
const Breadcrumbs = ({ items = [] }) => {
  const trail = [{ label: "Home", to: "/" }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-xs tracking-wide text-gray-500 uppercase">
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((item, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300">/</span>}
              {item.to && !isLast ? (
                <Link to={item.to} className="hover:text-ehsar-gold transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-ehsar-black" : ""}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
