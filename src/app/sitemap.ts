import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site";

/** Required so the static export can prerender the route. */
export const dynamic = "force-static";

/** Trailing slashes match `trailingSlash: true` in next.config.mjs. */
const ROUTES = ["/", "/npc-world/", "/partnership/", "/configurator/"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
