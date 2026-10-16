// Vercel serverless function: POST /api/preorder
//
// Environment variables (set in Vercel → Project → Settings → Environment Variables):
//   PREORDER_WEBHOOK_URL  optional  Receives {email, updates, lang, createdAt} as JSON.
//                                   Works with Zapier/Make, a Google Apps Script web app, Slack, etc.
//   STRIPE_PAYMENT_LINK   optional  A Stripe Payment Link for the $20 deposit, e.g. https://buy.stripe.com/xxx
//                                   The visitor is redirected there with their email prefilled.
// At least one must be set, otherwise the endpoint returns 503 so a sign-up is never silently lost.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Honeypot: bots fill hidden fields. Pretend success.
  if (body.company) return res.status(200).json({ ok: true });

  const email = String(body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ ok: false, error: "invalid_email" });
  }

  const webhook = process.env.PREORDER_WEBHOOK_URL;
  const paymentLink = process.env.STRIPE_PAYMENT_LINK;

  if (!webhook && !paymentLink) {
    console.error("preorder: neither PREORDER_WEBHOOK_URL nor STRIPE_PAYMENT_LINK is configured");
    return res.status(503).json({ ok: false, error: "not_configured" });
  }

  const record = {
    email,
    updates: Boolean(body.updates),
    lang: body.lang === "zh" ? "zh" : "en",
    createdAt: new Date().toISOString(),
  };

  if (webhook) {
    try {
      const r = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      if (!r.ok) throw new Error("webhook HTTP " + r.status);
    } catch (err) {
      console.error("preorder: webhook failed", err);
      // Without a payment link there is nowhere else to record the sign-up.
      if (!paymentLink) return res.status(502).json({ ok: false, error: "storage_failed" });
    }
  }

  let checkoutUrl;
  if (paymentLink) {
    const url = new URL(paymentLink);
    url.searchParams.set("prefilled_email", email);
    if (record.lang === "zh") url.searchParams.set("locale", "zh-HK");
    checkoutUrl = url.toString();
  }

  return res.status(200).json({ ok: true, checkoutUrl });
};
