import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        discountedPrice: true,
        productVariants: {
          select: {
            image: true,
            isDefault: true,
          },
        },
      },
    });

    const serialized = products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price.toNumber(),
      discountedPrice: p.discountedPrice?.toNumber() ?? null,
      image: p.productVariants.find((v) => v.isDefault)?.image || p.productVariants[0]?.image || "",
    }));

    return NextResponse.json(serialized, { status: 200 });
  } catch (error) {
    console.error("[PUBLIC_SEARCH_API_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
