"use client";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useToast } from "@repo/ui/hooks/use-toast";
import { PasswordInput } from "components/password-input";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Signed in successfully");
        // AuthGuardが自動的にリダイレクトするので、ここでは何もしない
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            ログイン
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              type="email"
              name="email"
              placeholder="メールアドレス"
              required
            />
            <PasswordInput
              name="password"
              placeholder="パスワード"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700">
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>
          <p className="text-center text-sm text-gray-500">
            アカウントをお持ちでない方は
            <a href="/auth/signup" className="text-orange-600 hover:text-orange-700 font-medium ml-1">
              新規登録
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
