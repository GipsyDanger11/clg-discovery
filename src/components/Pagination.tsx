"use client";

import type { PaginationInfo } from "@/lib/types";

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Previous
      </button>
      <span className="px-4 text-sm text-gray-500">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Next
      </button>
    </div>
  );
}
