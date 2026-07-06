import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";

// TODO: Add admin authentication/authorization middleware

// GET /api/admin/categories - Get all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_CATEGORIES_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/categories - Create a category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      image,
      description,
    }: { title: string; slug: string; image?: string; description?: string } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        title,
        slug,
        image: image || null,
        description: description || null,
      },
    });

    revalidateTag("categories", "max");

    return NextResponse.json(
      { message: "Category created successfully", category },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADMIN_CATEGORIES_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
