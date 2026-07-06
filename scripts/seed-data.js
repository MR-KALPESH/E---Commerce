const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning existing data to avoid conflicts...");
  // Clear existing transactions first
  await prisma.review.deleteMany({});
  await prisma.heroBanner.deleteMany({});
  await prisma.heroSlider.deleteMany({});
  await prisma.countdown.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.additionalInformation.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.seoSetting.deleteMany({});
  await prisma.headerSetting.deleteMany({});

  console.log("Seeding database with premium Skincare & Beauty products...");

  // 1. Seed SEO Settings
  const seo = await prisma.seoSetting.create({
    data: {
      siteName: "CozyCommerce Beauty",
      siteTitle: "CozyCommerce | Natural Skincare & Beauty Essentials",
      metadescription: "Discover our curated collection of organic face serums, body scrubs, hydrating toners, and clean cosmetics.",
      metaKeywords: "skincare, beauty, cosmetics, face serum, body wash, organic beauty",
      favicon: "/favicon.ico",
      gtmId: "GTM-XXXXXX"
    }
  });
  console.log("Seeded SEO Settings.");

  // 2. Seed Header Settings
  const header = await prisma.headerSetting.create({
    data: {
      headerLogo: "/images/logo/logo.svg",
      emailLogo: "/images/logo/logo.svg",
      headerText: "Enjoy 15% off your first order! Use code WELCOME15"
    }
  });
  console.log("Seeded Header Settings.");

  // 3. Seed Beauty Categories
  const catFace = await prisma.category.create({
    data: {
      title: "Face Care",
      slug: "face-care",
      image: "/images/categories/categories-01.png",
      img: "/images/categories/categories-01.png",
      description: "Hydrating serums, foaming cleansers, and organic toners."
    }
  });

  const catBody = await prisma.category.create({
    data: {
      title: "Body Care",
      slug: "body-care",
      image: "/images/categories/categories-02.png",
      img: "/images/categories/categories-02.png",
      description: "Nourishing body scrubs, lotions, and natural wash blends."
    }
  });

  const catHair = await prisma.category.create({
    data: {
      title: "Hair Care",
      slug: "hair-care",
      image: "/images/categories/categories-03.png",
      img: "/images/categories/categories-03.png",
      description: "Restorative hair oils, botanical shampoos, and conditioners."
    }
  });

  const catMakeup = await prisma.category.create({
    data: {
      title: "Makeup & Cosmetics",
      slug: "makeup-cosmetics",
      image: "/images/categories/categories-04.png",
      img: "/images/categories/categories-04.png",
      description: "Clean liquid lipsticks, foundations, and palettes."
    }
  });
  console.log("Seeded Skincare Categories.");

  // 4. Seed Products
  // Product 1: Hyaluronic Acid Serum (Face Care)
  const prodSerum = await prisma.product.create({
    data: {
      title: "Hydrating Hyaluronic Acid Serum",
      slug: "hydrating-hyaluronic-acid-serum",
      shortDescription: "Ultra-pure hydrating serum with dual-weight hyaluronic acid to plump skin and locking moisture.",
      description: "Formulated with organic aloe vera and pure hyaluronic acid, this light serum absorbs quickly to revitalize dehydrated skin cells.",
      body: "<p>Apply 2-3 drops to clean damp skin. Follow with your favorite moisturizer to lock in deep hydration for up to 24 hours.</p>",
      price: 29.0,
      discountedPrice: 19.0,
      quantity: 120,
      sku: "HA-SER-30ML",
      tags: ["skincare", "face-care", "serum"],
      offers: ["Buy 2 get a free Jade Roller accessory", "15% discount for first time subscribers"],
      categoryId: catFace.id,
      productVariants: {
        create: [
          { image: "/images/products/product-1-bg-1.png", color: "Natural", size: "30ml", isDefault: true },
          { image: "/images/products/product-1-bg-2.png", color: "Natural", size: "50ml", isDefault: false }
        ]
      },
      additionalInformation: {
        create: [
          { name: "Ingredients", description: "Hyaluronic Acid, Aloe Vera Extract, Panthenol, Aqua" },
          { name: "Skin Type", description: "Suitable for all skin types, including sensitive" }
        ]
      }
    }
  });

  // Product 2: Rosewater Toner (Face Care)
  const prodToner = await prisma.product.create({
    data: {
      title: "Organic Rosewater Facial Toner",
      slug: "organic-rosewater-facial-toner",
      shortDescription: "100% pure steam-distilled rosewater spray to balance skin pH and refresh your complexion.",
      price: 24.0,
      discountedPrice: 18.0,
      quantity: 80,
      sku: "RW-TON-100ML",
      tags: ["skincare", "toner", "organic"],
      offers: ["Free shipping when purchased with any facial serum"],
      categoryId: catFace.id,
      productVariants: {
        create: [
          { image: "/images/products/product-2-bg-1.png", color: "Original", size: "100ml", isDefault: true }
        ]
      }
    }
  });

  // Product 3: Shea Butter Scrub (Body Care)
  const prodScrub = await prisma.product.create({
    data: {
      title: "Organic Shea Butter Body Scrub",
      slug: "organic-shea-butter-body-scrub",
      shortDescription: "Gently exfoliating brown sugar scrub enriched with organic shea butter and coconut oil.",
      price: 32.0,
      discountedPrice: 24.0,
      quantity: 65,
      sku: "SB-SCR-200G",
      tags: ["body-care", "scrub", "shea-butter"],
      categoryId: catBody.id,
      productVariants: {
        create: [
          { image: "/images/products/product-3-bg-1.png", color: "Coconut", size: "200g", isDefault: true }
        ]
      }
    }
  });

  // Product 4: Matte Liquid Lipstick (Makeup category)
  const prodLipstick = await prisma.product.create({
    data: {
      title: "Matte Liquid Lipstick - Classic Red",
      slug: "matte-liquid-lipstick-classic-red",
      shortDescription: "Long-lasting matte liquid lipstick enriched with vitamin E for comfortable, velvety wear.",
      price: 18.0,
      discountedPrice: 15.0,
      quantity: 150,
      sku: "LL-CR-RD",
      tags: ["makeup", "lipstick", "cosmetics"],
      categoryId: catMakeup.id,
      productVariants: {
        create: [
          { image: "/images/products/product-4-bg-1.png", color: "Classic Red", size: "Standard", isDefault: true }
        ]
      }
    }
  });

  // Product 5: Argan Hair Oil (Hair Care)
  const prodHairOil = await prisma.product.create({
    data: {
      title: "Restorative Argan Hair Oil",
      slug: "restorative-argan-hair-oil",
      shortDescription: "Nourishing organic argan oil to repair dry split ends and restore radiant shine.",
      price: 35.0,
      discountedPrice: 28.0,
      quantity: 90,
      sku: "AO-RES-50ML",
      tags: ["hair-care", "hair-oil", "argan"],
      categoryId: catHair.id,
      productVariants: {
        create: [
          { image: "/images/products/product-5-bg-1.png", color: "Gold", size: "50ml", isDefault: true }
        ]
      }
    }
  });
  console.log("Seeded Skincare Products.");

  // 5. Seed Countdowns
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 7); // 7 days from now
  const countdown = await prisma.countdown.create({
    data: {
      title: "Special Offer of the Week",
      subtitle: "Save 35% on our award-winning Hydrating Serum. Restore your skin's natural barrier today!",
      image: "/images/countdown/countdown-bg.png",
      countdownImage: "/images/products/product-1-bg-1.png",
      date: targetDate,
      productId: prodSerum.id
    }
  });
  console.log("Seeded Countdowns.");

  // 6. Seed Hero Sliders
  await prisma.heroSlider.create({
    data: {
      sliderName: "Glowing Skin Essentials",
      sliderImage: "/images/hero/hero-01.png",
      discountRate: 15,
      slug: prodSerum.slug,
      productId: prodSerum.id
    }
  });

  await prisma.heroSlider.create({
    data: {
      sliderName: "Bold Velvety Lips",
      sliderImage: "/images/products/product-4-bg-1.png",
      discountRate: 20,
      slug: prodLipstick.slug,
      productId: prodLipstick.id
    }
  });
  console.log("Seeded Hero Sliders.");

  // 7. Seed Hero Banners
  await prisma.heroBanner.create({
    data: {
      bannerName: "Organic Facial Toners",
      bannerImage: "/images/products/product-2-bg-1.png",
      slug: prodToner.slug,
      productId: prodToner.id
    }
  });
  console.log("Seeded Hero Banners.");

  // 8. Seed Reviews
  await prisma.review.create({
    data: {
      name: "Sophia Martinez",
      email: "sophia@example.com",
      comment: "My skin feels so plump and soft after using this serum. Highly recommend it to everyone!",
      ratings: 5,
      isApproved: true,
      productSlug: prodSerum.slug,
      productId: prodSerum.id
    }
  });

  await prisma.review.create({
    data: {
      name: "Aisha Khan",
      email: "aisha@example.com",
      comment: "Wonderful rose aroma and balances dry patches perfectly.",
      ratings: 5,
      isApproved: true,
      productSlug: prodToner.slug,
      productId: prodToner.id
    }
  });
  console.log("Seeded Reviews.");

  console.log("Database successfully seeded with Skincare & Beauty products!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
