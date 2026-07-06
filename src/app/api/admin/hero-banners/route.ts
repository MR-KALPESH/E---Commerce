import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

// TODO: Add admin authentication/authorization middleware

// GET /api/admin/hero-banners - Get all hero banners
export async function GET() {
  try {
    const heroBanners = await prisma.heroBanner.findMany({
      include: {
        product: {
          select: {
            price: true,
            discountedPrice: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Serialize Decimal fields
    const serialized = heroBanners.map((b) => ({
      ...b,
      product: {
        ...b.product,
        price: b.product.price.toNumber(),
        discountedPrice: b.product.discountedPrice?.toNumber() ?? null,
      },
    }));

    return NextResponse.json({ heroBanners: serialized }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_HERO_BANNERS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/hero-banners - Create a hero banner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bannerName,
      bannerImage,
      slug,
      productId,
    }: { bannerName?: string; bannerImage: string; slug: string; productId: string } = body;

    if (!bannerImage || !slug || !productId) {
      return NextResponse.json(
        { error: "Missing required fields: bannerImage, slug, productId" },
        { status: 400 }
      );
    }

    const heroBanner = await prisma.heroBanner.create({
      data: {
        bannerName: bannerName || null,
        bannerImage,
        slug,
        productId,
      },
      include: {
        product: {
          select: { price: true, discountedPrice: true, title: true, slug: true },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Hero banner created successfully",
        heroBanner: {
          ...heroBanner,
          product: {
            ...heroBanner.product,
            price: heroBanner.product.price.toNumber(),
            discountedPrice: heroBanner.product.discountedPrice?.toNumber() ?? null,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADMIN_HERO_BANNERS_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
