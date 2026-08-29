import React from "react";
import InfoPage from "./InfoPage.jsx";

// Placeholder contact details - swap the email/phone/hours below for your
// real ones whenever you're ready. Nothing else needs to change; this is
// the only file that feeds the "Contact Us" page.
const CONTACT_EMAIL = "support@ehsar.com";
const CONTACT_PHONE_DISPLAY = "+92 300 1234567";
const CONTACT_WHATSAPP_LINK = "https://wa.me/923001234567";

const ContactUs = () => (
  <InfoPage title="Contact Us">
    <p>Have a question about an order, a product, or anything else? We're happy to help.</p>

    <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
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
    </div>

    <p className="mt-8 text-sm text-gray-500">We typically reply within one business day.</p>
  </InfoPage>
);

export default ContactUs;
