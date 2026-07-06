/**
 * Shopify Admin API Client
 *
 * Provides functions to create orders, fetch fulfillments, and get tracking info
 * from the connected Shopify store for shipping & delivery tracking.
 */

const SHOPIFY_SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN || "";
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || "";
const API_VERSION = "2024-01"; // Stable Shopify API version

function getBaseUrl() {
  return `https://${SHOPIFY_SHOP_DOMAIN}/admin/api/${API_VERSION}`;
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
  };
}

/**
 * Check if Shopify credentials are configured
 */
export function isShopifyConfigured(): boolean {
  return (
    !!SHOPIFY_SHOP_DOMAIN &&
    SHOPIFY_SHOP_DOMAIN !== "your-store.myshopify.com" &&
    !!SHOPIFY_ACCESS_TOKEN &&
    SHOPIFY_ACCESS_TOKEN !== "shpat_xxxxxxxxxx"
  );
}

/**
 * Create a draft order in Shopify from a CozyCommerce order
 */
export async function createShopifyOrder(orderData: {
  customerEmail: string;
  customerName?: string | null;
  shippingAddress?: string | null;
  items: {
    name: string;
    price: number; // in cents
    quantity: number;
  }[];
  currency?: string;
}) {
  const lineItems = orderData.items.map((item) => ({
    title: item.name,
    quantity: item.quantity,
    price: (item.price / 100).toFixed(2), // Convert cents to dollars/rupees
  }));

  // Parse shipping address if available (best-effort single-line to structured)
  const shippingAddr = orderData.shippingAddress
    ? parseAddress(orderData.shippingAddress, orderData.customerName)
    : undefined;

  const payload: any = {
    order: {
      email: orderData.customerEmail,
      line_items: lineItems,
      financial_status: "paid",
      send_receipt: false,
      send_fulfillment_receipt: false,
      tags: "cozycommerce",
      note: "Synced from CozyCommerce",
    },
  };

  if (shippingAddr) {
    payload.order.shipping_address = shippingAddr;
  }

  const response = await fetch(`${getBaseUrl()}/orders.json`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[SHOPIFY_CREATE_ORDER_ERROR]", response.status, errorText);
    throw new Error(`Shopify API error: ${response.status} — ${errorText}`);
  }

  const data = await response.json();
  return {
    shopifyOrderId: String(data.order.id),
    shopifyOrderNumber: data.order.order_number,
    shopifyAdminUrl: `https://${SHOPIFY_SHOP_DOMAIN}/admin/orders/${data.order.id}`,
  };
}

/**
 * Get fulfillment & tracking info for a Shopify order
 */
export async function getShopifyFulfillments(shopifyOrderId: string) {
  const response = await fetch(
    `${getBaseUrl()}/orders/${shopifyOrderId}/fulfillments.json`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[SHOPIFY_FULFILLMENTS_ERROR]", response.status, errorText);
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const data = await response.json();
  const fulfillments = data.fulfillments || [];

  if (fulfillments.length === 0) {
    return {
      status: "unfulfilled",
      trackingNumber: null,
      trackingUrl: null,
      courierName: null,
    };
  }

  // Use the latest fulfillment
  const latest = fulfillments[fulfillments.length - 1];

  return {
    status: mapShopifyFulfillmentStatus(latest.status),
    trackingNumber: latest.tracking_number || null,
    trackingUrl: latest.tracking_url || (latest.tracking_urls?.[0] ?? null),
    courierName: latest.tracking_company || null,
    shippedAt: latest.created_at || null,
    deliveredAt:
      latest.status === "success" ? latest.updated_at : null,
  };
}

/**
 * Get the order status from Shopify (fulfillment_status field)
 */
export async function getShopifyOrderStatus(shopifyOrderId: string) {
  const response = await fetch(
    `${getBaseUrl()}/orders/${shopifyOrderId}.json?fields=id,fulfillment_status,fulfillments`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const data = await response.json();
  return data.order;
}

/**
 * Map Shopify fulfillment status to our internal status
 */
function mapShopifyFulfillmentStatus(status: string | null): string {
  switch (status) {
    case "success":
      return "delivered";
    case "in_transit":
      return "in_transit";
    case "open":
    case "pending":
      return "shipped";
    case "failure":
    case "error":
      return "shipped"; // Still shipped, just delivery issue
    default:
      return "shipped";
  }
}

/**
 * Best-effort parse a single-line address string into Shopify's structured format
 */
function parseAddress(
  addressStr: string,
  customerName?: string | null
) {
  // Try to split by commas or newlines
  const parts = addressStr
    .split(/[,\n]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const nameParts = (customerName || "Customer").split(" ");

  return {
    first_name: nameParts[0] || "Customer",
    last_name: nameParts.slice(1).join(" ") || "",
    address1: parts[0] || addressStr,
    address2: parts[1] || "",
    city: parts[2] || "Unknown",
    province: parts[3] || "",
    zip: parts[4] || "000000",
    country: parts[5] || "IN",
  };
}
