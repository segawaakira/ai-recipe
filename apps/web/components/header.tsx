"use client";

import { apiClient } from "@/lib/api-client";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { useToast } from "@repo/ui/hooks/use-toast";
import { ChefHat, Clock, LogOut, User, UserX } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = () => {
    signOut();
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) {
      toast.error("User session not found");
      return;
    }

    const confirmed = window.confirm(
      "本当にアカウントを削除しますか？この操作は取り消せません。"
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error } = await apiClient.DELETE("/users", {
        body: {
          id: Number(session.user.id),
        },
      });

      if (error) {
        toast.error("Failed to delete user");
        console.log(error);
        return;
      }

      toast.success("Account deleted successfully", {
        description: "Your account has been permanently deleted",
      });

      await signOut({ callbackUrl: "/auth/signin" });
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("Network error occurred");
    }
  };

  return (
    <div className="px-4 bg-white shadow-sm border-b">
      <header className="max-w-md mx-auto py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <h1 className="text-xl font-bold text-gray-900">
              AIレシピ提案アプリ
            </h1>
          </Link>

          {session?.user?.id ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3"
                >
                  <User className="h-8 w-8 text-orange-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <p className="text-xs text-gray-500 p-4 break-all">
                  {session?.user?.email}
                </p>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/history" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    レシピ提案履歴
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  ログアウト
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  退会する
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="/auth/signin">ログイン</a>
              </Button>
              <Button asChild>
                <a href="/auth/signup">新規登録</a>
              </Button>
            </div>
          )}
      </header>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              アカウント削除の確認
            </DialogTitle>
            <DialogDescription>
              本当にアカウントを削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                キャンセル
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteAccount();
                  setShowDeleteConfirm(false);
                }}
              >
                削除する
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
