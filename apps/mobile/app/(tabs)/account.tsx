import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { showConfirmDialog } from "@/components/ConfirmDialog";

export default function AccountScreen() {
  const { user, signOut, deleteAccount, changePassword, requestEmailChange } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const handleLogout = () => {
    showConfirmDialog({
      title: "ログアウト",
      message: "ログアウトしますか？",
      confirmText: "ログアウト",
      onConfirm: () => signOut(),
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "アカウント削除",
      "アカウントを削除すると、すべてのデータが失われます。本当に削除しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除する",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
            } catch {
              Alert.alert("エラー", "アカウントの削除に失敗しました");
            }
          },
        },
      ]
    );
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      Alert.alert("エラー", "メールアドレスを入力してください");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      Alert.alert("エラー", "有効なメールアドレスを入力してください");
      return;
    }

    setIsChangingEmail(true);
    try {
      await requestEmailChange(newEmail);
      Alert.alert("送信完了", "確認メールを新しいメールアドレスに送信しました");
      setShowChangeEmail(false);
      setNewEmail("");
    } catch {
      Alert.alert("エラー", "このメールアドレスは既に使用されています");
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert("エラー", "現在のパスワードを入力してください");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("エラー", "新しいパスワードは8文字以上で入力してください");
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      Alert.alert("エラー", "新しいパスワードには英字と数字を含めてください");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("エラー", "新しいパスワードが一致しません");
      return;
    }

    setIsChanging(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert("完了", "パスワードを変更しました");
      setShowChangePassword(false);
      resetPasswordForm();
    } catch {
      Alert.alert("エラー", "現在のパスワードが正しくありません");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb", padding: 16, gap: 16 }}>
      {/* User Info */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 20,
          alignItems: "center",
          gap: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#fed7aa",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="person" size={32} color="#ea580c" />
        </View>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
          {user?.email || ""}
        </Text>
      </View>

      {/* Actions */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowChangeEmail(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
          }}
        >
          <Ionicons name="mail-outline" size={22} color="#374151" />
          <Text style={{ flex: 1, fontSize: 15, color: "#374151" }}>メールアドレス変更</Text>
          <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowChangePassword(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
          }}
        >
          <Ionicons name="key-outline" size={22} color="#374151" />
          <Text style={{ flex: 1, fontSize: 15, color: "#374151" }}>パスワード変更</Text>
          <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#f3f4f6",
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="#374151" />
          <Text style={{ flex: 1, fontSize: 15, color: "#374151" }}>ログアウト</Text>
          <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingVertical: 16,
            paddingHorizontal: 20,
          }}
        >
          <Ionicons name="trash-outline" size={22} color="#ef4444" />
          <Text style={{ flex: 1, fontSize: 15, color: "#ef4444" }}>アカウント削除</Text>
          <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
        </TouchableOpacity>
      </View>

      {/* Change Email Modal */}
      <Modal
        visible={showChangeEmail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowChangeEmail(false);
          setNewEmail("");
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, backgroundColor: "#fff" }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#f3f4f6",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setShowChangeEmail(false);
                setNewEmail("");
              }}
            >
              <Text style={{ fontSize: 16, color: "#6b7280" }}>キャンセル</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: "600", color: "#111827" }}>
              メールアドレス変更
            </Text>
            <View style={{ width: 70 }} />
          </View>

          {/* Form */}
          <View style={{ padding: 24, gap: 20 }}>
            <Text style={{ fontSize: 14, color: "#6b7280" }}>
              新しいメールアドレスに確認メールが送信されます。メール内のリンクをクリックして変更を完了してください。
            </Text>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 }}>
                新しいメールアドレス
              </Text>
              <TextInput
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="example@email.com"
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
              onPress={handleChangeEmail}
              disabled={isChangingEmail}
              style={{
                backgroundColor: "#ea580c",
                borderRadius: 8,
                paddingVertical: 14,
                alignItems: "center",
                opacity: isChangingEmail ? 0.7 : 1,
                marginTop: 8,
              }}
            >
              {isChangingEmail ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  確認メールを送信
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowChangePassword(false);
          resetPasswordForm();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, backgroundColor: "#fff" }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#f3f4f6",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setShowChangePassword(false);
                resetPasswordForm();
              }}
            >
              <Text style={{ fontSize: 16, color: "#6b7280" }}>キャンセル</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: "600", color: "#111827" }}>
              パスワード変更
            </Text>
            <View style={{ width: 70 }} />
          </View>

          {/* Form */}
          <View style={{ padding: 24, gap: 20 }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 }}>
                現在のパスワード
              </Text>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="現在のパスワード"
                secureTextEntry
                autoCapitalize="none"
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
                新しいパスワード
              </Text>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="8文字以上（英字・数字を含む）"
                secureTextEntry
                autoCapitalize="none"
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
                新しいパスワード（確認）
              </Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="新しいパスワードをもう一度入力"
                secureTextEntry
                autoCapitalize="none"
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
              onPress={handleChangePassword}
              disabled={isChanging}
              style={{
                backgroundColor: "#ea580c",
                borderRadius: 8,
                paddingVertical: 14,
                alignItems: "center",
                opacity: isChanging ? 0.7 : 1,
                marginTop: 8,
              }}
            >
              {isChanging ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  パスワードを変更
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
