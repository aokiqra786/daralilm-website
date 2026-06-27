import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with SoCal Academy of Knowledge in Northridge, CA — questions about programs, admissions, events, or volunteering.",
};

export default function ContactPage() {
  return <ContactClient />;
}
