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
import { Product } from "../types";

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  deleteLoading: boolean;
  deletedId: string;
}

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

const TableSkeleton = ({ part = false }) => (
  <Table>
    {!part && (
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
    )}
    <TableBody>
      <RowsSkeleton />
    </TableBody>
  </Table>
);

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  onEdit,
  onDelete,
  deleteLoading,
  deletedId,
}) => {
  if (loading) {
    return <TableSkeleton />;
  }

  if (products.length === 0) {
    return (
      <p className="text-muted-foreground font-bold text-3xl mt-5">
        No Products
      </p>
    );
  }

  return (
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
              <div className="h-10" style={{ aspectRatio: "3 / 2" }}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-10 object-cover rounded"
                  style={{ aspectRatio: "3 / 2" }}
                />
              </div>
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
              <Badge
                className="whitespace-nowrap"
                variant={
                  product.in_stock === undefined || product.in_stock
                    ? "default"
                    : "destructive"
                }
              >
                {product.in_stock === undefined || product.in_stock
                  ? "In Stock"
                  : "Out of Stock"}
              </Badge>
            </TableCell>
            <TableCell align="right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(product._id)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
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
  );
};

export default ProductTable;
