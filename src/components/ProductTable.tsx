import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "./ui/skeleton";
import ImageWithSkeleton from "./ImageWithSkeleton";
import LoadError from "./LoadError";
import { Product } from "../types";

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  error?: boolean;
  onRetry?: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  deleteLoading: boolean;
  deletedId: string;
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

const RowsSkeleton = () => (
  <>
    {[...Array(12)].map((_, index) => (
      <TableRow key={index} className={index === 0 ? "border-t" : ""}>
        <TableCell>
          <Skeleton className="h-10 rounded" style={{ aspectRatio: "3 / 2" }} />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-full max-w-[200px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-full min-w-[60px] max-w-[177px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-full min-w-[50px] max-w-[130px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-full min-w-[50px] max-w-[170px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-full min-w-[60px] max-w-[190px]" />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </TableCell>
      </TableRow>
    ))}
  </>
);

const CardsSkeleton = () => (
  <>
    {[...Array(8)].map((_, i) => (
      <div key={i} className="rounded-lg border bg-card p-4">
        <div className="flex gap-3">
          <Skeleton className="h-16 w-24 rounded flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-5 w-20 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </>
);

// ─── Stock badge helper ───────────────────────────────────────────────────────

const StockBadge: React.FC<{ in_stock: boolean | undefined }> = ({ in_stock }) => (
  <Badge
    className="whitespace-nowrap"
    variant={in_stock === undefined || in_stock ? "default" : "destructive"}
  >
    {in_stock === undefined || in_stock ? "In Stock" : "Out of Stock"}
  </Badge>
);

// ─── Main component ───────────────────────────────────────────────────────────

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  error,
  onRetry,
  onEdit,
  onDelete,
  deleteLoading,
  deletedId,
}) => {
  if (!loading && error) {
    return <LoadError message="Couldn't load products." onRetry={onRetry} />;
  }
  if (!loading && products.length === 0) {
    return (
      <p className="text-muted-foreground font-bold text-3xl mt-5">
        No Products
      </p>
    );
  }

  return (
    <>
      {/* Mobile: card list (below sm) */}
      <div className="space-y-3 sm:hidden">
        {loading ? (
          <CardsSkeleton />
        ) : (
          products.map((product, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <div className="flex gap-3">
                <ImageWithSkeleton
                  src={product.imageUrl}
                  alt={product.name}
                  width={220}
                  className="h-16 w-24 flex-shrink-0 rounded"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {product.category}
                  </p>
                  <p className="mt-0.5 text-sm">
                    ${product.price.toFixed(2)}
                    {product.discountPercentage && product.discountPercentage > 0 ? (
                      <span className="ml-1.5 text-muted-foreground">
                        ({product.discountPercentage}% off)
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <StockBadge in_stock={product.in_stock} />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11"
                    aria-label="Edit product"
                    onClick={() => onEdit(product._id)}
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-destructive hover:text-destructive"
                    aria-label="Delete product"
                    onClick={() => onDelete(product._id)}
                    disabled={deleteLoading && product._id === deletedId}
                  >
                    {!deleteLoading || product._id !== deletedId ? (
                      <Trash2 className="h-5 w-5" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: table (sm and up) */}
      <div className="hidden sm:block">
        {loading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead></TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <RowsSkeleton />
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="whitespace-nowrap">
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead></TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="whitespace-nowrap">
              {products.map((product, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <ImageWithSkeleton
                      src={product.imageUrl}
                      alt={product.name}
                      width={120}
                      className="h-10 aspect-[3/2] rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap min-w-[200px]">
                    {product.name}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  {product.discountPercentage && product.discountPercentage > 0 ? (
                    <TableCell>{product.discountPercentage}%</TableCell>
                  ) : (
                    <TableCell>--</TableCell>
                  )}
                  <TableCell>
                    <StockBadge in_stock={product.in_stock} />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Edit product"
                      onClick={() => onEdit(product._id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Delete product"
                      onClick={() => onDelete(product._id)}
                      disabled={deleteLoading && product._id === deletedId}
                    >
                      {!deleteLoading || product._id !== deletedId ? (
                        <Trash2 className="h-4 w-4" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
};

export default ProductTable;
