import SoulDemo from "@/components/demo/SoulDemo";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata({ title: "RealNPC | Conversation Demo", description: "A space to meet the Soul you created.", path: "/demo/" }),
  robots: { index: false, follow: true },
};

export default function DemoPage() {
  return <SoulDemo />;
}
