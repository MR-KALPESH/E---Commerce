import type { Metadata } from 'next';
import Sidebar from './components/Sidebar';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Panel | CozyCommerce',
  description: 'CozyCommerce Admin Dashboard',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-1 font-body">
      <Sidebar />
      <div className="ml-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-3 px-6 py-3 flex items-center justify-between shadow-1">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
            <span className="text-dark text-sm font-medium">CozyCommerce Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 text-sm text-dark-3 hover:text-blue transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View Store
            </Link>
            <div className="w-8 h-8 rounded-full bg-blue flex items-center justify-center text-white text-xs font-semibold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
