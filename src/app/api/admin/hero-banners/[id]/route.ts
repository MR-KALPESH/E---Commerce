import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

// TODO: Add admin authentication/authorization middleware

// GET /api/admin/hero-banners/[id] - Get single hero banner
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const heroBanner = await prisma.heroBanner.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        product: {
          select: { price: true, discountedPrice: true, title: true, slug: true },
        },
      },
    });

    if (!heroBanner) {
      return NextResponse.json({ error: "Hero banner not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        heroBanner: {
          ...heroBanner,
          product: {
            ...heroBanner.product,
            price: heroBanner.product.price.toNumber(),
            discountedPrice: heroBanner.product.discountedPrice?.toNumber() ?? null,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_HERO_BANNER_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/admin/hero-banners/[id] - Update hero banner
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      bannerName,
      bannerImage,
      slug,
      productId,
    }: { bannerName?: string; bannerImage?: string; slug?: string; productId?: string } = body;

    const heroBanner = await prisma.heroBanner.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(bannerName !== undefined && { bannerName }),
        ...(bannerImage !== undefined && { bannerImage }),
        ...(slug !== undefined && { slug }),
        ...(productId !== undefined && { productId }),
      },
    });

    return NextResponse.json(
      { message: "Hero banner updated successfully", heroBanner },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_HERO_BANNER_PUT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/hero-banners/[id] - Delete hero banner
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.heroBanner.delete({ where: { id: parseInt(id, 10) } });

    return NextResponse.json({ message: "Hero banner deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_HERO_BANNER_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
