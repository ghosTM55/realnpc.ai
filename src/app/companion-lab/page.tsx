"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CompanionLabPage() {
  const router = useRouter();

  useEffect(() => {
    // The configurator validates ?view= and ?form= itself, so forward the whole query.
    router.replace(`/configurator/${window.location.search}`);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Link href="/configurator/">Continue to the configurator</Link>
    </main>
  );
}
