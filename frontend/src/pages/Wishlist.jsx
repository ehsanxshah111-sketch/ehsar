import React from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext.jsx";
import { formatPKR } from "../utils/currency.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlist();

  return (
    <div className="container-ehsar py-14">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <h1 className="section-title">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-6">You haven't saved anything yet.</p>
          <Link to="/shop" className="btn-primary">Explore the Shop</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((p) => {
            const hasDiscount = p.isOnSale && p.discountPrice;
            return (
              <div key={p.productId} className="group relative">
                <Link to={`/product/${p.productId}`} className="block">
                  <div className="relative overflow-hidden bg-ehsar-cream aspect-[3/4]">
                    <img
                      src={p.image || "https://via.placeholder.com/600x800?text=Ehsar"}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="pt-3 text-center">
                    <h3 className="text-sm uppercase tracking-wide">{p.name}</h3>
                    <div className="mt-1 text-sm">
                      {hasDiscount ? (
                        <>
                          <span className="line-through text-gray-400 mr-2">{formatPKR(p.price)}</span>
                          <span className="text-ehsar-gold">{formatPKR(p.discountPrice)}</span>
                        </>
                      ) : (
                        <span>{formatPKR(p.price)}</span>
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => removeFromWishlist(p.productId)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm text-gray-500 hover:text-ehsar-black"
                  aria-label="Remove from wishlist"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
