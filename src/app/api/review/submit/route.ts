import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, comment, ratings, productSlug, productId } = body;

    if (!name || !email || !comment || ratings === undefined || !productSlug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        name,
        email,
        comment,
        ratings: parseFloat(ratings),
        productSlug,
        productId: productId || null,
        isApproved: false, // Moderated by default
      },
    });

    return NextResponse.json({ message: "Review submitted successfully and is awaiting moderation.", review }, { status: 201 });
  } catch (error) {
    console.error("[REVIEW_SUBMIT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
