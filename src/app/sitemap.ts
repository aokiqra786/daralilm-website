import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://socalaok.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/programs",
    "/admissions",
    "/events",
    "/volunteers",
    "/donate",
    "/coffee",
    "/contact",
  ];
  return routes.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
