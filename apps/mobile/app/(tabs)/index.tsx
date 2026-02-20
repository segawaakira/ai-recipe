import { useState, useMemo, useCallback } from "react";
import { ScrollView, Alert } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { createAuthClient } from "@/lib/auth-api-client";
import { IngredientSection } from "@/components/IngredientSection";
import { RecipeDisplaySection } from "@/components/RecipeDisplaySection";

interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

export default function HomeScreen() {
  const { token } = useAuth();

  const authClient = useMemo(
    () => (token ? createAuthClient(token) : null),
    [token]
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

  const generateRecipe = useCallback(
    async (params: {
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
              ratedRecipes = data as { name: string; rating: number }[];
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
            ratedRecipes: ratedRecipes.length > 0 ? ratedRecipes : undefined,
          },
        });

        if (geminiError || !data) throw new Error("レシピ生成に失敗しました");
        const recipeData = data as unknown as { recipe: string; recipeName: string };
        setRecipe(recipeData.recipe);

        if (recipeData.recipeName) {
          setRecipeName(recipeData.recipeName);

          let savedVideos: YouTubeVideo[] = [];
          try {
            const { data: ytData } = await authClient.GET("/youtube/search", {
              params: { query: { q: recipeData.recipeName } },
            });
            const ytResult = ytData as unknown as { videos?: YouTubeVideo[] };
            if (ytResult?.videos) {
              savedVideos = ytResult.videos;
              setYoutubeVideos(ytResult.videos);
            }
          } catch {}

          if (authClient) {
            try {
              const { data: savedRecipe } = await authClient.POST("/recipes", {
                body: {
                  name: recipeData.recipeName,
                  content: recipeData.recipe,
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
      } catch {
        setRecipe("レシピの生成中にエラーが発生しました。もう一度お試しください。");
      } finally {
        setIsGenerating(false);
      }
    },
    [authClient]
  );

  if (!token) return null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f9fafb" }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <IngredientSection
        token={token}
        onGenerateRecipe={generateRecipe}
        isGenerating={isGenerating}
        onHasIngredientsChange={setHasIngredients}
      />

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
              if (authClient && savedRecipeId) {
                await authClient.PATCH("/recipes/{id}/rating", {
                  params: { path: { id: String(savedRecipeId) } },
                  body: { rating },
                });
              }
              Alert.alert("完了", "評価を記録しました");
            } catch {
              console.error("Failed to save rating");
            }
          }}
        />
      )}
    </ScrollView>
  );
}
