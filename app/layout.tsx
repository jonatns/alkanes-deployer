import "@/styles/globals.css";
import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={jetbrainsMono.className}>{children}</body>
    </html>
  );
}

import "./globals.css";
