import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Genie — Your AI-Powered Travel Companion",
  description:
    "Plan smarter trips with Travel Genie. AI-powered itineraries, budget-aware suggestions, and seamless booking — beautifully crafted travel experiences.",
  keywords: ["travel", "AI itinerary", "trip planning", "travel chatbot", "India travel"],
  openGraph: {
    title: "Travel Genie",
    description: "Your AI-Powered Travel Companion",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
