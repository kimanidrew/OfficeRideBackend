import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer"; 
import { UserProvider } from "../context/UserContext"; 
import { ThemeProvider } from "../context/ThemeContext";
import { DrawerProvider } from "../components/Drawer"; // import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Office Ride",
  description: "Share ride with co-workers",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents user scaling
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Prevent pinch zoom on mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <UserProvider>
          <ThemeProvider>
            <DrawerProvider>
              <div className="layout">
                <Navbar />
                <main className="content">{children}</main>
                <Footer />
              </div>
            </DrawerProvider>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
