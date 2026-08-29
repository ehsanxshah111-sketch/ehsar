import React from "react";
import InfoPage from "./InfoPage.jsx";

// Placeholder copy - swap this out for real open roles / an application
// email whenever you're ready. Nothing else needs to change; this is the
// only file that feeds the "Careers" page.
const Careers = () => (
  <InfoPage title="Careers">
    <p>
      We're always glad to hear from people who care about good design, good craft, and good customer
      experience.
    </p>
    <p>
      We don't have any open roles listed right now, but if you'd like to introduce yourself, send your
      CV and a short note about what you're looking for to{" "}
      <a href="mailto:careers@ehsar.com" className="underline">
        careers@ehsar.com
      </a>{" "}
      and we'll keep it on file for when a relevant position opens up.
    </p>
  </InfoPage>
);

export default Careers;
