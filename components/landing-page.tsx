"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Alkanes Deployer</h1>
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card
          className="cursor-pointer transition-all hover:border-primary"
          onClick={() => router.push("/deploy/token")}
        >
          <CardHeader>
            <CardTitle>Standard Token</CardTitle>
            <CardDescription>
              Deploy a standard Alkanes token with customizable parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Select Standard Token
            </Button>
          </CardContent>
        </Card>
        <Card className="opacity-40">
          <CardHeader>
            <CardTitle>Alkanes Contract</CardTitle>
            <CardDescription>
              Create a custom Alkanes contract with advanced features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled variant="outline" className="w-full">
              Coming soon...
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
