import { pageMetadata } from "@/lib/seo";

// Keep metadata on the server while the legacy page preserves query-aware navigation.
export const metadata = pageMetadata({
  title: "RealNPC | Configurator",
  description: "Continue to the RealNPC companion configurator.",
  path: "/configurator/",
});

export default function CompanionLabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
