import type { Metadata } from "next";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Events and announcements from SoCal Academy of Knowledge — community programs, parent meetings, and seasonal activities.",
};

export default function EventsPage() {
  return <EventsClient />;
}
