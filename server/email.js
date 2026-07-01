import { Resend } from "resend";

const FROM = "ISSA Beauty <orders@send.issabeauty.org>";
const resend = process.env.RESEND ? new Resend(process.env.RESEND) : null;

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const money = (n) => `$${Number(n).toFixed(2)}`;

function shell(heading, bodyHtml) {
  return `<!DOCTYPE html><html><body style="margin:0;background:#faf7f5;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="font-size:22px;font-weight:700;color:#e11d63;letter-spacing:0.5px;">ISSA Beauty</div>
      <h1 style="font-size:18px;margin:16px 0;">${heading}</h1>
      ${bodyHtml}
      <p style="margin-top:24px;font-size:12px;color:#8a8a8a;">ISSA Beauty · Automated message, please don't reply.</p>
    </div>
  </body></html>`;
}

const STATUS_COPY = {
  confirmed: {
    subject: "confirmed",
    heading: "Your order is confirmed",
    line: "We're preparing your order for delivery.",
  },
  delivered: {
    subject: "delivered",
    heading: "Your order has been delivered",
    line: "Thank you for shopping with ISSA Beauty!",
  },
  cancelled: {
    subject: "cancelled",
    heading: "Your order was cancelled",
    line: "Your order has been cancelled. If this is unexpected, please contact us.",
  },
};

export function statusUpdateEmail(order) {
  const copy = STATUS_COPY[order.status];
  if (!copy) return null;
  const html = shell(
    copy.heading,
    `<p style="font-size:14px;">${copy.line}</p>
     <p style="font-size:14px;">Order <strong>${esc(order.orderNumber)}</strong> · Total ${money(order.total)}</p>`,
  );
  return { subject: `Order ${esc(order.orderNumber)} ${copy.subject} — ISSA Beauty`, html };
}

export async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.warn("RESEND not set; skipping email:", subject);
    return;
  }
  await resend.emails.send({ from: FROM, to, subject, html });
}
