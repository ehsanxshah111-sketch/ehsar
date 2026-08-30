import React from "react";
import InfoPage from "./InfoPage.jsx";
import { formatPKR } from "../../utils/currency.js";

// Shipping figures below match what Cart.jsx actually charges - if you
// change the shipping fee or the free-shipping threshold there, update the
// numbers here too so this page stays accurate.
const Shipping = () => (
  <InfoPage title="Shipping">
    <p>
      We ship nationwide across Pakistan. Standard shipping costs {formatPKR(100)} per order, and is free
      on orders over {formatPKR(10000)}.
    </p>
    <p>
      Orders are typically processed within 1-2 business days, with delivery taking a further 2-5
      business days depending on your city. You can pay online via JazzCash, Easypaisa, or bank transfer,
      or choose Cash on Delivery and pay the rider when your order arrives.
    </p>
  </InfoPage>
);

export default Shipping;
