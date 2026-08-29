import React from "react";
import InfoPage from "./InfoPage.jsx";
import { formatPKR } from "../../utils/currency.js";

// Shipping figures below match what Cart.jsx actually charges - if you
// change the shipping fee or the free-shipping threshold there, update the
// numbers here too so this page stays accurate. The returns policy text is
// a placeholder; edit it to match your real policy whenever you're ready.
const ShippingReturns = () => (
  <InfoPage title="Shipping & Returns">
    <h2 className="text-sm font-medium text-ehsar-black uppercase tracking-widest2 mt-2">Shipping</h2>
    <p>
      We ship nationwide across Pakistan. Standard shipping costs {formatPKR(100)} per order, and is free
      on orders over {formatPKR(10000)}.
    </p>
    <p>
      Orders are typically processed within 1-2 business days, with delivery taking a further 2-5
      business days depending on your city. You can pay online via JazzCash, Easypaisa, or bank transfer,
      or choose Cash on Delivery and pay the rider when your order arrives.
    </p>

    <h2 className="text-sm font-medium text-ehsar-black uppercase tracking-widest2 mt-8">Returns</h2>
    <p>
      If something isn't right, you can request a return within 7 days of delivery, provided the item is
      unworn, unwashed, and still has its original tags attached.
    </p>
    <p>
      To start a return, message us on WhatsApp with your order number and reason for return, and we'll
      guide you through the next steps.
    </p>
  </InfoPage>
);

export default ShippingReturns;
