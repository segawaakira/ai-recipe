import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Markdown from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { createAuthClient } from "@/lib/auth-api-client";
import { StarRating } from "@/components/StarRating";
import { YouTubeVideos } from "@/components/YouTubeVideos";
import { RecipeMeta } from "@/components/RecipeMeta";
import { showConfirmDialog } from "@/components/ConfirmDialog";
import type { components } from "@repo/api-types";

type Recipe = components["schemas"]["RecipeResponseDto"];

const markdownStyles = {
  body: { fontSize: 14, color: "#374151", lineHeight: 22 },
  heading1: { fontSize: 20, fontWeight: "700" as const, color: "#111827", marginTop: 16, marginBottom: 8 },
  heading2: { fontSize: 17, fontWeight: "600" as const, color: "#111827", marginTop: 14, marginBottom: 6 },
  heading3: { fontSize: 15, fontWeight: "600" as const, color: "#111827", marginTop: 12, marginBottom: 4 },
  list_item: { marginBottom: 4 },
  strong: { fontWeight: "600" as const },
};

export default function RecipeDetailScreen() {
  const { token } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const authClient = useMemo(
    () => (token ? createAuthClient(token) : null),
    [token]
  );

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!authClient || !id) return;
      setIsLoading(true);
      try {
        const { data, error } = await authClient.GET("/recipes/{id}", {
          params: { path: { id } },
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
    fetchRecipe();
  }, [id, authClient]);

  const handleDelete = () => {
    if (!recipe) return;
    showConfirmDialog({
      title: "履歴削除の確認",
      message: `本当に「${recipe.name}」を削除しますか？`,
      onConfirm: async () => {
        try {
          if (authClient) {
            await authClient.DELETE("/recipes/{id}", {
              params: { path: { id: String(recipe.id) } },
            });
          }
          router.back();
        } catch {
          Alert.alert("エラー", "削除に失敗しました");
        }
      },
    });
  };

  const handleRate = async (rating: number) => {
    if (!authClient || !recipe) return;
    try {
      await authClient.PATCH("/recipes/{id}/rating", {
        params: { path: { id: String(recipe.id) } },
        body: { rating },
      });
      setRecipe((prev) => (prev ? { ...prev, rating } : prev));
      Alert.alert("完了", "評価を記録しました");
    } catch {
      Alert.alert("エラー", "評価の保存に失敗しました");
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  if (notFound || !recipe) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 14, color: "#9ca3af" }}>レシピが見つかりません</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f9fafb" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
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
        {/* Title */}
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 8 }}>
          {recipe.name}
        </Text>

        {/* Date & Rating */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="time-outline" size={14} color="#9ca3af" />
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>
              {new Date(recipe.createdAt).toLocaleDateString("ja-JP")}
            </Text>
          </View>
          <StarRating rating={recipe.rating ?? null} onRate={handleRate} />
        </View>

        {/* Meta */}
        <RecipeMeta ingredients={recipe.ingredients} genre={recipe.genre ?? null} />

        {/* Content */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            paddingTop: 16,
            marginTop: 12,
          }}
        >
          <Markdown style={markdownStyles}>{recipe.content}</Markdown>
        </View>

        {/* YouTube */}
        {recipe.youtubeVideos && recipe.youtubeVideos.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <YouTubeVideos videos={recipe.youtubeVideos} recipeName={recipe.name} ingredients={recipe.ingredients} genre={recipe.genre} />
          </View>
        )}

        {/* Delete */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            paddingTop: 12,
            marginTop: 16,
            alignItems: "flex-end",
          }}
        >
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "#fecaca",
            }}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
            <Text style={{ fontSize: 13, color: "#ef4444" }}>このレシピを削除</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
