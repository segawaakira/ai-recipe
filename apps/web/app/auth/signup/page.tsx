"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserInput, type CreateUserInputType } from "@repo/api-schema";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useToast } from "@repo/ui/hooks/use-toast";
import { PasswordInput } from "components/password-input";
import { useForm } from "react-hook-form";

import { apiClient } from "@/lib/api-client";

export default function SignUp() {
  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInputType>({
    resolver: zodResolver(CreateUserInput),
  });

  const onSubmit = async (data: CreateUserInputType) => {
    try {
      const { error } = await apiClient.POST("/users", {
        body: {
          email: data.email,
          password: data.password,
        },
      });

      if (error) {
        toast.error("Failed to create user");
        return;
      }

      setRegisteredEmail(data.email);
      setEmailSent(true);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Network error occurred");
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm text-center space-y-6">
          <div className="text-5xl">&#9993;</div>
          <h2 className="text-2xl font-bold text-gray-900">確認メールを送信しました</h2>
          <p className="text-gray-600">
            <span className="font-medium text-gray-900">{registeredEmail}</span>
            {" "}に確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。
          </p>
          <p className="text-sm text-gray-500">
            メールが届かない場合は、迷惑メールフォルダをご確認ください。
          </p>
          <a href="/auth/signin" className="block text-orange-600 hover:text-orange-700 font-medium text-sm cursor-pointer">
            ログインページへ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            新規登録
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                {...register("email")}
                placeholder="メールアドレス"
                type="email"
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
          <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer">
            {isSubmitting ? "登録中..." : "会員登録"}
          </Button>
          <p className="text-center text-sm text-gray-500">
            アカウントをお持ちの方は
            <a href="/auth/signin" className="text-orange-600 hover:text-orange-700 font-medium ml-1 cursor-pointer">
              ログイン
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
