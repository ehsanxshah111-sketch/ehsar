import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import customerApi from "../api/customerAxios.js";
import { formatPKR } from "../utils/currency.js";

const STEPS = ["Pending", "Processing", "Shipped", "Delivered"];

const PAYMENT_LABELS = {
  JazzCash: "JazzCash",
  Easypaisa: "Easypaisa",
  BankTransfer: "Bank Transfer",
  COD: "Cash on Delivery",
};

const PaymentBadge = ({ order }) => {
  const colors = {
    Submitted: "text-yellow-700",
    Verified: "text-green-700",
    Rejected: "text-red-600",
  };
  const text = {
    Submitted: order.paymentMethod === "COD" ? "Pay on Delivery" : "Payment Pending Verification",
    Verified: order.paymentMethod === "COD" ? "Cash Received" : "Payment Verified",
    Rejected: "Payment Rejected",
  };
  return (
    <span className={`text-xs ${colors[order.paymentStatus] || "text-gray-500"}`}>
      {PAYMENT_LABELS[order.paymentMethod]} · {text[order.paymentStatus] || order.paymentStatus}
    </span>
  );
};

const OrderProgress = ({ status }) => {
  if (status === "Cancelled") {
    return <p className="text-sm text-red-600 uppercase tracking-widest2 mt-4">Cancelled</p>;
  }
  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center mt-6 mb-2">
      {STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                i <= currentIndex ? "bg-ehsar-black text-white" : "bg-gray-200 text-gray-400"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-[10px] uppercase tracking-wide mt-2 ${
                i <= currentIndex ? "text-ehsar-black" : "text-gray-400"
              }`}
            >
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-2 ${i < currentIndex ? "bg-ehsar-black" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    customerApi
      .get("/orders/my")
      .then(({ data }) => setOrders(data))
      .catch((err) => setError(err?.response?.data?.message || "Could not load your orders."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="container-ehsar py-24 text-center text-gray-500">Loading your orders…</div>;
  }

  if (error) {
    return <div className="container-ehsar py-24 text-center text-red-600">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="container-ehsar py-24 text-center">
        <h1 className="section-title">No Orders Yet</h1>
        <Link to="/shop" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-ehsar py-14">
      <h1 className="text-2xl font-display uppercase tracking-widest2 mb-10">My Orders</h1>
      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order._id} className="admin-card p-6">
            <div className="flex flex-wrap justify-between items-baseline gap-2 mb-2">
              <span className="text-xs text-gray-500">
                Order #{order._id.slice(-6).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString()}
              </span>
              <span className="text-sm font-medium">{formatPKR(order.totalAmount)}</span>
            </div>
            {order.couponCode && (
              <p className="text-xs text-green-700 mb-2">
                Coupon {order.couponCode} applied (-{formatPKR(order.discountAmount)})
              </p>
            )}

            <PaymentBadge order={order} />

            <OrderProgress status={order.status} />

            <div className="mt-6 space-y-3 border-t border-gray-200 pt-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3 items-center text-sm">
                  <div className="w-12 h-16 bg-ehsar-cream overflow-hidden shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p>{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.size && `Size: ${item.size}`} {item.color && ` · ${item.color}`} · Qty {item.qty}
                    </p>
                  </div>
                  <span>{formatPKR(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
