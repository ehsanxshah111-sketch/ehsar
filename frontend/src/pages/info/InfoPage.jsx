import React from "react";

// Shared shell for the simple, mostly-static footer pages (About,
// Sustainability, Careers, Shipping & Returns). Keeps their heading/spacing
// consistent without repeating the same wrapper markup five times.
const InfoPage = ({ title, children }) => (
  <div className="container-ehsar py-20 max-w-3xl mx-auto">
    <h1 className="text-3xl font-display uppercase tracking-widest2 mb-8">{title}</h1>
    <div className="prose prose-sm text-gray-600 leading-relaxed space-y-4">{children}</div>
  </div>
);

export default InfoPage;
