"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { formatPrice } from "@/utils/formatePrice";

interface SearchProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountedPrice: number | null;
  image: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      fetchProducts();
      // Lock scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const fetchProducts = async () => {
    if (products.length > 0) return;
    setIsLoading(true);
    try {
      const res = await axios.get("/api/products/search");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products for search", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredProducts = query.trim()
    ? products.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-99999 flex items-start justify-center pt-20 px-4">
      {/* Glassmorphism Backdrop */}
      <div
        className="fixed inset-0 bg-dark/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-full max-w-xl bg-white rounded-2xl border border-gray-3 shadow-2xl overflow-hidden flex flex-col max-h-[70vh] z-10 animate-fade-in"
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-3 bg-gray-1">
          <svg
            className="w-5 h-5 text-dark-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skincare, lipsticks, hair oils..."
            className="w-full text-sm text-dark bg-transparent focus:outline-none placeholder-dark-4"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs font-semibold text-dark-4 hover:text-dark px-1.5 py-0.5 rounded bg-gray-3 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-bold text-dark-4 hover:text-dark border border-gray-3 hover:bg-gray-2 px-2.5 py-1 rounded-lg transition-all"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-blue border-t-transparent rounded-full animate-spin" />
              <p className="text-[11px] font-medium text-dark-4 uppercase tracking-wider">Loading products...</p>
            </div>
          ) : query.trim() === "" ? (
            <div className="py-12 text-center text-dark-4">
              <p className="text-xs">Type to search the store instantly...</p>
              <p className="text-[10px] mt-1">Try: &quot;Serum&quot;, &quot;Toner&quot;, &quot;Lipstick&quot;</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-dark-4 uppercase tracking-wider mb-2">
                Products Found ({filteredProducts.length})
              </p>
              {filteredProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3.5 p-2 rounded-xl border border-transparent hover:border-gray-3 hover:bg-gray-1 transition-all group"
                >
                  <div className="relative w-12 h-12 bg-gray-2 rounded-lg overflow-hidden border border-gray-3 shrink-0 flex items-center justify-center">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    ) : (
                      <span className="text-[9px] text-dark-4">No img</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-dark truncate group-hover:text-blue transition-colors">
                      {p.title}
                    </h4>
                    <span className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xs font-bold text-dark">
                        {formatPrice(p.discountedPrice ?? p.price)}
                      </span>
                      {p.discountedPrice && (
                        <span className="text-[10px] text-dark-4 line-through">
                          {formatPrice(p.price)}
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] text-blue font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-dark-4">
              <p className="text-xs">No products match &quot;{query}&quot;</p>
              <p className="text-[10px] mt-1">Check spelling or try a different term.</p>
            </div>
          )}
        </div>

        {/* Search Footer */}
        {query.trim() && filteredProducts.length > 0 && (
          <div className="p-3 border-t border-gray-3 bg-gray-1 text-center">
            <Link
              href={`/shop-with-sidebar?q=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="text-xs font-bold text-blue hover:underline"
            >
              See all results in Shop catalog →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
