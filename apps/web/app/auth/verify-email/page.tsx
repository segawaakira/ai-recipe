"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { apiClient } from "@/lib/api-client";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        const { error } = await apiClient.POST("/auth/verify-email", {
          body: { token },
        });
        if (error) {
          setStatus("error");
        } else {
          setStatus("success");
        }
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm text-center space-y-6">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto" />
            <p className="text-gray-600">メールアドレスを確認中...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl">&#10003;</div>
            <h2 className="text-2xl font-bold text-gray-900">確認完了</h2>
            <p className="text-gray-600">
              メールアドレスの確認が完了しました。ログインしてください。
            </p>
            <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer">
              <a href="/auth/signin">ログインへ</a>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl text-red-500">&#10007;</div>
            <h2 className="text-2xl font-bold text-gray-900">確認失敗</h2>
            <p className="text-gray-600">
              リンクが無効または有効期限が切れています。
            </p>
            <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer">
              <a href="/auth/signin">ログインページへ</a>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
