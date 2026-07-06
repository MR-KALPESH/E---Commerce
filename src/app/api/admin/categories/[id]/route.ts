import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";

// TODO: Add admin authentication/authorization middleware

// GET /api/admin/categories/[id] - Get single category
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_CATEGORY_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/admin/categories/[id] - Update category
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
      image,
      description,
    }: { title?: string; slug?: string; image?: string; description?: string } = body;

    const category = await prisma.category.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(image !== undefined && { image }),
        ...(description !== undefined && { description }),
      },
    });

    revalidateTag("categories", "max");

    return NextResponse.json(
      { message: "Category updated successfully", category },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_CATEGORY_PUT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.category.delete({ where: { id: parseInt(id, 10) } });

    revalidateTag("categories", "max");

    return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_CATEGORY_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
