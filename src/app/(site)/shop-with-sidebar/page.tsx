import { Suspense } from "react";
import { getCategories } from "@/get-api-data/category";
import { getAllProducts } from "@/get-api-data/product";
import ShopWithSidebarClient from "./ShopWithSidebarClient";
import { Product } from "@/types/product";

export const metadata = {
  title: "Shop with Sidebar | CozyCommerce",
  description: "Browse products using our advanced filters and catalog sidebar.",
};

export default async function ShopWithSidebarPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getAllProducts() as unknown as Product[],
  ]);

  return (
    <main className="bg-gray-1 min-h-screen py-14">
      <div className="container mx-auto px-4">
        <Suspense fallback={
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-3 border-blue border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <ShopWithSidebarClient
            initialProducts={products}
            categories={categories || []}
          />
        </Suspense>
      </div>
    </main>
  );
}
