import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

// Compact page list: 1 … p-1 p p+1 … last, collapsing gaps with ellipses.
function getPages(page: number, total: number): (number | "ellipsis")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push("ellipsis");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const go = (p: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange(p);
  };

  const atStart = page === 1;
  const atEnd = page === totalPages;

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          {/* Icon-only on mobile (hide the label span), full on desktop. */}
          <PaginationPrevious
            href="#"
            onClick={go(page - 1)}
            aria-disabled={atStart}
            tabIndex={atStart ? -1 : undefined}
            className={`h-11 sm:h-10 [&>span]:hidden sm:[&>span]:inline ${
              atStart ? "pointer-events-none opacity-50" : ""
            }`}
          />
        </PaginationItem>

        {getPages(page, totalPages).map((p, i) =>
          p === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis className="h-11 w-9 sm:h-10" />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={p === page}
                onClick={go(p)}
                className="h-11 w-11 sm:h-10 sm:w-10"
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={go(page + 1)}
            aria-disabled={atEnd}
            tabIndex={atEnd ? -1 : undefined}
            className={`h-11 sm:h-10 [&>span]:hidden sm:[&>span]:inline ${
              atEnd ? "pointer-events-none opacity-50" : ""
            }`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationControls;
