import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "@/lib/api-client";
import { Ionicons } from "@expo/vector-icons";

interface ImageUploadAreaProps {
  onIngredientsRecognized: (ingredients: string[]) => void;
}

export function ImageUploadArea({ onIngredientsRecognized }: ImageUploadAreaProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("権限エラー", "画像ライブラリへのアクセス権限が必要です");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImage(asset.uri);
      if (asset.base64) {
        recognizeIngredients(asset.base64);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("権限エラー", "カメラへのアクセス権限が必要です");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImage(asset.uri);
      if (asset.base64) {
        recognizeIngredients(asset.base64);
      }
    }
  };

  const recognizeIngredients = async (base64: string) => {
    setIsRecognizing(true);
    try {
      const res = await fetch(`${API_URL}/gemini/recognize-ingredients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await res.json();
      if (data.ingredients && data.ingredients.length > 0) {
        onIngredientsRecognized(data.ingredients);
      } else {
        Alert.alert("認識結果", "食材を認識できませんでした");
      }
    } catch {
      Alert.alert("エラー", "画像の認識に失敗しました");
    } finally {
      setIsRecognizing(false);
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          onPress={pickImage}
          disabled={isRecognizing}
          style={{
            flex: 1,
            borderWidth: 2,
            borderColor: "#d1d5db",
            borderStyle: "dashed",
            borderRadius: 12,
            padding: 20,
            alignItems: "center",
            gap: 8,
          }}
        >
          <Ionicons name="images-outline" size={32} color="#9ca3af" />
          <Text style={{ fontSize: 12, color: "#6b7280" }}>ライブラリ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={takePhoto}
          disabled={isRecognizing}
          style={{
            flex: 1,
            borderWidth: 2,
            borderColor: "#d1d5db",
            borderStyle: "dashed",
            borderRadius: 12,
            padding: 20,
            alignItems: "center",
            gap: 8,
          }}
        >
          <Ionicons name="camera-outline" size={32} color="#9ca3af" />
          <Text style={{ fontSize: 12, color: "#6b7280" }}>カメラ</Text>
        </TouchableOpacity>
      </View>

      {isRecognizing && (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <ActivityIndicator size="small" color="#ea580c" />
          <Text style={{ fontSize: 13, color: "#ea580c" }}>食材を認識中...</Text>
        </View>
      )}

      {image && !isRecognizing && (
        <Image
          source={{ uri: image }}
          style={{ width: "100%", height: 150, borderRadius: 8 }}
          resizeMode="cover"
        />
      )}
    </View>
  );
}
