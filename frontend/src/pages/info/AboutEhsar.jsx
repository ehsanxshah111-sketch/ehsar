import React from "react";
import InfoPage from "./InfoPage.jsx";

const AboutEhsar = () => (
  <InfoPage title="About Ehsar">
    <p>
      Ehsar started with a simple frustration: too many clothes that look good for a season and then fall
      apart, lose their shape, or just stop being wearable. We wanted to build something different -
      pieces you actually reach for months later, not just the week you bought them.
    </p>
    <p>
      Every item in our collection is chosen carefully, with an eye on fit, fabric quality, and stitching
      that holds up to real wear, not just fast turnover. We're a small team, which means we stay closely
      involved at every stage - from picking fabric, to checking samples, to the final quality check
      before an order leaves our hands.
    </p>
    <p>
      We're based in Pakistan and ship nationwide. Every order is packed and inspected by hand, and we
      treat each one like it's going to someone we know - because for a store this size, in a lot of ways,
      it is.
    </p>
    <p>
      You can also find us on Instagram{" "}
      <a
        href="https://instagram.com/ehsar.store"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        @ehsar.store
      </a>
      , where we share new arrivals, restocks, and a closer look at what we're working on.
    </p>
  </InfoPage>
);

export default AboutEhsar;
