import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = "https://issyhmceqfzedfmvxiqa.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlzc3lobWNlcWZ6ZWRmbXZ4aXFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjA1NDUsImV4cCI6MjA5MzQ5NjU0NX0.im5E9FiMmq8cMHyVCx5QzjdAaqGB3LGVodaAkd5jpnk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to mock data if Supabase isn't configured yet
export const isSupabaseConfigured = () => {
  return true; // Hardcoded to true since keys are now present
};
