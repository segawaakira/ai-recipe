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

export default function SignInScreen() {
  const { signIn, resendVerification } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("エラー", "メールアドレスとパスワードを入力してください");
      return;
    }
    setEmailNotVerified(false);
    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
      } else {
        Alert.alert("ログイン失敗", "メールアドレスまたはパスワードが正しくありません");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      Alert.alert("エラー", "メールアドレスを入力してください");
      return;
    }
    setIsResending(true);
    try {
      await resendVerification(email.trim());
      Alert.alert("送信完了", "確認メールを再送信しました");
    } catch {
      Alert.alert("エラー", "メールの送信に失敗しました");
    } finally {
      setIsResending(false);
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
          AI Recipe
        </Text>
        <Text
          style={{
            fontSize: 14,
            textAlign: "center",
            color: "#6b7280",
            marginBottom: 32,
          }}
        >
          ログインしてレシピを管理しましょう
        </Text>

        {emailNotVerified && (
          <View
            style={{
              backgroundColor: "#fefce8",
              borderWidth: 1,
              borderColor: "#fde68a",
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: "#92400e", fontWeight: "600", fontSize: 14 }}>
              メールアドレスが未確認です
            </Text>
            <Text style={{ color: "#a16207", fontSize: 13, marginTop: 4 }}>
              登録時に送信された確認メールのリンクをクリックしてください。
            </Text>
            <TouchableOpacity
              onPress={handleResendVerification}
              disabled={isResending}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: "#ea580c", fontWeight: "600", fontSize: 13, textDecorationLine: "underline" }}>
                {isResending ? "送信中..." : "確認メールを再送信"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
              placeholder="パスワード"
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

          <View style={{ alignItems: "flex-end" }}>
            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity>
                <Text style={{ color: "#ea580c", fontSize: 13, fontWeight: "500" }}>
                  パスワードを忘れた方
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          <TouchableOpacity
            onPress={handleSignIn}
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
                ログイン
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
          <Text style={{ color: "#6b7280", fontSize: 14 }}>
            アカウントをお持ちでない方は{" "}
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text style={{ color: "#ea580c", fontSize: 14, fontWeight: "600" }}>
                新規登録
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
