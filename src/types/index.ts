export interface Program {
  id: string;
  slug: string;
  name: string;
  category: "quran" | "weekend_school" | "vocational" | "youth" | "other";
  shortDescription: string;
  longDescription: string;
  schedule: string;
  ageRange: string;
  fees: string;
  instructor: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: "general" | "ramadan" | "summer" | "youth" | "other";
  isPinned: boolean;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  category: "community" | "parent" | "youth" | "school" | "other";
  imageUrl?: string;
  flyer_url?: string | null;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}
