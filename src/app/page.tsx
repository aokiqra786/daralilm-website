import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { CredibilityBar } from "@/components/home/CredibilityBar";
import { ProblemPromise } from "@/components/home/ProblemPromise";
import { ProgramsGrid } from "@/components/home/ProgramsGrid";
import { WhyUs } from "@/components/home/WhyUs";
import EventsSlider from "@/components/home/EventsSlider";
import { EnrollTuition } from "@/components/home/EnrollTuition";
import { DonorOnramp } from "@/components/home/DonorOnramp";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "Islamic Education in Northridge",
  description:
    "SoCal Academy of Knowledge offers evening Qur'an classes, weekend school, youth & vocational programs, and a path to full-time Hifz and K-12 homeschool academic support in Northridge, CA — taught by qualified instructors in a safe, gender-appropriate environment. Financial aid available.",
  openGraph: {
    title: "SoCal Academy of Knowledge — Islamic Education in Northridge",
    description:
      "Qur'an, character, and real academics under one roof. Enroll your child today.",
    images: ["/brand/logo/AoK_Logo_Color.png"],
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <CredibilityBar />
      <ProblemPromise />
      <ProgramsGrid />
      <WhyUs />
      <EventsSlider />
      <EnrollTuition />
      <DonorOnramp />
      <FinalCta />
    </>
  );
}
