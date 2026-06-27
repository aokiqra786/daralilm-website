import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SoCal Academy of Knowledge",
    short_name: "SoCal AoK",
    description: "Providing Quality Islamic Education for Our Community",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e4",
    theme_color: "#005418",
    icons: [
      { src: "/brand/favicon/favicon_256.png", sizes: "256x256", type: "image/png" },
      { src: "/brand/favicon/AoK_AppIcon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
