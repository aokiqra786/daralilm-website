import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Resend } from "resend";

// Sender must be on a domain verified in Resend. The live domain is socalaok.org.
const CONTACT_FROM = "SoCal Academy of Knowledge <info@socalaok.org>";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      // No silent success in production — fail loudly so dropped inquiries surface.
      if (process.env.NODE_ENV === "production") {
        console.error("Contact form: Supabase is not configured in production");
        return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
      }
      console.log("[dev] Mock contact submission received:", body);
      return NextResponse.json({ success: true }, { status: 201 });
    }

    const { error } = await supabase.from("contact_submissions").insert(body);
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
          replyTo: body.email,
          subject: `New contact form: ${body.name}`,
          text: `From: ${body.name} <${body.email}> ${body.phone ?? ""}\n\n${body.message}`,
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
