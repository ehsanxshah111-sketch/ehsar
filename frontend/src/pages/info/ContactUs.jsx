import React from "react";
import InfoPage from "./InfoPage.jsx";

// Placeholder contact details - swap the email/phone/hours below for your
// real ones whenever you're ready. Nothing else needs to change; this is
// the only file that feeds the "Contact Us" page.
const CONTACT_EMAIL = "ehsarbrand@gmail.com";
const CONTACT_PHONE_DISPLAY = "0300 0878181";
const CONTACT_WHATSAPP_LINK = "https://wa.me/923000878181";
const INSTAGRAM_LINK = "https://www.instagram.com/ehsar.store/";

const ContactUs = () => (
  <InfoPage title="Contact Us">
    <p>Have a question about an order, a product, or anything else? We're happy to help.</p>

    <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
      <div className="border border-gray-200 p-6">
        <h2 className="text-xs uppercase tracking-widest2 text-gray-500 mb-2">Email</h2>
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm underline">
          {CONTACT_EMAIL}
        </a>
      </div>
      <div className="border border-gray-200 p-6">
        <h2 className="text-xs uppercase tracking-widest2 text-gray-500 mb-2">WhatsApp / Phone</h2>
        <a href={CONTACT_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-sm underline">
          {CONTACT_PHONE_DISPLAY}
        </a>
      </div>
      <div className="border border-gray-200 p-6">
        <h2 className="text-xs uppercase tracking-widest2 text-gray-500 mb-2">Instagram</h2>
        <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" className="text-sm underline">
          @ehsar.store
        </a>
      </div>
    </div>

    <p className="mt-8 text-sm text-gray-500">We typically reply within one business day.</p>
  </InfoPage>
);

export default ContactUs;
