import React from "react";
import InfoPage from "./InfoPage.jsx";

const Careers = () => (
  <InfoPage title="Careers">
    <p>
      We're a small, hands-on team building Ehsar from the ground up, and we're always open to hearing
      from people who genuinely care about design, quality, and customer experience - even when we don't
      have a specific role posted.
    </p>
    <p>
      We don't have any open positions right now. But if you'd like to introduce yourself, send your CV
      and a short note about what you're interested in to{" "}
      <a href="mailto:ehsarbrand@gmail.com" className="underline">
        ehsarbrand@gmail.com
      </a>
      , or reach out to us directly on Instagram{" "}
      <a
        href="https://instagram.com/ehsar.store"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        @ehsar.store
      </a>
      . We'll keep it on file and reach out if something opens up that's a fit.
    </p>
  </InfoPage>
);

export default Careers;
