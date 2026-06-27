import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { HONEYPOT_FIELD, honeypotTripped, rateLimit, clientIp } from "@/lib/security";

// Sender must be on the Resend-verified domain (socalaok.org).
const FROM = "SoCal Academy of Knowledge <info@socalaok.org>";
const EmailSchema = z.string().trim().email().max(254);

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function POST(request: Request) {
  if (!rateLimit(`newsletter:${clientIp(request.headers)}`, 5)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  // Accept JSON (fetch) or form-encoded (no-JS fallback).
  const contentType = request.headers.get("content-type") || "";
  let email = "";
  let honeypot: unknown = "";
  let isForm = false;
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null);
    email = typeof body?.email === "string" ? body.email : "";
    honeypot = body?.[HONEYPOT_FIELD];
  } else {
    const form = await request.formData().catch(() => null);
    email = (form?.get("email") as string) ?? "";
    honeypot = form?.get(HONEYPOT_FIELD);
    isForm = true;
  }

  // For a plain form POST, redirect home with a flag; for fetch, return JSON.
  const respond = (status: number, ok: boolean, msg?: string) => {
    if (isForm) {
      return NextResponse.redirect(new URL(ok ? "/?subscribed=1" : "/?subscribed=0", request.url), 303);
    }
    return NextResponse.json(ok ? { success: true } : { error: msg }, { status });
  };

  // Honeypot: silently accept and drop the bot.
  if (honeypotTripped(honeypot)) return respond(201, true);

  const parsed = EmailSchema.safeParse(email);
  if (!parsed.success) return respond(400, false, "Please enter a valid email address.");
  const clean = parsed.data.toLowerCase();

  const resend = getResend();
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (resend && audienceId) {
    try {
      await resend.contacts.create({ audienceId, email: clean, unsubscribed: false });
    } catch {
      console.error("Newsletter: failed to add contact to Resend audience");
    }
    try {
      await resend.emails.send({
        from: FROM,
        to: clean,
        subject: "You're subscribed — SoCal Academy of Knowledge",
        text:
          "JazakAllahu Khairan for subscribing to SoCal Academy of Knowledge updates.\n\n" +
          "You'll receive occasional news and events. You can unsubscribe at any time using the link in our emails.",
      });
    } catch {
      console.error("Newsletter: confirmation email failed to send");
    }
  } else {
    console.error("Newsletter: RESEND_API_KEY or RESEND_AUDIENCE_ID not set; subscription not recorded");
  }

  return respond(201, true);
}
