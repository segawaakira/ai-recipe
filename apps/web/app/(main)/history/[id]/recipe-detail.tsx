"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Clock, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

import { createAuthClient } from "@/lib/auth-api-client";
import type { components } from "@repo/api-types";
import { useToast } from "@repo/ui/hooks/use-toast";
import { ConfirmDialog } from "components/confirm-dialog";
import { RecipeMeta } from "components/recipe-meta";
import { StarRating } from "components/star-rating";
import { YouTubeVideos } from "components/youtube-videos";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Recipe = components["schemas"]["RecipeResponseDto"];

interface RecipeDetailProps {
  recipe: Recipe;
}

export function RecipeDetail({ recipe: initialRecipe }: RecipeDetailProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const authClient = useMemo(
    () => session?.accessToken ? createAuthClient(session.accessToken) : null,
    [session?.accessToken]
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="leading-normal text-lg">{recipe.name}</h1>
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {new Date(recipe.createdAt).toLocaleDateString("ja-JP")}
            </div>
            <StarRating
              rating={recipe.rating ?? null}
              onRate={async (rating) => {
                try {
                  if (authClient) {
                    await authClient.PATCH("/recipes/{id}/rating", {
                      params: { path: { id: String(recipe.id) } },
                      body: { rating },
                    });
                  }
                  setRecipe((prev) => ({ ...prev, rating }));
                  toast.success("評価を記録しました");
                } catch {
                  console.error("Failed to save rating");
                }
              }}
            />
          </div>
          <RecipeMeta
            ingredients={recipe.ingredients}
            genre={recipe.genre}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="markdown-content">
            <ReactMarkdown>{recipe.content}</ReactMarkdown>
          </div>

          {recipe.youtubeVideos && recipe.youtubeVideos.length > 0 && (
            <YouTubeVideos videos={recipe.youtubeVideos} recipeName={recipe.name} ingredients={recipe.ingredients} genre={recipe.genre} />
          )}

          <div className="flex justify-end pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              このレシピを削除
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="履歴削除の確認"
        description={`本当に「${recipe.name}」を削除しますか？`}
        onConfirm={async () => {
          try {
            if (authClient) {
              await authClient.DELETE("/recipes/{id}", {
                params: { path: { id: String(recipe.id) } },
              });
            }
            router.back();
          } catch {
            console.error("Failed to delete recipe");
          }
        }}
      />
    </>
  );
}
