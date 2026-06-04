import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Program } from "@/types";

// Mock data fallback
const mockPrograms: Program[] = [
  {
    id: "1",
    slug: "evening-quran",
    name: "Evening Qur'an Classes",
    category: "quran",
    shortDescription: "Learn to read and memorize the Holy Qur'an.",
    longDescription: "Our evening Qur'an classes are designed for students of all ages to learn proper recitation, Tajweed rules, and memorization of the Holy Qur'an.",
    schedule: "Mon-Thu, 5:30 PM - 7:30 PM",
    ageRange: "5-18 years",
    fees: "$50/month",
    instructor: "Shaykh Ahmad",
    location: "Main Prayer Hall",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    slug: "weekend-school",
    name: "Weekend School",
    category: "weekend_school",
    shortDescription: "Comprehensive Islamic education.",
    longDescription: "A comprehensive program covering Islamic studies, Arabic language, and Qur'an for children.",
    schedule: "Saturday (Boy's Only) : 9:30 AM - 1:00 PM, Sunday (Girl's Only) : 9:30 AM - 1:00 PM",
    ageRange: "5-15 years",
    fees: "$60/month",
    instructor: "Various Teachers",
    location: "Classrooms A, B, C",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from("programs").select("*").eq("isActive", true);
      if (error) throw error;
      return NextResponse.json(data);
    }
    
    // Return mock data if Supabase isn't configured
    return NextResponse.json(mockPrograms);
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simple authentication check (to be expanded with JWT)
    // const authHeader = request.headers.get("authorization");
    // if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from("programs").insert(body).select().single();
      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    }
    
    // Mock response
    const newProgram = { ...body, id: Date.now().toString(), createdAt: new Date().toISOString() };
    return NextResponse.json(newProgram, { status: 201 });
  } catch (error) {
    console.error("Error creating program:", error);
    return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
  }
}
