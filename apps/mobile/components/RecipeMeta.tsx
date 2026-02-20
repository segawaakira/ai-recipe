import { View, Text } from "react-native";

interface RecipeMetaProps {
  ingredients: string[];
  genre: string | null;
}

export function RecipeMeta({ ingredients, genre }: RecipeMetaProps) {
  return (
    <View style={{ gap: 8 }}>
      {genre && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 10,
              backgroundColor: "#dbeafe",
            }}
          >
            <Text style={{ fontSize: 11, color: "#1d4ed8" }}>{genre}</Text>
          </View>
        </View>
      )}
      {ingredients.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
          {ingredients.map((ingredient, index) => (
            <View
              key={index}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 10,
                backgroundColor: "#f3f4f6",
              }}
            >
              <Text style={{ fontSize: 11, color: "#374151" }}>{ingredient}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
