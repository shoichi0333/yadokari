import { NextRequest, NextResponse } from "next/server";

type ContactRequest = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
};

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function logFallbackContact(payload: ContactPayload) {
  console.info("[contact:fallback]", {
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    messageLength: payload.message.length,
    receivedAt: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  let body: ContactRequest;

  try {
    body = (await request.json()) as ContactRequest;
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "お問い合わせ";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !message || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL;
  const payload = { name, email, subject, message };

  if (resendKey && contactEmail) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "YADOKARI <noreply@yadokari.jp>",
        to: [contactEmail],
        subject: `YADOKARIお問い合わせ: ${subject}`,
        html: [
          `<p><strong>お名前:</strong> ${escapeHtml(name)}</p>`,
          `<p><strong>メール:</strong> ${escapeHtml(email)}</p>`,
          `<p><strong>種別:</strong> ${escapeHtml(subject)}</p>`,
          `<p><strong>内容:</strong></p>`,
          `<p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>`,
        ].join(""),
        reply_to: email,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, delivered: true });
  }

  logFallbackContact(payload);

  return NextResponse.json({ ok: true, delivered: false, fallback: true });
}
