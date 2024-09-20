import { useEffect, useState } from "react";
import { BannerImage, Category } from "./types";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Loader2 } from "lucide-react";

const ContentManagement: React.FC<{
  allCategories: Category[];
  setAllCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}> = ({ allCategories, setAllCategories }) => {
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newBannerImage, setNewBannerImage] = useState<File | null>(null);
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const handleAddBanner = async () => {
    if (newBannerImage) {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", newBannerImage);
      try {
        const response = await axios.post("/api/banner-images", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.success) {
          setBannerImages([...bannerImages, response.data.data]);
          setNewBannerImage(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error adding banner image:", error);
      }
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    try {
      setDeleteLoading(true);
      const response = await axios.delete(`/api/banner-images/${bannerId}`);
      if (response.data.success) {
        setBannerImages(bannerImages.filter((b) => b._id !== bannerId));
      }
      setDeleteLoading(false);
    } catch (error) {
      console.error("Error deleting banner image:", error);
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        setLoading(true);
        const response = await axios.post("/api/categories", {
          name: newCategory,
        });
        if (response.data.success) {
          setAllCategories([...allCategories, response.data.data]);
          setNewCategory("");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error adding category:", error);
      }
    }
  };

  const handleEditCategory = async (category: Category) => {
    if (editingCategory && editingCategory.name.trim()) {
      try {
        setSaveLoading(true);
        const response = await axios.put(`/api/categories/${category._id}`, {
          name: editingCategory.name,
        });
        setSaveLoading(false);
        if (response.data.success) {
          setAllCategories(
            allCategories.map((c) =>
              c._id === category._id ? response.data.data : c
            )
          );
          setEditingCategory(null);
        } else throw new Error("Operation failed successfully");
      } catch (error) {
        console.error("Error editing category:", error);
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setDeleteLoading(true);
      const response = await axios.delete(`/api/categories/${categoryId}`);
      setDeleteLoading(false);
      if (response.data.success) {
        setAllCategories(allCategories.filter((c) => c._id !== categoryId));
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const fetchBannerImages = async () => {
    try {
      const response = await axios.get("/api/banner-images");
      if (response.data.success) {
        setBannerImages(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching banner images:", error);
    }
  };

  useEffect(() => {
    fetchBannerImages();
  }, []);

  return (
    <Tabs defaultValue="categories">
      <TabsList className="grid w-full grid-cols-2 mb-5">
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="banners">Banner Images</TabsTrigger>
      </TabsList>
      <TabsContent value="categories">
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <Button onClick={handleAddCategory} disabled={loading}>
            {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
            Add
          </Button>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCategories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    {editingCategory && editingCategory._id === category._id ? (
                      <Input
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                          })
                        }
                      />
                    ) : (
                      category.name
                    )}
                  </TableCell>
                  <TableCell className="flex gap-3 justify-end">
                    {editingCategory && editingCategory._id === category._id ? (
                      <Button
                        onClick={() => {
                          handleEditCategory(category);
                          setSelectedId(category._id);
                        }}
                        disabled={saveLoading && selectedId === category._id}
                      >
                        {saveLoading && selectedId === category._id ? (
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                          ""
                        )}
                        Save
                      </Button>
                    ) : (
                      <Button onClick={() => setEditingCategory(category)}>
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleDeleteCategory(category._id);
                        setSelectedId(category._id);
                      }}
                      disabled={deleteLoading && selectedId === category._id}
                    >
                      {deleteLoading && selectedId === category._id ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        ""
                      )}
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
      <TabsContent value="banners">
        <div className="flex gap-2 mb-4">
          <Input
            type="file"
            onChange={(e) => setNewBannerImage(e.target.files?.[0] || null)}
          />
          <Button onClick={handleAddBanner} disabled={loading}>
            <Loader2
              className={`w-5 h-5 animate-spin ${loading ? "" : "hidden"} mr-2`}
            />
            Add Banner
          </Button>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bannerImages.map((banner) => (
                <TableRow key={banner._id}>
                  <TableCell>
                    <img
                      src={banner.imageUrl}
                      alt="Banner"
                      className="w-20 object-cover rounded"
                      style={{ aspectRatio: "16/9" }}
                    />
                  </TableCell>
                  <TableCell>{banner.imageUrl}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleDeleteBanner(banner._id);
                        setSelectedId(banner._id);
                      }}
                      disabled={deleteLoading && selectedId === banner._id}
                    >
                      {deleteLoading && selectedId === banner._id ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        ""
                      )}
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ContentManagement;
