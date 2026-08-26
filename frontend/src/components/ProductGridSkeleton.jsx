import React from "react";

const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-ehsar-cream aspect-[3/4]" />
        <div className="pt-3 flex flex-col items-center gap-2">
          <div className="h-3 w-2/3 bg-ehsar-cream rounded" />
          <div className="h-3 w-1/3 bg-ehsar-cream rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default ProductGridSkeleton;
