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
import React, { useEffect, useState } from "react";
import { Image, Loader2 } from "lucide-react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Textarea } from "./components/ui/textarea";
import { toast } from "sonner";

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
  const navigate = useNavigate();

  useEffect(() => {
    console.log(id);
    if (id) {
      axios
        .get(`/api/products/${id}`)
        .then((res) => {
          setCurrentProduct(res.data.data);
          setImageUrl(res.data.data.imageUrl);
        })
        .catch((err) => console.log(err.message));
    }
  }, [id]);

  useEffect(() => {
    axios.get("/api/categories").then((response) => {
      const data = response.data;
      if (data.success) {
        setCategories(data.data);
      }
    });
    setCurrentProduct(
      (c) =>
        ({
          ...c,
          in_stock: true,
        } as Product)
    );
  }, []);

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
        await axios.put(`/api/products/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("/api/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate("/");
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="p-5 sm:p-6 md:p-8 max-w-3xl mx-auto">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <>
          <div className="space-y-2">
            <img
              src={imageUrl ?? ""}
              alt="Preview"
              className={`w-[300px] h-[200px] object-cover rounded ${
                !imageUrl ? "hidden" : ""
              } mx-auto mb-5`}
            />
            {!imageUrl && (
              <div
                className="w-[300px] h-[200px] grid place-items-center border rounded mx-auto"
                style={{ marginBottom: "1.25rem" }}
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
            defaultValue={currentProduct?.category}
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
            defaultValue={currentProduct?.price}
            onChange={(e) => {
              if (
                !isNaN(parseFloat(e.target.value)) &&
                e.target.value[e.target.value.length - 1] !== "."
              ) {
                e.target.value = parseFloat(e.target.value).toString();
                setCurrentProduct(
                  (c) =>
                    ({
                      ...c,
                      price: parseFloat(e.target.value),
                    } as Product)
                );
              } else if (
                e.target.value !== "" &&
                e.target.value[e.target.value.length - 1] !== "."
              ) {
                e.target.value = "";
              }
            }}
          />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Discount Percentage</Label>
          <Input
            id="discountPercentage"
            name="discountPercentage"
            defaultValue={currentProduct?.discountPercentage ?? 0}
            min={0}
            max={100}
            onChange={(e) => {
              if (
                !isNaN(parseFloat(e.target.value)) &&
                e.target.value[e.target.value.length - 1] !== "."
              ) {
                e.target.value = parseFloat(e.target.value).toString();
                setCurrentProduct(
                  (c) =>
                    ({
                      ...c,
                      discountPercentage: parseFloat(e.target.value),
                    } as Product)
                );
              } else if (
                e.target.value !== "" &&
                e.target.value[e.target.value.length - 1] !== "."
              ) {
                e.target.value = "";
              }
            }}
          />
          {errors.discountPercentage && (
            <p className="text-red-500 text-sm">{errors.discountPercentage}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="in_stock"
            name="in_stock"
            defaultChecked={
              currentProduct?.in_stock ? currentProduct?.in_stock : true
            }
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
          className={`w-full ${loading ? "opacity-50" : ""}`}
          disabled={
            id !== null &&
            Object.keys(currentProduct || {}).length === 1 &&
            currentProduct?.in_stock !== undefined
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
