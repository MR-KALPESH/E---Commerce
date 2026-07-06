import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";
import algoliasearch from "algoliasearch";

// TODO: Add admin authentication/authorization middleware

const algoliaClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_PROJECT_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_WRITE_API_KEY!
);
const algoliaIndex = algoliaClient.initIndex(
  process.env.NEXT_PUBLIC_ALGOLIA_INDEX || "products"
);

interface ProductVariantInput {
  image: string;
  color: string;
  size: string;
  isDefault: boolean;
}

interface CreateProductBody {
  title: string;
  slug: string;
  shortDescription: string;
  description?: string;
  body?: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  sku?: string;
  tags: string[];
  offers: string[];
  categoryId?: number;
  productVariants: ProductVariantInput[];
}

// GET /api/admin/products - Get all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        productVariants: true,
        category: true,
        _count: { select: { reviews: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Convert Decimal price fields to numbers
    const serialized = products.map((p) => ({
      ...p,
      price: p.price.toNumber(),
      discountedPrice: p.discountedPrice?.toNumber() ?? null,
    }));

    return NextResponse.json({ products: serialized }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/products - Create a product
export async function POST(req: NextRequest) {
  try {
    const body: CreateProductBody = await req.json();

    const {
      title,
      slug,
      shortDescription,
      description,
      body: productBody,
      price,
      discountedPrice,
      quantity,
      sku,
      tags,
      offers,
      categoryId,
      productVariants,
    } = body;

    if (!title || !slug || !shortDescription || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, shortDescription, price" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        shortDescription,
        description: description || null,
        body: productBody || null,
        price,
        discountedPrice: discountedPrice ?? null,
        quantity: quantity ?? 0,
        sku: sku || null,
        tags: tags || [],
        offers: offers || [],
        categoryId: categoryId || null,
        productVariants: {
          create: (productVariants || []).map((v) => ({
            image: v.image,
            color: v.color,
            size: v.size,
            isDefault: v.isDefault ?? false,
          })),
        },
      },
      include: {
        productVariants: true,
        category: true,
      },
    });

    // Sync to Algolia
    try {
      await algoliaIndex.saveObject({
        objectID: product.id,
        title: product.title,
        slug: product.slug,
        shortDescription: product.shortDescription,
        price: product.price.toNumber(),
        discountedPrice: product.discountedPrice?.toNumber() ?? null,
        image: product.productVariants.find((v) => v.isDefault)?.image || null,
      });
    } catch (algoliaError) {
      console.warn("[ALGOLIA_SYNC_WARNING]", algoliaError);
      // Non-fatal: product is created even if Algolia sync fails
    }

    // Bust the product cache so the shop page shows the new product
    revalidateTag("products", "max");

    return NextResponse.json(
      {
        message: "Product created successfully",
        product: {
          ...product,
          price: product.price.toNumber(),
          discountedPrice: product.discountedPrice?.toNumber() ?? null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
