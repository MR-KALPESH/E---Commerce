"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  slug?: string | null;
}

interface Order {
  id: string;
  customerEmail: string;
  customerName?: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const statusSteps = ["pending", "paid", "shipped", "delivered"];

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: "text-yellow-600", bg: "bg-yellow-100", label: "Payment Pending" },
  paid: { color: "text-blue", bg: "bg-blue-light-5", label: "Payment Confirmed" },
  shipped: { color: "text-purple-600", bg: "bg-purple-100", label: "Shipped & In Transit" },
  delivered: { color: "text-green", bg: "bg-green-light-6", label: "Delivered Successfully" },
  failed: { color: "text-red", bg: "bg-red-light-6", label: "Payment Failed" },
  refunded: { color: "text-dark-4", bg: "bg-gray-2", label: "Refunded" },
};

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) {
      toast.error("Please enter both Order ID and Email.");
      return;
    }

    setIsLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await axios.post("/api/orders/track", {
        orderId: orderId.trim(),
        email: email.trim(),
      });
      setOrder(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Order not found.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? idx : -1;
  };

  const config = order ? statusConfig[order.status] || statusConfig.pending : null;
  const currentStep = order ? getStepIndex(order.status) : -1;

  return (
    <main className="bg-gray-1 min-h-screen py-14">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-light-5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            📦
          </div>
          <h1 className="text-2xl font-bold text-dark">Track Your Order</h1>
          <p className="text-xs text-dark-4 mt-1">
            Enter your Order ID and email address to check your delivery status.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl border border-gray-3 p-6 lg:p-8 shadow-sm mb-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-dark uppercase tracking-wider mb-1">
                  Order ID
                </label>
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. #A1B2C3D4"
                  className="w-full border border-gray-3 rounded-lg px-3 py-2.5 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-dark uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-3 rounded-lg px-3 py-2.5 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue hover:bg-blue-dark text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-60"
            >
              {isLoading ? "Searching..." : "Track Order"}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && !order && (
          <div className="bg-red-light-6 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-sm font-bold text-red mb-1">Order Not Found</p>
            <p className="text-xs text-dark-4">
              Please double-check your Order ID and email address. The Order ID is shown in your confirmation email and on the success page.
            </p>
          </div>
        )}

        {/* Order Result */}
        {order && config && (
          <div className="bg-white rounded-2xl border border-gray-3 shadow-sm overflow-hidden space-y-0">
            {/* Status Header */}
            <div className={`${config.bg} px-6 py-5 flex items-center justify-between`}>
              <div>
                <p className={`text-sm font-bold ${config.color}`}>{config.label}</p>
                <p className="text-[10px] text-dark-4 mt-0.5">
                  Order #{order.id.slice(-8).toUpperCase()} •{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span className="text-lg font-bold text-dark">
                ${(order.totalAmount / 100).toFixed(2)}
              </span>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Progress Tracker */}
              {currentStep >= 0 && (
                <div>
                  <p className="text-[10px] font-bold text-dark-4 uppercase tracking-wider mb-4">Delivery Progress</p>
                  <div className="flex items-center">
                    {statusSteps.map((step, i) => {
                      const isCompleted = i <= currentStep;
                      const isCurrent = i === currentStep;
                      return (
                        <div key={step} className="flex-1 flex flex-col items-center relative">
                          {i > 0 && (
                            <div
                              className={`absolute top-3.5 right-1/2 w-full h-0.5 -z-1 ${
                                i <= currentStep ? "bg-blue" : "bg-gray-3"
                              }`}
                            />
                          )}
                          <div
                            className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                              isCompleted
                                ? "bg-blue border-blue text-white"
                                : "bg-white border-gray-3 text-dark-4"
                            } ${isCurrent ? "ring-4 ring-blue-light-5 scale-110" : ""}`}
                          >
                            {isCompleted ? "✓" : i + 1}
                          </div>
                          <p
                            className={`text-[9px] font-bold uppercase tracking-wider mt-2 ${
                              isCompleted ? "text-blue" : "text-dark-4"
                            }`}
                          >
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-3 pt-4">
                <div>
                  <p className="text-[10px] font-bold text-dark-4 uppercase tracking-wider">Customer</p>
                  <p className="text-xs font-semibold text-dark mt-0.5">{order.customerName || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-dark-4 uppercase tracking-wider">Email</p>
                  <p className="text-xs font-semibold text-dark mt-0.5">{order.customerEmail}</p>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-gray-3 pt-4">
                <p className="text-[10px] font-bold text-dark-4 uppercase tracking-wider mb-2">Items Ordered</p>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-gray-1 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        {item.slug ? (
                          <Link href={`/products/${item.slug}`} className="text-xs font-semibold text-dark hover:text-blue transition-colors">
                            {item.name}
                          </Link>
                        ) : (
                          <span className="text-xs font-semibold text-dark">{item.name}</span>
                        )}
                        <span className="text-[10px] text-dark-4">× {item.quantity}</span>
                      </div>
                      <span className="text-xs font-bold text-dark">
                        ${((item.price * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t border-gray-3 pt-3">
                <span className="text-xs text-dark-4">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                <span className="text-sm font-bold text-dark">Total: ${(order.totalAmount / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Link */}
        <p className="text-center text-xs text-dark-4 mt-6">
          Have an account?{" "}
          <Link href="/my-orders" className="text-blue font-bold hover:underline">
            View all your orders →
          </Link>
        </p>
      </div>
    </main>
  );
}
