import type React from "react";
import type { Metadata } from "next";
import { Inter, Playfair_Display, Special_Elite } from "next/font/google";
import "./globals.css";

// Modern sans-serif font for UI elements
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Classic serif font for newspaper headlines and body text
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// Typewriter font for certain accents
const specialElite = Special_Elite({
  weight: "400",
  variable: "--font-special-elite",
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Commit Log - Vintage Newspaper",
  openGraph: {
    images: [
      {
        url: "./favicon.ico",
        width: 1200,
        height: 630,
        alt: "The Commit Log Newspaper",
      },
    ],
  },
  description: "Past Meets Pixel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${specialElite.variable} font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
