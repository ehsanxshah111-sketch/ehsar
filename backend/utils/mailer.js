// Sends order notifications via Resend's HTTP API instead of Gmail SMTP.
// Gmail SMTP (port 465/587) is unreliable from Vercel's serverless
// functions - the TLS handshake or connection can just drop or time out,
// because outbound SMTP from short-lived serverless containers is a known
// weak spot on most platforms. Resend's API is a plain HTTPS POST, which
// serverless functions handle the same way as any other API call, so it
// doesn't hit that class of problem at all.

const money = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

function buildOrderEmailHtml(order) {
  const itemsRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.size || "-"}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.color || "-"}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.qty}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${money(item.price)}</td>
        </tr>`
    )
    .join("");

  const addr = order.shippingAddress || {};

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#222;">
    <h2 style="margin-bottom:4px;">New Order Received</h2>
    <p style="color:#666;margin-top:0;">Order #${order._id.toString().slice(-6).toUpperCase()} - ${new Date(
    order.createdAt
  ).toLocaleString()}</p>

    <h3>Items</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#f7f7f7;text-align:left;">
          <th style="padding:8px;">Product</th>
          <th style="padding:8px;">Size</th>
          <th style="padding:8px;">Color</th>
          <th style="padding:8px;text-align:center;">Qty</th>
          <th style="padding:8px;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <table style="width:100%;font-size:14px;margin-top:8px;">
      ${
        order.discountAmount
          ? `<tr><td style="padding:4px 8px;">Coupon (${order.couponCode})</td><td style="padding:4px 8px;text-align:right;">- ${money(
              order.discountAmount
            )}</td></tr>`
          : ""
      }
      <tr>
        <td style="padding:4px 8px;">Shipping</td>
        <td style="padding:4px 8px;text-align:right;">${order.shippingFee ? money(order.shippingFee) : "Free"}</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;font-weight:bold;">Total</td>
        <td style="padding:4px 8px;text-align:right;font-weight:bold;">${money(order.totalAmount)}</td>
      </tr>
    </table>

    <h3>Shipping Address</h3>
    <p style="font-size:14px;line-height:1.5;margin:0;">
      ${addr.fullName || ""}<br/>
      House ${addr.houseNumber || ""}, ${addr.street || ""}<br/>
      ${addr.address || ""}<br/>
      ${addr.city || ""} ${addr.postalCode || ""}<br/>
      Phone: ${addr.phone || ""}
    </p>

    <h3>Payment</h3>
    <p style="font-size:14px;line-height:1.5;margin:0;">
      Method: ${order.paymentMethod}<br/>
      Status: ${order.paymentStatus}
      ${order.transactionId ? `<br/>Transaction ID: ${order.transactionId}` : ""}
    </p>

    <p style="color:#999;font-size:12px;margin-top:24px;">
      This is an automated notification from your Ehsar store.
    </p>
  </div>`;
}

// Fire-and-forget by design: called without awaiting from the order route,
// and every failure path here is caught and logged rather than thrown, so a
// missing/broken email config or a Resend API error can never prevent an
// order from being created or make the checkout request fail/slow down.
export async function sendOrderNotificationEmail(order) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Order email skipped: RESEND_API_KEY not configured.");
    return;
  }
  // RESEND_FROM must be either "onboarding@resend.dev" (Resend's shared test
  // address - works immediately, no setup, but can only send TO the email
  // you signed up to Resend with) or an address at a domain you've verified
  // in the Resend dashboard (needed to send to your customers/any address).
  const from = process.env.RESEND_FROM || "onboarding@resend.dev";
  const to = process.env.ADMIN_EMAIL;
  if (!to) {
    console.warn("Order email skipped: ADMIN_EMAIL not configured.");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Ehsar Store <${from}>`,
        to,
        subject: `New Order #${order._id.toString().slice(-6).toUpperCase()} - ${money(order.totalAmount)}`,
        html: buildOrderEmailHtml(order),
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      console.error(`Failed to send order notification email: ${response.status} ${body}`);
    }
  } catch (err) {
    console.error("Failed to send order notification email:", err.message);
  }
}
