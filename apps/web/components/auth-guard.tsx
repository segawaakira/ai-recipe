"use client";

import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  // クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // サーバーサイドレンダリング中は何もしない
  if (!isClient) {
    return null;
  }

  // デバッグ情報をコンソールに出力
  console.log("AuthGuard Debug:", {
    pathname,
    session: !!session,
    status,
    isClient,
  });

  // ローディング中は何もしない
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // 認証されていない場合、authページ以外はリダイレクト
  if (!session && !pathname.includes("/auth")) {
    console.log("Redirecting to signin: no session");
    redirect("/auth/signin");
  }

  // 認証済みでsigninページにいる場合はホームにリダイレクト
  // signupページは認証済みユーザーでもアクセス可能にする
  if (session && pathname === "/auth/signin") {
    console.log("Redirecting to home: authenticated user on signin page");
    redirect("/");
  }

  console.log("AuthGuard: rendering children");
  return <>{children}</>;
}
