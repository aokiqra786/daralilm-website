import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Announcement } from "@/types";
import { readData, writeData } from "@/lib/localDb";

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
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      let query = supabase.from("announcements").select("*");
      
      if (activeOnly) {
        query = query.lte("startDate", now).or(`endDate.gte.${now},endDate.is.null`);
      }
      
      const { data, error } = await query.order("isPinned", { ascending: false }).order("createdAt", { ascending: false });
      
      if (error) throw error;
      return NextResponse.json(data);
    }
    
    // Fallback to local DB
    let data = readData<Announcement[]>("announcements.json", mockAnnouncements);
    
    if (activeOnly) {
      data = data.filter(a => {
        if (a.startDate > now) return false;
        if (a.endDate && a.endDate < now) return false;
        return true;
      });
    }

    data.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(data);
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
    
    // Fallback to local DB
    const newAnnouncement: Announcement = { 
      ...body, 
      id: Date.now().toString(), 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const existing = readData<Announcement[]>("announcements.json", mockAnnouncements);
    existing.push(newAnnouncement);
    writeData("announcements.json", existing);

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
