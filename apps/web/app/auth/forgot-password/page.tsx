"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestPasswordResetInput, type RequestPasswordResetInputType } from "@repo/api-schema";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useForm } from "react-hook-form";
import { apiClient } from "@/lib/api-client";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestPasswordResetInputType>({
    resolver: zodResolver(RequestPasswordResetInput),
  });

  const onSubmit = async (data: RequestPasswordResetInputType) => {
    try {
      await apiClient.POST("/auth/request-password-reset", {
        body: { email: data.email },
      });
      setSent(true);
    } catch {
      // セキュリティ上、エラーでも成功表示
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm text-center space-y-6">
          <div className="text-5xl">&#9993;</div>
          <h2 className="text-2xl font-bold text-gray-900">メール送信完了</h2>
          <p className="text-gray-600">
            パスワードリセット用のメールを送信しました。メールに記載されたリンクから新しいパスワードを設定してください。
          </p>
          <p className="text-sm text-gray-500">
            メールが届かない場合は、迷惑メールフォルダをご確認ください。
          </p>
          <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer">
            <a href="/auth/signin">ログインページへ戻る</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm space-y-8">
        <div className="space-y-2">
          <h1 className="text-center text-3xl font-bold tracking-tight text-orange-600">
            パスワードリセット
          </h1>
          <p className="text-center text-sm text-gray-500">
            登録したメールアドレスを入力してください
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <Input
              {...register("email")}
              type="email"
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer">
            {isSubmitting ? "送信中..." : "リセットメールを送信"}
          </Button>
          <p className="text-center text-sm text-gray-500">
            <a href="/auth/signin" className="text-orange-600 hover:text-orange-700 font-medium cursor-pointer">
              ログインページへ戻る
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
