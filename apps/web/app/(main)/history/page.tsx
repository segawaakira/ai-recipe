"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { ArrowLeft, Clock, Search, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createAuthClient } from "@/lib/auth-api-client";
import { Pagination } from "components/pagination";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const RecipeSearchInput = z.object({
  search: z.string(),
  rating: z.string(),
});
type RecipeSearchInputType = z.infer<typeof RecipeSearchInput>;

interface RecipeHistoryItem {
  id: number;
  name: string;
  content: string;
  ingredients: string[];
  servings: number;
  youtubeVideos: { videoId: string; title: string; channelTitle: string; thumbnail: string }[] | null;
  rating: number | null;
  createdAt: string;
}

export default function HistoryPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const authClient = useMemo(
    () => session?.accessToken ? createAuthClient(session.accessToken) : null,
    [session?.accessToken]
  );

  const currentPage = Number(searchParams.get("page")) || 1;
  const appliedSearch = searchParams.get("search") || "";
  const ratingFilter = searchParams.get("rating") ? Number(searchParams.get("rating")) : null;
  const perPage = Number(searchParams.get("perPage")) || 10;

  const [recipeHistory, setRecipeHistory] = useState<RecipeHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit } = useForm<RecipeSearchInputType>({
    resolver: zodResolver(RecipeSearchInput),
    values: {
      search: appliedSearch,
      rating: ratingFilter !== null ? String(ratingFilter) : "",
    },
  });

  const updateQuery = useCallback((updates: { page?: number; search?: string; rating?: number | null; perPage?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.page !== undefined && updates.page > 1) {
      params.set("page", String(updates.page));
    } else if (updates.page !== undefined) {
      params.delete("page");
    }
    if (updates.search !== undefined && updates.search) {
      params.set("search", updates.search);
    } else if (updates.search !== undefined) {
      params.delete("search");
    }
    if (updates.rating !== undefined && updates.rating !== null) {
      params.set("rating", String(updates.rating));
    } else if (updates.rating !== undefined) {
      params.delete("rating");
    }
    if (updates.perPage !== undefined && updates.perPage !== 10) {
      params.set("perPage", String(updates.perPage));
    } else if (updates.perPage !== undefined) {
      params.delete("perPage");
    }
    const qs = params.toString();
    router.push(qs ? `/history?${qs}` : "/history");
  }, [searchParams, router]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const fetchRecipes = useCallback(async (page: number, search: string, rating: number | null) => {
    if (!authClient) return;
    setIsLoading(true);
    try {
      const { data } = await authClient.GET("/recipes", {
        params: {
          query: {
            page,
            perPage,
            search: search || undefined,
            ratingFilter: rating ?? undefined,
          },
        },
      });
      if (data) {
        setRecipeHistory(data.items as RecipeHistoryItem[]);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch recipe history:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [authClient, perPage]);

  useEffect(() => {
    fetchRecipes(currentPage, appliedSearch, ratingFilter);
  }, [currentPage, appliedSearch, ratingFilter, perPage, fetchRecipes]);

  const onSearch = (data: RecipeSearchInputType) => {
    updateQuery({
      search: data.search,
      rating: data.rating ? Number(data.rating) : null,
      page: 1,
    });
  };

  const renderNoResults = (text: string) => {
    return (
      <div className="text-center py-8 text-gray-500">
        <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">{text}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
            <div>
              <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 font-medium w-fit mb-4">
                <ArrowLeft className="h-4 w-4" />
                AIレシピ作成画面に戻る
              </Link>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  レシピ履歴
                </CardTitle>
                <CardDescription>
                  過去に生成したレシピの一覧です ({total}件)
                </CardDescription>
                <form onSubmit={handleSubmit(onSearch)} className="flex gap-2 pt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      {...register("search")}
                      placeholder="レシピ名・食材で検索..."
                      className="pl-8"
                    />
                  </div>
                  <select
                    {...register("rating")}
                    className="rounded-md border border-gray-300 px-2 py-1.5 text-sm min-w-[80px]"
                  >
                    <option value="" disabled hidden>評価</option>
                    <option value="">未選択</option>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{"★".repeat(n)}</option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="icon"
                    type="submit"
                    className="cursor-pointer"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </CardHeader>
              <CardContent>
                {!isLoading && recipeHistory.length === 0 && (appliedSearch || ratingFilter) ? (
                  renderNoResults("該当するレシピが見つかりません")
                ) : !isLoading && recipeHistory.length === 0 ? (
                  renderNoResults("まだレシピ履歴がありません")
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>レシピ名</TableHead>
                        <TableHead className="w-[70px] text-center">評価</TableHead>
                        <TableHead className="w-[100px]">作成日</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: perPage }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Skeleton className="h-4 w-3/4" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Skeleton className="h-4 w-8 mx-auto" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        recipeHistory.map((item) => (
                          <TableRow
                            key={item.id}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => router.push(`/history/${item.id}`)}
                          >
                            <TableCell className="font-medium text-sm">
                              {item.name}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.rating ? (
                                <span className="inline-flex items-center gap-0.5 text-xs text-yellow-600">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {item.rating}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-300">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                              {new Date(item.createdAt).toLocaleDateString("ja-JP")}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  total={total}
                  perPage={perPage}
                  onPageChange={(page) => updateQuery({ page })}
                  onPerPageChange={(pp) => updateQuery({ perPage: pp, page: 1 })}
                />
              </CardContent>
            </Card>
            </div>
    </div>
  );
}
