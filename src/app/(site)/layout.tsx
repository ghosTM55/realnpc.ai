import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

/**
 * Marketing pages share one shell so the header and footer are banner and
 * contentinfo landmarks beside <main>, not inside it. The configurator and the
 * companion-lab redirect keep their own flow layout outside this group.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
