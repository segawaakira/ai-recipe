import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { createAuthClient } from "@/lib/auth-api-client";

interface RecipeHistoryItem {
  id: number;
  name: string;
  rating: number | null;
  createdAt: string;
}

export default function HistoryScreen() {
  const { token } = useAuth();
  const router = useRouter();

  const authClient = useMemo(
    () => (token ? createAuthClient(token) : null),
    [token]
  );

  const [recipes, setRecipes] = useState<RecipeHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const perPage = 20;

  const fetchRecipes = useCallback(
    async (pageNum: number, searchText: string, rating: number | null) => {
      if (!authClient) return;
      setIsLoading(true);
      try {
        const { data } = await authClient.GET("/recipes", {
          params: {
            query: {
              page: pageNum,
              perPage,
              search: searchText || undefined,
              ratingFilter: rating ?? undefined,
            },
          },
        });
        if (data) {
          const items = data.items as RecipeHistoryItem[];
          if (pageNum === 1) {
            setRecipes(items);
          } else {
            setRecipes((prev) => [...prev, ...items]);
          }
          setTotal(data.total);
        }
      } catch (error) {
        console.error("Failed to fetch recipe history:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [authClient]
  );

  useEffect(() => {
    setPage(1);
    fetchRecipes(1, appliedSearch, ratingFilter);
  }, [appliedSearch, ratingFilter, fetchRecipes]);

  const loadMore = () => {
    if (recipes.length < total && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRecipes(nextPage, appliedSearch, ratingFilter);
    }
  };

  const handleSearch = () => {
    setAppliedSearch(search);
  };

  const renderItem = ({ item }: { item: RecipeHistoryItem }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/history/${item.id}`)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        backgroundColor: "#fff",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{ fontSize: 14, fontWeight: "500", color: "#111827" }}
        >
          {item.name}
        </Text>
        <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
          {new Date(item.createdAt).toLocaleDateString("ja-JP")}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {item.rating ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            <Ionicons name="star" size={14} color="#eab308" />
            <Text style={{ fontSize: 13, color: "#eab308" }}>{item.rating}</Text>
          </View>
        ) : (
          <Text style={{ fontSize: 13, color: "#d1d5db" }}>-</Text>
        )}
        <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Search & Filter */}
      <View
        style={{
          padding: 12,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
          gap: 8,
        }}
      >
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              paddingHorizontal: 10,
            }}
          >
            <Ionicons name="search" size={16} color="#9ca3af" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="レシピ名・食材で検索..."
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 6, fontSize: 14 }}
            />
          </View>
          <TouchableOpacity
            onPress={handleSearch}
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              width: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="search" size={18} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Rating filter */}
        <View style={{ flexDirection: "row", gap: 6 }}>
          <TouchableOpacity
            onPress={() => setRatingFilter(null)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 14,
              backgroundColor: ratingFilter === null ? "#ea580c" : "#f3f4f6",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: ratingFilter === null ? "#fff" : "#374151",
              }}
            >
              全て
            </Text>
          </TouchableOpacity>
          {[5, 4, 3, 2, 1].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setRatingFilter(ratingFilter === n ? null : n)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 14,
                backgroundColor: ratingFilter === n ? "#ea580c" : "#f3f4f6",
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Ionicons
                name="star"
                size={12}
                color={ratingFilter === n ? "#fff" : "#eab308"}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: ratingFilter === n ? "#fff" : "#374151",
                }}
              >
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results */}
      <Text
        style={{
          fontSize: 12,
          color: "#6b7280",
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        {total}件のレシピ
      </Text>

      <FlatList
        data={recipes}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Ionicons name="search" size={32} color="#d1d5db" />
              <Text style={{ fontSize: 14, color: "#9ca3af", marginTop: 8 }}>
                {appliedSearch || ratingFilter
                  ? "該当するレシピが見つかりません"
                  : "まだレシピ履歴がありません"}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isLoading ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator size="small" color="#ea580c" />
            </View>
          ) : null
        }
      />
    </View>
  );
}
