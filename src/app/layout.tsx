import type { Metadata } from "next";
import localFont from "next/font/local";
import FlowBackground from "@/components/FlowBackground";
import "./globals.css";

const cinzel = localFont({
  src: "../fonts/Cinzel-Variable.woff2",
  weight: "400 900",
  variable: "--font-cinzel",
  display: "swap",
});

/** IoskeleyMono remains the body and interface font. */
const ioskeley = localFont({
  src: [
    { path: "../fonts/IoskeleyMonoNerdFont-Regular.ttf", weight: "400" },
    { path: "../fonts/IoskeleyMonoNerdFont-SemiBold.ttf", weight: "600" },
    { path: "../fonts/IoskeleyMonoNerdFont-Bold.ttf", weight: "700" },
  ],
  variable: "--font-ioskeley",
});

export const metadata: Metadata = {
  title: "RealNPC — Private Companion Robotics, Configured for You",
  description:
    "RealNPC is a build-to-order platform for modular robot companions, assembled across body, character, and capability packs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ioskeley.variable} ${cinzel.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <FlowBackground>{children}</FlowBackground>
      </body>
    </html>
  );
}
