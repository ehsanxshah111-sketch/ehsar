import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import ProductGridSkeleton from "../components/ProductGridSkeleton.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [maxPrice, setMaxPrice] = useState("");

  const category = searchParams.get("category") || "";
  const type = searchParams.get("type") || "";
  const search = searchParams.get("search") || "";
  const sale = searchParams.get("sale") || "";
  const isNew = searchParams.get("isNew") || "";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category) params.category = category;
        if (type) params.type = type;
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
  }, [category, type, search, sale, isNew]);

  const heading = useMemo(() => {
    if (search) return `Results for "${search}"`;
    if (sale) return "Sale";
    if (isNew) return "New In";
    if (category) {
      const catLabel = category === "men" ? "Men" : "Women";
      const typeLabel = type ? ` ${type.charAt(0).toUpperCase()}${type.slice(1)}` : "";
      return `${catLabel}${typeLabel}`;
    }
    return "All Products";
  }, [category, type, search, sale, isNew]);

  const setCategory = (value) => {
    const params = Object.fromEntries(searchParams);
    if (value) params.category = value;
    else delete params.category;
    delete params.search;
    delete params.type;
    setSearchParams(params);
  };

  const setType = (value) => {
    const params = Object.fromEntries(searchParams);
    if (value) params.type = value;
    else delete params.type;
    setSearchParams(params);
  };

  const visibleProducts = useMemo(() => {
    let list = [...products];

    if (maxPrice) {
      const limit = Number(maxPrice);
      list = list.filter((p) => (p.discountPrice || p.price) <= limit);
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case "price-desc":
        list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // "newest" - backend already sorts by createdAt desc, keep as-is
        break;
    }

    return list;
  }, [products, sort, maxPrice]);

  return (
    <div className="container-ehsar py-14">
      <Breadcrumbs items={category ? [{ label: "Shop", to: "/shop" }, { label: heading }] : [{ label: heading }]} />
      <h1 className="section-title">{heading}</h1>

      <div className="flex justify-center gap-6 mb-4 text-sm tracking-widest2 uppercase">
        <button onClick={() => setCategory("")} className={!category ? "text-ehsar-gold" : ""}>All</button>
        <button onClick={() => setCategory("women")} className={category === "women" ? "text-ehsar-gold" : ""}>Women</button>
        <button onClick={() => setCategory("men")} className={category === "men" ? "text-ehsar-gold" : ""}>Men</button>
      </div>

      <div className="flex justify-center gap-5 mb-8 text-xs tracking-wide uppercase text-gray-500">
        <button onClick={() => setType("")} className={!type ? "text-ehsar-gold" : ""}>All Types</button>
        <button onClick={() => setType("clothing")} className={type === "clothing" ? "text-ehsar-gold" : ""}>Clothing</button>
        <button onClick={() => setType("shoes")} className={type === "shoes" ? "text-ehsar-gold" : ""}>Shoes</button>
        <button onClick={() => setType("watches")} className={type === "watches" ? "text-ehsar-gold" : ""}>Watches</button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 border-y border-gray-200 py-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          {loading ? "Loading..." : `${visibleProducts.length} item${visibleProducts.length !== 1 ? "s" : ""}`}
        </p>
        <div className="flex items-center gap-4">
          <label className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2">
            Under
            <input
              type="number"
              min="0"
              placeholder="Any price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-24 border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-ehsar-black"
            />
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 px-2 py-1 text-xs uppercase tracking-wide focus:outline-none focus:border-ehsar-black bg-white"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <ProductGridSkeleton />
      ) : visibleProducts.length === 0 ? (
        <p className="text-center text-gray-400 py-20">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {visibleProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
