import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import customerApi from "../api/customerAxios.js";
import { formatPKR } from "../utils/currency.js";

const MAX_SCREENSHOT_BYTES = 1_000_000; // ~1MB, matches the backend cap
const PAYMENT_METHODS = ["JazzCash", "Easypaisa", "BankTransfer"];

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });

const SETTINGS_KEY = { JazzCash: "jazzCash", Easypaisa: "easypaisa", BankTransfer: "bankTransfer" };

const Cart = () => {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const { isAuthenticated, customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("JazzCash");
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [screenshotError, setScreenshotError] = useState("");
  const [shipping, setShipping] = useState({
    fullName: customer?.name || "",
    houseNumber: "",
    street: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  useEffect(() => {
    customerApi
      .get("/settings/payment")
      .then(({ data }) => setPaymentSettings(data))
      .catch(() => setPaymentSettings(null));
  }, []);

  const shippingCost = total >= 10000 ? 0 : 250;
  const grandTotal = total + shippingCost;

  const handleShippingChange = (e) => setShipping({ ...shipping, [e.target.name]: e.target.value });

  const handleScreenshotChange = async (e) => {
    const file = e.target.files?.[0];
    setScreenshotError("");
    setScreenshot("");
    if (!file) return;
    if (file.size > MAX_SCREENSHOT_BYTES) {
      setScreenshotError("Image is too large - please upload one under 1MB.");
      e.target.value = "";
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setScreenshot(base64);
    } catch {
      setScreenshotError("Could not read that image, please try another.");
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    if (!transactionId.trim()) {
      setError("Please enter the transaction ID after sending payment.");
      return;
    }
    if (!screenshot) {
      setError("Please upload a screenshot of the payment.");
      return;
    }

    setPlacing(true);
    try {
      await customerApi.post("/orders", {
        items: items.map((item) => ({
          product: item.productId || item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          size: item.size,
          color: item.color,
          qty: item.qty,
        })),
        shippingAddress: shipping,
        paymentMethod,
        transactionId,
        paymentScreenshot: screenshot,
      });
      setPlaced(true);
      clearCart();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (placed) {
    return (
      <div className="container-ehsar py-24 text-center">
        <h1 className="section-title">Thank You</h1>
        <p className="text-gray-600 mb-8">Your Ehsar order has been placed successfully.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/shop" className="btn-outline">Continue Shopping</Link>
          <Link to="/my-orders" className="btn-primary">Track My Order</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-ehsar py-24 text-center">
        <h1 className="section-title">Your Bag is Empty</h1>
        <Link to="/shop" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-ehsar py-14 grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-display uppercase tracking-widest2 mb-8">Shopping Bag</h1>
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.key} className="flex gap-4 border-b border-gray-200 pb-6">
              <div className="w-24 h-32 bg-ehsar-cream overflow-hidden shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="uppercase text-sm mb-1">{item.name}</h3>
                <p className="text-xs text-gray-500 mb-2">
                  {item.size && `Size: ${item.size}`} {item.color && ` · Color: ${item.color}`}
                </p>
                <p className="text-sm mb-3">{formatPKR(item.price)}</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateQty(item.key, parseInt(e.target.value) || 1)}
                    className="w-16 border border-gray-300 px-2 py-1 text-sm"
                  />
                  <button onClick={() => removeItem(item.key)} className="text-xs text-gray-500 underline">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card p-6 h-fit">
        <h2 className="text-lg font-display uppercase tracking-wide mb-6">Order Summary</h2>
        <div className="flex justify-between text-sm mb-3">
          <span>Subtotal</span>
          <span>{formatPKR(total)}</span>
        </div>
        <div className="flex justify-between text-sm mb-6 text-gray-500">
          <span>Shipping</span>
          <span>{shippingCost === 0 ? "Free" : formatPKR(shippingCost)}</span>
        </div>
        <div className="flex justify-between text-base font-medium border-t border-gray-200 pt-4 mb-6">
          <span>Total</span>
          <span>{formatPKR(grandTotal)}</span>
        </div>

        {!isAuthenticated ? (
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-3">Log in to check out and track this order.</p>
            <button
              onClick={() => navigate("/login", { state: { from: "/cart" } })}
              className="btn-primary w-full"
            >
              Log In to Checkout
            </button>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="space-y-3">
            <p className="text-xs tracking-widest2 uppercase text-gray-500 mb-1">Shipping Details</p>
            <input
              name="fullName"
              placeholder="Full Name"
              className="input-field"
              value={shipping.fullName}
              onChange={handleShippingChange}
              required
            />
            <div className="flex gap-3">
              <input
                name="houseNumber"
                placeholder="House No."
                className="input-field"
                value={shipping.houseNumber}
                onChange={handleShippingChange}
                required
              />
              <input
                name="street"
                placeholder="Street"
                className="input-field"
                value={shipping.street}
                onChange={handleShippingChange}
                required
              />
            </div>
            <input
              name="address"
              placeholder="Area / Address"
              className="input-field"
              value={shipping.address}
              onChange={handleShippingChange}
              required
            />
            <div className="flex gap-3">
              <input
                name="city"
                placeholder="City"
                className="input-field"
                value={shipping.city}
                onChange={handleShippingChange}
                required
              />
              <input
                name="postalCode"
                placeholder="Postal Code"
                className="input-field"
                value={shipping.postalCode}
                onChange={handleShippingChange}
              />
            </div>
            <input
              name="phone"
              placeholder="Phone"
              className="input-field"
              value={shipping.phone}
              onChange={handleShippingChange}
              required
            />

            <p className="text-xs tracking-widest2 uppercase text-gray-500 mb-1 pt-3">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`text-xs px-3 py-2 border ${
                    paymentMethod === method
                      ? "border-ehsar-black bg-ehsar-black text-white"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  {method === "BankTransfer" ? "Bank Transfer" : method}
                </button>
              ))}
            </div>

            {(() => {
              const settingsKey = SETTINGS_KEY[paymentMethod];
              const details = paymentSettings?.[settingsKey];
              return (
                <div className="bg-ehsar-cream p-4 text-xs space-y-2 mt-2">
                  {details ? (
                    <>
                      <p>
                        <strong>{details.accountTitle}</strong>
                        {details.bankName && ` · ${details.bankName}`}
                      </p>
                      <p className="font-mono text-sm">{details.accountNumber}</p>
                      {details.instructions && <p className="text-gray-500">{details.instructions}</p>}
                    </>
                  ) : (
                    <p className="text-gray-500">Loading payment details…</p>
                  )}

                  <input
                    name="transactionId"
                    placeholder="Transaction ID / Reference No."
                    className="input-field"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                  />

                  <div>
                    <label className="text-gray-500 block mb-1">Payment screenshot (required)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="text-xs"
                      required
                    />
                    {screenshotError && <p className="text-red-600 mt-1">{screenshotError}</p>}
                    {screenshot && <p className="text-green-700 mt-1">Screenshot attached ✓</p>}
                  </div>

                  <p className="text-gray-400 italic">
                    Your order will show as "Payment Pending Verification" until we confirm it.
                  </p>
                </div>
              );
            })()}

            {error && <p className="text-red-600 text-xs">{error}</p>}

            <button type="submit" disabled={placing} className="btn-primary w-full disabled:opacity-50">
              {placing ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Cart;
