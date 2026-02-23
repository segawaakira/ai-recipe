import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RecipeFollowUpProps {
  isLoading: boolean;
  onSend: (message: string) => void;
}

const PRESET_BUTTONS = [
  { label: "減塩版", message: "このレシピを減塩バージョンにアレンジしてください" },
  { label: "子供向け", message: "子供向けにアレンジしてください" },
  { label: "時短版", message: "時短バージョンにアレンジしてください" },
  { label: "カロリーオフ", message: "カロリーを抑えたバージョンにしてください" },
  { label: "代替食材", message: "手に入りにくい食材の代替案を教えてください" },
];

export function RecipeFollowUp({
  isLoading,
  onSend,
}: RecipeFollowUpProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <View style={{ borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 12, gap: 12 }}>
      <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}>
        レシピをアレンジ
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {PRESET_BUTTONS.map((preset) => (
          <TouchableOpacity
            key={preset.label}
            onPress={() => onSend(preset.message)}
            disabled={isLoading}
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              opacity: isLoading ? 0.5 : 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            {isLoading && <ActivityIndicator size="small" color="#6b7280" />}
            <Text style={{ fontSize: 13, color: "#374151" }}>{preset.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <TextInput
          placeholder="アレンジリクエストを入力..."
          placeholderTextColor="#9ca3af"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          editable={!isLoading}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 14,
            color: "#111827",
            backgroundColor: "#fff",
          }}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
          style={{
            backgroundColor: !input.trim() || isLoading ? "#93c5fd" : "#2563eb",
            borderRadius: 8,
            padding: 10,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
