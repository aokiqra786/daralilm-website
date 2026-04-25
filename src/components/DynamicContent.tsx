"use client";

import { useEffect, useState } from "react";
import { Bell, Calendar as CalendarIcon, Users, Mail } from "lucide-react";
import { Announcement, Event } from "@/types";

export default function DynamicContent() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [announcementsRes, eventsRes] = await Promise.all([
          fetch("/api/v1/announcements?active=true"),
          fetch("/api/v1/events?upcoming=true")
        ]);

        if (announcementsRes.ok) {
          setAnnouncements(await announcementsRes.json());
        }
        if (eventsRes.ok) {
          setEvents(await eventsRes.json());
        }
      } catch (error) {
        console.error("Error fetching dynamic content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full text-center py-12 text-blue-800">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-blue-200 rounded mb-4"></div>
          <div className="h-32 w-full max-w-4xl bg-blue-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Announcements */}
      <div className="bg-amber-50 rounded-lg p-6 sm:p-8 shadow-sm border border-amber-100">
        <div className="mb-6 relative flex items-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-amber-200"></div>
          </div>
          <div className="relative pr-4 bg-amber-50">
            <h3 className="text-xl font-playfair font-semibold text-blue-900">Announcements</h3>
          </div>
        </div>
        
        <ul className="space-y-4">
          {announcements.length > 0 ? announcements.map((announcement) => (
            <li key={announcement.id} className="flex items-start">
              <Bell className="w-5 h-5 text-red-700 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-800 font-medium block">{announcement.title}</span>
                <span className="text-sm text-slate-600 mt-1 block">{announcement.body}</span>
              </div>
            </li>
          )) : (
            <li className="text-slate-500 italic">No active announcements.</li>
          )}
        </ul>
      </div>

      {/* Events */}
      <div className="bg-slate-50 rounded-lg p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="mb-6 relative flex items-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300"></div>
          </div>
          <div className="relative pr-4 bg-slate-50">
            <h3 className="text-xl font-playfair font-semibold text-blue-900">Upcoming Events</h3>
          </div>
        </div>
        
        <ul className="space-y-4">
          {events.length > 0 ? events.map((event) => {
            const dateObj = new Date(event.date);
            const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            return (
              <li key={event.id} className="flex items-start">
                <CalendarIcon className="w-5 h-5 text-blue-700 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-slate-800 font-medium"><span className="text-blue-900 mr-2">{formattedDate}:</span> {event.title}</span>
                  {event.time && <span className="text-sm text-slate-500 block mt-0.5">{event.time} @ {event.location}</span>}
                </div>
              </li>
            );
          }) : (
            <li className="text-slate-500 italic">No upcoming events.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
