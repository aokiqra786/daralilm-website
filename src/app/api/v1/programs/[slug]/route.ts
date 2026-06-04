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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("slug", slug)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }
        throw error;
      }
      return NextResponse.json(data);
    }
    
    // Mock data fallback
    const program = mockPrograms.find(p => p.slug === slug);
    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }
    
    return NextResponse.json(program);
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json({ error: "Failed to fetch program" }, { status: 500 });
  }
}
