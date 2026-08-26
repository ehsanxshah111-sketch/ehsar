import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { formatPKR } from "../../utils/currency.js";
import { buildWhatsAppLink } from "../../utils/whatsapp.js";

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const statusColor = (status) => {
  switch (status) {
    case "Delivered": return "text-green-700";
    case "Cancelled": return "text-red-600";
    case "Shipped": return "text-blue-700";
    case "Processing": return "text-yellow-700";
    default: return "text-gray-500";
  }
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const openScreenshot = async (orderId) => {
    setPreviewLoading(true);
    setPreviewImage("");
    try {
      const { data } = await api.get(`/orders/${orderId}/screenshot`);
      setPreviewImage(data.paymentScreenshot);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load the screenshot");
      setPreviewImage(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

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

  const handleDelete = async (orderId) => {
    if (!window.confirm("Delete this order permanently? This can't be undone.")) return;
    setUpdatingId(orderId);
    try {
      await api.delete(`/orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete order");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p className="text-gray-500">Loading orders…</p>;

  return (
    <div>
      <h1 className="text-2xl font-display uppercase tracking-widest2 mb-6">Orders</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders placed yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="admin-card p-5">
              <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                <div>
                  <p className="text-sm font-medium">
                    #{order._id.slice(-6).toUpperCase()} — {order.user?.name || "Unknown customer"}
                  </p>
                  <p className="text-xs text-gray-500">{order.user?.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPKR(order.totalAmount)}</p>
                  <p className={`text-xs uppercase tracking-wide ${statusColor(order.status)}`}>
                    {order.status}
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                {order.items.map((item, i) => (
                  <div key={i}>
                    {item.qty} × {item.name} {item.size && `(${item.size})`}
                  </div>
                ))}
              </div>

              <div className="text-xs text-gray-500 mb-3">
                Ship to: {order.shippingAddress?.fullName}, House {order.shippingAddress?.houseNumber},{" "}
                {order.shippingAddress?.street}, {order.shippingAddress?.address},{" "}
                {order.shippingAddress?.city} · {order.shippingAddress?.phone}
              </div>

              <div className="border border-gray-200 p-3 mb-3 text-xs space-y-2">
                <p>
                  <span className="text-gray-500">Payment method:</span>{" "}
                  <span className="font-medium">
                    {order.paymentMethod === "BankTransfer" ? "Bank Transfer" : order.paymentMethod}
                  </span>
                  <span
                    className={`ml-2 uppercase tracking-wide ${
                      order.paymentStatus === "Verified"
                        ? "text-green-700"
                        : order.paymentStatus === "Rejected"
                        ? "text-red-600"
                        : "text-yellow-700"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </p>

                {order.transactionId && (
                  <p>
                    <span className="text-gray-500">Transaction ID:</span> {order.transactionId}
                  </p>
                )}
                {/* paymentScreenshot is deliberately left out of the list
                    response (see backend route) so this list loads fast -
                    every order requires one, so it's fetched only when
                    actually clicked. */}
                <button
                  onClick={() => openScreenshot(order._id)}
                  className="underline text-gray-600 block"
                >
                  View Payment Screenshot
                </button>
                <div className="flex gap-2 pt-1">
                  <button
                    disabled={updatingId === order._id || order.paymentStatus === "Verified"}
                    onClick={() => handlePaymentStatus(order._id, "Verified")}
                    className="text-green-700 underline disabled:opacity-40"
                  >
                    Mark Verified
                  </button>
                  <button
                    disabled={updatingId === order._id || order.paymentStatus === "Rejected"}
                    onClick={() => handlePaymentStatus(order._id, "Rejected")}
                    className="text-red-600 underline disabled:opacity-40"
                  >
                    Mark Rejected
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Update status:</label>
                  <select
                    className="border border-gray-300 text-sm px-2 py-1"
                    value={order.status}
                    disabled={updatingId === order._id}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  {order.shippingAddress?.phone && (
                    <a
                      href={buildWhatsAppLink(order)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-green-700 underline"
                    >
                      WhatsApp Customer
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(order._id)}
                    disabled={updatingId === order._id}
                    className="text-xs text-red-600 underline disabled:opacity-50"
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(previewImage !== null || previewLoading) && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6"
          onClick={() => {
            setPreviewImage(null);
            setPreviewLoading(false);
          }}
        >
          {previewLoading ? (
            <p className="text-white text-sm">Loading screenshot…</p>
          ) : (
            <img
              src={previewImage}
              alt="Payment proof"
              className="max-h-[85vh] max-w-full border-4 border-white"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
