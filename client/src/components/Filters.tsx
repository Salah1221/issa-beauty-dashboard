import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, TableOfContents } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import ContentManagement from "../ContentManagement";
import { Category } from "../types";

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  allCategories: Category[];
  sortOrder: "newest" | "oldest";
  onSortChange: (value: "newest" | "oldest") => void;
  mobile: boolean;
  setAllCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  categoriesLoading: boolean;
  setCategoriesLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onAddProduct: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  allCategories,
  sortOrder,
  onSortChange,
  mobile,
  setAllCategories,
  categoriesLoading,
  setCategoriesLoading,
  onAddProduct,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Input
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full sm:max-w-xs"
      />

      <Select onValueChange={onCategoryFilterChange} value={categoryFilter}>
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

      <Select onValueChange={onSortChange} value={sortOrder}>
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

      <Button onClick={onAddProduct} className="w-full sm:w-auto">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Product
      </Button>
    </div>
  );
};

export default Filters;
