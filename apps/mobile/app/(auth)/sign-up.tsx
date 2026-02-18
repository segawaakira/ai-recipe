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

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("エラー", "メールアドレスとパスワードを入力してください");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("エラー", "パスワードが一致しません");
      return;
    }
    if (password.length < 8) {
      Alert.alert("エラー", "パスワードは8文字以上で入力してください");
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      Alert.alert("エラー", "パスワードには英字と数字を含めてください");
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email.trim(), password);
    } catch {
      Alert.alert("登録失敗", "アカウントの作成に失敗しました。別のメールアドレスをお試しください。");
    } finally {
      setIsLoading(false);
    }
  };

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
          新規登録
        </Text>
        <Text
          style={{
            fontSize: 14,
            textAlign: "center",
            color: "#6b7280",
            marginBottom: 32,
          }}
        >
          アカウントを作成してレシピを保存しましょう
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

          <View>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 }}>
              パスワード
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="8文字以上（英字・数字を含む）"
              secureTextEntry
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

          <View>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 }}>
              パスワード（確認）
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="パスワードをもう一度入力"
              secureTextEntry
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
            onPress={handleSignUp}
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
                アカウントを作成
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
          <Text style={{ color: "#6b7280", fontSize: 14 }}>
            アカウントをお持ちの方は{" "}
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text style={{ color: "#ea580c", fontSize: 14, fontWeight: "600" }}>
                ログイン
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
