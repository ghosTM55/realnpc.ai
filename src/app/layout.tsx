import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/** Site-wide font: IoskeleyMono Nerd Font (matches the founder's ghostty terminal). */
const ioskeley = localFont({
  src: [
    { path: "../fonts/IoskeleyMonoNerdFont-Regular.ttf", weight: "400" },
    { path: "../fonts/IoskeleyMonoNerdFont-Medium.ttf", weight: "500" },
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
    <html lang="en" className={`${ioskeley.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
