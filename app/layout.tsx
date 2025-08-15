import type { Metadata } from "next";
import Link from "next/link";
import { Rubik as Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/ui/mode-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Persona Agent – Hitesh & Piyush Tones",
  description:
    "Chat with LLM personas tuned for Hitesh Choudhary and Piyush Garg. Includes data prep, prompt logic, and sample chats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global Navbar */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
              <nav className="flex items-center gap-5 text-sm">
                <Link href="/" className="text-foreground hover:underline">
                  Home
                </Link>
                <Link
                  href="/showcase"
                  className="text-foreground hover:underline"
                >
                  Showcase
                </Link>
                <Link href="/about" className="text-foreground hover:underline">
                  About
                </Link>
                <a
                  href="https://github.com/soham901"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  GitHub
                </a>
              </nav>
              <ModeToggle />
            </div>
          </header>

          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
