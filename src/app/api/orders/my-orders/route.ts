import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prismaDB";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.email) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { customerEmail: token.email },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("[MY_ORDERS_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
