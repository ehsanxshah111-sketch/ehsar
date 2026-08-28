import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      houseNumber: { type: String, required: true },
      street: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, default: "" },
      phone: { type: String, required: true },
    },
    totalAmount: { type: Number, required: true },
    // Set only when this specific order used a coupon at checkout. Left
    // blank/zero for every order that didn't apply one - those customers
    // paid totalAmount in full, exactly as before coupons existed.
    couponCode: { type: String, default: "" },
    discountAmount: { type: Number, default: 0 },
    // This is what a customer's "My Orders" page tracks - the admin panel
    // moves an order through these steps as it actually progresses.
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    // How the customer says they paid. There's no live gateway API here -
    // JazzCash/Easypaisa require a registered business merchant account to
    // integrate directly. Instead the customer sends money themselves and
    // reports the transaction here, and the admin confirms it landed.
    paymentMethod: {
      type: String,
      enum: ["JazzCash", "Easypaisa", "BankTransfer"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Submitted", "Verified", "Rejected"],
      default: "Submitted",
    },
    transactionId: { type: String, required: true },
    // Small base64 screenshot of the payment confirmation - required, since
    // this is the only proof the admin has to go on before verifying.
    paymentScreenshot: { type: String, required: true },
    paymentNote: { type: String, default: "" }, // admin's note if rejected, etc.
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
