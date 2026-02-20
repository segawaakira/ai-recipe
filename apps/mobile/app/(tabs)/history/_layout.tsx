import { Stack } from "expo-router";

export default function HistoryLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "レシピ履歴",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "レシピ詳細",
        }}
      />
    </Stack>
  );
}
