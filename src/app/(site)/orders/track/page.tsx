"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";

interface TrackedOrder {
  id: string;
  status: string;
  shippingStatus: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  courierName: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  totalAmount: number;
  currency: string;
  createdAt: string;
  items: { name: string; quantity: number; price: number; image: string | null }[];
}

const steps = [
  { key: "ordered", label: "Order Placed", icon: "📦" },
  { key: "shipped", label: "Shipped", icon: "🚚" },
  { key: "in_transit", label: "In Transit", icon: "✈️" },
  { key: "delivered", label: "Delivered", icon: "✅" },
];

function getStepIndex(shippingStatus: string, paymentStatus: string): number {
  if (paymentStatus === "pending") return -1;
  if (shippingStatus === "delivered") return 3;
  if (shippingStatus === "in_transit") return 2;
  if (shippingStatus === "shipped") return 1;
  return 0; // ordered / unfulfilled
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);

    if (!orderId.trim() || !email.trim()) {
      setError("Please enter both Order ID and email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.get(
        `/api/orders/track?orderId=${encodeURIComponent(orderId.trim())}&email=${encodeURIComponent(email.trim())}`
      );
      setOrder(res.data.order);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Could not find your order. Please check your details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const activeStep = order ? getStepIndex(order.shippingStatus, order.status) : -1;

  return (
    <main className="bg-gray-1 min-h-screen py-14">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-heading-4 font-bold text-dark mb-2">Track Your Order</h1>
          <p className="text-dark-4 text-sm">
            Enter your Order ID and email to see the latest shipping status.
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleTrack}
          className="bg-white rounded-2xl border border-gray-3 shadow-sm p-6 lg:p-8 space-y-5 mb-8"
        >
          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. cm5abc123xyz"
              className="w-full border border-gray-3 rounded-lg px-4 py-3 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="The email used during checkout"
              className="w-full border border-gray-3 rounded-lg px-4 py-3 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>

          {error && (
            <div className="bg-red-light-6 border border-red/20 rounded-lg px-4 py-3 text-xs text-red font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue hover:bg-blue-dark text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-60"
          >
            {isLoading ? "Searching..." : "Track Order"}
          </button>
        </form>

        {/* Results */}
        {order && (
          <div className="bg-white rounded-2xl border border-gray-3 shadow-sm overflow-hidden">
            {/* Order Info Header */}
            <div className="p-6 lg:p-8 border-b border-gray-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-dark-4 font-semibold uppercase tracking-wider mb-1">
                    Order
                  </p>
                  <p className="font-mono text-sm font-bold text-dark">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-dark-4 font-semibold uppercase tracking-wider mb-1">
                    Placed On
                  </p>
                  <p className="text-sm font-semibold text-dark">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between relative">
                  {/* Connecting line */}
                  <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-3 z-0" />
                  <div
                    className="absolute top-5 left-8 h-0.5 bg-blue z-10 transition-all duration-500"
                    style={{
                      width:
                        activeStep <= 0
                          ? "0%"
                          : `${(activeStep / (steps.length - 1)) * 100}%`,
                      maxWidth: "calc(100% - 64px)",
                    }}
                  />

                  {steps.map((step, i) => (
                    <div key={step.key} className="flex flex-col items-center z-20 relative">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-300 ${
                          i <= activeStep
                            ? "bg-blue border-blue text-white shadow-md"
                            : "bg-white border-gray-3 text-dark-4"
                        }`}
                      >
                        {step.icon}
                      </div>
                      <span
                        className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${
                          i <= activeStep ? "text-blue" : "text-dark-4"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tracking Details */}
            <div className="p-6 lg:p-8 space-y-4">
              <h3 className="text-xs font-bold text-dark uppercase tracking-wider mb-3">
                Shipping Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-1 rounded-xl p-4 border border-gray-3">
                  <p className="text-[10px] text-dark-4 font-semibold uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <p className="text-sm font-bold text-dark capitalize">
                    {order.shippingStatus.replace("_", " ")}
                  </p>
                </div>

                <div className="bg-gray-1 rounded-xl p-4 border border-gray-3">
                  <p className="text-[10px] text-dark-4 font-semibold uppercase tracking-wider mb-1">
                    Courier
                  </p>
                  <p className="text-sm font-bold text-dark">
                    {order.courierName || "Not assigned yet"}
                  </p>
                </div>

                <div className="bg-gray-1 rounded-xl p-4 border border-gray-3">
                  <p className="text-[10px] text-dark-4 font-semibold uppercase tracking-wider mb-1">
                    Tracking Number
                  </p>
                  <p className="text-sm font-bold text-dark font-mono">
                    {order.trackingNumber || "Pending"}
                  </p>
                </div>

                <div className="bg-gray-1 rounded-xl p-4 border border-gray-3">
                  <p className="text-[10px] text-dark-4 font-semibold uppercase tracking-wider mb-1">
                    Shipped On
                  </p>
                  <p className="text-sm font-bold text-dark">
                    {order.shippedAt
                      ? new Date(order.shippedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not shipped yet"}
                  </p>
                </div>
              </div>

              {/* Track on courier website */}
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue hover:bg-blue-dark text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors shadow-sm mt-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Track on Courier Website
                </a>
              )}

              {/* Items */}
              <div className="border-t border-gray-3 pt-4 mt-4">
                <h3 className="text-xs font-bold text-dark uppercase tracking-wider mb-3">
                  Order Items
                </h3>
                <div className="divide-y divide-gray-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="py-3 flex justify-between text-sm">
                      <div>
                        <span className="font-semibold text-dark">{item.name}</span>
                        <span className="text-dark-4 ml-2">× {item.quantity}</span>
                      </div>
                      <span className="font-bold text-dark">
                        ${((item.price * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-3 text-sm font-bold">
                  <span className="text-dark">Total</span>
                  <span className="text-blue text-base">
                    ${(order.totalAmount / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-xs font-semibold text-dark-4 hover:text-blue transition-colors"
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    </main>
  );
}
