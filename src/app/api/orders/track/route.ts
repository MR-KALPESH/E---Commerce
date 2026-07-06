import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

/**
 * GET /api/orders/track?orderId=xxx&email=xxx
 * Public endpoint for customers to track their order
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const email = searchParams.get("email");

    if (!orderId || !email) {
      return NextResponse.json(
        { error: "Both orderId and email are required." },
        { status: 400 }
      );
    }

    // Find order by ID and verify email matches (security)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found. Please check your Order ID." },
        { status: 404 }
      );
    }

    // Verify email matches
    if (order.customerEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "Email does not match this order." },
        { status: 403 }
      );
    }

    // Return safe tracking info (no internal IDs or Shopify details)
    return NextResponse.json(
      {
        order: {
          id: order.id,
          status: order.status,
          shippingStatus: order.shippingStatus,
          trackingNumber: order.trackingNumber,
          trackingUrl: order.trackingUrl,
          courierName: order.courierName,
          shippedAt: order.shippedAt,
          deliveredAt: order.deliveredAt,
          totalAmount: order.totalAmount,
          currency: order.currency,
          createdAt: order.createdAt,
          items: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ORDER_TRACK_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
