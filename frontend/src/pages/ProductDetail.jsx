import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        setSize(data.sizes?.[0] || "");
        setColor(data.colors?.[0] || "");
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id]);

  if (!product) return <div className="container-ehsar py-24 text-center text-gray-400">Loading...</div>;

  const hasDiscount = product.isOnSale && product.discountPrice;
  const images = product.images?.length ? product.images : ["https://via.placeholder.com/800x1000?text=Ehsar"];

  const handleAdd = () => {
    addItem(product, size, color, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container-ehsar py-14 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <div className="aspect-[3/4] bg-ehsar-cream overflow-hidden mb-4">
          <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
        </div>
        {images.length > 1 && (
          <div className="flex gap-3">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-20 overflow-hidden border ${activeImg === i ? "border-ehsar-black" : "border-transparent"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-md">
        <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wide mb-3">{product.name}</h1>
        <div className="mb-6 text-lg">
          {hasDiscount ? (
            <>
              <span className="line-through text-gray-400 mr-3">${product.price}</span>
              <span className="text-ehsar-gold">${product.discountPrice}</span>
            </>
          ) : (
            <span>${product.price}</span>
          )}
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-8">{product.description}</p>

        {product.sizes?.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs tracking-widest2 uppercase text-gray-500 mb-2">Size</h4>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-11 h-11 border text-sm ${size === s ? "border-ehsar-black bg-ehsar-black text-white" : "border-gray-300"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.colors?.length > 0 && (
          <div className="mb-8">
            <h4 className="text-xs tracking-widest2 uppercase text-gray-500 mb-2">Color</h4>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`px-4 py-2 border text-sm ${color === c ? "border-ehsar-black bg-ehsar-black text-white" : "border-gray-300"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleAdd} className="btn-primary w-full mb-3">
          {added ? "Added to Bag ✓" : "Add to Bag"}
        </button>
        <button onClick={() => navigate("/cart")} className="btn-outline w-full">
          View Bag
        </button>

        <div className="mt-10 text-xs text-gray-500 leading-relaxed border-t border-gray-200 pt-6">
          <p>Free shipping on orders over $100.</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
