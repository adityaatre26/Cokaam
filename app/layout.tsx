import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import Squares from "@/src/blocks/Backgrounds/Squares/Squares";

export const metadata: Metadata = {
  title: "Cokaam",
  description:
    "Get your github repo and task management working in under 5 minutes using Cokaam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Squares
            speed={0.08}
            squareSize={32}
            direction="up"
            borderColor="#FFFFFF13"
            hoverFillColor="#fff"
          />
        </div>
        <div className="relative z-10">
          <Providers>{children}</Providers>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
