import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/data/site";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import ScrollTop from "@/components/ScrollTop";
import Scrollbar from "@/components/Scrollbar";
import Loader from "@/components/Loader";

// Self-hosted variable fonts (no request to Google at runtime or build time).
const bigShoulders = localFont({
  src: "../fonts/big-shoulders.woff2",
  variable: "--font-big-shoulders",
  weight: "100 900",
  display: "swap",
});
const instrument = localFont({
  src: "../fonts/instrument-sans.woff2",
  variable: "--font-instrument",
  weight: "400 700",
  display: "swap",
});
const jetbrains = localFont({
  src: "../fonts/jetbrains-mono.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name} — Portfolio`,
  description: site.tagline,
  openGraph: {
    title: site.name,
    description: site.tagline,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bigShoulders.variable} ${instrument.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-ink text-bone">
        {/* without JS the loader would never lift */}
        <noscript>
          <style>{`.loader{display:none}`}</style>
        </noscript>
        <SmoothScroll>
          <Loader />
          <Nav />
          <ScrollTop />
          {children}
          <Scrollbar />
        </SmoothScroll>
      </body>
    </html>
  );
}
