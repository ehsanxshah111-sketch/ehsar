import React from "react";
import { Link } from "react-router-dom";
import { formatPKR } from "../utils/currency.js";
import { useWishlist } from "../context/WishlistContext.jsx";

const ProductCard = ({ product }) => {
  const hasDiscount = product.isOnSale && product.discountPrice;
  const { isWishlisted, toggleWishlist } = useWishlist();
  const saved = isWishlisted(product._id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link to={`/product/${product._id}`} className="group block">
      <div className="relative overflow-hidden bg-ehsar-cream aspect-[3/4]">
        <img
          src={product.images?.[0] || "https://via.placeholder.com/600x800?text=Ehsar"}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <button
          onClick={handleWishlist}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-300"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill={saved ? "#b08d57" : "none"}
            stroke={saved ? "#b08d57" : "currentColor"}
            strokeWidth="1.5"
          >
            <path d="M12 21s-7.5-4.6-10.2-9.1C.2 8.9 1.4 5 5 4.2c2.1-.5 4 .5 5 2.3.9-1.8 2.9-2.8 5-2.3 3.6.8 4.8 4.7 3.2 7.7C19.5 16.4 12 21 12 21z" />
          </svg>
        </button>

        {product.isNew && (
          <span className="absolute top-3 left-3 bg-ehsar-black text-white text-[10px] tracking-widest2 uppercase px-2 py-1">
            New
          </span>
        )}
        {hasDiscount && (
          <span className="absolute top-3 right-3 bg-ehsar-gold text-white text-[10px] tracking-widest2 uppercase px-2 py-1">
            Sale
          </span>
        )}
      </div>
      <div className="pt-3 text-center">
        <h3 className="text-sm uppercase tracking-wide">{product.name}</h3>
        <div className="mt-1 text-sm">
          {hasDiscount ? (
            <>
              <span className="line-through text-gray-400 mr-2">{formatPKR(product.price)}</span>
              <span className="text-ehsar-gold">{formatPKR(product.discountPrice)}</span>
            </>
          ) : (
            <span>{formatPKR(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
