"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { User } from "lucide-react";
import { useState } from "react";

import { apiClient } from "@/lib/api-client";
import { useToast } from "@repo/ui/hooks/use-toast";
import { IngredientSection } from "components/ingredient-section";
import { RecipeDisplaySection } from "components/recipe-display-section";
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
  const [recipeGenre, setRecipeGenre] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasIngredients, setHasIngredients] = useState(false);

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
            onHasIngredientsChange={setHasIngredients}
          />

          {/* レシピ表示セクション */}
          {hasIngredients && (
            <RecipeDisplaySection
              recipe={recipe}
              recipeName={recipeName}
              youtubeVideos={youtubeVideos}
              savedRecipeId={savedRecipeId}
              recipeRating={recipeRating}
              recipeIngredients={recipeIngredients}
              recipeGenre={recipeGenre}
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
          )}
        </div>
      </div>
    </>
  );
}
