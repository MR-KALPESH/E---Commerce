"use client";

import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function SuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Clear the cart on successful payment completion
    clearCart();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-3 shadow-3 p-10 max-w-md mx-auto text-center flex flex-col items-center gap-6 relative">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-success-50 rounded-full flex items-center justify-center text-green animate-bounce">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h1 className="text-heading-5 font-bold text-dark mb-2">Order Confirmed!</h1>
        <p className="text-dark-3 text-custom-sm leading-relaxed">
          Thank you for shopping with CozyCommerce! Your order has been placed and is being processed.
        </p>
      </div>

      {sessionId && (
        <div className="w-full bg-gray-1 border border-gray-3 rounded-xl p-4 text-xs font-mono text-dark-4 break-all">
          <span className="block text-[10px] font-semibold text-dark-3 uppercase tracking-wider mb-1 font-body">
            Stripe Session Reference
          </span>
          {sessionId}
        </div>
      )}

      <div className="w-full h-px bg-gray-3" />

      <Link
        href="/products"
        className="w-full bg-blue hover:bg-blue-dark text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-sm"
      >
        Continue Shopping
      </Link>

      <div className="flex items-center gap-3 text-xs">
        <Link href="/my-orders" className="text-blue font-bold hover:underline">
          View My Orders
        </Link>
        <span className="text-dark-4">•</span>
        <Link href="/order-tracking" className="text-blue font-bold hover:underline">
          Track an Order
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="bg-gray-1 min-h-screen py-20 px-4 flex items-center justify-center">
      <Suspense fallback={<div className="text-dark-4 text-sm font-semibold">Loading confirmation details...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
