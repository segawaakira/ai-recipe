"use client";

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
import { ChefHat, ChevronLeft, ChevronRight, Clock, Search, Star, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/api-client";
import { ConfirmDialog } from "components/confirm-dialog";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const appliedSearch = searchParams.get("search") || "";
  const ratingFilter = searchParams.get("rating") ? Number(searchParams.get("rating")) : null;
  const perPage = Number(searchParams.get("perPage")) || 10;

  const [recipeHistory, setRecipeHistory] = useState<RecipeHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recipeToDelete, setRecipeToDelete] = useState<RecipeHistoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState(appliedSearch);
  const [isNarrow, setIsNarrow] = useState(false);

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

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 400px)");
    setIsNarrow(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const fetchRecipes = useCallback(async (page: number, search: string, rating: number | null) => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const { data } = await apiClient.GET("/recipes", {
        params: {
          query: {
            userId: Number(session.user.id),
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
      setIsLoading(false);
    }
  }, [session?.user?.id, perPage]);

  useEffect(() => {
    fetchRecipes(currentPage, appliedSearch, ratingFilter);
  }, [currentPage, appliedSearch, ratingFilter, perPage, fetchRecipes]);

  const handleSearch = () => {
    updateQuery({ search: searchQuery, page: 1 });
  };

  const deleteRecipeHistory = async (id: number) => {
    try {
      await apiClient.DELETE("/recipes/{id}", {
        params: { path: { id: String(id) } },
      });
      const newTotal = total - 1;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / perPage));
      const nextPage = currentPage > newTotalPages ? newTotalPages : currentPage;
      updateQuery({ page: nextPage });
      await fetchRecipes(nextPage, appliedSearch, ratingFilter);
    } catch (error) {
      console.error("Failed to delete recipe:", error);
    }
  };

  return (
    <div className="space-y-6">
          {!session?.user?.id ? (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-blue-700 text-sm">
                    履歴を閲覧するにはログインしてください
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" asChild>
                      <a href="/auth/signin">ログイン</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <p>読み込み中...</p>
            </div>
          ) : total === 0 && !appliedSearch && ratingFilter === null ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-gray-500">
                  <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>まだレシピ履歴がありません</p>
                  <p className="text-sm mt-1">レシピを生成すると自動的に保存されます</p>
                  <Link href="/" className="mt-4 inline-block">
                    <Button variant="outline" className="mt-4">
                      レシピを作成する
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  レシピ履歴
                </CardTitle>
                <CardDescription>
                  過去に生成したレシピの一覧です ({total}件)
                </CardDescription>
                <div className="flex gap-2 pt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="レシピ名・食材で検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                      className="pl-8"
                    />
                  </div>
                  <select
                    value={ratingFilter ?? ""}
                    onChange={(e) => updateQuery({ rating: e.target.value ? Number(e.target.value) : null, page: 1 })}
                    className="rounded-md border border-gray-300 px-2 py-1.5 text-sm min-w-[80px]"
                  >
                    <option value="">評価</option>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{"★".repeat(n)}</option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSearch}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recipeHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">該当するレシピが見つかりません</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>レシピ名</TableHead>
                        <TableHead className="w-[70px] text-center">評価</TableHead>
                        <TableHead className="w-[100px]">作成日</TableHead>
                        <TableHead className="w-[44px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recipeHistory.map((item) => (
                        <TableRow key={item.id} className="group">
                          <TableCell>
                            <Link
                              href={`/history/${item.id}`}
                              className="flex items-center gap-1 font-medium text-sm hover:text-orange-600 transition-colors"
                            >
                              {item.name}
                              <ChevronRight className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </Link>
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
                          <TableCell className="p-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-100"
                              onClick={() => setRecipeToDelete(item)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    {totalPages > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={currentPage === 1}
                          onClick={() => updateQuery({ page: currentPage - 1 })}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {(() => {
                          const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
                          const sibling = isNarrow ? 0 : 1;
                          const threshold = 3 + sibling * 2;
                          if (totalPages <= threshold) {
                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                          } else {
                            pages.push(1);
                            if (currentPage > 2 + sibling) pages.push("ellipsis-start");
                            const start = Math.max(2, currentPage - sibling);
                            const end = Math.min(totalPages - 1, currentPage + sibling);
                            for (let i = start; i <= end; i++) pages.push(i);
                            if (currentPage < totalPages - 1 - sibling) pages.push("ellipsis-end");
                            pages.push(totalPages);
                          }
                          return pages.map((page) =>
                            typeof page === "string" ? (
                              <span key={page} className="px-1 text-gray-400">...</span>
                            ) : (
                              <Button
                                key={page}
                                variant={page === currentPage ? "default" : "outline"}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuery({ page })}
                              >
                                {page}
                              </Button>
                            )
                          );
                        })()}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={currentPage === totalPages}
                          onClick={() => updateQuery({ page: currentPage + 1 })}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={perPage}
                      onChange={(e) => updateQuery({ perPage: Number(e.target.value), page: 1 })}
                      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                    >
                      {[2, 10, 50, 100].map((n) => (
                        <option key={n} value={n}>{n}件</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
      <ConfirmDialog
        open={recipeToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setRecipeToDelete(null);
        }}
        title="履歴削除の確認"
        description={`本当に「${recipeToDelete?.name ?? ""}」を削除しますか？`}
        onConfirm={() => {
          if (recipeToDelete) {
            deleteRecipeHistory(recipeToDelete.id);
            setRecipeToDelete(null);
          }
        }}
      />
    </div>
  );
}
