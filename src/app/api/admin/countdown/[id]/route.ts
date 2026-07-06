import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const countdown = await prisma.countdown.findUnique({
      where: { id: parseInt(id, 10) },
      include: { product: true },
    });

    if (!countdown) {
      return NextResponse.json({ error: "Countdown not found" }, { status: 404 });
    }

    return NextResponse.json({ countdown }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_COUNTDOWN_GET_ERROR]", error);
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
    const { title, subtitle, image, date, productId } = body;

    const countdown = await prisma.countdown.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(image !== undefined && { image }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(productId !== undefined && { productId }),
      },
      include: { product: true },
    });

    return NextResponse.json({ message: "Countdown updated successfully", countdown }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_COUNTDOWN_PUT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.countdown.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ message: "Countdown deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_COUNTDOWN_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
