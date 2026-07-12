const { PrismaClient } = require("@prisma/client");
const algoliasearch = require("algoliasearch");

const prisma = new PrismaClient();

async function main() {
  const projectId = process.env.NEXT_PUBLIC_ALGOLIA_PROJECT_ID;
  const writeApiKey = process.env.NEXT_PUBLIC_ALGOLIA_WRITE_API_KEY;
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX || "products";

  if (!projectId || !writeApiKey) {
    console.error("Error: NEXT_PUBLIC_ALGOLIA_PROJECT_ID and NEXT_PUBLIC_ALGOLIA_WRITE_API_KEY must be set in your environment.");
    process.exit(1);
  }

  console.log("Initializing Algolia client...");
  const algoliaClient = algoliasearch(projectId, writeApiKey);
  const algoliaIndex = algoliaClient.initIndex(indexName);

  console.log("Fetching products from database...");
  const products = await prisma.product.findMany({
    include: {
      productVariants: true,
      category: true,
    },
  });

  if (products.length === 0) {
    console.log("No products found in database to sync.");
    return;
  }

  console.log(`Syncing ${products.length} products to Algolia index "${indexName}"...`);

  const records = products.map((product) => {
    const defaultVariant = product.productVariants.find((v) => v.isDefault) || product.productVariants[0];
    return {
      objectID: product.id,
      title: product.title,
      slug: product.slug,
      shortDescription: product.shortDescription,
      price: Number(product.price),
      discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : null,
      image: defaultVariant ? defaultVariant.image : null,
      category: product.category ? product.category.title : null,
      tags: product.tags || [],
    };
  });

  await algoliaIndex.saveObjects(records);
  console.log("Algolia sync completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during Algolia sync:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
