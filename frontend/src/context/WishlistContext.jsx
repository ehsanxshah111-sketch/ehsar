import React, { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("ehsar_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("ehsar_wishlist", JSON.stringify(items));
  }, [items]);

  const isWishlisted = (productId) => items.some((i) => i.productId === productId);

  const toggleWishlist = (product) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.productId === product._id);
      if (exists) return prev.filter((i) => i.productId !== product._id);
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          discountPrice: product.discountPrice,
          isOnSale: product.isOnSale,
          image: product.images?.[0] || "",
        },
      ];
    });
  };

  const removeFromWishlist = (productId) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  return (
    <WishlistContext.Provider
      value={{ items, count: items.length, isWishlisted, toggleWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
