import { connectDB } from "./db.js";
import { Product, Category } from "./models.js";
import mongoose from "mongoose";

const productNames = [
  "Hydrating Face Cream", "Vitamin C Serum", "Gentle Cleanser", "Retinol Night Oil", "Sunscreen SPF 50",
  "Exfoliating Toner", "Eye Repair Cream", "Soothing Face Mask", "Lip Balm Set", "Clay Detox Mask",
  "Moisturizing Shampoo", "Repairing Conditioner", "Argan Hair Oil", "Volumizing Mousse", "Scalp Scrub",
  "Detangling Spray", "Hair Growth Serum", "Curl Defining Cream", "Heat Protectant", "Silver Shampoo",
  "Matte Lipstick", "Liquid Foundation", "Eyeshadow Palette", "Mascara Black", "Brow Pomade",
  "Setting Spray", "Blush Compact", "Liquid Eyeliner", "Highlighter Palette", "Concealer Stick",
  "Eau de Parfum - Flora", "Night Woods Cologne", "Fresh Citrus Mist", "Vanilla Dream", "Ocean Breeze",
  "Midnight Musk", "Lavender Fields", "Gold Amber", "Morning Dew", "Rose Garden",
  "Lavender Body Wash", "Shea Butter Lotion", "Sugar Scrub - Coconut", "Bath Bomb Set", "Hand Cream - Almond",
  "Aloe Vera Gel", "Body Butter - Mango", "Epson Salt Soak", "Liquid Hand Soap", "Foot Cream - Peppermint"
];

const categoriesCreated = ["Hair Care", "Fragrance", "Bath & Body"];

const undoSeed = async () => {
  await connectDB();
  
  try {
    // Delete seeded products
    const productResult = await Product.deleteMany({ name: { $in: productNames } });
    console.log(`Deleted ${productResult.deletedCount} products.`);

    // Delete categories if they were created and are now empty
    for (const catName of categoriesCreated) {
      const productCount = await Product.countDocuments({ category: catName });
      if (productCount === 0) {
        await Category.deleteOne({ name: catName });
        console.log(`Deleted empty category: ${catName}`);
      } else {
        console.log(`Category ${catName} still has products, skipping deletion.`);
      }
    }

    console.log("Undo operation completed successfully.");
  } catch (error) {
    console.error("Error during undo operation:", error);
  } finally {
    mongoose.connection.close();
  }
};

undoSeed();
