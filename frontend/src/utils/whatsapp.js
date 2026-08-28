import { formatPKR } from "./currency.js";

// Pakistani numbers are collected at checkout in local format (leading 0,
// 11 digits, e.g. "03001234567"). WhatsApp's wa.me links need the full
// international format with no leading 0 or symbols (e.g. "923001234567").
export const formatPhoneForWhatsApp = (phone) => {
  let digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "92" + digits.slice(1);
  else if (!digits.startsWith("92")) digits = "92" + digits;
  return digits;
};

const PAYMENT_LABELS = {
  JazzCash: "JazzCash",
  Easypaisa: "Easypaisa",
  BankTransfer: "Bank Transfer",
  COD: "Cash on Delivery",
};

// One message covering both the order confirmation and where things stand
// right now (payment + shipping status) - the admin can still edit it
// inside WhatsApp before hitting send, this is just a solid starting draft.
export const buildOrderConfirmationMessage = (order) => {
  const shortId = order._id.slice(-6).toUpperCase();
  const name = order.shippingAddress?.fullName || "there";

  const itemLines = order.items
    .map((item) => `- ${item.qty} x ${item.name}${item.size ? ` (${item.size})` : ""}`)
    .join("\n");

  const paymentLine =
    order.paymentStatus === "Verified"
      ? order.paymentMethod === "COD"
        ? "Cash received - thank you!"
        : "Payment received - thank you!"
      : order.paymentStatus === "Rejected"
      ? "We could not verify your payment yet - please check your transaction details or contact us."
      : order.paymentMethod === "COD"
      ? "You'll pay in cash to the rider when your order is delivered."
      : `Payment via ${PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod} is being reviewed.`;

  return (
    `Hi ${name}, thank you for your order at Ehsar!\n\n` +
    `Order #${shortId}\n${itemLines}\n\n` +
    `Total: ${formatPKR(order.totalAmount)}\n` +
    `${paymentLine}\n` +
    `Order status: ${order.status}\n\n` +
    `We'll keep you updated as your order is processed, shipped, and delivered. Thank you for shopping with us!`
  );
};

export const buildWhatsAppLink = (order) => {
  const phone = formatPhoneForWhatsApp(order.shippingAddress?.phone);
  const message = buildOrderConfirmationMessage(order);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
