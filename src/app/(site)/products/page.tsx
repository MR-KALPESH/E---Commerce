import { getAllProducts } from "@/get-api-data/product";
import ProductItem from "@/components/Common/ProductItem";
import { Product } from "@/types/product";

export const metadata = {
  title: "All Products | CozyCommerce",
  description:
    "Browse our full collection of premium products. Find exactly what you're looking for.",
};

export default async function ProductsPage() {
  const products = (await getAllProducts()) as unknown as Product[];

  return (
    <main className="bg-gray-1 min-h-screen">
      <section className="py-14">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-heading-4 font-bold text-dark leading-tight mb-2">
                All Products
              </h1>
              <p className="text-dark-4 text-custom-sm">
                {products.length > 0
                  ? `Showing ${products.length} product${products.length !== 1 ? "s" : ""}`
                  : "No products found"}
              </p>
            </div>

            {/* Sort control (visual only – server sorted by updatedAt desc) */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-select"
                className="text-sm text-dark-4 whitespace-nowrap"
              >
                Sort by:
              </label>
              <select
                id="sort-select"
                className="border border-gray-3 rounded-lg px-3 py-2 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all duration-200 cursor-pointer"
                defaultValue="newest"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 xl:gap-7">
              {products.map((product) => (
                <ProductItem key={product.id} item={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-light-5 flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-dark mb-3">
                No products yet
              </h2>
              <p className="text-dark-4 max-w-sm leading-relaxed">
                Our shelves are being stocked. Check back soon for amazing
                products!
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
