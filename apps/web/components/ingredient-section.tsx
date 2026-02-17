"use client";

import type React from "react";

import { Skeleton } from "@repo/ui/components/skeleton";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import {
  ArrowDown,
  Carrot,
  Check,
  ChefHat,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { apiClient } from "@/lib/api-client";
import { useToast } from "@repo/ui/hooks/use-toast";
import { ConfirmDialog } from "components/confirm-dialog";
import { ImageUploadArea } from "components/image-upload-area";
import {
  IngredientValidationDialog,
  type ValidationResult,
} from "components/ingredient-validation-dialog";
import { Camera, Type } from "lucide-react";

interface IngredientSectionProps {
  session: { user?: { id?: string } } | null;
  onGenerateRecipe: (params: {
    selectedIngredients: string[];
    allIngredients: string[];
    servings: number;
    genre: string;
  }) => void;
  isGenerating: boolean;
  onHasIngredientsChange?: (hasIngredients: boolean) => void;
}

function IngredientsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton
          key={i}
          className="h-7 rounded-full"
          style={{ width: `${60 + i * 12}px` }}
        />
      ))}
    </div>
  );
}

export function IngredientSection({
  session,
  onGenerateRecipe,
  isGenerating,
  onHasIngredientsChange,
}: IngredientSectionProps) {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [isFetchedIngredients, setIsFetchedIngredients] = useState(false);

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [servings, setServings] = useState(2);
  const [genre, setCuisine] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [showIngredientDeleteConfirm, setShowIngredientDeleteConfirm] =
    useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<string>("");

  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [isValidating, setIsValidating] = useState(false);

  const isInitialLoad = useRef(true);

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
        setTimeout(() => {
          setIsFetchedIngredients(true);
        }, 1000);
      }
    };

    fetchIngredients();
  }, [session?.user?.id]);

  useEffect(() => {
    onHasIngredientsChange?.(ingredients.length > 0);
  }, [ingredients.length, onHasIngredientsChange]);

  useEffect(() => {
    if (!session?.user?.id || !isFetchedIngredients) return;
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    const updateIngredients = async () => {
      try {
        await apiClient.PATCH("/ingredient-sets/{id}", {
          params: { path: { id: String(session?.user?.id) } },
          body: {
            ingredients: ingredients,
          },
        });
      } catch (error) {
        console.error("Failed to save ingredients:", error);
      }
    };

    updateIngredients();
  }, [ingredients, session?.user?.id, isFetchedIngredients]);

  const validateAndAddIngredients = async (newItems: string[]) => {
    if (newItems.length === 0) return;

    const duplicates = newItems.filter((i) => ingredients.includes(i));
    const unique = newItems.filter((i) => !ingredients.includes(i));

    if (duplicates.length > 0) {
      toast.error(
        duplicates.length === 1
          ? `「${duplicates[0]}」はすでに追加されています`
          : `${duplicates.map((d) => `「${d}」`).join("、")}はすでに追加されています`
      );
    }

    if (unique.length === 0) return;

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
      const results: ValidationResult[] = data.results || [];

      const hasProblems = results.some(
        (r) => !r.isFood || r.similarTo || r.isDuplicate
      );

      if (hasProblems) {
        setValidationResults(results);
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
    if (trimmed) {
      setNewIngredient("");
      validateAndAddIngredients([trimmed]);
    }
  };

  const addToSelected = (ingredient: string) => {
    if (!selectedIngredients.includes(ingredient)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const removeFromSelected = (ingredient: string) => {
    setSelectedIngredients(
      selectedIngredients.filter((i) => i !== ingredient)
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addIngredient();
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Carrot className="h-5 w-5" />
            食材管理
          </CardTitle>
          <CardDescription>
            テキスト入力または画像から食材を追加できます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="text">
            <TabsList className="w-full">
              <TabsTrigger value="text" className="flex items-center gap-1">
                <Type className="h-4 w-4" />
                テキスト入力
              </TabsTrigger>
              <TabsTrigger value="camera" className="flex items-center gap-1">
                <Camera className="h-4 w-4" />
                画像から追加
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
                  className="cursor-pointer"
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
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-gray-700">
                所有食材 ({ingredients.length}個)
              </h3>
              {ingredients.length > 0 && (
                <Button
                  variant={isEditMode ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 px-2 text-xs gap-1 cursor-pointer ${
                    isEditMode
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  {isEditMode ? (
                    <>
                      <Check className="h-3 w-3" />
                      完了
                    </>
                  ) : (
                    <>
                      <Pencil className="h-3 w-3" />
                      編集
                    </>
                  )}
                </Button>
              )}
            </div>
            {isEditMode && (
              <p className="text-xs text-red-500">
                削除する食材をタップしてください
              </p>
            )}
            {!isFetchedIngredients && session?.user?.id ? (
              <IngredientsSkeleton />
            ) : ingredients.length === 0 ? (
              <p className="text-xs text-gray-400 text-center">
                食材を追加してください
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={`flex items-center gap-1 px-3 py-1 cursor-pointer select-none ${
                      isEditMode
                        ? "border border-red-200 hover:bg-red-100"
                        : selectedIngredients.includes(ingredient)
                          ? "opacity-50 cursor-default"
                          : "hover:bg-orange-100"
                    }`}
                    onClick={() => {
                      if (isEditMode) {
                        setIngredientToDelete(ingredient);
                        setShowIngredientDeleteConfirm(true);
                      } else if (
                        !selectedIngredients.includes(ingredient)
                      ) {
                        addToSelected(ingredient);
                      }
                    }}
                  >
                    {isEditMode ? (
                      <>
                        <Trash2 className="h-3 w-3 text-red-500" />
                        {ingredient}
                      </>
                    ) : (
                      <>
                        {!selectedIngredients.includes(ingredient) && (
                          <Plus className="h-3 w-3 text-orange-600" />
                        )}
                        {ingredient}
                      </>
                    )}
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
                  使いたい食材 ({selectedIngredients.length}個)
                </h3>
                <div
                  className={`min-h-[48px] rounded-lg border-2 border-dashed p-3 transition-colors ${
                    selectedIngredients.length > 0
                      ? "border-orange-300 bg-orange-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  {selectedIngredients.length === 0 ? (
                    <p className="text-gray-400 text-xs text-center">
                      上の所有食材から + で追加してください
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedIngredients.map((ingredient, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="flex items-center gap-1 px-3 py-1 border-orange-600 text-orange-600 hover:bg-orange-50 cursor-pointer select-none"
                          onClick={() => removeFromSelected(ingredient)}
                        >
                          <X className="h-3 w-3 text-orange-600" />
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {ingredients.length > 0 && (
            <>
              <Separator />

              {/* 人数・ジャンル選択 */}
              <div className="flex items-center gap-2 justify-end flex-wrap">
                <h3 className="font-medium text-sm text-gray-700">ジャンル</h3>
                <select
                  value={genre}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                >
                  <option value="">おまかせ</option>
                  <option value="和食">和食</option>
                  <option value="中華">中華</option>
                  <option value="イタリアン">イタリアン</option>
                  <option value="フレンチ">フレンチ</option>
                  <option value="韓国料理">韓国料理</option>
                  <option value="エスニック">エスニック</option>
                </select>
                <h3 className="font-medium text-sm text-gray-700">分量</h3>
                <select
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}人分
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={() =>
                  onGenerateRecipe({
                    selectedIngredients,
                    allIngredients: ingredients,
                    servings,
                    genre,
                  })
                }
                disabled={selectedIngredients.length === 0 || isGenerating}
                className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer"
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
              {selectedIngredients.length === 0 && (
                <p className="text-xs text-gray-400 text-center">
                  使いたい食材を1つ以上選んでください
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
    </>
  );
}
