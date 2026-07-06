import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { createShopifyOrder, isShopifyConfigured } from "@/lib/shopify";

/**
 * POST /api/admin/orders/[id]/ship
 * Push an order to Shopify for fulfillment
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check Shopify credentials
    if (!isShopifyConfigured()) {
      return NextResponse.json(
        {
          error:
            "Shopify is not configured. Please add SHOPIFY_SHOP_DOMAIN and SHOPIFY_ACCESS_TOKEN to your .env file.",
        },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Prevent duplicate shipping
    if (order.shopifyOrderId) {
      return NextResponse.json(
        {
          error: "This order has already been synced to Shopify.",
          shopifyOrderId: order.shopifyOrderId,
        },
        { status: 409 }
      );
    }

    // Ensure order is paid before shipping
    if (order.status !== "paid") {
      return NextResponse.json(
        { error: "Only paid orders can be shipped." },
        { status: 400 }
      );
    }

    // Push to Shopify
    const shopifyResult = await createShopifyOrder({
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      shippingAddress: order.shippingAddress,
      items: order.items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      currency: order.currency,
    });

    // Update our order with the Shopify order ID
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        shopifyOrderId: shopifyResult.shopifyOrderId,
        shippingStatus: "shipped",
        shippedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Order synced to Shopify successfully!",
        shopifyOrderId: shopifyResult.shopifyOrderId,
        shopifyAdminUrl: shopifyResult.shopifyAdminUrl,
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[SHIP_ORDER_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync order to Shopify" },
      { status: 500 }
    );
  }
}
