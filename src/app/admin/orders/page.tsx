"use client";

import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  slug?: string | null;
}

interface Order {
  id: string;
  stripeSessionId: string;
  customerEmail: string;
  customerName?: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  // Shipping fields
  shopifyOrderId?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  courierName?: string | null;
  shippingStatus: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-blue-100 text-blue-800",
};

const shippingStatusColors: Record<string, string> = {
  unfulfilled: "bg-gray-2 text-dark-4",
  shipped: "bg-blue-light-5 text-blue",
  in_transit: "bg-yellow-100 text-yellow-800",
  delivered: "bg-green-100 text-green-800",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/admin/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const statusToast = toast.loading("Updating order status...");
    try {
      await axios.put(`/api/admin/orders/${id}`, { status: newStatus });
      toast.success("Order status updated!", { id: statusToast });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status", { id: statusToast });
    }
  };

  const handleShipViaShopify = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Ship via Shopify?",
      text: "This will create an order in your Shopify store for fulfillment.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3c50e0",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, ship it!",
    });

    if (!confirm.isConfirmed) return;

    setShippingOrderId(id);
    try {
      const res = await axios.post(`/api/admin/orders/${id}/ship`);
      toast.success(res.data.message || "Order synced to Shopify!");
      fetchOrders();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to ship order");
    } finally {
      setShippingOrderId(null);
    }
  };

  const handleManualTracking = async (id: string) => {
    const { value: formValues } = await Swal.fire({
      title: "Enter Tracking Details",
      html: `
        <div style="text-align:left; font-size:13px;">
          <label style="display:block; margin-bottom:4px; font-weight:600;">Courier Name</label>
          <input id="swal-courier" class="swal2-input" placeholder="e.g. Delhivery, BlueDart" style="margin-bottom:12px; width:100%;">
          <label style="display:block; margin-bottom:4px; font-weight:600;">Tracking Number (AWB)</label>
          <input id="swal-tracking" class="swal2-input" placeholder="e.g. 1234567890" style="margin-bottom:12px; width:100%;">
          <label style="display:block; margin-bottom:4px; font-weight:600;">Tracking URL (optional)</label>
          <input id="swal-url" class="swal2-input" placeholder="https://..." style="width:100%;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: "#3c50e0",
      confirmButtonText: "Save Tracking",
      preConfirm: () => {
        return {
          courierName: (document.getElementById("swal-courier") as HTMLInputElement)?.value,
          trackingNumber: (document.getElementById("swal-tracking") as HTMLInputElement)?.value,
          trackingUrl: (document.getElementById("swal-url") as HTMLInputElement)?.value,
        };
      },
    });

    if (!formValues) return;

    try {
      await axios.put(`/api/admin/orders/${id}`, {
        ...formValues,
        shippingStatus: "shipped",
      });
      toast.success("Tracking details saved!");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save tracking details");
    }
  };

  const handleRefreshTracking = async (id: string) => {
    const refreshToast = toast.loading("Fetching tracking info from Shopify...");
    try {
      const res = await axios.get(`/api/admin/orders/${id}/tracking`);
      const t = res.data.tracking;
      toast.success(`Status: ${t.shippingStatus} | Courier: ${t.courierName || "N/A"}`, {
        id: refreshToast,
        duration: 4000,
      });
      fetchOrders();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to fetch tracking", {
        id: refreshToast,
      });
    }
  };

  const handleShippingStatusChange = async (id: string, newStatus: string) => {
    try {
      await axios.put(`/api/admin/orders/${id}`, { shippingStatus: newStatus });
      toast.success("Shipping status updated!");
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, shippingStatus: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update shipping status");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Orders</h1>
          <p className="text-dark-4 text-sm mt-1">
            Track, manage, and ship customer orders.
          </p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-3 shadow-1 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-dark-4">
            <svg
              className="animate-spin w-8 h-8 text-blue mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth={4}
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Loading orders...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-3 bg-gray-1 text-xs font-semibold text-dark-4 uppercase tracking-wider">
                  <th className="px-4 py-4"></th>
                  <th className="px-4 py-4">Order</th>
                  <th className="px-4 py-4">Customer</th>
                  <th className="px-4 py-4">Total</th>
                  <th className="px-4 py-4">Payment</th>
                  <th className="px-4 py-4">Shipping</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-dark-4">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const isExpanded = expandedId === order.id;
                    return (
                      <Fragment key={order.id}>
                        <tr className="hover:bg-gray-1 transition-colors text-dark-2">
                          <td className="px-3 py-4 text-center">
                            <button
                              onClick={() => toggleExpand(order.id)}
                              className="text-dark-4 hover:text-dark p-1"
                            >
                              {isExpanded ? "▼" : "▶"}
                            </button>
                          </td>
                          <td className="px-4 py-4 font-mono text-xs font-semibold text-dark">
                            #{order.id.slice(-8).toUpperCase()}
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-semibold text-dark block text-xs">
                              {order.customerName || "No Name"}
                            </span>
                            <span className="text-[10px] text-dark-4">
                              {order.customerEmail}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-bold text-dark text-xs">
                            ${(order.totalAmount / 100).toFixed(2)}
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value)
                              }
                              className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold capitalize border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue ${
                                statusColors[order.status] || "bg-gray-2 text-dark-4"
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="failed">Failed</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={order.shippingStatus}
                              onChange={(e) =>
                                handleShippingStatusChange(order.id, e.target.value)
                              }
                              className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold capitalize border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue ${
                                shippingStatusColors[order.shippingStatus] ||
                                "bg-gray-2 text-dark-4"
                              }`}
                            >
                              <option value="unfulfilled">Unfulfilled</option>
                              <option value="shipped">Shipped</option>
                              <option value="in_transit">In Transit</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 text-dark-4 text-xs">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Ship via Shopify button */}
                              {order.status === "paid" && !order.shopifyOrderId && (
                                <button
                                  onClick={() => handleShipViaShopify(order.id)}
                                  disabled={shippingOrderId === order.id}
                                  className="bg-blue hover:bg-blue-dark text-white font-semibold py-1 px-2.5 rounded text-[10px] transition-colors disabled:opacity-50"
                                  title="Ship via Shopify"
                                >
                                  {shippingOrderId === order.id ? "⏳" : "🚚 Ship"}
                                </button>
                              )}

                              {/* Manual tracking entry */}
                              {order.status === "paid" && !order.shopifyOrderId && (
                                <button
                                  onClick={() => handleManualTracking(order.id)}
                                  className="border border-blue text-blue hover:bg-blue hover:text-white font-semibold py-1 px-2.5 rounded text-[10px] transition-colors"
                                  title="Add tracking manually"
                                >
                                  ✏️ Track
                                </button>
                              )}

                              {/* Refresh tracking from Shopify */}
                              {order.shopifyOrderId && (
                                <button
                                  onClick={() => handleRefreshTracking(order.id)}
                                  className="border border-green text-green hover:bg-green hover:text-white font-semibold py-1 px-2.5 rounded text-[10px] transition-colors"
                                  title="Refresh tracking from Shopify"
                                >
                                  🔄 Sync
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded row with details + tracking */}
                        {isExpanded && (
                          <tr className="bg-gray-1">
                            <td colSpan={8} className="px-8 py-5">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Items */}
                                <div className="border border-gray-3 rounded-xl bg-white p-4 shadow-sm">
                                  <h4 className="text-xs font-semibold uppercase text-dark-4 tracking-wider mb-3">
                                    Order Items
                                  </h4>
                                  <div className="divide-y divide-gray-3">
                                    {order.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="py-2.5 flex justify-between text-sm"
                                      >
                                        <div>
                                          <span className="font-semibold text-dark block text-xs">
                                            {item.name}
                                          </span>
                                          <span className="text-[10px] text-dark-4">
                                            Qty: {item.quantity}
                                          </span>
                                        </div>
                                        <span className="font-bold text-dark text-xs">
                                          ${((item.price * item.quantity) / 100).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Tracking Info */}
                                <div className="border border-gray-3 rounded-xl bg-white p-4 shadow-sm">
                                  <h4 className="text-xs font-semibold uppercase text-dark-4 tracking-wider mb-3">
                                    Shipping & Tracking
                                  </h4>
                                  <div className="space-y-2.5 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-dark-4">Shipping Status</span>
                                      <span
                                        className={`font-bold capitalize px-2 py-0.5 rounded-full text-[10px] ${
                                          shippingStatusColors[order.shippingStatus] ||
                                          "bg-gray-2 text-dark-4"
                                        }`}
                                      >
                                        {order.shippingStatus.replace("_", " ")}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-dark-4">Courier</span>
                                      <span className="font-semibold text-dark">
                                        {order.courierName || "—"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-dark-4">Tracking #</span>
                                      <span className="font-mono font-semibold text-dark">
                                        {order.trackingNumber || "—"}
                                      </span>
                                    </div>
                                    {order.trackingUrl && (
                                      <div className="flex justify-between">
                                        <span className="text-dark-4">Track Link</span>
                                        <a
                                          href={order.trackingUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue font-semibold hover:underline"
                                        >
                                          Open →
                                        </a>
                                      </div>
                                    )}
                                    {order.shopifyOrderId && (
                                      <div className="flex justify-between">
                                        <span className="text-dark-4">Shopify</span>
                                        <span className="font-mono text-dark-3 text-[10px]">
                                          {order.shopifyOrderId}
                                        </span>
                                      </div>
                                    )}
                                    {order.shippedAt && (
                                      <div className="flex justify-between">
                                        <span className="text-dark-4">Shipped At</span>
                                        <span className="font-semibold text-dark">
                                          {new Date(order.shippedAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                    )}
                                    {order.deliveredAt && (
                                      <div className="flex justify-between">
                                        <span className="text-dark-4">Delivered At</span>
                                        <span className="font-semibold text-green">
                                          {new Date(order.deliveredAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
