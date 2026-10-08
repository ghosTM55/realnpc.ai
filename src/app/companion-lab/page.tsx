"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CompanionLabPage() {
  const router = useRouter();

  useEffect(() => {
    const view = new URL(window.location.href).searchParams.get("view");
    const query = view === "choose" || view === "profile" ? `?view=${view}` : "";
    router.replace(`/configurator/${query}`);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Link href="/configurator/">Continue to the configurator</Link>
    </main>
  );
}
