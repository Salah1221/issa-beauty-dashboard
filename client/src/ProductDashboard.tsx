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

const TopSkeleton = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Skeleton className="h-[33px] w-full sm:w-[320px]" />
      <Skeleton className="h-[33px] w-full sm:w-[180px]" />
      <Skeleton className="h-[33px] w-full sm:w-[180px]" />
      <Skeleton className="h-[33px] w-full sm:w-[186px]" />
      <Skeleton className="h-[33px] w-full sm:w-[140px]" />
    </div>
  );
};

const RowsSkeleton = () => (
  <>
    {[...Array(12)].map((_, index) => (
      <TableRow key={index} className={index === 0 ? "border-t" : ""}>
        <TableCell>
          <Skeleton className="h-4 w-full max-w-[200px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-full max-w-[177px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-full max-w-[130px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-full max-w-[170px]" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-full max-w-[190px]" />
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
  const navigate = useNavigate();
  const mobile = useMediaQuery("(max-width: 640px)");

  const deleteProduct: DeleteProductFunction = async (id) => {
    setDeleteLoading(true);
    try {
      const response = await axios.delete(`/api/products/${id}`);
      const data = response.data;
      if (!data.success) throw new Error("Error in server");
      setDeleteLoading(false);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchProducts: FetchProductsFunction = useCallback(
    async (page: number) => {
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
        });
        const data = response.data;
        if (!data.success) throw new Error("Error in server");
        if (fetchId === fetchIdRef.current) {
          setLoading(false);
          setProducts((prevProducts) =>
            page === 1 ? data.data : [...prevProducts, ...data.data]
          );
          setTotalPages(data.pages);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setPage(1);
      }
    },
    [searchTerm, categoryFilter, sortOrder]
  );

  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, page]);

  useEffect(() => {
    setProducts([]);
    setPage(1);
    fetchProducts(1);
  }, [fetchProducts, searchTerm, categoryFilter, sortOrder]);

  useEffect(() => {
    axios.get("/api/categories").then((response) => {
      const data = response.data;
      if (data.success) {
        setAllCategories(data.data);
      }
      setCategoriesLoading(false);
    });
  }, [allCategories]);

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
    setProducts(products.filter((p) => p._id !== id));
  };

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((product) =>
      categoryFilter && categoryFilter !== "all"
        ? product.category === categoryFilter
        : true
    )
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });

  return (
    <div className="p-5 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Products</h1>

      {!loading ? (
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
      ) : (
        <TopSkeleton />
      )}

      <div className="overflow-x-auto">
        {filteredProducts.length > 0 ? (
          <div className="grid">
            <Table>
              <TableHeader>
                <TableRow className="whitespace-nowrap">
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Discount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="whitespace-nowrap">
                {filteredProducts.map((product, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium whitespace-nowrap">
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
                    <TableCell className="flex justify-end items-start">
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
                {loading && <RowsSkeleton />}
              </TableBody>
            </Table>
            {page < totalPages && (
              <Button
                className="justify-self-center mt-3"
                onClick={() => setPage((p) => p + 1)}
              >
                Load more
              </Button>
            )}
          </div>
        ) : loading ? (
          <TableSkeleton />
        ) : (
          <p className="text-muted-foreground font-bold text-3xl mt-5">
            No Products
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductDashboard;
