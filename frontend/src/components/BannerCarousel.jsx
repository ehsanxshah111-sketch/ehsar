import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BannerCarousel = ({ banners }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length < 2) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) {
    return (
      <div className="w-full h-[70vh] bg-ehsar-beige flex items-center justify-center">
        <h1 className="text-4xl sm:text-6xl font-display tracking-widest2 uppercase">Ehsar</h1>
      </div>
    );
  }

  const banner = banners[index];

  return (
    <div className="relative w-full h-[70vh] overflow-hidden bg-ehsar-black">
      {banners.map((b, i) => (
        <div
          key={b._id || i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={b.image}
            alt={b.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ))}

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-6">
        {banner.promotionText && (
          <span className="text-xs sm:text-sm tracking-widest2 uppercase text-ehsar-gold mb-4">
            {banner.promotionText}
          </span>
        )}
        <h1 className="text-4xl sm:text-6xl font-display tracking-widest2 uppercase mb-3">
          {banner.title}
        </h1>
        {banner.subtitle && (
          <p className="text-sm sm:text-base tracking-wide mb-8 max-w-md">{banner.subtitle}</p>
        )}
        <Link to={banner.linkUrl || "/shop"} className="btn-primary bg-white text-ehsar-black hover:bg-ehsar-gold hover:text-white">
          {banner.buttonText || "Shop Now"}
        </Link>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === index ? "bg-white" : "bg-white/40"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
