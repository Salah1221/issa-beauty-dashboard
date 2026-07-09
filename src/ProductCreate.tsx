import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Category, Product } from "./types";
import React, { CSSProperties, useEffect, useState } from "react";
import { Image, Loader2 } from "lucide-react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Textarea } from "./components/ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "./components/ui/skeleton";
import ImageWithSkeleton from "./components/ImageWithSkeleton";

const ProductCreateSkeleton = () => (
  <div className="p-5 sm:p-6 md:p-8 max-w-3xl mx-auto">
    <form className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="w-full max-w-[300px] aspect-[3/2] h-auto rounded mx-auto mb-5" />
        <Skeleton className="mt-5 w-[100px] h-[20px]" />
        <Skeleton className="w-full h-[35px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="mt-5 w-[100px] h-[20px]" />
        <Skeleton className="w-full h-[35px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="mt-5 w-[100px] h-[20px]" />
        <Skeleton className="w-[180px] h-[35px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="mt-5 w-[100px] h-[20px]" />
        <Skeleton className="w-full h-[65px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="mt-5 w-[100px] h-[20px]" />
        <Skeleton className="w-full h-[35px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="mt-5 w-[100px] h-[20px]" />
        <Skeleton className="w-full h-[35px]" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="w-[100px] h-[25px]" />
      </div>
      <Skeleton className="w-full h-[35px]" />
    </form>
  </div>
);

const ProductCreate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const isOld = Boolean(id);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  // Raw text for the numeric fields so typing "12." (and mid-string edits)
  // isn't clobbered; the parsed number lives on currentProduct.
  const [priceInput, setPriceInput] = useState("");
  const [discountInput, setDiscountInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log(id);
    if (id) {
      axios
        .get(`/api/admin/products/${id}`)
        .then((res) => {
          const p = res.data.data as Product;
          setCurrentProduct(p);
          setImageUrl(p.imageUrl);
          setPriceInput(p.price != null ? String(p.price) : "");
          setDiscountInput(
            p.discountPercentage != null ? String(p.discountPercentage) : ""
          );
        })
        .catch((err) => console.log(err.message));
    } else {
      setCurrentProduct(
        (c) =>
          ({
            ...c,
            in_stock: true,
          } as Product)
      );
    }
  }, [id]);

  useEffect(() => {
    axios.get("/api/admin/categories").then((response) => {
      const data = response.data;
      if (data.success) {
        setCategories(data.data);
        if ((id && currentProduct) || !id) {
          setPageLoading(false);
        }
      }
    });
  }, [id, currentProduct]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!currentProduct?.name) newErrors.name = "Product name is required";
    if (!currentProduct?.category) newErrors.category = "Category is required";
    if (!currentProduct?.price || currentProduct.price <= 0)
      newErrors.price = "Price must be a positive number";
    if (!imageFile && !imageUrl)
      newErrors.imageUrl = "An image must be uploaded";

    if (!currentProduct?.description) {
      newErrors.description = "Description is required";
    }

    if (
      currentProduct?.discountPercentage &&
      currentProduct?.discountPercentage < 0
    )
      newErrors.discountPercentage =
        "Discount percentage must be a positive number";
    if (
      currentProduct?.discountPercentage &&
      currentProduct?.discountPercentage > 100
    )
      newErrors.discountPercentage =
        "Discount percentage must be less than 100";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);
    }
    formData.append("name", currentProduct?.name || "");
    formData.append("category", currentProduct?.category || "");
    formData.append("description", currentProduct?.description || "");
    formData.append("price", currentProduct?.price?.toString() || "");
    formData.append(
      "discountPercentage",
      currentProduct?.discountPercentage?.toString() || "0"
    );
    formData.append("in_stock", currentProduct?.in_stock ? "true" : "false");

    try {
      if (isOld) {
        await axios.put(`/api/admin/products/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("/api/admin/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message);
    } finally {
      // Always reset so a failed save can be retried without a page reload.
      setLoading(false);
    }
  };

  return pageLoading ? (
    <ProductCreateSkeleton />
  ) : (
    <div className="p-5 sm:p-6 md:p-8 max-w-3xl mx-auto">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <>
          <div className="space-y-2">
            {imageUrl && (
              <ImageWithSkeleton
                src={imageUrl}
                alt="Preview"
                width={640}
                className="w-full max-w-[300px] aspect-[3/2] rounded mx-auto mb-5"
              />
            )}
            {!imageUrl && (
              <div
                className="w-full max-w-[300px] aspect-[3/2] h-auto grid place-items-center border rounded mx-auto"
                style={
                  {
                    marginBottom: "1.25rem",
                    "--tw-space-y-reverse": 0,
                  } as CSSProperties
                }
              >
                <Image className="w-8 h-8" fill="hsl(var(--border))" />
              </div>
            )}
            <Label htmlFor="imageUrl" className="mt-5">
              Image URL
            </Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="file"
              accept="image/*"
              onInput={(e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files && files.length > 0) {
                  const file = files[0];
                  const imageUrl = URL.createObjectURL(file);
                  setImageUrl(imageUrl);
                  setImageFile(file);
                }
              }}
            />
            {errors.imageUrl && (
              <p className="text-red-500 text-sm">{errors.imageUrl}</p>
            )}
          </div>
        </>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={currentProduct?.name}
            onChange={(e) =>
              setCurrentProduct(
                (c) =>
                  ({
                    ...c,
                    name: e.target.value,
                  } as Product)
              )
            }
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={currentProduct ? currentProduct.category : undefined}
            onValueChange={(value) =>
              setCurrentProduct((c) => ({ ...c, category: value } as Product))
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              {categories &&
                categories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-red-500 text-sm">{errors.category}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={currentProduct?.description}
            onChange={(e) =>
              setCurrentProduct(
                (c) =>
                  ({
                    ...c,
                    description: e.target.value,
                  } as Product)
              )
            }
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            inputMode="decimal"
            value={priceInput}
            onChange={(e) => {
              const v = e.target.value;
              if (v !== "" && !/^\d*\.?\d*$/.test(v)) return;
              setPriceInput(v);
              setCurrentProduct(
                (c) =>
                  ({
                    ...c,
                    price: v === "" ? undefined : parseFloat(v),
                  } as Product)
              );
            }}
          />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountPercentage">Discount Percentage</Label>
          <Input
            id="discountPercentage"
            name="discountPercentage"
            inputMode="decimal"
            min={0}
            max={100}
            value={discountInput}
            onChange={(e) => {
              const v = e.target.value;
              if (v !== "" && !/^\d*\.?\d*$/.test(v)) return;
              setDiscountInput(v);
              setCurrentProduct(
                (c) =>
                  ({
                    ...c,
                    discountPercentage: v === "" ? undefined : parseFloat(v),
                  } as Product)
              );
            }}
          />
          {errors.discountPercentage && (
            <p className="text-red-500 text-sm">{errors.discountPercentage}</p>
          )}
        </div>
        <div className="flex items-center space-x-2 py-2">
          <Switch
            id="in_stock"
            name="in_stock"
            checked={currentProduct ? currentProduct?.in_stock : true}
            onCheckedChange={(in_stock) =>
              setCurrentProduct(
                (c) =>
                  ({
                    ...c,
                    in_stock: in_stock,
                  } as Product)
              )
            }
          />
          <Label htmlFor="in_stock">In Stock</Label>
        </div>
        <Button
          type="submit"
          className={`w-full`}
          disabled={
            (id !== null && Object.keys(currentProduct || {}).length === 0) ||
            loading
          }
        >
          {loading && (
            <Loader2
              className="h-5 w-5 mr-2"
              style={{ animation: "spinner 1s linear infinite" }}
            />
          )}
          {isOld ? "Update" : "Add"} Product
        </Button>
      </form>
    </div>
  );
};

export default ProductCreate;
