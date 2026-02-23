import { View, Text, ActivityIndicator } from "react-native";
import Markdown from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";
import { RecipeFollowUp } from "./RecipeFollowUp";
import { StarRating } from "./StarRating";
import { YouTubeVideos } from "./YouTubeVideos";
import { RecipeMeta } from "./RecipeMeta";

interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

interface RecipeDisplaySectionProps {
  recipe: string;
  recipeName: string;
  youtubeVideos: YouTubeVideo[];
  savedRecipeId: number | null;
  recipeRating: number | null;
  recipeIngredients: string[];
  recipeGenre: string;
  onRate: (rating: number) => Promise<void>;
  isFollowUpLoading?: boolean;
  onSendFollowUp?: (message: string) => void;
}

const markdownStyles = {
  body: { fontSize: 14, color: "#374151", lineHeight: 22 },
  heading1: { fontSize: 20, fontWeight: "700" as const, color: "#111827", marginTop: 16, marginBottom: 8 },
  heading2: { fontSize: 17, fontWeight: "600" as const, color: "#111827", marginTop: 14, marginBottom: 6 },
  heading3: { fontSize: 15, fontWeight: "600" as const, color: "#111827", marginTop: 12, marginBottom: 4 },
  list_item: { marginBottom: 4 },
  strong: { fontWeight: "600" as const },
};

export function RecipeDisplaySection({
  recipe,
  recipeName,
  youtubeVideos,
  savedRecipeId,
  recipeRating,
  recipeIngredients,
  recipeGenre,
  onRate,
  isFollowUpLoading,
  onSendFollowUp,
}: RecipeDisplaySectionProps) {
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Ionicons name="restaurant-outline" size={20} color="#374151" />
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
            おすすめレシピ
          </Text>
        </View>
        <Text style={{ fontSize: 13, color: "#6b7280" }}>
          AIが提案するレシピが表示されます
        </Text>
      </View>

      {recipeName ? (
        <>
          <Text style={{ fontSize: 17, fontWeight: "600", color: "#111827", marginBottom: 8 }}>
            {recipeName}
          </Text>
          <RecipeMeta ingredients={recipeIngredients} genre={recipeGenre} />
        </>
      ) : null}

      {recipe && !isFollowUpLoading ? (
        <View style={{ gap: 16, marginTop: 12 }}>
          <Markdown style={markdownStyles}>{recipe}</Markdown>

          {savedRecipeId && (
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: "#e5e7eb",
                paddingTop: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 13, color: "#6b7280" }}>
                  このレシピはいかがですか？
                </Text>
                <StarRating rating={recipeRating} onRate={onRate} />
              </View>
              {recipeRating && (
                <Text
                  style={{ fontSize: 11, color: "#9ca3af", textAlign: "right", marginTop: 4 }}
                >
                  次回のレシピ提案に反映されます
                </Text>
              )}
            </View>
          )}

          {recipeName && onSendFollowUp && (
            <RecipeFollowUp
              isLoading={isFollowUpLoading ?? false}
              onSend={onSendFollowUp}
            />
          )}

          {recipeName && (
            <YouTubeVideos videos={youtubeVideos} recipeName={recipeName} />
          )}
        </View>
      ) : isFollowUpLoading ? (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <ActivityIndicator size="large" color="#ea580c" />
          <Text style={{ fontSize: 14, color: "#9ca3af", marginTop: 12 }}>
            レシピをアレンジ中...
          </Text>
        </View>
      ) : (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <Ionicons name="restaurant-outline" size={48} color="#d1d5db" />
          <Text style={{ fontSize: 14, color: "#9ca3af", marginTop: 12 }}>
            「AIレシピを作成」ボタンを押して
          </Text>
          <Text style={{ fontSize: 14, color: "#9ca3af" }}>
            おすすめレシピを生成してください
          </Text>
        </View>
      )}
    </View>
  );
}
