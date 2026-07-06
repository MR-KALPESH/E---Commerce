import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";

// GET /api/admin/blogs - Get all blogs ordered by createdAt desc
export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_BLOGS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/blogs - Create a new blog
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      image,
      author,
    }: {
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      category: string;
      image?: string;
      author?: string;
    } = body;

    if (!title || !slug || !excerpt || !content || !category) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, excerpt, content, category" },
        { status: 400 }
      );
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        category,
        image: image || null,
        author: author || "CozyCommerce Admin",
      },
    });

    // Revalidate storefront blogs cache
    revalidateTag("blogs", "max");

    return NextResponse.json(
      { message: "Blog created successfully", blog },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADMIN_BLOGS_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
