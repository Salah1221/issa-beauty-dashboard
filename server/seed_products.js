import { connectDB } from "./db.js";
import { Product, Category } from "./models.js";
import mongoose from "mongoose";

const products = [
  // Skin Care
  { name: "Hydrating Face Cream", category: "Skin Care", price: 25, description: "A deeply hydrating face cream with hyaluronic acid.", imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop" },
  { name: "Vitamin C Serum", category: "Skin Care", price: 35, description: "Brightening serum with 15% pure Vitamin C.", imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop" },
  { name: "Gentle Cleanser", category: "Skin Care", price: 18, description: "pH-balanced cleanser for all skin types.", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000&auto=format&fit=crop" },
  { name: "Retinol Night Oil", category: "Skin Care", price: 45, description: "Anti-aging retinol oil for overnight rejuvenation.", imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1000&auto=format&fit=crop" },
  { name: "Sunscreen SPF 50", category: "Skin Care", price: 22, description: "Broad-spectrum mineral sunscreen.", imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=1000&auto=format&fit=crop" },
  { name: "Exfoliating Toner", category: "Skin Care", price: 20, description: "AHA/BHA toner for smooth skin texture.", imageUrl: "https://images.unsplash.com/photo-1601049541289-9b1b7bebf70a?q=80&w=1000&auto=format&fit=crop" },
  { name: "Eye Repair Cream", category: "Skin Care", price: 30, description: "Targeted treatment for dark circles and puffiness.", imageUrl: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?q=80&w=1000&auto=format&fit=crop" },
  { name: "Soothing Face Mask", category: "Skin Care", price: 15, description: "Sheet mask with aloe vera and chamomile.", imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop" },
  { name: "Lip Balm Set", category: "Skin Care", price: 12, description: "Trio of moisturizing lip balms.", imageUrl: "https://images.unsplash.com/photo-1599426417084-20d41f0bc19a?q=80&w=1000&auto=format&fit=crop" },
  { name: "Clay Detox Mask", category: "Skin Care", price: 24, description: "Deeply purifying kaolin clay mask.", imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1000&auto=format&fit=crop" },

  // Hair Care
  { name: "Moisturizing Shampoo", category: "Hair Care", price: 20, description: "Sulfate-free shampoo for dry hair.", imageUrl: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=1000&auto=format&fit=crop" },
  { name: "Repairing Conditioner", category: "Hair Care", price: 22, description: "Deeply nourishing conditioner with keratin.", imageUrl: "https://images.unsplash.com/photo-1592136957897-b2b6ca21e10d?q=80&w=1000&auto=format&fit=crop" },
  { name: "Argan Hair Oil", category: "Hair Care", price: 28, description: "Pure Moroccan argan oil for shine and softness.", imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1000&auto=format&fit=crop" },
  { name: "Volumizing Mousse", category: "Hair Care", price: 18, description: "Lightweight mousse for extra body.", imageUrl: "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?q=80&w=1000&auto=format&fit=crop" },
  { name: "Scalp Scrub", category: "Hair Care", price: 24, description: "Exfoliating scrub for a healthy scalp.", imageUrl: "https://images.unsplash.com/photo-1601049541289-9b1b7bebf70a?q=80&w=1000&auto=format&fit=crop" },
  { name: "Detangling Spray", category: "Hair Care", price: 16, description: "Leave-in spray for easy combing.", imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=1000&auto=format&fit=crop" },
  { name: "Hair Growth Serum", category: "Hair Care", price: 38, description: "Stimulates follicles for thicker hair.", imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop" },
  { name: "Curl Defining Cream", category: "Hair Care", price: 26, description: "Enhances and defines natural curls.", imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop" },
  { name: "Heat Protectant", category: "Hair Care", price: 20, description: "Protects hair from styling tools up to 450°F.", imageUrl: "https://images.unsplash.com/photo-1592136957897-b2b6ca21e10d?q=80&w=1000&auto=format&fit=crop" },
  { name: "Silver Shampoo", category: "Hair Care", price: 22, description: "Toning shampoo for blonde and grey hair.", imageUrl: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=1000&auto=format&fit=crop" },

  // Makeup
  { name: "Matte Lipstick", category: "Makeup", price: 18, description: "Long-lasting matte finish in 'Ruby Red'.", imageUrl: "https://images.unsplash.com/photo-1586776977607-310e9c725c37?q=80&w=1000&auto=format&fit=crop" },
  { name: "Liquid Foundation", category: "Makeup", price: 32, description: "Full coverage foundation for a flawless look.", imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop" },
  { name: "Eyeshadow Palette", category: "Makeup", price: 42, description: "12 warm neutral shades.", imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1000&auto=format&fit=crop" },
  { name: "Mascara Black", category: "Makeup", price: 15, description: "Volume and length in one stroke.", imageUrl: "https://images.unsplash.com/photo-1631214503020-74944744851b?q=80&w=1000&auto=format&fit=crop" },
  { name: "Brow Pomade", category: "Makeup", price: 16, description: "Sculpts and fills brows for a natural look.", imageUrl: "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?q=80&w=1000&auto=format&fit=crop" },
  { name: "Setting Spray", category: "Makeup", price: 20, description: "Locks makeup in place all day.", imageUrl: "https://images.unsplash.com/photo-1601049541289-9b1b7bebf70a?q=80&w=1000&auto=format&fit=crop" },
  { name: "Blush Compact", category: "Makeup", price: 14, description: "Soft pink blush for a healthy glow.", imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1000&auto=format&fit=crop" },
  { name: "Liquid Eyeliner", category: "Makeup", price: 12, description: "Precision felt tip for the perfect wing.", imageUrl: "https://images.unsplash.com/photo-1631214503020-74944744851b?q=80&w=1000&auto=format&fit=crop" },
  { name: "Highlighter Palette", category: "Makeup", price: 30, description: "Four luminous shades for every skin tone.", imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1000&auto=format&fit=crop" },
  { name: "Concealer Stick", category: "Makeup", price: 14, description: "Creamy concealer for spot correction.", imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop" },

  // Fragrance
  { name: "Eau de Parfum - Flora", category: "Fragrance", price: 65, description: "Delicate floral scent with jasmine and rose.", imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop" },
  { name: "Night Woods Cologne", category: "Fragrance", price: 75, description: "Woody and spicy scent with sandalwood.", imageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop" },
  { name: "Fresh Citrus Mist", category: "Fragrance", price: 30, description: "Light and refreshing citrus body mist.", imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop" },
  { name: "Vanilla Dream", category: "Fragrance", price: 55, description: "Sweet and warm vanilla scent.", imageUrl: "https://images.unsplash.com/photo-1585232351009-aa87416fca90?q=80&w=1000&auto=format&fit=crop" },
  { name: "Ocean Breeze", category: "Fragrance", price: 60, description: "Crisp aquatic scent for a fresh feel.", imageUrl: "https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?q=80&w=1000&auto=format&fit=crop" },
  { name: "Midnight Musk", category: "Fragrance", price: 70, description: "Intense and mysterious musk fragrance.", imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop" },
  { name: "Lavender Fields", category: "Fragrance", price: 45, description: "Calming lavender scent with herbal notes.", imageUrl: "https://images.unsplash.com/photo-1585232351009-aa87416fca90?q=80&w=1000&auto=format&fit=crop" },
  { name: "Gold Amber", category: "Fragrance", price: 85, description: "Rich and luxurious amber fragrance.", imageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop" },
  { name: "Morning Dew", category: "Fragrance", price: 50, description: "Green and earthy scent of fresh morning air.", imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop" },
  { name: "Rose Garden", category: "Fragrance", price: 68, description: "Pure essence of freshly picked roses.", imageUrl: "https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?q=80&w=1000&auto=format&fit=crop" },

  // Bath & Body
  { name: "Lavender Body Wash", category: "Bath & Body", price: 15, description: "Calming body wash with lavender oil.", imageUrl: "https://images.unsplash.com/photo-1601049541289-9b1b7bebf70a?q=80&w=1000&auto=format&fit=crop" },
  { name: "Shea Butter Lotion", category: "Bath & Body", price: 20, description: "Ultra-moisturizing body lotion.", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000&auto=format&fit=crop" },
  { name: "Sugar Scrub - Coconut", category: "Bath & Body", price: 22, description: "Exfoliating sugar scrub with coconut oil.", imageUrl: "https://images.unsplash.com/photo-1601049541289-9b1b7bebf70a?q=80&w=1000&auto=format&fit=crop" },
  { name: "Bath Bomb Set", category: "Bath & Body", price: 25, description: "Six colorful and fragrant bath bombs.", imageUrl: "https://images.unsplash.com/photo-1584305650910-6fbf0bc35e5d?q=80&w=1000&auto=format&fit=crop" },
  { name: "Hand Cream - Almond", category: "Bath & Body", price: 12, description: "Nourishing hand cream for dry hands.", imageUrl: "https://images.unsplash.com/photo-1599426417084-20d41f0bc19a?q=80&w=1000&auto=format&fit=crop" },
  { name: "Aloe Vera Gel", category: "Bath & Body", price: 10, description: "Pure aloe vera gel for sun-drenched skin.", imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop" },
  { name: "Body Butter - Mango", category: "Bath & Body", price: 24, description: "Thick and creamy mango body butter.", imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop" },
  { name: "Epson Salt Soak", category: "Bath & Body", price: 18, description: "Muscle-relaxing bath salts with eucalyptus.", imageUrl: "https://images.unsplash.com/photo-1584305650910-6fbf0bc35e5d?q=80&w=1000&auto=format&fit=crop" },
  { name: "Liquid Hand Soap", category: "Bath & Body", price: 10, description: "Gentle hand soap with lemon zest.", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000&auto=format&fit=crop" },
  { name: "Foot Cream - Peppermint", category: "Bath & Body", price: 14, description: "Cooling peppermint cream for tired feet.", imageUrl: "https://images.unsplash.com/photo-1599426417084-20d41f0bc19a?q=80&w=1000&auto=format&fit=crop" },
];

const seedDB = async () => {
  await connectDB();
  
  try {
    // Optional: Clear existing products
    // await Product.deleteMany({});
    // console.log("Cleared existing products.");

    // Ensure categories exist
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    for (const catName of uniqueCategories) {
      const exists = await Category.findOne({ name: catName });
      if (!exists) {
        await Category.create({ name: catName });
        console.log(`Created category: ${catName}`);
      }
    }

    await Product.insertMany(products);
    console.log(`Successfully seeded ${products.length} products.`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
