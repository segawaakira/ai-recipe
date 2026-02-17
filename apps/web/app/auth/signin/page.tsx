"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SignInInput, type SignInInputType } from "@repo/api-schema";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useToast } from "@repo/ui/hooks/use-toast";
import { PasswordInput } from "components/password-input";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";

export default function SignIn() {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInputType>({
    resolver: zodResolver(SignInInput),
  });

  const onSubmit = async (data: SignInInputType) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Signed in successfully");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Network error occurred");
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
