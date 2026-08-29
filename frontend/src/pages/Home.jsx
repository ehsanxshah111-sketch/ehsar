import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import BannerCarousel from "../components/BannerCarousel.jsx";
import CategoryTilesSection from "../components/CategoryTilesSection.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductGridSkeleton from "../components/ProductGridSkeleton.jsx";

const Home = () => {
  const [banners, setBanners] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categoryTiles, setCategoryTiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [bannerRes, productRes, tileRes] = await Promise.all([
          api.get("/banners"),
          api.get("/products", { params: { featured: true } }),
          api.get("/category-tiles"),
        ]);
        setBanners(bannerRes.data);
        setFeatured(productRes.data);
        setCategoryTiles(tileRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <BannerCarousel banners={banners} />

      <section className="container-ehsar py-20">
        <h2 className="section-title">Featured Pieces</h2>
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      <CategoryTilesSection tiles={categoryTiles} />

      <section className="container-ehsar py-20 text-center">
        <h2 className="section-title">The Ehsar Promise</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-4xl mx-auto text-sm text-gray-600">
          <div>
            <h3 className="font-display text-lg mb-2 text-ehsar-black">Considered Design</h3>
            <p>Every piece is designed to last beyond a single season.</p>
          </div>
          <div>
            <h3 className="font-display text-lg mb-2 text-ehsar-black">Quality Materials</h3>
            <p>Sourced fabrics chosen for comfort, durability and feel.</p>
          </div>
          <div>
            <h3 className="font-display text-lg mb-2 text-ehsar-black">Secure Payments</h3>
            <p>Verified JazzCash, Easypaisa and bank transfer payments on every order.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
