"use client";

import type React from "react";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { ArrowDown, ChefHat, Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

import { apiClient } from "@/lib/api-client";
import { useToast } from "@repo/ui/hooks/use-toast";
import { ConfirmDialog } from "components/confirm-dialog";
import { Header } from "components/header";
import { ImageUploadArea } from "components/image-upload-area";
import {
  IngredientValidationDialog,
  type ValidationResult,
} from "components/ingredient-validation-dialog";
import { StarRating } from "components/star-rating";
import { YouTubeVideos } from "components/youtube-videos";
import { Camera, Type, User } from "lucide-react";
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
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [isFetchedIngredients, setIsFetchedIngredients] = useState(false);

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [servings, setServings] = useState(2);
  const [recipe, setRecipe] = useState("");
  const [recipeName, setRecipeName] = useState("");
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [savedRecipeId, setSavedRecipeId] = useState<number | null>(null);
  const [recipeRating, setRecipeRating] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showIngredientDeleteConfirm, setShowIngredientDeleteConfirm] =
    useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<string>("");
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchIngredients = async () => {
      try {
        const { data } = await apiClient.GET("/ingredient-sets", {
          params: { query: { userId: Number(session?.user?.id) } },
        });
        if (data && data.length > 0 && data[0]) {
          setIngredients(data[0].ingredients);
        }
      } catch (error) {
        console.error("Failed to fetch ingredients:", error);
      } finally {
        setIsFetchedIngredients(true);
      }
    };

    fetchIngredients();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id || !isFetchedIngredients) return;
    const updateIngredients = async () => {
      try {
        await apiClient.PATCH("/ingredient-sets/{id}", {
          params: { path: { id: String(session?.user?.id) } },
          body: {
            ingredients: ingredients,
          },
        });
      } catch (error) {
        console.error("Failed to fetch ingredients:", error);
      }
    };

    updateIngredients();
  }, [ingredients, session?.user?.id, isFetchedIngredients]);

  const validateAndAddIngredients = async (newItems: string[]) => {
    const exactDuplicates = newItems.filter((i) => ingredients.includes(i));
    const unique = newItems.filter((i) => !ingredients.includes(i));

    if (unique.length === 0 && exactDuplicates.length === 0) return;

    const duplicateResults: ValidationResult[] = exactDuplicates.map((name) => ({
      name,
      isFood: true,
      similarTo: null,
      isDuplicate: true,
    }));

    if (unique.length === 0) {
      setValidationResults(duplicateResults);
      setShowValidationDialog(true);
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/gemini/validate-ingredients`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newIngredients: unique,
            existingIngredients: ingredients,
          }),
        }
      );
      const data = await res.json();
      const apiResults: ValidationResult[] = data.results || [];

      const allResults = [...duplicateResults, ...apiResults];
      const hasProblems = allResults.some(
        (r) => !r.isFood || r.similarTo || r.isDuplicate
      );

      if (hasProblems) {
        setValidationResults(allResults);
        setShowValidationDialog(true);
      } else {
        setIngredients((prev) => [...prev, ...unique]);
        toast.success(`${unique.length}個の食材を追加しました`);
      }
    } catch {
      setIngredients((prev) => [...prev, ...unique]);
      toast.success(`${unique.length}個の食材を追加しました`);
    } finally {
      setIsValidating(false);
    }
  };

  const addIngredient = () => {
    const trimmed = newIngredient.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setNewIngredient("");
      validateAndAddIngredients([trimmed]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  const addToSelected = (ingredient: string) => {
    if (!selectedIngredients.includes(ingredient)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const removeFromSelected = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter((i) => i !== ingredient));
  };

  const generateRecipe = async () => {
    if (selectedIngredients.length === 0) return;

    setIsGenerating(true);
    setRecipe("");
    setRecipeName("");
    setYoutubeVideos([]);
    setSavedRecipeId(null);
    setRecipeRating(null);
    try {
      // 評価済みレシピを取得してプロンプトに反映
      let ratedRecipes: { name: string; rating: number }[] = [];
      if (session?.user?.id) {
        try {
          const ratedRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/recipes/rated?userId=${session.user.id}`
          );
          ratedRecipes = await ratedRes.json();
        } catch {}
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/gemini/generate-recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredIngredients: selectedIngredients,
          allIngredients: ingredients,
          servings,
          ratedRecipes: ratedRecipes.length > 0 ? ratedRecipes : undefined,
        }),
      });

      const data = await response.json();
      setRecipe(data.recipe);
      if (data.recipeName) {
        setRecipeName(data.recipeName);
        // YouTube動画を検索
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

        // DBに自動保存
        if (session?.user?.id) {
          try {
            const { data: savedRecipe } = await apiClient.POST("/recipes", {
              body: {
                userId: Number(session.user.id),
                name: data.recipeName,
                content: data.recipe,
                ingredients: selectedIngredients,
                servings,
                youtubeVideos: savedVideos.length > 0 ? (savedVideos as unknown as Record<string, never>) : undefined,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addIngredient();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header />

      <div className="p-4">
        <div className="max-w-[640px] mx-auto space-y-6">
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

          <div className="max-w-[640px] mx-auto space-y-6">
            {/* <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <ChefHat className="h-8 w-8 text-orange-600" />
                AIレシピ提案アプリ
              </h1>
              <p className="text-gray-600">
                所有している食材からAIがおすすめレシピを提案します
              </p>
            </div> */}

            <div className="flex gap-4 flex-col w-full">
              {/* 食材管理セクション */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    食材管理
                  </CardTitle>
                  <CardDescription>
                    テキスト入力または画像から食材を追加できます
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 食材追加方法の切り替え */}
                  <Tabs defaultValue="text">
                    <TabsList className="w-full">
                      <TabsTrigger value="text" className="flex items-center gap-1">
                        <Type className="h-4 w-4" />
                        テキスト入力
                      </TabsTrigger>
                      <TabsTrigger value="camera" className="flex items-center gap-1">
                        <Camera className="h-4 w-4" />
                        カメラで追加
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="text">
                      <div className="flex gap-2">
                        <Input
                          placeholder="食材名を入力..."
                          value={newIngredient}
                          onChange={(e) => setNewIngredient(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1"
                        />
                        <Button
                          onClick={addIngredient}
                          disabled={!newIngredient.trim() || isValidating}
                        >
                          {isValidating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "追加"
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="camera">
                      <ImageUploadArea
                        onIngredientsRecognized={(newIngredients) => {
                          if (newIngredients.length > 0) {
                            validateAndAddIngredients(newIngredients);
                          }
                        }}
                      />
                    </TabsContent>
                  </Tabs>

                  {/* 所有食材一覧 */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-gray-700">
                      所有食材 ({ingredients.length}個)
                    </h3>
                    {ingredients.length === 0 ? (
                      <p className="text-gray-500 text-sm py-4 text-center">
                        食材を追加してください
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {ingredients.map((ingredient, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className={`flex items-center gap-1 px-3 py-1 ${
                              selectedIngredients.includes(ingredient)
                                ? "opacity-50"
                                : ""
                            }`}
                          >
                            {!selectedIngredients.includes(ingredient) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-green-100"
                                onClick={() => addToSelected(ingredient)}
                              >
                                <Plus className="h-3 w-3 text-green-600" />
                              </Button>
                            )}
                            {ingredient}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-red-100"
                              onClick={() => {
                                setIngredientToDelete(ingredient);
                                setShowIngredientDeleteConfirm(true);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 使いたい食材エリア */}
                  {ingredients.length > 0 && (
                    <>
                      <div className="flex justify-center">
                        <ArrowDown className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm text-orange-700">
                          特に使いたい食材 ({selectedIngredients.length}個)
                        </h3>
                        <div
                          className={`min-h-[48px] rounded-lg border-2 border-dashed p-3 transition-colors ${
                            selectedIngredients.length > 0
                              ? "border-orange-300 bg-orange-50"
                              : "border-gray-300 bg-gray-50"
                          }`}
                        >
                          {selectedIngredients.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center">
                              上の所有食材から + で追加してください
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {selectedIngredients.map((ingredient, index) => (
                                <Badge
                                  key={index}
                                  className="flex items-center gap-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                  {ingredient}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-orange-800"
                                    onClick={() =>
                                      removeFromSelected(ingredient)
                                    }
                                  >
                                    <X className="h-3 w-3 text-white" />
                                  </Button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* 人数選択 */}
                  <div className="flex items-center gap-2 justify-end">
                    <h3 className="font-medium text-sm text-gray-700">分量</h3>
                    <select
                      value={servings}
                      onChange={(e) => setServings(Number(e.target.value))}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>{n}人分</option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={generateRecipe}
                    disabled={
                      selectedIngredients.length === 0 || isGenerating
                    }
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        レシピを生成中...
                      </>
                    ) : (
                      <>
                        <ChefHat className="h-4 w-4 mr-2" />
                        AIレシピを作成
                        {selectedIngredients.length > 0 &&
                          ` (${selectedIngredients.length}食材)`}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

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
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{recipe}</ReactMarkdown>
                      </div>
                      {recipeName && (
                        <YouTubeVideos videos={youtubeVideos} recipeName={recipeName} />
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
                                      headers: { "Content-Type": "application/json" },
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
        </div>
      </div>

      <ConfirmDialog
        open={showIngredientDeleteConfirm}
        onOpenChange={(open) => {
          setShowIngredientDeleteConfirm(open);
          if (!open) setIngredientToDelete("");
        }}
        title="食材削除の確認"
        description={`本当に「${ingredientToDelete}」を削除しますか？`}
        onConfirm={() => {
          setIngredients(
            ingredients.filter((i) => i !== ingredientToDelete)
          );
          setSelectedIngredients(
            selectedIngredients.filter((i) => i !== ingredientToDelete)
          );
          setIngredientToDelete("");
        }}
      />

      <IngredientValidationDialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        results={validationResults}
        onConfirm={(selected) => {
          if (selected.length > 0) {
            setIngredients((prev) => [...prev, ...selected]);
            toast.success(`${selected.length}個の食材を追加しました`);
          }
        }}
      />
    </div>
  );
}
