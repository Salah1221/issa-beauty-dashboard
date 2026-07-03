import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@react-hookz/web";
import { Category, Product } from "./types";
import PaginationControls from "./components/PaginationControls";
import Filters from "./components/Filters";
import ProductTable from "./components/ProductTable";

// API function types
type FetchProductsFunction = (page: number) => Promise<void>;
type DeleteProductFunction = (id: string) => Promise<void>;

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
  const mobile = useMediaQuery("(max-width: 640px)") ?? false;

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
      const response = await axios.delete(`/api/admin/products/${id}`, {
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
        const response = await axios.get(`/api/admin/products`, {
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
    axios.get("/api/admin/categories").then((response) => {
      const data = response.data;
      if (data.success) {
        setAllCategories(data.data);
      }
      setCategoriesLoading(false);
    });
  }, []);

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
      <Filters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        allCategories={allCategories}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        mobile={mobile}
        setAllCategories={setAllCategories}
        categoriesLoading={categoriesLoading}
        setCategoriesLoading={setCategoriesLoading}
        onAddProduct={() => navigate("/create")}
      />
      <div className="overflow-x-auto">
        <ProductTable
          products={filteredProducts}
          loading={loading}
          onEdit={(id) => navigate(`/create?id=${id}`)}
          onDelete={handleDelete}
          deleteLoading={deleteLoading}
          deletedId={deletedId}
        />
      </div>
      <PaginationControls
        page={page}
        totalPages={totalPages}
        mobile={mobile}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ProductDashboard;
