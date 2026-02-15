"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiClient } from "@/lib/api-client";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useToast } from "@repo/ui/hooks/use-toast";
import { PasswordInput } from "components/password-input";

export default function SignUp() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    // パスワードのバリデーション
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      toast.error("Password must contain both letters and numbers");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await apiClient.POST("/users", {
        body: {
          email: email,
          password: password,
        },
      });

      if (error) {
        toast.error("Failed to create user");
        return;
      }

      toast.success("User created successfully");

      // 成功したらログインページにリダイレクト
      router.push("/auth/signin");
    } catch (error) {
      console.error("Signup error:", error);
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
            新規登録
          </h2>
        </div>
        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-4">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              type="email"
              required
            />
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700">
            {isLoading ? "登録中..." : "会員登録"}
          </Button>
          <p className="text-center text-sm text-gray-500">
            アカウントをお持ちの方は
            <a href="/auth/signin" className="text-orange-600 hover:text-orange-700 font-medium ml-1">
              ログイン
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
