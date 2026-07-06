"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  slug?: string | null;
}

interface Order {
  id: string;
  stripeSessionId: string;
  customerEmail: string;
  customerName?: string | null;
  totalAmount: number;
  currency: string;
  status: string;
  shippingAddress?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const statusSteps = ["pending", "paid", "shipped", "delivered"];

const statusConfig: Record<string, { color: string; bg: string; icon: string }> = {
  pending: { color: "text-yellow-600", bg: "bg-yellow-100", icon: "⏳" },
  paid: { color: "text-blue", bg: "bg-blue-light-5", icon: "💳" },
  shipped: { color: "text-purple-600", bg: "bg-purple-100", icon: "🚚" },
  delivered: { color: "text-green", bg: "bg-green-light-6", icon: "✅" },
  failed: { color: "text-red", bg: "bg-red-light-6", icon: "❌" },
  refunded: { color: "text-dark-4", bg: "bg-gray-2", icon: "↩️" },
};

export default function MyOrdersPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (authStatus === "authenticated") {
      fetchOrders();
    }
  }, [authStatus]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/orders/my-orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? idx : -1;
  };

  if (authStatus === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gray-1 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="bg-gray-1 min-h-screen py-14">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8 border-b border-gray-3 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-dark">My Orders</h1>
            <p className="text-xs text-dark-4 mt-1">View your purchase history and track delivery status.</p>
          </div>
          <Link
            href="/order-tracking"
            className="text-xs font-bold text-blue hover:underline"
          >
            Track by Order ID →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-3 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-light-5 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📦
            </div>
            <h2 className="text-base font-bold text-dark mb-1">No orders yet</h2>
            <p className="text-xs text-dark-4 mb-5">When you place your first order, it will appear here.</p>
            <Link
              href="/shop-with-sidebar"
              className="bg-blue hover:bg-blue-dark text-white font-bold py-2.5 px-6 rounded-lg text-xs transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const currentStep = getStepIndex(order.status);
              const isExpanded = expandedId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-3 shadow-sm overflow-hidden transition-all"
                >
                  {/* Order Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-1 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center text-lg`}>
                        {config.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-dark">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-[10px] text-dark-4 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.color}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-bold text-dark">
                        ${(order.totalAmount / 100).toFixed(2)}
                      </span>
                      <svg
                        className={`w-4 h-4 text-dark-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-3 px-6 py-5 space-y-5">
                      {/* Progress Tracker */}
                      {currentStep >= 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-dark-4 uppercase tracking-wider mb-3">Delivery Progress</p>
                          <div className="flex items-center gap-0">
                            {statusSteps.map((step, i) => {
                              const isCompleted = i <= currentStep;
                              const isCurrent = i === currentStep;
                              return (
                                <div key={step} className="flex-1 flex flex-col items-center relative">
                                  {/* Connector line */}
                                  {i > 0 && (
                                    <div
                                      className={`absolute top-3 right-1/2 w-full h-0.5 -z-1 ${
                                        i <= currentStep ? "bg-blue" : "bg-gray-3"
                                      }`}
                                    />
                                  )}
                                  {/* Circle */}
                                  <div
                                    className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                                      isCompleted
                                        ? "bg-blue border-blue text-white"
                                        : "bg-white border-gray-3 text-dark-4"
                                    } ${isCurrent ? "ring-4 ring-blue-light-5" : ""}`}
                                  >
                                    {isCompleted ? "✓" : i + 1}
                                  </div>
                                  {/* Label */}
                                  <p
                                    className={`text-[9px] font-bold uppercase tracking-wider mt-1.5 ${
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

                      {/* Line Items */}
                      <div>
                        <p className="text-[10px] font-bold text-dark-4 uppercase tracking-wider mb-2">Items Ordered</p>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between bg-gray-1 rounded-xl px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
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

                      {/* Summary */}
                      <div className="flex items-center justify-between border-t border-gray-3 pt-3">
                        <span className="text-xs text-dark-4">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                        <span className="text-sm font-bold text-dark">Total: ${(order.totalAmount / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
