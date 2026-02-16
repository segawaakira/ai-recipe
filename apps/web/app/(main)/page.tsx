"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { ChefHat, User } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

import { apiClient } from "@/lib/api-client";
import { useToast } from "@repo/ui/hooks/use-toast";
import { IngredientSection } from "components/ingredient-section";
import { RecipeMeta } from "components/recipe-meta";
import { StarRating } from "components/star-rating";
import { YouTubeVideos } from "components/youtube-videos";
import { useSession } from "next-auth/react";

interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

export default function RecipeApp() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [recipe, setRecipe] = useState("");
  const [recipeName, setRecipeName] = useState("");
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [savedRecipeId, setSavedRecipeId] = useState<number | null>(null);
  const [recipeRating, setRecipeRating] = useState<number | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<string[]>([]);
  const [recipeServings, setRecipeServings] = useState(2);
  const [recipeGenre, setRecipeGenre] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRecipe = async (params: {
    selectedIngredients: string[];
    allIngredients: string[];
    servings: number;
    genre: string;
  }) => {
    if (params.selectedIngredients.length === 0) return;

    setIsGenerating(true);
    setRecipe("");
    setRecipeName("");
    setYoutubeVideos([]);
    setSavedRecipeId(null);
    setRecipeRating(null);
    setRecipeIngredients(params.selectedIngredients);
    setRecipeServings(params.servings);
    setRecipeGenre(params.genre);
    try {
      let ratedRecipes: { name: string; rating: number }[] = [];
      if (session?.user?.id) {
        try {
          const ratedRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/recipes/rated?userId=${session.user.id}`
          );
          ratedRecipes = await ratedRes.json();
        } catch {}
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/gemini/generate-recipe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            preferredIngredients: params.selectedIngredients,
            allIngredients: params.allIngredients,
            servings: params.servings,
            genre: params.genre || undefined,
            ratedRecipes:
              ratedRecipes.length > 0 ? ratedRecipes : undefined,
          }),
        }
      );

      const data = await response.json();
      setRecipe(data.recipe);
      if (data.recipeName) {
        setRecipeName(data.recipeName);
        let savedVideos: YouTubeVideo[] = [];
        try {
          const ytRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/youtube/search?q=${encodeURIComponent(data.recipeName)}`
          );
          const ytData = await ytRes.json();
          if (ytData.videos) {
            savedVideos = ytData.videos;
            setYoutubeVideos(ytData.videos);
          }
        } catch {}

        if (session?.user?.id) {
          try {
            const { data: savedRecipe } = await apiClient.POST("/recipes", {
              body: {
                userId: Number(session.user.id),
                name: data.recipeName,
                content: data.recipe,
                ingredients: params.selectedIngredients,
                servings: params.servings,
                genre: params.genre || undefined,
                youtubeVideos:
                  savedVideos.length > 0
                    ? (savedVideos as unknown as Record<string, never>)
                    : undefined,
              },
            });
            if (savedRecipe) {
              setSavedRecipeId(savedRecipe.id);
            }
          } catch (error) {
            console.error("Failed to save recipe:", error);
          }
        }
      }
    } catch (error) {
      setRecipe(
        "レシピの生成中にエラーが発生しました。もう一度お試しください。"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {!session?.user?.id && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <User className="h-12 w-12 mx-auto text-blue-600" />
                <h3 className="font-semibold text-blue-900">
                  ログインしてレシピを保存
                </h3>
                <p className="text-blue-700 text-sm">
                  アカウントを作成すると、お気に入りのレシピを保存できます
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" asChild>
                    <a href="/auth/signin">ログイン</a>
                  </Button>
                  <Button asChild>
                    <a href="/auth/signup">新規登録</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 flex-col w-full">
          <IngredientSection
            session={session}
            onGenerateRecipe={generateRecipe}
            isGenerating={isGenerating}
          />

          {/* レシピ表示セクション */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                おすすめレシピ
              </CardTitle>
              <CardDescription>
                AIが提案するレシピが表示されます
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recipe ? (
                <div className="space-y-4">
                  <RecipeMeta
                    ingredients={recipeIngredients}
                    servings={recipeServings}
                    genre={recipeGenre}
                  />
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{recipe}</ReactMarkdown>
                  </div>
                  {recipeName && (
                    <YouTubeVideos
                      videos={youtubeVideos}
                      recipeName={recipeName}
                    />
                  )}
                  {savedRecipeId && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          このレシピはいかがですか？
                        </span>
                        <StarRating
                          rating={recipeRating}
                          onRate={async (rating) => {
                            setRecipeRating(rating);
                            try {
                              await fetch(
                                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/recipes/${savedRecipeId}/rating`,
                                {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ rating }),
                                }
                              );
                              toast.success("評価を記録しました");
                            } catch {
                              console.error("Failed to save rating");
                            }
                          }}
                        />
                      </div>
                      {recipeRating && (
                        <p className="text-xs text-gray-400 text-right">
                          次回のレシピ提案に反映されます
                        </p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>「AIレシピを作成」ボタンを押して</p>
                  <p>おすすめレシピを生成してください</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
