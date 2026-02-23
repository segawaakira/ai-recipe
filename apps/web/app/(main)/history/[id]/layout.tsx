"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RecipeDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        レシピ履歴に戻る
      </button>
      {children}
    </div>
  );
}
