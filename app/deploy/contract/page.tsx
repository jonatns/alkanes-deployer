import { Navbar } from "@/components/navbar";
import { AlkanesContractEditor } from "@/components/alkanes-contract-editor";

export default function AlkanesDeployPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Deploy Alkanes Contract</h1>
        <AlkanesContractEditor />
      </main>
    </div>
  );
}
