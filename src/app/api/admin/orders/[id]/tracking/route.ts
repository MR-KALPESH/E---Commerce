import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { getShopifyFulfillments, isShopifyConfigured } from "@/lib/shopify";

/**
 * GET /api/admin/orders/[id]/tracking
 * Fetch latest tracking info from Shopify for a given order
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If no Shopify order ID, return local tracking data
    if (!order.shopifyOrderId) {
      return NextResponse.json(
        {
          tracking: {
            trackingNumber: order.trackingNumber,
            trackingUrl: order.trackingUrl,
            courierName: order.courierName,
            shippingStatus: order.shippingStatus,
            shippedAt: order.shippedAt,
            deliveredAt: order.deliveredAt,
            source: "manual",
          },
        },
        { status: 200 }
      );
    }

    // Fetch from Shopify if configured
    if (!isShopifyConfigured()) {
      return NextResponse.json(
        {
          tracking: {
            trackingNumber: order.trackingNumber,
            trackingUrl: order.trackingUrl,
            courierName: order.courierName,
            shippingStatus: order.shippingStatus,
            shippedAt: order.shippedAt,
            deliveredAt: order.deliveredAt,
            source: "local",
          },
        },
        { status: 200 }
      );
    }

    // Get tracking data from Shopify
    const fulfillment = await getShopifyFulfillments(order.shopifyOrderId);

    // Update our local DB with the latest from Shopify
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        trackingNumber: fulfillment.trackingNumber || order.trackingNumber,
        trackingUrl: fulfillment.trackingUrl || order.trackingUrl,
        courierName: fulfillment.courierName || order.courierName,
        shippingStatus: fulfillment.status,
        shippedAt: fulfillment.shippedAt
          ? new Date(fulfillment.shippedAt)
          : order.shippedAt,
        deliveredAt: fulfillment.deliveredAt
          ? new Date(fulfillment.deliveredAt)
          : order.deliveredAt,
      },
    });

    return NextResponse.json(
      {
        tracking: {
          trackingNumber: updatedOrder.trackingNumber,
          trackingUrl: updatedOrder.trackingUrl,
          courierName: updatedOrder.courierName,
          shippingStatus: updatedOrder.shippingStatus,
          shippedAt: updatedOrder.shippedAt,
          deliveredAt: updatedOrder.deliveredAt,
          source: "shopify",
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[TRACKING_FETCH_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tracking info" },
      { status: 500 }
    );
  }
}
