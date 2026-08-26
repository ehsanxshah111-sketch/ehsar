import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { formatPKR } from "../../utils/currency.js";
import { buildWhatsAppLink } from "../../utils/whatsapp.js";
import { ADMIN_DASHBOARD_PATH } from "../../adminConfig.js";

const PAYMENT_LABELS = {
  JazzCash: "JazzCash",
  Easypaisa: "Easypaisa",
  BankTransfer: "Bank Transfer",
};

const TABS = ["Needs Review", "Verified", "Rejected", "All"];

// Same 3 states as the Order model's paymentStatus, just filtered/sorted
// with pending-review payments surfaced first - that's the whole point of
// this page existing separately from the general Orders list.
const matchesTab = (order, tab) => {
  if (tab === "Needs Review") return order.paymentStatus === "Submitted";
  if (tab === "Verified") return order.paymentStatus === "Verified";
  if (tab === "Rejected") return order.paymentStatus === "Rejected";
  return true;
};

const Payments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [tab, setTab] = useState("Needs Review");
  const [previewImage, setPreviewImage] = useState(null);

  const loadOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handlePaymentStatus = async (orderId, paymentStatus) => {
    setUpdatingId(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}/payment-status`, { paymentStatus });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, ...data } : o)));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update payment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.paymentStatus === "Submitted");
    const verified = orders.filter((o) => o.paymentStatus === "Verified");
    const rejected = orders.filter((o) => o.paymentStatus === "Rejected");
    const revenue = verified.reduce((sum, o) => sum + o.totalAmount, 0);
    return { pending, verified, rejected, revenue };
  }, [orders]);

  // Newest-first within whichever tab is selected, so a fresh submission
  // that needs review always lands at the top of "Needs Review".
  const visibleOrders = useMemo(
    () =>
      orders
        .filter((o) => matchesTab(o, tab))
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders, tab]
  );

  if (loading) return <p className="text-gray-500">Loading payments…</p>;

  return (
    <div>
      <h1 className="text-2xl font-display uppercase tracking-widest2 mb-6">Payments</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="admin-card p-6">
          <p className="text-3xl font-display text-yellow-700">{stats.pending.length}</p>
          <p className="text-xs tracking-widest2 uppercase text-gray-500 mt-2">Needs Review</p>
        </div>
        <div className="admin-card p-6">
          <p className="text-3xl font-display text-green-700">{stats.verified.length}</p>
          <p className="text-xs tracking-widest2 uppercase text-gray-500 mt-2">Verified</p>
        </div>
        <div className="admin-card p-6">
          <p className="text-3xl font-display text-red-600">{stats.rejected.length}</p>
          <p className="text-xs tracking-widest2 uppercase text-gray-500 mt-2">Rejected</p>
        </div>
        <div className="admin-card p-6">
          <p className="text-3xl font-display">{formatPKR(stats.revenue)}</p>
          <p className="text-xs tracking-widest2 uppercase text-gray-500 mt-2">Revenue Received</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs uppercase tracking-widest2 border-b-2 -mb-px ${
              tab === t ? "border-ehsar-black text-ehsar-black" : "border-transparent text-gray-400"
            }`}
          >
            {t}
            {t === "Needs Review" && stats.pending.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-white text-[9px]">
                {stats.pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {visibleOrders.length === 0 ? (
        <p className="text-gray-500">Nothing here.</p>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => (
            <div
              key={order._id}
              className={`admin-card p-5 ${
                order.paymentStatus === "Submitted" ? "border-l-4 border-l-yellow-500" : ""
              }`}
            >
              <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                <div>
                  <Link
                    to={`${ADMIN_DASHBOARD_PATH}/orders`}
                    className="text-sm font-medium hover:underline"
                  >
                    Order #{order._id.slice(-6).toUpperCase()}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {order.user?.name || "Unknown customer"} · {order.user?.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPKR(order.totalAmount)}</p>
                  <p className="text-xs text-gray-500">
                    {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <span className="text-gray-500">
                  Transaction ID: <span className="text-gray-800 font-medium">{order.transactionId}</span>
                </span>
                {order.paymentScreenshot && (
                  <button
                    onClick={() => setPreviewImage(order.paymentScreenshot)}
                    className="underline text-gray-600"
                  >
                    View Screenshot
                  </button>
                )}
                {order.shippingAddress?.phone && (
                  <a
                    href={buildWhatsAppLink(order)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-green-700 underline"
                  >
                    WhatsApp Customer
                  </a>
                )}
                <span
                  className={`uppercase tracking-wide ${
                    order.paymentStatus === "Verified"
                      ? "text-green-700"
                      : order.paymentStatus === "Rejected"
                      ? "text-red-600"
                      : "text-yellow-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>

              {order.paymentStatus === "Submitted" && (
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
                  <button
                    disabled={updatingId === order._id}
                    onClick={() => handlePaymentStatus(order._id, "Verified")}
                    className="btn-primary text-xs px-4 py-2 disabled:opacity-50"
                  >
                    Mark Payment Received
                  </button>
                  <button
                    disabled={updatingId === order._id}
                    onClick={() => handlePaymentStatus(order._id, "Rejected")}
                    className="text-xs text-red-600 underline disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              )}

              {order.paymentStatus === "Verified" && order.shippingAddress?.phone && (
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
                  <a
                    href={buildWhatsAppLink(order)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary text-xs px-4 py-2 bg-green-700 border-green-700 hover:bg-green-800"
                  >
                    Send Confirmation on WhatsApp
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Payment proof"
            className="max-h-[85vh] max-w-full border-4 border-white"
          />
        </div>
      )}
    </div>
  );
};

export default Payments;
