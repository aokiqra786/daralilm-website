import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Announcement } from "@/types";

const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Ramadan Program Update",
    body: "Join us for daily Taraweeh prayers starting at 9:00 PM. Iftar will be served on weekends.",
    category: "ramadan",
    isPinned: true,
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "New Summer Classes Starting Soon!",
    body: "Enrollment for our summer youth program is now open. Register early to secure a spot.",
    category: "summer",
    isPinned: false,
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    if (isSupabaseConfigured()) {
      let query = supabase.from("announcements").select("*");
      
      // If we only want active ones, we might filter by startDate <= now and endDate >= now
      if (activeOnly) {
        const now = new Date().toISOString();
        query = query.lte("startDate", now).or(`endDate.gte.${now},endDate.is.null`);
      }
      
      const { data, error } = await query.order("isPinned", { ascending: false }).order("createdAt", { ascending: false });
      
      if (error) throw error;
      return NextResponse.json(data);
    }
    
    return NextResponse.json(mockAnnouncements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from("announcements").insert(body).select().single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    }
    
    const newAnnouncement = { ...body, id: Date.now().toString(), createdAt: new Date().toISOString() };
    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
