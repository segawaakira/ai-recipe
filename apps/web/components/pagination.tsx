"use client";

import { Button } from "@repo/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  perPageOptions?: number[];
}

export function Pagination({
  currentPage,
  totalPages,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [2, 10, 50, 100],
}: PaginationProps) {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 400px)");
    setIsNarrow(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

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

  return (
    <div className="flex items-center justify-between pt-4">
      <div className="flex items-center gap-2">
        {totalPages > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pages.map((page) =>
              typeof page === "string" ? (
                <span key={page} className="px-1 text-gray-400">...</span>
              ) : (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        >
          {perPageOptions.map((n) => (
            <option key={n} value={n}>{n}件</option>
          ))}
        </select>
      </div>
    </div>
  );
}
