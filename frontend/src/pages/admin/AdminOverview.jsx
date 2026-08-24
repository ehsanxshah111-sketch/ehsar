import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

const AdminOverview = () => {
  const [stats, setStats] = useState({ products: 0, men: 0, women: 0, banners: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [products, banners] = await Promise.all([
          api.get("/products"),
          api.get("/banners/all"),
        ]);
        setStats({
          products: products.data.length,
          men: products.data.filter((p) => p.category === "men").length,
          women: products.data.filter((p) => p.category === "women").length,
          banners: banners.data.length,
        });
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const cards = [
    { label: "Total Products", value: stats.products },
    { label: "Men's Items", value: stats.men },
    { label: "Women's Items", value: stats.women },
    { label: "Banners", value: stats.banners },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display uppercase tracking-wide mb-8">Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div key={c.label} className="admin-card p-6">
            <p className="text-3xl font-display">{c.value}</p>
            <p className="text-xs tracking-widest2 uppercase text-gray-500 mt-2">{c.label}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-10">
        Use the sidebar to manage products, banners, and your admin account.
      </p>
    </div>
  );
};

export default AdminOverview;
