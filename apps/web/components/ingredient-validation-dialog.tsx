"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { AlertTriangle } from "lucide-react";

export interface ValidationResult {
  name: string;
  isFood: boolean;
  similarTo: string | null;
  isDuplicate?: boolean;
}

interface IngredientValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: ValidationResult[];
  onConfirm: (selectedIngredients: string[]) => void;
}

export function IngredientValidationDialog({
  open,
  onOpenChange,
  results,
  onConfirm,
}: IngredientValidationDialogProps) {
  const problemResults = results.filter(
    (r) => !r.isFood || r.similarTo || r.isDuplicate
  );
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    for (const r of problemResults) {
      initial[r.name] = r.isDuplicate ? false : true;
    }
    setCheckedItems(initial);
  }, [results]);

  const toggleItem = (name: string) => {
    setCheckedItems((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleConfirm = () => {
    const okResults = results.filter(
      (r) => r.isFood && !r.similarTo && !r.isDuplicate
    );
    const selectedProblem = problemResults.filter(
      (r) => !r.isDuplicate && checkedItems[r.name]
    );
    const selectedNames = [
      ...okResults.map((r) => r.name),
      ...selectedProblem.map((r) => r.name),
    ];
    onConfirm(selectedNames);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            食材の確認
          </DialogTitle>
          <DialogDescription>
            以下の食材に問題がある可能性があります。追加する食材を選択してください。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {problemResults.map((result) => (
            <div
              key={result.name}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                result.isDuplicate
                  ? "bg-gray-50 opacity-60"
                  : "cursor-pointer hover:bg-gray-50"
              } transition-colors`}
              onClick={() => {
                if (!result.isDuplicate) toggleItem(result.name);
              }}
            >
              {result.isDuplicate ? (
                <div className="mt-0.5 h-4 w-4" />
              ) : (
                <input
                  type="checkbox"
                  checked={checkedItems[result.name] ?? false}
                  onChange={() => toggleItem(result.name)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-orange-600"
                />
              )}
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm">{result.name}</span>
                {result.isDuplicate && (
                  <p className="text-gray-500 text-xs mt-0.5">
                    「{result.name}」は既に追加されています
                  </p>
                )}
                {!result.isFood && (
                  <p className="text-red-600 text-xs mt-0.5">
                    「{result.name}」は食材ではない可能性があります
                  </p>
                )}
                {result.similarTo && (
                  <p className="text-orange-600 text-xs mt-0.5">
                    「{result.name}」は既存の「{result.similarTo}
                    」と似ています
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-orange-600 hover:bg-orange-700"
          >
            追加する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
