"use client";

import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatePrice";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const dispatch = useDispatch();
  const { addItem, cartDetails } = useCart();

  const handleRemove = (id: string) => {
    dispatch(removeItemFromWishlist(id));
    toast.success("Item removed from wishlist");
  };

  const handleAddToCart = (item: typeof wishlistItems[0]) => {
    if (item.quantity < 1) {
      toast.error("This item is out of stock!");
      return;
    }

    const isAlreadyAdded = Object.values(cartDetails || {}).some(
      (ci) => ci.id === item.id
    );

    if (isAlreadyAdded) {
      toast.success("Item is already in your cart!");
      return;
    }

    addItem({
      id: item.id,
      name: item.title,
      price: item.price,
      quantity: 1,
      currency: "usd",
      image: item.image,
      slug: item.slug,
      availableQuantity: item.quantity,
      color: item.color || "",
    });
    toast.success("Added to cart!");
  };

  return (
    <main className="bg-gray-1 min-h-screen py-14">
      <div className="container mx-auto px-4">
        <h1 className="text-heading-4 font-bold text-dark mb-8 border-b border-gray-3 pb-4">
          My Wishlist
        </h1>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 xl:gap-7">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-3 shadow-sm overflow-hidden flex flex-col p-4 group relative"
              >
                {/* Image */}
                <div className="relative w-full aspect-square bg-gray-1 rounded-xl border border-gray-3 overflow-hidden mb-4 flex items-center justify-center">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="text-xs text-gray-4">No image</div>
                  )}
                  {item.quantity < 1 && (
                    <span className="absolute top-2.5 right-2.5 bg-red text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <h3 className="font-semibold text-dark hover:text-blue transition-colors line-clamp-1">
                    <Link href={`/products/${item.slug}`}>{item.title}</Link>
                  </h3>
                  <span className="text-base font-bold text-dark mb-4">
                    {formatPrice(item.price)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.quantity < 1}
                    className="flex-1 bg-blue hover:bg-blue-dark text-white text-xs font-semibold py-2.5 px-3 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="border border-gray-3 hover:border-red-600 hover:bg-red-50 text-dark-3 hover:text-red-600 p-2.5 rounded-lg transition-colors duration-150"
                    aria-label="Remove from wishlist"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-gray-3 shadow-sm p-12 text-center max-w-lg mx-auto flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-light-5 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-dark mb-2">Your wishlist is empty</h2>
            <p className="text-dark-4 max-w-sm mb-6 leading-relaxed">
              Save your favorite items here to purchase them later.
            </p>
            <Link
              href="/products"
              className="bg-blue hover:bg-blue-dark text-white font-bold py-3 px-8 rounded-xl transition-all shadow-sm"
            >
              Go to Shop
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
