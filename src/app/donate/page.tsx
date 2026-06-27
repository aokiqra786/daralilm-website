import type { Metadata } from "next";
import DonateClient from "./DonateClient";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support SoCal Academy of Knowledge with your Sadaqah Jariyah. Your gift funds Islamic education, financial aid, and program expansion.",
};

export default function DonatePage() {
  return <DonateClient />;
}
