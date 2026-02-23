"use client";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";

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
    <div className="space-y-3">
      <Separator />
      <p className="text-sm font-medium text-gray-700">
        レシピをアレンジ
      </p>

      <div className="flex flex-wrap gap-2">
        {PRESET_BUTTONS.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => onSend(preset.message)}
            className="cursor-pointer"
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="アレンジリクエストを入力..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSend();
          }}
          disabled={isLoading}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="cursor-pointer"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
