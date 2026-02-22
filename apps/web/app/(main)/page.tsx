"use client";

import { useMemo, useState } from "react";

import { createAuthClient } from "@/lib/auth-api-client";
import { useToast } from "@repo/ui/hooks/use-toast";
import { ArrowRight } from "lucide-react";
import { IngredientSection } from "components/ingredient-section";
import { RecipeDisplaySection } from "components/recipe-display-section";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { components } from "@repo/api-types";

type YouTubeVideo = components["schemas"]["YouTubeVideoDto"];

export default function RecipeApp() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const authClient = useMemo(
    () => session?.accessToken ? createAuthClient(session.accessToken) : null,
    [session?.accessToken]
  );

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
      if (authClient) {
        try {
          const { data } = await authClient.GET("/recipes/rated");
          if (data) {
            ratedRecipes = data.flatMap((r) => r.rating != null ? [{ name: r.name, rating: r.rating }] : []);
          }
        } catch {}
      }

      if (!authClient) return;

      const { data, error: geminiError } = await authClient.POST("/gemini/generate-recipe", {
        body: {
          preferredIngredients: params.selectedIngredients,
          allIngredients: params.allIngredients,
          servings: params.servings,
          genre: params.genre || undefined,
          ratedRecipes:
            ratedRecipes.length > 0 ? ratedRecipes : undefined,
        },
      });

      if (geminiError || !data) throw new Error("レシピ生成に失敗しました");
      setRecipe(data.recipe);
      if (data.recipeName) {
        setRecipeName(data.recipeName);
        let savedVideos: YouTubeVideo[] = [];
        try {
          const { data: ytData } = await authClient.GET("/youtube/search", {
            params: { query: { q: data.recipeName } },
          });
          if (ytData?.videos) {
            savedVideos = ytData.videos;
            setYoutubeVideos(ytData.videos);
          }
        } catch {}

        if (authClient) {
          try {
            const { data: savedRecipe } = await authClient.POST("/recipes", {
              body: {
                name: data.recipeName,
                content: data.recipe,
                ingredients: params.selectedIngredients,
                servings: params.servings,
                genre: params.genre || undefined,
                youtubeVideos:
                  savedVideos.length > 0
                    ? savedVideos
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
              isGenerating={isGenerating}
              onRate={async (rating) => {
                setRecipeRating(rating);
                try {
                  if (authClient && savedRecipeId) {
                    await authClient.PATCH("/recipes/{id}/rating", {
                      params: { path: { id: String(savedRecipeId) } },
                      body: { rating },
                    });
                  }
                  toast.success("評価を記録しました");
                } catch {
                  console.error("Failed to save rating");
                }
              }}
            />
          )}
        </div>
        <Link href="/history" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 font-medium w-fit">
          レシピ提案履歴へ
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </>
  );
}
