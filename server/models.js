import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Define the Product schema
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: false,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    in_stock: {
      type: Boolean,
      required: false,
      default: true,
    },
    imageFileId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Define the Category schema
const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const bannerImgSchema = new Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    imageFileId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const adminAuthSchema = new Schema(
  {
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create models
const Product = model("Product", productSchema);
const Category = model("Category", categorySchema);
const BannerImg = model("BannerImg", bannerImgSchema, "bannerImages");
const AdminAuth = model("AdminAuth", adminAuthSchema, "adminAuth");

// Export the models
export { Product, Category, BannerImg, AdminAuth };
