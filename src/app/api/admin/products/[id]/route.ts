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

// GET /api/admin/products/[id] - Get single product with all relations
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        productVariants: true,
        category: true,
        reviews: true,
        additionalInformation: true,
        customAttributes: {
          include: { attributeValues: true },
        },
        heroBanners: true,
        heroSliders: true,
        countdowns: true,
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        product: {
          ...product,
          price: product.price.toNumber(),
          discountedPrice: product.discountedPrice?.toNumber() ?? null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_PRODUCT_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

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
    }: {
      title?: string;
      slug?: string;
      shortDescription?: string;
      description?: string;
      body?: string;
      price?: number;
      discountedPrice?: number;
      quantity?: number;
      sku?: string;
      tags?: string[];
      offers?: string[];
      categoryId?: number;
      productVariants?: ProductVariantInput[];
    } = body;

    // When updating variants: delete existing and recreate
    if (productVariants !== undefined) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(description !== undefined && { description }),
        ...(productBody !== undefined && { body: productBody }),
        ...(price !== undefined && { price }),
        ...(discountedPrice !== undefined && { discountedPrice }),
        ...(quantity !== undefined && { quantity }),
        ...(sku !== undefined && { sku }),
        ...(tags !== undefined && { tags }),
        ...(offers !== undefined && { offers }),
        ...(categoryId !== undefined && { categoryId }),
        ...(productVariants !== undefined && {
          productVariants: {
            create: productVariants.map((v) => ({
              image: v.image,
              color: v.color,
              size: v.size,
              isDefault: v.isDefault ?? false,
            })),
          },
        }),
      },
      include: {
        productVariants: true,
        category: true,
      },
    });

    // Sync to Algolia
    try {
      await algoliaIndex.partialUpdateObject({
        objectID: product.id,
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(price !== undefined && { price }),
        ...(discountedPrice !== undefined && { discountedPrice }),
      });
    } catch (algoliaError) {
      console.warn("[ALGOLIA_SYNC_WARNING]", algoliaError);
    }

    // Bust the product cache so the shop page shows updates
    revalidateTag("products", "max");

    return NextResponse.json(
      {
        message: "Product updated successfully",
        product: {
          ...product,
          price: product.price.toNumber(),
          discountedPrice: product.discountedPrice?.toNumber() ?? null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_PRODUCT_PUT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.product.delete({ where: { id } });

    // Remove from Algolia
    try {
      await algoliaIndex.deleteObject(id);
    } catch (algoliaError) {
      console.warn("[ALGOLIA_DELETE_WARNING]", algoliaError);
    }

    // Bust the product cache so the shop page reflects deletion
    revalidateTag("products", "max");

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_PRODUCT_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
