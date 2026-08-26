import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { formatPKR } from "../../utils/currency.js";
import { ADMIN_DASHBOARD_PATH } from "../../adminConfig.js";

const AdminOverview = () => {
  const [stats, setStats] = useState({ products: 0, men: 0, women: 0, banners: 0 });
  const [payments, setPayments] = useState({ pending: 0, revenue: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [products, banners, orders] = await Promise.all([
          api.get("/products"),
          api.get("/banners/all"),
          api.get("/orders"),
        ]);
        setStats({
          products: products.data.length,
          men: products.data.filter((p) => p.category === "men").length,
          women: products.data.filter((p) => p.category === "women").length,
          banners: banners.data.length,
        });
        const pending = orders.data.filter((o) => o.paymentStatus === "Submitted").length;
        const revenue = orders.data
          .filter((o) => o.paymentStatus === "Verified")
          .reduce((sum, o) => sum + o.totalAmount, 0);
        setPayments({ pending, revenue });
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

      {payments.pending > 0 && (
        <Link
          to={`${ADMIN_DASHBOARD_PATH}/payments`}
          className="block admin-card p-5 mb-8 border-l-4 border-l-yellow-500 hover:bg-gray-50"
        >
          <p className="text-sm font-medium">
            {payments.pending} payment{payments.pending === 1 ? "" : "s"} waiting on your review
          </p>
          <p className="text-xs text-gray-500 mt-1">Click to open Payments →</p>
        </Link>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="admin-card p-6">
          <p className="text-3xl font-display">{formatPKR(payments.revenue)}</p>
          <p className="text-xs tracking-widest2 uppercase text-gray-500 mt-2">Revenue Received</p>
        </div>
        {cards.map((c) => (
          <div key={c.label} className="admin-card p-6">
            <p className="text-3xl font-display">{c.value}</p>
            <p className="text-xs tracking-widest2 uppercase text-gray-500 mt-2">{c.label}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 mt-10">
        Use the sidebar to manage products, orders, payments, banners, and your admin account.
      </p>
    </div>
  );
};

export default AdminOverview;
