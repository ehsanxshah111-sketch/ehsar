import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const sale = searchParams.get("sale") || "";
  const isNew = searchParams.get("isNew") || "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category) params.category = category;
        if (search) params.search = search;
        if (sale) params.sale = sale;
        if (isNew) params.isNew = isNew;
        const { data } = await api.get("/products", { params });
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category, search, sale, isNew]);

  const heading = useMemo(() => {
    if (search) return `Results for "${search}"`;
    if (sale) return "Sale";
    if (isNew) return "New In";
    if (category) return category === "men" ? "Men" : "Women";
    return "All Products";
  }, [category, search, sale, isNew]);

  const setCategory = (value) => {
    const params = Object.fromEntries(searchParams);
    if (value) params.category = value;
    else delete params.category;
    delete params.search;
    setSearchParams(params);
  };

  return (
    <div className="container-ehsar py-14">
      <h1 className="section-title">{heading}</h1>

      <div className="flex justify-center gap-6 mb-10 text-sm tracking-widest2 uppercase">
        <button onClick={() => setCategory("")} className={!category ? "text-ehsar-gold" : ""}>All</button>
        <button onClick={() => setCategory("women")} className={category === "women" ? "text-ehsar-gold" : ""}>Women</button>
        <button onClick={() => setCategory("men")} className={category === "men" ? "text-ehsar-gold" : ""}>Men</button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-20">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-400 py-20">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
