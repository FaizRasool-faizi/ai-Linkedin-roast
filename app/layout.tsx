import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Updated metadata for your LinkedIn project
export const metadata: Metadata = {
  title: "LinkedIn Roast & Growth Analyzer",
  description: "Get roasted by AI and get a 7-day plan to land your dream job.",
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
      // This ignores attributes injected by extensions into the <html> tag
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col bg-[#0a0a0a] text-white" 
        // This ignores attributes injected by extensions into the <body> tag
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}