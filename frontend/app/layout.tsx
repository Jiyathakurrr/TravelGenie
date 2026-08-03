import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TravelGenie — Your AI Travel Companion",
  description:
    "Plan smarter trips with TravelGenie. AI-powered itineraries, budget-aware suggestions, and seamless booking — all in a warm, conversational interface.",
  keywords: ["travel", "AI itinerary", "trip planning", "travel chatbot"],
  openGraph: {
    title: "TravelGenie",
    description: "Your AI Travel Companion",
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
