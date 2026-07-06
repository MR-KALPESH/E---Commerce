import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prismaDB";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Note: For Next.js App Router, raw body is obtained via req.text()
// The equivalent of `export const config = { api: { bodyParser: false } }` is not needed here
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_SIGNATURE_ERROR]", error);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Update order status to 'paid' using stripeSessionId
      const updatedOrder = await prisma.order.update({
        where: { stripeSessionId: session.id },
        data: {
          status: "paid",
          customerName: session.customer_details?.name || null,
          shippingAddress: session.customer_details?.address
            ? JSON.stringify(session.customer_details.address)
            : null,
        },
        include: { items: true },
      });

      console.log(`[STRIPE_WEBHOOK] Order updated to paid for session: ${session.id}`);

      // Send transactional confirmation emails via Resend HTTP REST API
      try {
        const itemsHtml = updatedOrder.items
          .map(
            (item) =>
              `<li>${item.name} x ${item.quantity} - $${((item.price * item.quantity) / 100).toFixed(2)}</li>`
          )
          .join("");

        const customerHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #3c50e0; margin-bottom: 20px;">Order Confirmed!</h2>
            <p>Hello ${updatedOrder.customerName || "Customer"},</p>
            <p>Thank you for shopping with CozyCommerce. Your payment was processed successfully and your order is now being prepared for shipping.</p>
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Order Reference:</strong> #${updatedOrder.id.slice(-8).toUpperCase()}</p>
              <p style="margin: 0 0 8px 0;"><strong>Total Paid:</strong> $${(updatedOrder.totalAmount / 100).toFixed(2)}</p>
              <p style="margin: 0;"><strong>Status:</strong> Paid</p>
            </div>
            <h3 style="border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-top: 24px;">Items Summary</h3>
            <ul style="padding-left: 20px; margin: 12px 0;">${itemsHtml}</ul>
            <p style="margin-top: 30px; font-size: 11px; color: #8d93a5; text-align: center; border-t: 1px solid #e5e7eb; padding-top: 15px;">
              © 2026 CozyCommerce. All rights reserved.
            </p>
          </div>
        `;

        const adminHtml = `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1c274c;">New Store Order Alert! 📦</h2>
            <p>A new order has been paid and completed on the store layout.</p>
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Order Reference:</strong> #${updatedOrder.id.slice(-8).toUpperCase()}</p>
              <p style="margin: 0 0 8px 0;"><strong>Customer Name:</strong> ${updatedOrder.customerName || "N/A"}</p>
              <p style="margin: 0 0 8px 0;"><strong>Customer Email:</strong> ${updatedOrder.customerEmail}</p>
              <p style="margin: 0;"><strong>Total Paid:</strong> $${(updatedOrder.totalAmount / 100).toFixed(2)}</p>
            </div>
            <h3 style="border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Order Line Items</h3>
            <ul style="padding-left: 20px;">${itemsHtml}</ul>
          </div>
        `;

        // Send to Customer
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: "Bearer re_WeBTCzuN_MDaYPtM2w1B6yunyeNq4DDmz",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "CozyCommerce <onboarding@resend.dev>",
            to: updatedOrder.customerEmail,
            subject: `Order Confirmation #${updatedOrder.id.slice(-8).toUpperCase()}`,
            html: customerHtml,
          }),
        });

        // Send to Admin
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: "Bearer re_WeBTCzuN_MDaYPtM2w1B6yunyeNq4DDmz",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "CozyCommerce Admin <onboarding@resend.dev>",
            to: "kalpeshkatariya.app@gmail.com",
            subject: `New CozyCommerce Order #${updatedOrder.id.slice(-8).toUpperCase()}`,
            html: adminHtml,
          }),
        });

        console.log(`[STRIPE_WEBHOOK] Confirmation emails dispatched successfully via Resend.`);
      } catch (emailError) {
        console.error("[STRIPE_WEBHOOK_EMAIL_ERROR]", emailError);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
