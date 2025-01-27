import { Navbar } from "@/components/navbar";
import { TokenDeployForm } from "@/components/token-deploy-form";

export default function TokenDeployPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Deploy a standard Alkanes token
        </h1>
        <TokenDeployForm />
      </main>
    </div>
  );
}
