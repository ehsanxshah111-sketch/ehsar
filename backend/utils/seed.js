import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";
import Product from "../models/Product.js";
import Banner from "../models/Banner.js";

dotenv.config();

const products = [
  {
    name: "Classic Wool Overcoat",
    description: "A timeless tailored overcoat crafted from premium wool blend. Perfect for elevated everyday layering.",
    price: 189,
    category: "men",
    subCategory: "Coats",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Camel", "Black", "Grey"],
    images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800"],
    isFeatured: true,
    isNew: true,
  },
  {
    name: "Oxford Cotton Shirt",
    description: "Crisp, breathable cotton shirt with a clean tailored fit. A wardrobe essential.",
    price: 59,
    category: "men",
    subCategory: "Shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Light Blue"],
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"],
    isFeatured: true,
  },
  {
    name: "Slim Fit Chino Trousers",
    description: "Modern slim-fit chinos in stretch cotton twill for all-day comfort.",
    price: 69,
    category: "men",
    subCategory: "Trousers",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Beige", "Navy", "Black"],
    images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800"],
    isOnSale: true,
    discountPrice: 49,
  },
  {
    name: "Tailored Blazer",
    description: "A refined single-breasted blazer with structured shoulders, made for the modern gentleman.",
    price: 149,
    category: "men",
    subCategory: "Jackets",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Navy", "Charcoal"],
    images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800"],
    isFeatured: true,
  },
  {
    name: "Satin Wrap Midi Dress",
    description: "An elegant satin midi dress with a flattering wrap silhouette, ideal for evening occasions.",
    price: 99,
    category: "women",
    subCategory: "Dresses",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Emerald", "Black", "Blush"],
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"],
    isFeatured: true,
    isNew: true,
  },
  {
    name: "High-Waist Tailored Trousers",
    description: "Sharp, high-waisted trousers with a wide leg silhouette for a polished, elongated look.",
    price: 79,
    category: "women",
    subCategory: "Trousers",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Cream"],
    images: ["https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=800"],
  },
  {
    name: "Ribbed Knit Sweater",
    description: "Soft ribbed-knit sweater with a relaxed fit, designed for effortless everyday style.",
    price: 65,
    category: "women",
    subCategory: "Knitwear",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Oatmeal", "Sage", "Black"],
    images: ["https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800"],
    isOnSale: true,
    discountPrice: 45,
  },
  {
    name: "Structured Trench Coat",
    description: "A double-breasted trench coat in water-resistant cotton, the definitive transitional-season staple.",
    price: 169,
    category: "women",
    subCategory: "Coats",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Camel", "Black"],
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800"],
    isFeatured: true,
  },
];

const banners = [
  {
    title: "EHSAR",
    subtitle: "The New Season Edit",
    promotionText: "NEW ARRIVALS",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600",
    linkUrl: "/shop",
    buttonText: "Discover Now",
    order: 0,
  },
  {
    title: "End of Season Sale",
    subtitle: "Refresh your wardrobe for less",
    promotionText: "UP TO 40% OFF",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600",
    linkUrl: "/shop?sale=true",
    buttonText: "Shop the Sale",
    order: 1,
  },
];

const runSeed = async () => {
  await connectDB();

  await Product.deleteMany();
  await Banner.deleteMany();
  await Product.insertMany(products);
  await Banner.insertMany(banners);
  console.log("Products and banners seeded.");

  const existingAdmin = await Admin.findOne({
    username: process.env.ADMIN_SEED_USERNAME || "admin",
  });

  if (!existingAdmin) {
    await Admin.create({
      username: process.env.ADMIN_SEED_USERNAME || "admin",
      password: process.env.ADMIN_SEED_PASSWORD || "Ehsar@Admin123",
    });
    console.log("Default admin created.");
    console.log(`   Username: ${process.env.ADMIN_SEED_USERNAME || "admin"}`);
    console.log(`   Password: ${process.env.ADMIN_SEED_PASSWORD || "Ehsar@Admin123"}`);
    console.log("   IMPORTANT: Log in and change this password immediately.");
  } else {
    console.log("Admin already exists, skipping admin creation.");
  }

  mongoose.connection.close();
  process.exit(0);
};

runSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
