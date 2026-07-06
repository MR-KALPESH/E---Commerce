import { prisma } from '@/lib/prismaDB';
import Link from 'next/link';

async function getStats() {
  const [products, categories, reviews, orders] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.review.count(),
    prisma.order.count(),
  ]);
  return { products, categories, reviews, orders };
}

async function getRecentOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { items: true },
  });
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-light-2 text-yellow-dark-2',
  paid: 'bg-green-light-6 text-green-dark',
  failed: 'bg-red-light-6 text-red-dark',
  refunded: 'bg-blue-light-5 text-blue-dark',
};

export default async function AdminDashboard() {
  const stats = await getStats();
  const recentOrders = await getRecentOrders();

  const statCards = [
    {
      label: 'Total Products',
      value: stats.products,
      color: 'bg-blue-light-5',
      iconColor: 'text-blue',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      ),
      href: '/admin/products',
    },
    {
      label: 'Categories',
      value: stats.categories,
      color: 'bg-green-light-6',
      iconColor: 'text-green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
      href: '/admin/categories',
    },
    {
      label: 'Reviews',
      value: stats.reviews,
      color: 'bg-yellow-light-2',
      iconColor: 'text-yellow-dark',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      href: '/admin/reviews',
    },
    {
      label: 'Orders',
      value: stats.orders,
      color: 'bg-red-light-6',
      iconColor: 'text-red',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
      href: '/admin/orders',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
        <p className="text-dark-4 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening in your store.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl border border-gray-3 p-6 shadow-1 hover:shadow-2 transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center ${card.iconColor}`}>
                {card.icon}
              </div>
              <svg className="w-4 h-4 text-dark-4 group-hover:text-blue transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-dark">{card.value.toLocaleString()}</p>
            <p className="text-dark-4 text-sm mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-3 shadow-1">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-3">
          <h2 className="text-base font-semibold text-dark">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-blue hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-3 bg-gray-1">
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-4 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-4 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-4 uppercase tracking-wider">Items</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-4 uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-4 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-dark-4 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-dark-4">No orders yet.</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-3 last:border-0 hover:bg-gray-1 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-dark">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm text-dark-2">{order.customerEmail}</td>
                    <td className="px-6 py-4 text-sm text-dark-3">{order.items.length} items</td>
                    <td className="px-6 py-4 text-sm font-semibold text-dark">
                      ${(order.totalAmount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || 'bg-gray-2 text-dark-4'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-4">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
