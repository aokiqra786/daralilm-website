import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Event } from "@/types";
import { readData, writeData } from "@/lib/localDb";
import { requireAdmin, authErrorResponse } from "@/utils/supabase/auth";

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Community Iftar",
    description: "Join us for a community Iftar every Friday during Ramadan.",
    date: "2024-03-15",
    time: "Sunset",
    location: "Main Hall",
    category: "community",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Parent-Teacher Meeting",
    description: "Discuss your child's progress with our teaching staff.",
    date: "2024-04-20",
    time: "10:00 AM",
    location: "Classrooms",
    category: "parent",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get("upcoming") === "true";
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      // Prefer the budget-free, published-only projection (public_events view).
      // It already filters to published + upcoming, so no date math is needed.
      const viewRes = await supabase
        .from("public_events")
        .select("*")
        .order("date", { ascending: true });
      if (!viewRes.error) {
        return NextResponse.json(viewRes.data);
      }
      // Fallback when the view isn't present yet (migration 2b not applied):
      // legacy behavior on the events table so the live feed never breaks.
      let query = supabase.from("events").select("*");
      if (upcoming) {
        query = query.lte("date", today).gte("endDate", now);
      }
      const { data, error } = await query.order("date", { ascending: false });
      if (error) throw error;
      return NextResponse.json(data);
    }
    
    // Fallback to local DB
    let data = readData<Event[]>("events.json", mockEvents);
    
    if (upcoming) {
      data = data.filter(e => {
        if (e.date > today) return false; // Hide scheduled future posts
        if (e.endDate && e.endDate < now) return false; // Hide expired posts
        return true;
      });
    }

    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let authed;
  try {
    authed = await requireAdmin();
  } catch (e) {
    return authErrorResponse(e);
  }

  try {
    const body = await request.json();

    if (isSupabaseConfigured()) {
      // Quick announcements from the event-uploader publish immediately; the
      // budgeted approval workflow sets status explicitly via its own actions.
      const insertBody = { status: "published", ...body };
      const { data, error } = await authed.supabase.from("events").insert(insertBody).select().single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    }

    // Fallback to local DB
    const newEvent: Event = {
      ...body, 
      id: Date.now().toString(), 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const existing = readData<Event[]>("events.json", mockEvents);
    existing.push(newEvent);
    writeData("events.json", existing);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    const message = error instanceof Error ? error.message : "Failed to create event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  let authed;
  try {
    authed = await requireAdmin();
  } catch (e) {
    return authErrorResponse(e);
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "No ID provided" }, { status: 400 });

    if (isSupabaseConfigured()) {
      const { error } = await authed.supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // Fallback to local DB
    let existing = readData<Event[]>("events.json", mockEvents);
    existing = existing.filter(e => e.id !== id);
    writeData("events.json", existing);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    const message = error instanceof Error ? error.message : "Failed to delete event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
