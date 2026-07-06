import { getCategoryBySlug } from "@/get-api-data/category";
import { getAllProducts } from "@/get-api-data/product";
import ProductItem from "@/components/Common/ProductItem";
import { notFound } from "next/navigation";
import { Product } from "@/types/product";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found | CozyCommerce",
    };
  }

  return {
    title: `${category.title} | CozyCommerce`,
    description: category.description || `Browse products in the ${category.title} category.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const allProducts = (await getAllProducts()) as unknown as Product[];
  
  // Filter products belonging to this category
  // category.id is numeric in DB schema we wrote
  const products = allProducts.filter(
    (product: any) => product.categoryId === category.id
  );

  return (
    <main className="bg-gray-1 min-h-screen py-14">
      <div className="container mx-auto px-4">
        {/* Category Header */}
        <div className="bg-white rounded-2xl border border-gray-3 p-8 lg:p-12 mb-10 shadow-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-heading-4 font-bold text-dark mb-3">
              {category.title}
            </h1>
            {category.description && (
              <p className="text-dark-3 text-custom-sm leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
          <div className="text-sm font-semibold text-blue bg-blue-light-5 px-4.5 py-2.5 rounded-full inline-block">
            {products.length} Product{products.length !== 1 ? "s" : ""}
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
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-3 text-center p-8">
            <div className="w-16 h-16 rounded-full bg-blue-light-5 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-dark mb-2">No products in this category</h2>
            <p className="text-dark-4 max-w-sm text-sm">
              We haven't added any products to this category yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
