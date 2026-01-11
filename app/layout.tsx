import type { Metadata } from "next";
import { Spline_Sans } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/components/SocketProvider";

const splineSans = Spline_Sans({
  variable: "--font-spline-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mario Quiz Racer - Multiplayer Racing Game",
  description: "Race, answer questions, and win! Multiplayer Mario-themed quiz racing game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${splineSans.variable} font-display antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-x-hidden`}
      >
        {/* Global Background Pattern */}
        <div
          className="fixed inset-0 z-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(#ea2a33 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
        <div className="relative z-10 min-h-screen flex flex-col">
          <SocketProvider>
            {children}
          </SocketProvider>
        </div>
      </body>
    </html>
  );
}
