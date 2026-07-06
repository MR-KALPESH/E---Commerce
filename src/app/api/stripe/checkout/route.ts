import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prismaDB";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customerEmail }: { items: CartItem[]; customerEmail: string } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const origin = req.nextUrl.origin;

    // Build Stripe line items (prices must be in cents)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
      let imageUrl = item.image;
      if (imageUrl && imageUrl.startsWith("/")) {
        imageUrl = `${origin}${imageUrl}`;
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            ...(imageUrl ? { images: [imageUrl] } : {}),
          },
          unit_amount: Math.round(item.price * 100), // convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Calculate total in cents for DB storage
    const totalAmount = items.reduce(
      (acc, item) => acc + Math.round(item.price * 100) * item.quantity,
      0
    );

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: customerEmail || undefined,
      success_url: process.env.NEXT_PUBLIC_SUCCESS_URL!,
      cancel_url: process.env.NEXT_PUBLIC_CANCEL_URL!,
    });

    // Save pending order to database
    await prisma.order.create({
      data: {
        stripeSessionId: session.id,
        customerEmail: customerEmail || "",
        totalAmount,
        currency: "usd",
        status: "pending",
        items: {
          create: items.map((item) => ({
            productId: item.id || null,
            name: item.name,
            price: Math.round(item.price * 100),
            quantity: item.quantity,
            image: item.image || null,
            slug: item.slug || null,
          })),
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url }, { status: 200 });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
