"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { useToast } from "@repo/ui/hooks/use-toast";
import { PasswordInput } from "components/password-input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";

const passwordSchema = z
  .string()
  .min(8, "パスワードは8文字以上で入力してください")
  .regex(
    /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
    "パスワードは英字と数字の両方を含めてください"
  );

const ResetPasswordForm = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

type ResetPasswordFormType = z.infer<typeof ResetPasswordForm>;

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormType>({
    resolver: zodResolver(ResetPasswordForm),
  });

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm text-center space-y-6">
          <div className="text-5xl text-red-500">&#10007;</div>
          <h2 className="text-2xl font-bold text-gray-900">無効なリンク</h2>
          <p className="text-gray-600">
            パスワードリセットのリンクが無効です。
          </p>
          <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer">
            <a href="/auth/forgot-password">リセットメールを再送信</a>
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm text-center space-y-6">
          <div className="text-5xl">&#10003;</div>
          <h2 className="text-2xl font-bold text-gray-900">パスワードリセット完了</h2>
          <p className="text-gray-600">
            パスワードが正常にリセットされました。新しいパスワードでログインしてください。
          </p>
          <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer">
            <a href="/auth/signin">ログインへ</a>
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordFormType) => {
    try {
      const { error } = await apiClient.POST("/auth/reset-password", {
        body: { token, newPassword: data.newPassword },
      });
      if (error) {
        toast.error("リセットに失敗しました。リンクが無効または有効期限切れです。");
      } else {
        setSuccess(true);
      }
    } catch {
      toast.error("エラーが発生しました");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            新しいパスワードの設定
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            新しいパスワードを入力してください
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
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
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer">
            {isSubmitting ? "リセット中..." : "パスワードをリセット"}
          </Button>
        </form>
      </div>
    </div>
  );
}
