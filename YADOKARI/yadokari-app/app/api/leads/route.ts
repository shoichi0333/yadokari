import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: { email?: string; address?: string };
  try {
    body = (await request.json()) as { email?: string; address?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, address } = body;
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL;

  if (resendKey && contactEmail) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "YADOKARI <noreply@yadokari.jp>",
          to: [contactEmail],
          subject: `新規リード: ${email}`,
          html: `<p>メール: ${email}</p><p>チェックしたエリア: ${address ?? "不明"}</p>`,
        }),
      });

      if (response.ok) {
        return NextResponse.json({ ok: true, delivered: true });
      }
    } catch {
      // Resend失敗してもユーザーへはsuccessを返す
    }
  }

  console.info("[lead:fallback]", {
    email,
    address: address ?? null,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, delivered: false, fallback: true });
}
