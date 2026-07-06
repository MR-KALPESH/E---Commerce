import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slider = await prisma.heroSlider.findUnique({
      where: { id: parseInt(id, 10) },
      include: { product: true }
    });

    if (!slider) {
      return NextResponse.json({ error: "Hero slider not found" }, { status: 404 });
    }

    return NextResponse.json({
      heroSlider: {
        ...slider,
        product: {
          ...slider.product,
          price: slider.product.price.toNumber(),
          discountedPrice: slider.product.discountedPrice?.toNumber() ?? null,
        }
      }
    }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_HERO_SLIDER_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      sliderName,
      sliderImage,
      discountRate,
      slug,
      productId,
    }: {
      sliderName?: string;
      sliderImage?: string;
      discountRate?: number;
      slug?: string;
      productId?: string;
    } = body;

    const slider = await prisma.heroSlider.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(sliderName !== undefined && { sliderName }),
        ...(sliderImage !== undefined && { sliderImage }),
        ...(discountRate !== undefined && { discountRate }),
        ...(slug !== undefined && { slug }),
        ...(productId !== undefined && { productId }),
      },
      include: { product: true }
    });

    // Bust the hero sliders cache so changes appear on the homepage immediately
    revalidateTag("heroSliders", "max");

    return NextResponse.json({
      message: "Hero slider updated successfully",
      heroSlider: {
        ...slider,
        product: {
          ...slider.product,
          price: slider.product.price.toNumber(),
          discountedPrice: slider.product.discountedPrice?.toNumber() ?? null,
        }
      }
    }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_HERO_SLIDER_PUT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.heroSlider.delete({
      where: { id: parseInt(id, 10) }
    });

    // Bust the hero sliders cache so changes appear on the homepage immediately
    revalidateTag("heroSliders", "max");

    return NextResponse.json({ message: "Hero slider deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_HERO_SLIDER_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
