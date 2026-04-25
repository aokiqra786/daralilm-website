import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Event } from "@/types";

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

    if (isSupabaseConfigured()) {
      let query = supabase.from("events").select("*");
      
      if (upcoming) {
        // Simple comparison: date >= today
        const today = new Date().toISOString().split("T")[0];
        query = query.gte("date", today);
      }
      
      const { data, error } = await query.order("date", { ascending: true });
      if (error) throw error;
      return NextResponse.json(data);
    }
    
    return NextResponse.json(mockEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from("events").insert(body).select().single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    }
    
    const newEvent = { ...body, id: Date.now().toString(), createdAt: new Date().toISOString() };
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
