import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { BackgroundAnimation } from "@/components/BackgroundAnimation";
import { Navbar } from "@/components/Navbar";
import { FloatingChatIcon } from "@/components/FloatingChatIcon";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CollegeDiscovery",
  description: "Discover and compare colleges across India",
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-800">
        <Providers>
          <BackgroundAnimation />
          <Navbar />
          <main className="flex-1">{children}</main>
          <FloatingChatIcon />
        </Providers>
      </body>
    </html>
  );
}
