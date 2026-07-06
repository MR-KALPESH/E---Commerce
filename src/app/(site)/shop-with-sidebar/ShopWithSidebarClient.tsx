"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types/product";
import ProductItem from "@/components/Common/ProductItem";
import { formatPrice } from "@/utils/formatePrice";

interface Category {
  id: number;
  title: string;
  slug: string;
}

interface Props {
  initialProducts: Product[];
  categories: Category[];
}

export default function ShopWithSidebarClient({ initialProducts, categories }: Props) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Sync state if URL query changes
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearch(q);
    }
  }, [searchParams]);

  // Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategoryId !== null) {
      result = result.filter((p: any) => p.categoryId === selectedCategoryId);
    }

    // Price filters
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        result = result.filter((p) => (p.discountedPrice ?? p.price) >= min);
      }
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        result = result.filter((p) => (p.discountedPrice ?? p.price) <= max);
      }
    }

    // Availability filter
    if (onlyInStock) {
      result = result.filter((p) => p.quantity > 0);
    }

    // Sorting logic
    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => (a.discountedPrice ?? a.price) - (b.discountedPrice ?? b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (b.discountedPrice ?? b.price) - (a.discountedPrice ?? a.price));
    }

    return result;
  }, [initialProducts, search, selectedCategoryId, minPrice, maxPrice, sortBy, onlyInStock]);

  const clearAllFilters = () => {
    setSearch("");
    setSelectedCategoryId(null);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setOnlyInStock(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* ── Left Sidebar (Filter Panel) ─────────────────── */}
      <div className="space-y-6 lg:sticky lg:top-24">
        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-3 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-dark uppercase tracking-wider">
            Search Products
          </h3>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="w-full border border-gray-3 rounded-lg pl-4 pr-10 py-2.5 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
            />
            <svg
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-gray-3 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-dark uppercase tracking-wider">
            Categories
          </h3>
          <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar pr-1">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                selectedCategoryId === null
                  ? "bg-blue-light-5 text-blue"
                  : "text-dark-3 hover:bg-gray-1 hover:text-dark"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategoryId === cat.id
                    ? "bg-blue-light-5 text-blue"
                    : "text-dark-3 hover:bg-gray-1 hover:text-dark"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="bg-white rounded-2xl border border-gray-3 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-dark uppercase tracking-wider">
            Filter by Price
          </h3>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min ($)"
              className="w-full border border-gray-3 rounded-lg px-3 py-2 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
            />
            <span className="text-dark-4 text-xs font-semibold">—</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max ($)"
              className="w-full border border-gray-3 rounded-lg px-3 py-2 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>
        </div>
        {/* Availability */}
        <div className="bg-white rounded-2xl border border-gray-3 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-dark uppercase tracking-wider">
            Availability
          </h3>
          <label className="flex items-center gap-2 text-xs font-semibold text-dark-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="w-4 h-4 rounded border-gray-3 text-blue focus:ring-blue cursor-pointer"
            />
            Show In-Stock Only
          </label>
        </div>

        {/* Clear filters action */}
        {(search || selectedCategoryId !== null || minPrice || maxPrice || onlyInStock) && (
          <button
            onClick={clearAllFilters}
            className="w-full bg-red-light-6 hover:bg-red-light-5 text-red font-bold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-sm"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* ── Right Content Grid ──────────────────────────── */}
      <div className="lg:col-span-3 space-y-6">
        {/* Filter Summary Header */}
        <div className="bg-white rounded-2xl border border-gray-3 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-dark">
              {filteredProducts.length === 0
                ? "No products match your criteria"
                : `Showing ${filteredProducts.length} product${
                    filteredProducts.length !== 1 ? "s" : ""
                  }`}
            </h2>
            <p className="text-xs text-dark-4 mt-0.5">
              Use the sidebar filters to refine the catalog results.
            </p>
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-by" className="text-xs font-semibold text-dark-4 whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-3 rounded-lg px-2.5 py-1.5 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
            {filteredProducts.map((product) => (
              <ProductItem key={product.id} item={product} />
            ))}
          </div>
        ) : (
          /* Empty filters feedback state */
          <div className="bg-white rounded-2xl border border-gray-3 p-12 text-center flex flex-col items-center shadow-sm">
            <div className="w-16 h-16 bg-blue-light-5 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-dark mb-1">No matches found</h3>
            <p className="text-xs text-dark-4 max-w-sm mb-5">
              We couldn't find any products matching your specific search query or active filter settings.
            </p>
            <button
              onClick={clearAllFilters}
              className="bg-blue hover:bg-blue-dark text-white font-bold py-2.5 px-6 rounded-lg text-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
