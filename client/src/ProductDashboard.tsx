import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Loader2,
  TableOfContents,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { Category, Product } from "./types";
import { Skeleton } from "./components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
} from "@/components/ui/dialog";
import { useMediaQuery } from "@react-hookz/web";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import ContentManagement from "./ContentManagement";

// API function types
type FetchProductsFunction = (page: number) => Promise<void>;
type DeleteProductFunction = (id: string) => Promise<void>;

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

// Mock API functions (replace with actual API calls)

const ProductDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const fetchIdRef = React.useRef(0);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletedId, setDeletedId] = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const navigate = useNavigate();
  const mobile = useMediaQuery("(max-width: 640px)");

  // Custom setPage function that cancels ongoing requests
  const handlePageChange = useCallback(
    (newPage: number | ((prev: number) => number)) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setPage(newPage);
    },
    [],
  );

  // Cleanup: cancel any ongoing requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const deleteProduct: DeleteProductFunction = async (id) => {
    setDeleteLoading(true);
    try {
      const response = await axios.delete(`/api/products/${id}`, {
        params: {
          page,
          limit: 12,
        },
      });
      const data = response.data;
      if (!data.success) throw new Error("Error in server");
      setProducts(data.data);
      setDeleteLoading(false);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchProducts: FetchProductsFunction = useCallback(
    async (page: number) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const fetchId = ++fetchIdRef.current;
      setLoading(true);
      try {
        const response = await axios.get(`/api/products`, {
          params: {
            page,
            limit: 12,
            search: searchTerm || undefined,
            category: categoryFilter !== "all" ? categoryFilter : undefined,
            sort: sortOrder,
          },
          signal, // Pass the abort signal to axios
        });
        const data = response.data;
        if (!data.success) throw new Error("Error in server");
        if (fetchId === fetchIdRef.current && !signal.aborted) {
          setLoading(false);
          setProducts(data.data);
          setTotalPages(data.pages);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was cancelled, don't update state
          return;
        }
        console.error("Error fetching products:", error);
        if (!signal.aborted) {
          setProducts([]);
          handlePageChange(1);
        }
      }
    },
    [searchTerm, categoryFilter, sortOrder, handlePageChange],
  );

  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, page]);

  useEffect(() => {
    // Cancel any ongoing request when filters change
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setProducts([]);
    handlePageChange(1);
    fetchProducts(1);
  }, [fetchProducts, searchTerm, categoryFilter, sortOrder, handlePageChange]);

  useEffect(() => {
    axios.get("/api/categories").then((response) => {
      const data = response.data;
      if (data.success) {
        setAllCategories(data.data);
      }
      setCategoriesLoading(false);
    });
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
  };

  const handleSort = (value: "newest" | "oldest") => {
    setSortOrder(value);
  };

  const handleDelete = async (id: string) => {
    setDeletedId(id);
    await deleteProduct(id);
    // Refetch current page to maintain consistent pagination
    fetchProducts(page);
  };

  const filteredProducts = products;

  return (
    <div className="p-5 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Products</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full sm:max-w-xs"
        />

        <Select onValueChange={handleCategoryFilter} value={categoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {allCategories.map((category) => (
              <SelectItem key={category.name} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={handleSort} value={sortOrder}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>

        {!mobile ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <TableOfContents className="mr-2 h-4 w-4" /> Manage Categories
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader className="mb-3">
                <DialogTitle>Manage Content</DialogTitle>
              </DialogHeader>
              <ContentManagement
                allCategories={allCategories}
                setAllCategories={setAllCategories}
                categoriesLoading={categoriesLoading}
                setCategoriesLoading={setCategoriesLoading}
              />
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer>
            <DrawerTrigger asChild>
              <Button>
                <TableOfContents className="mr-2 h-4 w-4" /> Manage Content
              </Button>
            </DrawerTrigger>
            <DrawerContent className="p-5 pb-7" aria-describedby={undefined}>
              <DrawerHeader className="mb-3">
                <DialogTitle>Manage Content</DialogTitle>
              </DrawerHeader>
              <ContentManagement
                allCategories={allCategories}
                setAllCategories={setAllCategories}
                categoriesLoading={categoriesLoading}
                setCategoriesLoading={setCategoriesLoading}
              />
            </DrawerContent>
          </Drawer>
        )}

        <Button
          onClick={() => navigate("/create")}
          className="w-full sm:w-auto"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <TableSkeleton />
        ) : filteredProducts.length > 0 ? (
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
              {filteredProducts.map((product, i) => (
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
                  {product.discountPercentage &&
                  product.discountPercentage > 0 ? (
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
                      onClick={() => navigate(`/create?id=${product._id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product._id)}
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
        ) : (
          <p className="text-muted-foreground font-bold text-3xl mt-5">
            No Products
          </p>
        )}
      </div>

      {/* Pagination Controls - Always visible when multiple pages exist */}
      {totalPages > 1 && (
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
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
              >
                First
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange((p) => Math.max(1, p - 1))}
              disabled={page === 1}
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
                      onClick={() => handlePageChange(pageNum)}
                      className={`${mobile ? "w-7 h-7 text-xs" : "w-8 h-8"} p-0`}
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
              onClick={() =>
                handlePageChange((p) => Math.min(totalPages, p + 1))
              }
              disabled={page === totalPages}
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
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages}
              >
                Last
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDashboard;
