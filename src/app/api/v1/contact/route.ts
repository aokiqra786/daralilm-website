import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Resend } from "resend";
import { HONEYPOT_FIELD, honeypotTripped, rateLimit, clientIp } from "@/lib/security";

// Sender must be on a domain verified in Resend. The live domain is socalaok.org.
const CONTACT_FROM = "SoCal Academy of Knowledge <info@socalaok.org>";

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(50).optional(),
  message: z.string().trim().min(1).max(5000),
});

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function POST(request: Request) {
  try {
    // Best-effort per-IP throttle.
    if (!rateLimit(`contact:${clientIp(request.headers)}`, 5)) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }

    const raw = await request.json().catch(() => null);
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Honeypot: a real user never fills this. Pretend success and drop the bot.
    if (honeypotTripped((raw as Record<string, unknown>)[HONEYPOT_FIELD])) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    const parsed = ContactSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check your entries and try again." }, { status: 400 });
    }
    const { name, email, phone, message } = parsed.data;

    if (!isSupabaseConfigured()) {
      // No silent success in production — fail loudly so dropped inquiries surface.
      if (process.env.NODE_ENV === "production") {
        console.error("Contact form: Supabase is not configured in production");
        return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
      }
      console.log("[dev] Mock contact submission received:", { name, email });
      return NextResponse.json({ success: true }, { status: 201 });
    }

    const { error } = await supabase
      .from("contact_submissions")
      .insert({ name, email, phone: phone || null, message });
    if (error) throw error;

    // Notify staff. The stored row is the source of truth, so email is best-effort:
    // a delivery failure is logged loudly but does not fail the request (avoids resubmits).
    const resend = getResend();
    const notify = process.env.CONTACT_NOTIFY_EMAIL;
    if (resend && notify) {
      try {
        await resend.emails.send({
          from: CONTACT_FROM,
          to: notify,
          replyTo: email,
          subject: `New contact form: ${name}`,
          text: `From: ${name} <${email}> ${phone ?? ""}\n\n${message}`,
        });
      } catch (mailErr) {
        console.error("Contact form: row stored but notification email failed:", mailErr);
      }
    } else {
      console.error(
        "Contact form: RESEND_API_KEY or CONTACT_NOTIFY_EMAIL not set; no notification sent"
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 });
  }
}
