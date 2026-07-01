import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import { Product, Category, BannerImg, Order, ORDER_STATUSES } from "./models.js";
import mongoose from "mongoose";
import ImageKit from "imagekit";
import multer from "multer";
import {
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllProducts,
} from "./crud.js";
import cookieParser from "cookie-parser";
import { AdminAuth } from "./models.js";
import {
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
  COOKIE_NAME,
  TOKEN_MAX_AGE_MS,
} from "./auth.js";
import { sendEmail, statusUpdateEmail } from "./email.js";

const getAllCategories = async () => {
  return await Category.find();
};

dotenv.config();

const app = express();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const upload = multer();

// Compress images on upload so ImageKit stores an already-optimized original.
// `c-at_max` fits the image within the box without cropping, capping the
// longest side; q-80 keeps quality high while cutting file size dramatically.
const PRODUCT_IMAGE_TR = "w-1600,h-1600,c-at_max,q-80";
const BANNER_IMAGE_TR = "w-2000,h-2000,c-at_max,q-80";

const uploadImage = (buffer, fileName, pre) =>
  imagekit.upload({
    file: buffer,
    fileName,
    transformation: { pre },
  });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cookieParser());

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: TOKEN_MAX_AGE_MS,
};

// --- Auth: login is the ONLY unauthenticated /api route ---
app.post("/api/auth/login", async (req, res) => {
  try {
    const { password } = req.body;
    if (typeof password !== "string") {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }
    const auth = await AdminAuth.findOne();
    if (!auth || !(await verifyPassword(password, auth.passwordHash))) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }
    res.cookie(COOKIE_NAME, signToken(), cookieOptions);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Everything below this line requires a valid session cookie.
app.use("/api", requireAuth);

app.get("/api/auth/check", (req, res) => {
  res.status(200).json({ success: true, authenticated: true });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ success: true });
});

app.put("/api/auth/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }
    if (newPassword.length < 4) {
      return res
        .status(400)
        .json({ success: false, message: "New password must be at least 4 characters" });
    }
    const auth = await AdminAuth.findOne();
    if (!auth || !(await verifyPassword(currentPassword, auth.passwordHash))) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }
    auth.passwordHash = await hashPassword(newPassword);
    await auth.save();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/products", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";
  const category = req.query.category || "";
  const sortOrder = req.query.sort || "newest";

  try {
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      };
    }

    if (category && category !== "all") {
      query.category = category;
    }

    let sort = { createdAt: -1 }; // Default to newest first
    if (sortOrder === "oldest") {
      sort = { createdAt: 1 };
    }

    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    const total = await Product.countDocuments(query);
    changeOrigin: (true,
      res.status(200).json({
        success: true,
        data: products,
        total,
        page,
        pages: Math.ceil(total / limit),
      }));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/products-by-category", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    const productsByCategory = {};

    products.forEach((product) => {
      if (!productsByCategory[product.category]) {
        productsByCategory[product.category] = [];
      }
      if (productsByCategory[product.category].length < 8) {
        productsByCategory[product.category].push(product);
      }
    });

    res.status(200).json({
      success: true,
      data: productsByCategory,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const category = await createCategory(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const category = await updateCategory(req.params.id, req.body);

    if (category) {
      await Product.updateMany({ category: category.name }, { category: name });
    }

    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const category = await deleteCategory(req.params.id);

    const products = await getAllProducts();

    products.map((product) => (product.category = "Uncategorized"));

    products.map((product) => updateProduct(product._id, product));

    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

const deleteImage = async (fileId) => {
  try {
    const result = await imagekit.deleteFile(fileId);
    console.log("Image deleted successfully:", result);
    return true;
  } catch (err) {
    console.error("Error deleting image:", err);
    return false;
  }
};

app.post("/api/products", upload.single("image"), async (req, res) => {
  const { name, category, price, description, discountPercentage, in_stock } =
    req.body;

  if (!name || !category || !price || !description) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    const imageFile = req.file;
    let imageUrl = "";
    let fileId;

    if (imageFile) {
      const result = await uploadImage(
        imageFile.buffer,
        `${name}-${Date.now()}`,
        PRODUCT_IMAGE_TR
      );
      imageUrl = result.url;
      fileId = result.fileId;
    }

    const newProduct = new Product({
      name,
      category,
      price,
      description,
      discountPercentage,
      in_stock,
      imageUrl,
      imageFileId: fileId,
    });

    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/products/:id", upload.single("image"), async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const { name, category, price, description, discountPercentage, in_stock } =
      req.body;
    const imageFile = req.file;

    if (imageFile) {
      if (product.imageFileId) {
        await deleteImage(product.imageFileId);
      }

      const result = await uploadImage(
        imageFile.buffer,
        `${name}-${Date.now()}`,
        PRODUCT_IMAGE_TR
      );

      product.imageUrl = result.url;
      product.imageFileId = result.fileId;
    }

    product.name = name;
    product.category = category;
    product.price = price;
    product.description = description;
    product.discountPercentage = discountPercentage;
    product.in_stock = in_stock;

    await product.save();
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const product = await deleteProduct(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const sortOrder = req.query.sort || "newest";

    if (product.imageFileId) {
      await deleteImage(product.imageFileId);
    }

    // Build the same query as the GET endpoint
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      };
    }

    if (category && category !== "all") {
      query.category = category;
    }

    let sort = { createdAt: -1 }; // Default to newest first
    if (sortOrder === "oldest") {
      sort = { createdAt: 1 };
    }

    const data = await Product.find(query).sort(sort).skip(skip).limit(limit);

    res.status(200).json({ success: true, data: data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

app.get("/api/banner-images", async (req, res) => {
  try {
    const bannerImages = await BannerImg.find();

    res.status(200).json({ success: true, data: bannerImages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/banner-images", upload.single("image"), async (req, res) => {
  try {
    const imageFile = req.file;
    let imageUrl = "";
    let fileId;

    if (imageFile) {
      const result = await uploadImage(
        imageFile.buffer,
        `banner-${Date.now()}`,
        BANNER_IMAGE_TR
      );
      imageUrl = result.url;
      fileId = result.fileId;
    }

    const newBannerImage = new BannerImg({
      imageUrl,
      imageFileId: fileId,
    });

    await newBannerImage.save();
    res.status(201).json({ success: true, data: newBannerImage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/banner-images/:id", async (req, res) => {
  try {
    const bannerImage = await BannerImg.findByIdAndDelete(req.params.id);

    if (bannerImage.imageFileId) await deleteImage(bannerImage.imageFileId);

    res.status(200).json({ success: true, data: bannerImage });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = {};
    if (status && ORDER_STATUSES.includes(status)) query.status = status;

    const [data, total, pendingCount] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
      Order.countDocuments({ status: "pending" }),
    ]);

    res.status(200).json({
      success: true,
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
      pendingCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/orders/pending-count", async (req, res) => {
  try {
    const count = await Order.countDocuments({ status: "pending" });
    res.status(200).json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const built = statusUpdateEmail(order);
    if (built && order.customer?.email) {
      sendEmail({ to: order.customer.email, ...built }).catch((e) =>
        console.error("status email failed", e),
      );
    }
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"));
});

export default app;
