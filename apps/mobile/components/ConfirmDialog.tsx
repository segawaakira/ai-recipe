import { Alert } from "react-native";

interface ConfirmDialogOptions {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function showConfirmDialog({
  title,
  message,
  onConfirm,
  confirmText = "削除",
  cancelText = "キャンセル",
}: ConfirmDialogOptions) {
  Alert.alert(title, message, [
    { text: cancelText, style: "cancel" },
    { text: confirmText, style: "destructive", onPress: onConfirm },
  ]);
}
