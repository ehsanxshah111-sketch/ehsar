import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Respect prefers-reduced-motion - if someone's asked their OS to minimize
// motion, skip the 3D tilt/parallax entirely rather than force it on them.
const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// A single category tile: it flips up into place (3D rotate + fade) the
// first time it scrolls into view, and its image drifts slightly (a
// parallax effect) while the tile is anywhere on screen, for a subtle
// sense of depth. Purely visual - doesn't change the tile's link/click
// behavior at all.
const CategoryTile3D = ({ tile, index }) => {
  const linkRef = useRef(null);
  const parallaxRef = useRef(null);
  const [visible, setVisible] = useState(prefersReducedMotion);

  // Reveal-on-scroll: flip from a tilted, faded-out state to flat/full
  // opacity the first time the tile enters the viewport. Disconnects after
  // firing once so it doesn't re-trigger every time you scroll past it.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = linkRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Parallax: shift the image up/down based on how far the tile is from
  // the vertical center of the viewport, so it drifts at a different rate
  // than the page scrolls past it. Scaled up 1.15x so the drift never
  // reveals empty space at the tile's edges.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const wrapper = linkRef.current;
    const layer = parallaxRef.current;
    if (!wrapper || !layer) return;

    let ticking = false;
    const update = () => {
      const rect = wrapper.getBoundingClientRect();
      const viewportH = window.innerHeight || 1;
      const progress = (rect.top + rect.height / 2 - viewportH / 2) / viewportH;
      const shift = Math.max(-1, Math.min(1, progress)) * 40;
      layer.style.transform = `translateY(${shift}px) scale(1.15)`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div style={{ perspective: "1200px" }}>
      <Link
        ref={linkRef}
        to={tile.linkUrl || "/shop"}
        className="relative group h-[50vh] overflow-hidden block"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible
            ? "rotateX(0deg) translateY(0) scale(1)"
            : "rotateX(20deg) translateY(60px) scale(0.94)",
          transition: `opacity 0.8s ease-out ${index * 0.12}s, transform 0.8s ease-out ${index * 0.12}s`,
        }}
      >
        <div ref={parallaxRef} className="absolute inset-0">
          <img
            src={tile.image}
            alt={tile.label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <span className="text-white text-2xl tracking-widest2 uppercase border-b border-white pb-1">
            {tile.label}
          </span>
        </div>
      </Link>
    </div>
  );
};

const CategoryTilesSection = ({ tiles }) => (
  <section className="grid grid-cols-1 sm:grid-cols-2">
    {tiles.map((tile, i) => (
      <CategoryTile3D key={tile._id} tile={tile} index={i} />
    ))}
  </section>
);

export default CategoryTilesSection;
