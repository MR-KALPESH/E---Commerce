import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

export async function GET() {
  try {
    const countdowns = await prisma.countdown.findMany({
      include: { product: true },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ countdowns }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_COUNTDOWN_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subtitle, image, date, productId } = body;

    if (!title || !date || !productId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const countdown = await prisma.countdown.create({
      data: {
        title,
        subtitle: subtitle || null,
        image: image || null,
        date: new Date(date),
        productId,
      },
      include: { product: true },
    });

    return NextResponse.json({ message: "Countdown created successfully", countdown }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_COUNTDOWN_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
