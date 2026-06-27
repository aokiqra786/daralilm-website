import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://socalaok.org";
const isProd = base === "https://socalaok.org";

export default function robots(): MetadataRoute.Robots {
  if (!isProd) {
    // Staging / preview: keep the whole site out of search.
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/portal", "/login", "/onboard", "/acknowledge", "/api"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
