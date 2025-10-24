'use client';

import { Button } from "@/components/ui/button";
import { ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";
import { RecipeList } from "./_comps/fetch";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="backdrop-blur-md bg-white/30 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Frigo Assistant</h1>
          <Button
            variant="outline"
            className="gap-2 backdrop-blur-sm bg-white/50 border-white/30 hover:bg-white/70 transition-all"
            onClick={() => router.push('/add-recipe')}
          >
            <ReceiptText className="h-4 w-4" />
            Ajouter une recette
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-8">
        <RecipeList />
      </main>
    </div>
  );
}
