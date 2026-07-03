import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  mobile: boolean;
  onPageChange: (newPage: number | ((prev: number) => number)) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  totalPages,
  mobile,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`mt-6 ${mobile ? "flex flex-col space-y-3" : "flex items-center justify-between"}`}
    >
      <div
        className={`text-sm text-muted-foreground ${mobile ? "text-center" : ""}`}
      >
        Page {page} of {totalPages}
      </div>
      <div
        className={`flex items-center ${mobile ? "justify-center space-x-1" : "space-x-2"}`}
      >
        {!mobile && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          >
            First
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={mobile ? "h-11 px-3" : ""}
        >
          {mobile ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              {!mobile && "Previous"}
            </>
          )}
        </Button>

        {/* Page Numbers - Show fewer on mobile */}
        <div className="flex items-center space-x-1">
          {Array.from(
            { length: Math.min(mobile ? 3 : 5, totalPages) },
            (_, i) => {
              const pageNum =
                Math.max(
                  1,
                  Math.min(
                    totalPages - (mobile ? 2 : 4),
                    page - (mobile ? 1 : 2),
                  ),
                ) + i;
              if (pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className={`${mobile ? "w-9 h-9 text-xs" : "w-8 h-8"} p-0`}
                >
                  {pageNum}
                </Button>
              );
            },
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className={mobile ? "h-11 px-3" : ""}
        >
          {mobile ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              {!mobile && "Next"}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
        {!mobile && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
          >
            Last
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaginationControls;
