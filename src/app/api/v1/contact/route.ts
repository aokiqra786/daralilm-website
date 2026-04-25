import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("contact_submissions").insert(body);
      if (error) throw error;
      return NextResponse.json({ success: true }, { status: 201 });
    }
    
    // Mock successful response
    console.log("Mock contact submission received:", body);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 });
  }
}
