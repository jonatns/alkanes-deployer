"use client";

import Link from "next/link";
import { ConnectWalletButton } from "./connect-wallet-button";
import { NetworkDropdown } from "./NetworkDropdown";

export function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-white font-bold text-xl">
              𝇈
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link href="/" className="text-gray-300 hover:text-white">
                Deploy
              </Link>
              <Link
                href="https://alkanes.build"
                target="_blank"
                className="text-gray-300 hover:text-white"
              >
                Docs
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ConnectWalletButton />
            <NetworkDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
}
