import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display, Special_Elite } from "next/font/google"
import "./globals.css"

// Modern sans-serif font for UI elements
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

// Classic serif font for newspaper headlines and body text
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

// Typewriter font for certain accents
const specialElite = Special_Elite({
  weight: "400",
  variable: "--font-special-elite",
  display: "swap",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "The Daily Blog - Vintage Newspaper Style",
  description: "A blog with classic 1970s-1980s newspaper styling",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${specialElite.variable} font-sans`}>{children}</body>
    </html>
  )
}

