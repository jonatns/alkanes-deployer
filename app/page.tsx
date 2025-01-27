import { Navbar } from "@/components/navbar"
import { LandingPage } from "@/components/landing-page"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <LandingPage />
      </main>
    </div>
  )
}

