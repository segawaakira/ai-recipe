"use client";

import { useRouter } from "next/navigation";

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
  const router = useRouter();

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

      toast.success("User created successfully");
      router.push("/auth/signin");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Network error occurred");
    }
  };

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
          <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-600 hover:bg-orange-700">
            {isSubmitting ? "登録中..." : "会員登録"}
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
