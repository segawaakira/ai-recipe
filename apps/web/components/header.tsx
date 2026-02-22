"use client";

import { apiClient } from "@/lib/api-client";
import { createAuthClient } from "@/lib/auth-api-client";
import { ChangePasswordInput, type ChangePasswordInputType, RequestEmailChangeInput, type RequestEmailChangeInputType } from "@repo/api-schema";
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
import { Input } from "@repo/ui/components/input";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Clock, KeyRound, LogOut, Mail, Menu, UserX } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ConfirmDialog } from "./confirm-dialog";
import { PasswordInput } from "./password-input";

const ChangePasswordForm = ChangePasswordInput.extend({
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

type ChangePasswordFormType = z.infer<typeof ChangePasswordForm>;

export function Header() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);

  const authClient = useMemo(
    () => session?.accessToken ? createAuthClient(session.accessToken) : null,
    [session?.accessToken]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormType>({
    resolver: zodResolver(ChangePasswordForm),
  });

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    reset: resetEmail,
    formState: { errors: emailErrors, isSubmitting: isSubmittingEmail },
  } = useForm<RequestEmailChangeInputType>({
    resolver: zodResolver(RequestEmailChangeInput),
  });

  const handleLogout = () => {
    signOut();
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) {
      toast.error("User session not found");
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

  const handleChangePassword = async (data: ChangePasswordFormType) => {
    if (!authClient) {
      toast.error("ログインが必要です");
      return;
    }

    try {
      const { error } = await authClient.POST("/auth/change-password", {
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
      });

      if (error) {
        toast.error("現在のパスワードが正しくありません");
        return;
      }

      toast.success("パスワードを変更しました");
      setShowChangePassword(false);
      reset();
    } catch {
      toast.error("エラーが発生しました");
    }
  };

  const handleChangeEmail = async (data: RequestEmailChangeInputType) => {
    if (!authClient) {
      toast.error("ログインが必要です");
      return;
    }

    try {
      const { error } = await authClient.POST("/auth/request-email-change", {
        body: { newEmail: data.newEmail },
      });

      if (error) {
        toast.error("このメールアドレスは既に使用されています");
        return;
      }

      toast.success("確認メールを新しいメールアドレスに送信しました");
      setShowChangeEmail(false);
      resetEmail();
    } catch {
      toast.error("エラーが発生しました");
    }
  };

  return (
    <div className="px-4 bg-white shadow-sm border-b">
      <header className="max-w-md mx-auto py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="AI Recipe" width={28} height={28} />
            <h1 className="text-lg font-bold text-gray-900">
              AIレシピ提案アプリ
            </h1>
          </Link>

          {session?.user?.id ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <Button
                  variant="ghost"
                  className="flex items-center"
                  type="button"
                >
                  <Menu className="h-8 w-8 text-orange-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <p className="text-xs text-gray-500 p-4 break-all">
                  {session?.user?.email}
                </p>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/history" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    レシピ提案履歴
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowChangeEmail(true)}
                  className="cursor-pointer"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  メールアドレス変更
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowChangePassword(true)}
                  className="cursor-pointer"
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  パスワード変更
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  ログアウト
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteConfirm(true)}
                  className="cursor-pointer"
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

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="アカウント削除の確認"
        description="本当にアカウントを削除しますか？この操作は取り消せません。"
        onConfirm={handleDeleteAccount}
      />

      <Dialog open={showChangeEmail} onOpenChange={(open) => {
        setShowChangeEmail(open);
        if (!open) resetEmail();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>メールアドレス変更</DialogTitle>
            <DialogDescription>
              新しいメールアドレスを入力してください。確認メールが送信されます。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEmail(handleChangeEmail)} className="space-y-4">
            <div>
              <Input
                {...registerEmail("newEmail")}
                type="email"
                placeholder="新しいメールアドレス"
              />
              {emailErrors.newEmail && (
                <p className="mt-1 text-sm text-red-600">{emailErrors.newEmail.message}</p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowChangeEmail(false);
                  resetEmail();
                }}
                className="cursor-pointer"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingEmail}
                className="bg-orange-600 hover:bg-orange-700 cursor-pointer"
              >
                {isSubmittingEmail ? "送信中..." : "確認メールを送信"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showChangePassword} onOpenChange={(open) => {
        setShowChangePassword(open);
        if (!open) reset();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>パスワード変更</DialogTitle>
            <DialogDescription>
              現在のパスワードと新しいパスワードを入力してください
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-4">
            <div>
              <PasswordInput
                {...register("currentPassword")}
                placeholder="現在のパスワード"
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <PasswordInput
                {...register("newPassword")}
                placeholder="新しいパスワード"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <PasswordInput
                {...register("confirmPassword")}
                placeholder="新しいパスワード（確認）"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowChangePassword(false);
                  reset();
                }}
                className="cursor-pointer"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700 cursor-pointer"
              >
                {isSubmitting ? "変更中..." : "変更する"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
