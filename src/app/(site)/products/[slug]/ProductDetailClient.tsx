"use client";

import { IProductByDetails } from "@/types/product";
import { formatPrice } from "@/utils/formatePrice";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

type Props = {
  product: IProductByDetails & { reviews: number };
};

function StarRating({ count, total = 5 }: { count: number; total?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} out of ${total} stars`}>
      {Array.from({ length: total }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < count ? "text-yellow" : "text-gray-3"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductDetailClient({ product }: Props) {
  const defaultVariant =
    product.productVariants.find((v) => v.isDefault) ||
    product.productVariants[0];

  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const [selectedImage, setSelectedImage] = useState(
    defaultVariant?.image || ""
  );
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "additional" | "reviews"
  >("description");

  const { addItem, cartDetails } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAlreadyAdded = Object.values(cartDetails ?? {}).some(
    (ci) => ci.id === product.id
  );

  // Unique images across variants
  const allImages = Array.from(
    new Set(product.productVariants.map((v) => v.image).filter(Boolean))
  );

  const avgRating =
    product.reviews > 0
      ? Math.min(5, Math.round(product.reviews / (product.reviews * 0.2 + 1)))
      : 4;

  const handleAddToCart = () => {
    if (product.quantity < 1) {
      toast.error("This product is out of stock!");
      return;
    }
    addItem({
      id: product.id,
      name: product.title,
      price: product.discountedPrice ?? product.price,
      quantity: qty,
      currency: "usd",
      image: selectedVariant?.image || "",
      slug: product.slug,
      availableQuantity: product.quantity,
      color: selectedVariant?.color || "",
      size: selectedVariant?.size || "",
    });
    toast.success("Added to cart!");
  };

  const discountPct =
    product.discountedPrice && product.price > 0
      ? Math.round(
          ((product.price - product.discountedPrice) / product.price) * 100
        )
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-3 shadow-2 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* ── Left: Images ─────────────────────────────────── */}
        <div className="bg-gray-1 p-6 lg:p-10 flex flex-col gap-4">
          {/* Main image */}
          <div className="relative flex items-center justify-center bg-white rounded-xl border border-gray-3 overflow-hidden aspect-square w-full max-w-md mx-auto">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={product.title}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-4 text-sm">
                No image
              </div>
            )}
            {discountPct > 0 && (
              <span className="absolute top-3 left-3 bg-blue text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                {discountPct}% OFF
              </span>
            )}
            {product.quantity < 1 && (
              <span className="absolute top-3 right-3 bg-red text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2.5 flex-wrap justify-center">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  id={`thumb-${idx}`}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden transition-all duration-150 ${
                    selectedImage === img
                      ? "border-blue shadow-input"
                      : "border-gray-3 hover:border-blue-light-3"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Variant ${idx + 1}`}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Details ────────────────────────────────── */}
        <div className="p-6 lg:p-10 flex flex-col gap-6">
          {/* Category breadcrumb */}
          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-xs text-blue font-medium hover:underline uppercase tracking-wider"
            >
              {product.category.title}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-heading-5 font-bold text-dark leading-tight">
            {product.title}
          </h1>

          {/* Rating + reviews */}
          <div className="flex items-center gap-3">
            <StarRating count={avgRating} />
            <span className="text-sm text-dark-4">
              {product.reviews} review{product.reviews !== 1 ? "s" : ""}
            </span>
            {product.sku && (
              <span className="text-xs text-dark-4 ml-auto">
                SKU: {product.sku}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-dark">
              {formatPrice(product.discountedPrice ?? product.price)}
            </span>
            {product.discountedPrice && (
              <span className="text-base text-dark-4 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-dark-3 text-custom-sm leading-relaxed border-t border-gray-3 pt-4">
              {product.shortDescription}
            </p>
          )}

          {/* Color selector */}
          {(() => {
            const uniqueColors = Array.from(
              new Set(
                product.productVariants
                  .map((v) => v.color)
                  .filter(Boolean)
              )
            );
            if (uniqueColors.length === 0) return null;
            return (
              <div>
                <p className="text-sm font-medium text-dark mb-2.5">
                  Color:{" "}
                  <span className="text-dark-3 font-normal">
                    {selectedVariant?.color}
                  </span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {uniqueColors.map((color) => {
                    const variant = product.productVariants.find(
                      (v) => v.color === color
                    );
                    const isSelected = selectedVariant?.color === color;
                    return (
                      <button
                        key={color}
                        id={`color-${color}`}
                        onClick={() => {
                          if (variant) {
                            setSelectedVariant(variant);
                            if (variant.image) setSelectedImage(variant.image);
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-sm border-2 transition-all duration-150 font-medium ${
                          isSelected
                            ? "border-blue bg-blue-light-5 text-blue"
                            : "border-gray-3 text-dark-3 hover:border-blue-light-3"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Size selector */}
          {(() => {
            const uniqueSizes = Array.from(
              new Set(
                product.productVariants
                  .map((v) => v.size)
                  .filter(Boolean)
              )
            );
            if (uniqueSizes.length === 0) return null;
            return (
              <div>
                <p className="text-sm font-medium text-dark mb-2.5">
                  Size:{" "}
                  <span className="text-dark-3 font-normal">
                    {selectedVariant?.size}
                  </span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {uniqueSizes.map((size) => {
                    const variant = product.productVariants.find(
                      (v) => v.size === size
                    );
                    const isSelected = selectedVariant?.size === size;
                    return (
                      <button
                        key={size}
                        id={`size-${size}`}
                        onClick={() => {
                          if (variant) setSelectedVariant(variant);
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-sm border-2 transition-all duration-150 font-medium ${
                          isSelected
                            ? "border-blue bg-blue-light-5 text-blue"
                            : "border-gray-3 text-dark-3 hover:border-blue-light-3"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 pt-2">
            {/* Qty selector */}
            <div className="flex items-center border-2 border-gray-3 rounded-xl overflow-hidden">
              <button
                id="qty-decrement"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-11 flex items-center justify-center text-dark-3 hover:bg-gray-2 transition-colors duration-150"
                aria-label="Decrease quantity"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="w-12 text-center text-dark font-semibold text-base">
                {qty}
              </span>
              <button
                id="qty-increment"
                onClick={() =>
                  setQty((q) => Math.min(q + 1, product.quantity || 99))
                }
                className="w-10 h-11 flex items-center justify-center text-dark-3 hover:bg-gray-2 transition-colors duration-150"
                aria-label="Increase quantity"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Add to cart */}
            {isMounted && isAlreadyAdded ? (
              <Link
                href="/cart"
                className="flex-1 text-center bg-green text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-dark transition-colors duration-200"
              >
                View in Cart →
              </Link>
            ) : (
              <button
                id="btn-add-to-cart"
                onClick={handleAddToCart}
                disabled={product.quantity < 1}
                className="flex-1 bg-blue text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            )}
          </div>

          {/* Offers */}
          {product.offers && product.offers.length > 0 && (
            <div className="bg-green-light-6 border border-green-light-5 rounded-xl p-4">
              <p className="text-sm font-semibold text-green mb-2">
                🎉 Available Offers
              </p>
              <ul className="space-y-1">
                {product.offers.map((offer, i) => (
                  <li key={i} className="text-sm text-dark-3 flex gap-2">
                    <span className="text-green">✓</span>
                    {offer}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="border-t border-gray-3">
        <div className="flex border-b border-gray-3 px-6 lg:px-10 overflow-x-auto">
          {(
            [
              { key: "description", label: "Description" },
              { key: "additional", label: "Additional Info" },
              { key: "reviews", label: `Reviews (${product.reviews})` },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              id={`tab-${key}`}
              onClick={() => setActiveTab(key)}
              className={`py-4 px-5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 -mb-px ${
                activeTab === key
                  ? "border-blue text-blue"
                  : "border-transparent text-dark-4 hover:text-dark"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-6 lg:p-10">
          {/* Description Tab */}
          {activeTab === "description" && (
            <div className="prose prose-sm max-w-none text-dark-3 leading-relaxed">
              {product.body ? (
                <div dangerouslySetInnerHTML={{ __html: product.body }} />
              ) : product.description ? (
                <p>{product.description}</p>
              ) : (
                <p className="text-dark-4">
                  No detailed description available for this product.
                </p>
              )}
            </div>
          )}

          {/* Additional Info Tab */}
          {activeTab === "additional" && (
            <div>
              {product.additionalInformation &&
              product.additionalInformation.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-3">
                  <table className="w-full text-sm">
                    <tbody>
                      {product.additionalInformation.map((info, i) => (
                        <tr
                          key={i}
                          className={`${i % 2 === 0 ? "bg-gray-1" : "bg-white"}`}
                        >
                          <td className="py-3 px-4 font-medium text-dark border-r border-gray-3 w-1/3">
                            {info.name}
                          </td>
                          <td className="py-3 px-4 text-dark-3">
                            {info.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-dark-4 text-sm">
                  No additional information available.
                </p>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {product.reviews > 0 ? (
                <div className="flex items-center gap-6 p-5 bg-gray-1 rounded-xl border border-gray-3">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-dark">
                      {avgRating}.0
                    </div>
                    <StarRating count={avgRating} />
                    <p className="text-xs text-dark-4 mt-1">
                      {product.reviews} ratings
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">⭐</div>
                  <p className="text-dark-3 font-medium">No reviews yet</p>
                  <p className="text-sm text-dark-4 mt-1">
                    Be the first to review this product.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
