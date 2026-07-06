import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";

// TODO: Add admin authentication/authorization middleware

// GET /api/admin/hero-sliders - Get all hero sliders
export async function GET() {
  try {
    const heroSliders = await prisma.heroSlider.findMany({
      include: {
        product: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    // Serialize Decimal fields
    const serialized = heroSliders.map((s) => ({
      ...s,
      product: {
        ...s.product,
        price: s.product.price.toNumber(),
        discountedPrice: s.product.discountedPrice?.toNumber() ?? null,
      },
    }));

    return NextResponse.json({ heroSliders: serialized }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_HERO_SLIDERS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/hero-sliders - Create a hero slider
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sliderName,
      sliderImage,
      discountRate,
      slug,
      productId,
    }: {
      sliderName: string;
      sliderImage: string;
      discountRate?: number;
      slug: string;
      productId: string;
    } = body;

    if (!sliderName || !sliderImage || !slug || !productId) {
      return NextResponse.json(
        { error: "Missing required fields: sliderName, sliderImage, slug, productId" },
        { status: 400 }
      );
    }

    const heroSlider = await prisma.heroSlider.create({
      data: {
        sliderName,
        sliderImage,
        discountRate: discountRate ?? 0,
        slug,
        productId,
      },
      include: { product: true },
    });

    // Bust the hero sliders cache so changes appear on the homepage immediately
    revalidateTag("heroSliders", "max");

    return NextResponse.json(
      {
        message: "Hero slider created successfully",
        heroSlider: {
          ...heroSlider,
          product: {
            ...heroSlider.product,
            price: heroSlider.product.price.toNumber(),
            discountedPrice: heroSlider.product.discountedPrice?.toNumber() ?? null,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADMIN_HERO_SLIDERS_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
