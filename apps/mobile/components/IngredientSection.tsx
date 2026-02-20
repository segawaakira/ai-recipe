import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createAuthClient } from "@/lib/auth-api-client";
import { API_URL } from "@/lib/api-client";
import { ImageUploadArea } from "./ImageUploadArea";
import { showConfirmDialog } from "./ConfirmDialog";

interface IngredientSectionProps {
  token: string;
  onGenerateRecipe: (params: {
    selectedIngredients: string[];
    allIngredients: string[];
    servings: number;
    genre: string;
  }) => void;
  isGenerating: boolean;
  onHasIngredientsChange?: (hasIngredients: boolean) => void;
}

const GENRES = [
  { label: "おまかせ", value: "" },
  { label: "和食", value: "和食" },
  { label: "中華", value: "中華" },
  { label: "イタリアン", value: "イタリアン" },
  { label: "フレンチ", value: "フレンチ" },
  { label: "韓国料理", value: "韓国料理" },
  { label: "エスニック", value: "エスニック" },
];

export function IngredientSection({
  token,
  onGenerateRecipe,
  isGenerating,
  onHasIngredientsChange,
}: IngredientSectionProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [isFetchedIngredients, setIsFetchedIngredients] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [servings, setServings] = useState(2);
  const [genre, setGenre] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "camera">("text");

  const isInitialLoad = useRef(true);
  const authClient = createAuthClient(token);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const { data } = await authClient.GET("/ingredient-sets");
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
  }, [token]);

  useEffect(() => {
    onHasIngredientsChange?.(ingredients.length > 0);
  }, [ingredients.length]);

  useEffect(() => {
    if (!isFetchedIngredients) return;
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    const updateIngredients = async () => {
      try {
        await authClient.PATCH("/ingredient-sets", {
          body: { ingredients },
        });
      } catch (error) {
        console.error("Failed to save ingredients:", error);
      }
    };
    updateIngredients();
  }, [ingredients, isFetchedIngredients]);

  const validateAndAddIngredients = useCallback(
    async (newItems: string[]) => {
      if (newItems.length === 0) return;

      const duplicates = newItems.filter((i) => ingredients.includes(i));
      const unique = newItems.filter((i) => !ingredients.includes(i));

      if (duplicates.length > 0) {
        Alert.alert(
          "重複",
          duplicates.map((d) => `「${d}」`).join("、") + "はすでに追加されています"
        );
      }

      if (unique.length === 0) return;

      setIsValidating(true);
      try {
        const res = await fetch(`${API_URL}/gemini/validate-ingredients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newIngredients: unique,
            existingIngredients: ingredients,
          }),
        });
        const data = await res.json();
        const results: Array<{
          name: string;
          isFood: boolean;
          similarTo?: string;
          isDuplicate?: boolean;
        }> = data.results || [];

        const hasProblems = results.some(
          (r) => !r.isFood || r.similarTo || r.isDuplicate
        );

        if (hasProblems) {
          const validItems = results
            .filter((r) => r.isFood && !r.isDuplicate)
            .map((r) => (r.similarTo ? r.similarTo : r.name));
          const invalidItems = results.filter((r) => !r.isFood);
          const duplicateItems = results.filter((r) => r.isDuplicate);

          let message = "";
          if (invalidItems.length > 0) {
            message += `食材でないもの: ${invalidItems.map((r) => r.name).join("、")}\n`;
          }
          if (duplicateItems.length > 0) {
            message += `重複: ${duplicateItems.map((r) => r.name).join("、")}\n`;
          }
          if (validItems.length > 0) {
            message += `\n追加可能: ${validItems.join("、")}`;
          }

          Alert.alert("バリデーション結果", message, [
            { text: "キャンセル", style: "cancel" },
            ...(validItems.length > 0
              ? [
                  {
                    text: `${validItems.length}個追加`,
                    onPress: () => {
                      setIngredients((prev) => [...prev, ...validItems]);
                    },
                  },
                ]
              : []),
          ]);
        } else {
          setIngredients((prev) => [...prev, ...unique]);
        }
      } catch {
        setIngredients((prev) => [...prev, ...unique]);
      } finally {
        setIsValidating(false);
      }
    },
    [ingredients]
  );

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
    setSelectedIngredients(selectedIngredients.filter((i) => i !== ingredient));
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      {/* Header */}
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="nutrition-outline" size={20} color="#374151" />
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
            食材管理
          </Text>
        </View>
        <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
          テキスト入力または画像から食材を追加できます
        </Text>
      </View>

      {/* Input Mode Tabs */}
      <View
        style={{
          flexDirection: "row",
          borderRadius: 8,
          backgroundColor: "#f3f4f6",
          padding: 4,
          marginBottom: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => setInputMode("text")}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 6,
            backgroundColor: inputMode === "text" ? "#fff" : "transparent",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <Ionicons
            name="text-outline"
            size={16}
            color={inputMode === "text" ? "#111827" : "#6b7280"}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: "500",
              color: inputMode === "text" ? "#111827" : "#6b7280",
            }}
          >
            テキスト入力
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setInputMode("camera")}
          style={{
            flex: 1,
            paddingVertical: 8,
            borderRadius: 6,
            backgroundColor: inputMode === "camera" ? "#fff" : "transparent",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <Ionicons
            name="camera-outline"
            size={16}
            color={inputMode === "camera" ? "#111827" : "#6b7280"}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: "500",
              color: inputMode === "camera" ? "#111827" : "#6b7280",
            }}
          >
            画像から追加
          </Text>
        </TouchableOpacity>
      </View>

      {/* Text Input */}
      {inputMode === "text" ? (
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <TextInput
            value={newIngredient}
            onChangeText={setNewIngredient}
            placeholder="食材名を入力..."
            onSubmitEditing={addIngredient}
            returnKeyType="done"
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              fontSize: 15,
            }}
          />
          <TouchableOpacity
            onPress={addIngredient}
            disabled={!newIngredient.trim() || isValidating}
            style={{
              backgroundColor: !newIngredient.trim() || isValidating ? "#d1d5db" : "#ea580c",
              borderRadius: 8,
              paddingHorizontal: 16,
              justifyContent: "center",
            }}
          >
            {isValidating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>追加</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ marginBottom: 16 }}>
          <ImageUploadArea
            onIngredientsRecognized={(newIngredients) => {
              if (newIngredients.length > 0) {
                validateAndAddIngredients(newIngredients);
              }
            }}
          />
        </View>
      )}

      {/* Owned Ingredients */}
      <View style={{ marginBottom: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "500", color: "#374151" }}>
            所有食材 ({ingredients.length}個)
          </Text>
          {ingredients.length > 0 && (
            <TouchableOpacity
              onPress={() => setIsEditMode(!isEditMode)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: isEditMode ? "#ea580c" : "transparent",
              }}
            >
              <Ionicons
                name={isEditMode ? "checkmark" : "pencil"}
                size={14}
                color={isEditMode ? "#fff" : "#6b7280"}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: isEditMode ? "#fff" : "#6b7280",
                }}
              >
                {isEditMode ? "完了" : "編集"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditMode && (
          <Text style={{ fontSize: 11, color: "#ef4444", marginBottom: 8 }}>
            削除する食材をタップしてください
          </Text>
        )}

        {!isFetchedIngredients ? (
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={{
                  height: 28,
                  width: 60 + i * 12,
                  borderRadius: 14,
                  backgroundColor: "#e5e7eb",
                }}
              />
            ))}
          </View>
        ) : ingredients.length === 0 ? (
          <Text
            style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", paddingVertical: 8 }}
          >
            食材を追加してください
          </Text>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {ingredients.map((ingredient, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (isEditMode) {
                    showConfirmDialog({
                      title: "食材削除の確認",
                      message: `本当に「${ingredient}」を削除しますか？`,
                      onConfirm: () => {
                        setIngredients(ingredients.filter((i) => i !== ingredient));
                        setSelectedIngredients(
                          selectedIngredients.filter((i) => i !== ingredient)
                        );
                      },
                    });
                  } else if (!selectedIngredients.includes(ingredient)) {
                    addToSelected(ingredient);
                  }
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: isEditMode
                    ? "#fef2f2"
                    : selectedIngredients.includes(ingredient)
                      ? "#f3f4f6"
                      : "#f3f4f6",
                  borderWidth: isEditMode ? 1 : 0,
                  borderColor: "#fecaca",
                  opacity: !isEditMode && selectedIngredients.includes(ingredient) ? 0.5 : 1,
                }}
              >
                {isEditMode ? (
                  <Ionicons name="trash-outline" size={12} color="#ef4444" />
                ) : !selectedIngredients.includes(ingredient) ? (
                  <Ionicons name="add" size={12} color="#ea580c" />
                ) : null}
                <Text style={{ fontSize: 13, color: "#374151" }}>{ingredient}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Selected Ingredients */}
      {ingredients.length > 0 && (
        <>
          <View style={{ alignItems: "center", marginVertical: 4 }}>
            <Ionicons name="arrow-down" size={16} color="#9ca3af" />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: "500", color: "#ea580c", marginBottom: 8 }}>
              使いたい食材 ({selectedIngredients.length}個)
            </Text>
            <View
              style={{
                minHeight: 48,
                borderRadius: 8,
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: selectedIngredients.length > 0 ? "#fdba74" : "#d1d5db",
                backgroundColor: selectedIngredients.length > 0 ? "#fff7ed" : "#f9fafb",
                padding: 12,
              }}
            >
              {selectedIngredients.length === 0 ? (
                <Text
                  style={{ fontSize: 12, color: "#9ca3af", textAlign: "center" }}
                >
                  上の所有食材から + で追加してください
                </Text>
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {selectedIngredients.map((ingredient, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => removeFromSelected(ingredient)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: "#ea580c",
                        backgroundColor: "#fff7ed",
                      }}
                    >
                      <Ionicons name="close" size={12} color="#ea580c" />
                      <Text style={{ fontSize: 13, color: "#ea580c" }}>{ingredient}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Genre & Servings */}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "#e5e7eb",
              paddingTop: 12,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: "500", color: "#374151" }}>ジャンル</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ maxWidth: 200 }}
                >
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    {GENRES.map((g) => (
                      <TouchableOpacity
                        key={g.value}
                        onPress={() => setGenre(g.value)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 14,
                          backgroundColor: genre === g.value ? "#ea580c" : "#f3f4f6",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: genre === g.value ? "#fff" : "#374151",
                          }}
                        >
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: "500", color: "#374151" }}>分量</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 8,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setServings(Math.max(1, servings - 1))}
                    style={{ paddingHorizontal: 10, paddingVertical: 6 }}
                  >
                    <Ionicons name="remove" size={16} color="#374151" />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 14, minWidth: 40, textAlign: "center" }}>
                    {servings}人分
                  </Text>
                  <TouchableOpacity
                    onPress={() => setServings(Math.min(10, servings + 1))}
                    style={{ paddingHorizontal: 10, paddingVertical: 6 }}
                  >
                    <Ionicons name="add" size={16} color="#374151" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            onPress={() =>
              onGenerateRecipe({
                selectedIngredients,
                allIngredients: ingredients,
                servings,
                genre,
              })
            }
            disabled={selectedIngredients.length === 0 || isGenerating}
            style={{
              backgroundColor:
                selectedIngredients.length === 0 || isGenerating ? "#d1d5db" : "#ea580c",
              borderRadius: 8,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isGenerating ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  レシピを生成中...
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="restaurant-outline" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  AIレシピを作成
                  {selectedIngredients.length > 0 && ` (${selectedIngredients.length}食材)`}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {selectedIngredients.length === 0 && (
            <Text
              style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 6 }}
            >
              使いたい食材を1つ以上選んでください
            </Text>
          )}
        </>
      )}
    </View>
  );
}
