"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Image from "next/image";
import { formatPrice } from "@/utils/formatePrice";

interface Product {
  id: string;
  title: string;
  price: number;
  discountedPrice?: number | null;
  quantity: number;
  category?: { title: string } | null;
  productVariants: { image: string; isDefault: boolean }[];
  _count: { reviews: number };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/admin/products");
      setProducts(response.data.products || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this product deletion!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3c50e0",
      cancelButtonColor: "#f23030",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/admin/products/${id}`);
        toast.success("Product deleted successfully");
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete product");
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark">Products</h1>
          <p className="text-dark-4 text-sm mt-1">Manage your storefront products.</p>
        </div>
        <Link
          href="/admin/products/add"
          className="bg-blue hover:bg-blue-dark text-white font-bold py-2.5 px-5 rounded-lg text-sm transition-all shadow-sm"
        >
          Add New Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-3 shadow-1 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-dark-4">
            <svg className="animate-spin w-8 h-8 text-blue mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading products...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-3 bg-gray-1 text-xs font-semibold text-dark-4 uppercase tracking-wider">
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Reviews</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-dark-4">
                      No products found. Start by adding a new product!
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const defaultImg =
                      product.productVariants.find((v) => v.isDefault)?.image ||
                      product.productVariants[0]?.image ||
                      "";
                    return (
                      <tr key={product.id} className="hover:bg-gray-1 transition-colors text-sm text-dark-2">
                        <td className="px-6 py-4">
                          <div className="relative w-12 h-12 bg-gray-1 border border-gray-3 rounded-lg overflow-hidden flex items-center justify-center">
                            {defaultImg ? (
                              <Image
                                src={defaultImg}
                                alt={product.title}
                                fill
                                className="object-contain p-1"
                                sizes="48px"
                              />
                            ) : (
                              <span className="text-[10px] text-gray-4">No Image</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-dark max-w-xs truncate">
                          {product.title}
                        </td>
                        <td className="px-6 py-4">
                          {product.category?.title || <span className="text-dark-4">—</span>}
                        </td>
                        <td className="px-6 py-4 font-bold text-dark">
                          {formatPrice(product.discountedPrice ?? product.price)}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          {product.quantity > 0 ? (
                            <span className="text-dark">{product.quantity}</span>
                          ) : (
                            <span className="text-red font-medium">Out of Stock</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-dark-3">
                          {product._count.reviews} review{product._count.reviews !== 1 ? "s" : ""}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="border border-gray-3 hover:border-blue text-dark-3 hover:text-blue py-1.5 px-3 rounded-lg text-xs font-semibold transition-all"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="border border-gray-3 hover:border-red hover:bg-red-50 text-dark-3 hover:text-red py-1.5 px-3 rounded-lg text-xs font-semibold transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
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
