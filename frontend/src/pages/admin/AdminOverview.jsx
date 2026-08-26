import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { formatPKR } from "../../utils/currency.js";
import { ADMIN_DASHBOARD_PATH } from "../../adminConfig.js";

const AdminOverview = () => {
  const [stats, setStats] = useState({ products: 0, men: 0, women: 0, banners: 0 });
  const [payments, setPayments] = useState({ pending: 0, revenue: 0 });
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoadError("");
      const [productsRes, bannersRes, summaryRes] = await Promise.allSettled([
        api.get("/products"),
        api.get("/banners/all"),
        api.get("/orders/summary"),
      ]);

      if (productsRes.status === "fulfilled") {
        const products = productsRes.value.data;
        setStats((prev) => ({
          ...prev,
          products: products.length,
          men: products.filter((p) => p.category === "men").length,
          women: products.filter((p) => p.category === "women").length,
        }));
      }

      if (bannersRes.status === "fulfilled") {
        setStats((prev) => ({ ...prev, banners: bannersRes.value.data.length }));
      }

      if (summaryRes.status === "fulfilled") {
        setPayments({
          pending: summaryRes.value.data.pendingPayments,
          revenue: summaryRes.value.data.verifiedRevenue,
        });
      }

      const failed = [productsRes, bannersRes, summaryRes].find((r) => r.status === "rejected");
      if (failed) {
        console.error(failed.reason);
        const status = failed.reason?.response?.status;
        if (status === 401) {
          setLoadError("Your admin session has expired. Please log out and log back in.");
        } else {
          setLoadError("Some dashboard data failed to load. Check your connection and try refreshing.");
        }
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

      {loadError && (
        <div className="admin-card p-4 mb-6 border-l-4 border-l-red-500 bg-red-50 text-sm text-red-700">
          {loadError}
        </div>
      )}

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
