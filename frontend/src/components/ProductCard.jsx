import React from "react";
import { Link } from "react-router-dom";
import { formatPKR } from "../utils/currency.js";

const ProductCard = ({ product }) => {
  const hasDiscount = product.isOnSale && product.discountPrice;

  return (
    <Link to={`/product/${product._id}`} className="group block">
      <div className="relative overflow-hidden bg-ehsar-cream aspect-[3/4]">
        <img
          src={product.images?.[0] || "https://via.placeholder.com/600x800?text=Ehsar"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
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
