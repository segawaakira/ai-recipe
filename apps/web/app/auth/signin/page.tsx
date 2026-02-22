"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { SignInInput, type SignInInputType } from "@repo/api-schema";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useToast } from "@repo/ui/hooks/use-toast";
import { PasswordInput } from "components/password-input";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";

import { apiClient } from "@/lib/api-client";

export default function SignIn() {
  const { toast } = useToast();
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendingEmail, setResendingEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignInInputType>({
    resolver: zodResolver(SignInInput),
  });

  const onSubmit = async (data: SignInInputType) => {
    setEmailNotVerified(false);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("EMAIL_NOT_VERIFIED")) {
          setEmailNotVerified(true);
          setResendingEmail(data.email);
        } else {
          toast.error("メールアドレスまたはパスワードが正しくありません");
        }
      } else {
        toast.success("Signed in successfully");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Network error occurred");
    }
  };

  const handleResendVerification = async () => {
    const email = resendingEmail || getValues("email");
    if (!email) return;

    setIsResending(true);
    try {
      await apiClient.POST("/auth/resend-verification", {
        body: { email },
      });
      toast.success("確認メールを再送信しました");
    } catch {
      toast.error("メールの送信に失敗しました");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            ログイン
          </h2>
        </div>

        {emailNotVerified && (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4 text-sm">
            <p className="text-yellow-800 font-medium">メールアドレスが未確認です</p>
            <p className="text-yellow-700 mt-1">
              登録時に送信された確認メールのリンクをクリックしてください。
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending}
              className="mt-2 text-orange-600 hover:text-orange-700 font-medium underline cursor-pointer"
            >
              {isResending ? "送信中..." : "確認メールを再送信"}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                {...register("email")}
                type="email"
                placeholder="メールアドレス"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <PasswordInput
                {...register("password")}
                placeholder="パスワード"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <a href="/auth/forgot-password" className="text-sm text-orange-600 hover:text-orange-700 font-medium cursor-pointer">
              パスワードを忘れた方
            </a>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer">
            {isSubmitting ? "ログイン中..." : "ログイン"}
          </Button>
          <p className="text-center text-sm text-gray-500">
            アカウントをお持ちでない方は
            <a href="/auth/signup" className="text-orange-600 hover:text-orange-700 font-medium ml-1 cursor-pointer">
              新規登録
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
