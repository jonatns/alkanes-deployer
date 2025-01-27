import "@/styles/globals.css";
import { JetBrains_Mono } from "next/font/google";
import { LaserEyesProvider } from "@omnisat/lasereyes";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={jetbrainsMono.className}>
        <LaserEyesProvider>{children}</LaserEyesProvider>
      </body>
    </html>
  );
}

import "./globals.css";
