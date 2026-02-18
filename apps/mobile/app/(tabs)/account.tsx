import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { showConfirmDialog } from "@/components/ConfirmDialog";

export default function AccountScreen() {
  const { user, signOut, deleteAccount } = useAuth();

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
    </View>
  );
}
