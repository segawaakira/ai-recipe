import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("エラー", "メールアドレスを入力してください");
      return;
    }
    setIsLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch {
      // セキュリティ上、エラーでも成功表示
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24, backgroundColor: "#fff" }}>
        <Text
          style={{
            fontSize: 48,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          &#9993;
        </Text>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 12,
            color: "#111827",
          }}
        >
          メール送信完了
        </Text>
        <Text
          style={{
            fontSize: 14,
            textAlign: "center",
            color: "#6b7280",
            marginBottom: 8,
            lineHeight: 22,
          }}
        >
          パスワードリセット用のメールを送信しました。{"\n"}
          メールに記載されたリンクから新しいパスワードを設定してください。
        </Text>
        <Text
          style={{
            fontSize: 12,
            textAlign: "center",
            color: "#9ca3af",
            marginBottom: 24,
          }}
        >
          メールが届かない場合は、迷惑メールフォルダをご確認ください。
        </Text>
        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity>
            <Text style={{ color: "#ea580c", fontSize: 14, fontWeight: "600", textAlign: "center" }}>
              ログインページへ戻る
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 8,
            color: "#ea580c",
          }}
        >
          パスワードリセット
        </Text>
        <Text
          style={{
            fontSize: 14,
            textAlign: "center",
            color: "#6b7280",
            marginBottom: 32,
          }}
        >
          登録したメールアドレスを入力してください
        </Text>

        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 }}>
              メールアドレス
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 16,
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            style={{
              backgroundColor: "#ea580c",
              borderRadius: 8,
              paddingVertical: 14,
              alignItems: "center",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                リセットメールを送信
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: "center", marginTop: 24 }}>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text style={{ color: "#ea580c", fontSize: 14, fontWeight: "600" }}>
                ログインページへ戻る
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
