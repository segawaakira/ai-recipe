"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { ArrowLeft, Clock, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

import { createAuthClient } from "@/lib/auth-api-client";
import { useToast } from "@repo/ui/hooks/use-toast";
import { ConfirmDialog } from "components/confirm-dialog";
import { RecipeMeta } from "components/recipe-meta";
import { StarRating } from "components/star-rating";
import { YouTubeVideos } from "components/youtube-videos";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import type { components } from "@repo/api-types";

type Recipe = components["schemas"]["RecipeResponseDto"];

export default function RecipeDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const authClient = useMemo(
    () => session?.accessToken ? createAuthClient(session.accessToken) : null,
    [session?.accessToken]
  );

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!authClient) return;
      setIsLoading(true);
      try {
        const { data, error } = await authClient.GET("/recipes/{id}", {
          params: { path: { id: String(params.id) } },
        });
        if (error || !data) {
          setNotFound(true);
        } else {
          setRecipe(data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) fetchRecipe();
  }, [params.id, authClient]);

  return (
    <div className="space-y-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            レシピ履歴に戻る
          </button>

          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <p>読み込み中...</p>
            </div>
          ) : notFound || !recipe ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-gray-500">
                  <p>レシピが見つかりません</p>
                </div>
              </CardContent>
            </Card>
          ) : (
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
                        setRecipe((prev) => prev ? { ...prev, rating } : prev);
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
                  <YouTubeVideos videos={recipe.youtubeVideos} recipeName={recipe.name} />
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
          )}
      {recipe && (
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
      )}
    </div>
  );
}
