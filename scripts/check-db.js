const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.count();
  const categories = await prisma.category.count();
  const heroBanners = await prisma.heroBanner.count();
  const heroSliders = await prisma.heroSlider.count();
  const countdowns = await prisma.countdown.count();
  const reviews = await prisma.review.count();
  const orders = await prisma.order.count();
  const seo = await prisma.seoSetting.count();
  const header = await prisma.headerSetting.count();

  console.log(JSON.stringify({
    products,
    categories,
    heroBanners,
    heroSliders,
    countdowns,
    reviews,
    orders,
    seo,
    header
  }, null, 2));

  if (products > 0) {
    const sampleProduct = await prisma.product.findFirst({
      include: { productVariants: true, category: true }
    });
    console.log("\nSample Product in DB:", JSON.stringify(sampleProduct, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
