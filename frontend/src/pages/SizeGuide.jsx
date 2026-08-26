import React from "react";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

const chart = [
  { size: "S", chest: "36-38", waist: "30-32", length: "27" },
  { size: "M", chest: "39-41", waist: "33-35", length: "28" },
  { size: "L", chest: "42-44", waist: "36-38", length: "29" },
  { size: "XL", chest: "45-47", waist: "39-41", length: "30" },
];

const SizeGuide = () => (
  <div className="container-ehsar py-14">
    <Breadcrumbs items={[{ label: "Size Guide" }]} />
    <h1 className="section-title">Size Guide</h1>

    <p className="text-center text-gray-500 text-sm max-w-xl mx-auto mb-10">
      All measurements are in inches and are meant as a general guide — for the
      most accurate fit, compare against a similar garment you already own.
      Between sizes? We recommend sizing up.
    </p>

    <div className="max-w-2xl mx-auto overflow-x-auto">
      <table className="w-full text-sm border border-gray-200">
        <thead>
          <tr className="bg-ehsar-cream text-xs uppercase tracking-widest2">
            <th className="p-3 text-left">Size</th>
            <th className="p-3 text-left">Chest (in)</th>
            <th className="p-3 text-left">Waist (in)</th>
            <th className="p-3 text-left">Length (in)</th>
          </tr>
        </thead>
        <tbody>
          {chart.map((row) => (
            <tr key={row.size} className="border-t border-gray-200">
              <td className="p-3 font-medium">{row.size}</td>
              <td className="p-3">{row.chest}</td>
              <td className="p-3">{row.waist}</td>
              <td className="p-3">{row.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <p className="text-center text-xs text-gray-400 mt-8">
      Shopping for shoes or watches? Those will use their own size charts —
      check the product page once that collection is live.
    </p>
  </div>
);

export default SizeGuide;
