import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_ORDER_GET_ERROR]", error);
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
      status,
      trackingNumber,
      trackingUrl,
      courierName,
      shippingStatus,
    }: {
      status?: string;
      trackingNumber?: string;
      trackingUrl?: string;
      courierName?: string;
      shippingStatus?: string;
    } = body;

    const updateData: any = {};

    if (status !== undefined) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) updateData.trackingUrl = trackingUrl;
    if (courierName !== undefined) updateData.courierName = courierName;
    if (shippingStatus !== undefined) {
      updateData.shippingStatus = shippingStatus;
      if (shippingStatus === "shipped" && !updateData.shippedAt) {
        updateData.shippedAt = new Date();
      }
      if (shippingStatus === "delivered") {
        updateData.deliveredAt = new Date();
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    return NextResponse.json({ message: "Order updated successfully", order }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_ORDER_PUT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
