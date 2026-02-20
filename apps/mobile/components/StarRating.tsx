import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StarRatingProps {
  rating: number | null;
  onRate: (rating: number) => void;
  size?: number;
}

export function StarRating({ rating, onRate, size = 22 }: StarRatingProps) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onRate(star)}>
          <Ionicons
            name={rating && star <= rating ? "star" : "star-outline"}
            size={size}
            color={rating && star <= rating ? "#eab308" : "#d1d5db"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
