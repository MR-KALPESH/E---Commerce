import { getProductBySlug, getRelatedProducts } from "@/get-api-data/product";
import ProductDetailClient from "./ProductDetailClient";
import ProductItem from "@/components/Common/ProductItem";
import { notFound } from "next/navigation";
import { Product } from "@/types/product";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.id) {
    return {
      title: "Product Not Found | CozyCommerce",
    };
  }

  return {
    title: `${product.title} | CozyCommerce`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.id) {
    notFound();
  }

  // Cast product to expected type by ProductDetailClient
  // product.price is number because getProductBySlug converts Decimal to number.
  const clientProduct = product as any;

  // Fetch related products
  let relatedProducts: Product[] = [];
  if (product.category?.title) {
    relatedProducts = (await getRelatedProducts(
      product.category.title,
      product.tags || [],
      product.id!,
      product.title!
    )) as unknown as Product[];
  }

  return (
    <main className="bg-gray-1 min-h-screen py-14">
      <div className="container mx-auto px-4">
        {/* Product details */}
        <ProductDetailClient product={clientProduct} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="text-heading-5 font-bold text-dark mb-8 border-b border-gray-3 pb-4">
              Related Products
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 xl:gap-7">
              {relatedProducts.map((item) => (
                <ProductItem key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
