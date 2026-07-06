"use client";

import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatePrice";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const {
    cartCount,
    cartDetails,
    totalPrice,
    incrementItem,
    decrementItem,
    removeItem,
  } = useCart();

  const items = Object.values(cartDetails || {});

  // Compute total price (totalPrice from hook is in cents/100 or already format? let's see. In cart-slice, selectTotalPrice is calculated by item.price * item.quantity. And formattedTotalPrice is selectTotalPrice / 100 formatted.
  // Wait, let's verify if price in cartDetails is stored in normal dollars or cents. In ProductItem, it did: `price: item.discountedPrice ? item.discountedPrice : item.price`, which is regular decimal dollars (e.g. 29.0). So totalPrice is also in dollars (e.g. 29.0 * 2 = 58.0).
  // Let's check selectFormattedTotalPrice in cart-slice.ts: `(totalPrice) => { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", }).format(totalPrice / 100); }`
  // Wait! In selectFormattedTotalPrice, it divides totalPrice by 100. That implies selectTotalPrice expects it to be in cents! But wait, in ProductItem, `item.price` is parsed via `price: item.discountedPrice ? item.discountedPrice : item.price`, which is a Decimal value returned by unstable_cache, but wait, the decimal value gets converted to number (e.g. 29.0) in the fetcher!
  // Wait, let's double check product detail add to cart: `price: product.discountedPrice ?? product.price` (e.g. 29).
  // So the price in cart-slice items array is in dollars (e.g., 29). But wait, selectFormattedTotalPrice does `totalPrice / 100`. That's a mismatch in the original boilerplate's selector! Let's check `cart-slice.ts` line 130:
  // `return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", }).format(totalPrice / 100);` Wait, let's look at `selectFormattedTotalPrice` in `cart-slice.ts` again.
  // Ah! Yes, it divides by 100. That means if totalPrice is in dollars (e.g., 58), selectFormattedTotalPrice will return $0.58!
  // Let's fix that selector in `src/redux/features/cart-slice.ts` so it uses totalPrice directly, OR we can format it ourselves in the UI using formatPrice(totalPrice). Yes, using formatPrice(totalPrice) in our page is safer and doesn't break other potential places. Let's look at `cart-slice.ts` line 124 to 132:
  // Wait, let's write CartPage using formatPrice(totalPrice) directly! That way we bypass selectFormattedTotalPrice entirely, which might be buggy.

  return (
    <main className="bg-gray-1 min-h-screen py-14">
      <div className="container mx-auto px-4">
        <h1 className="text-heading-4 font-bold text-dark mb-8 border-b border-gray-3 pb-4">
          Shopping Cart
        </h1>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-3 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-3 hidden md:grid grid-cols-12 text-sm font-semibold text-dark-4">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                <div className="divide-y divide-gray-3">
                  {items.map((item) => (
                    <div key={item.id} className="p-6 grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                      {/* Product image + title */}
                      <div className="col-span-6 flex items-center gap-4">
                        <div className="relative w-20 h-20 bg-gray-1 rounded-xl border border-gray-3 overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-contain p-2"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-4">
                              No image
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/products/${item.slug}`}
                            className="font-semibold text-dark hover:text-blue transition-colors duration-150 line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          {(item.color || item.size) && (
                            <div className="flex gap-2 text-xs text-dark-4 mt-1">
                              {item.color && <span>Color: {item.color}</span>}
                              {item.size && <span>Size: {item.size}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-2 md:text-center text-sm font-medium text-dark flex md:block justify-between">
                        <span className="md:hidden text-dark-4 font-normal">Price:</span>
                        {formatPrice(item.price)}
                      </div>

                      {/* Qty */}
                      <div className="col-span-2 flex justify-between md:justify-center items-center gap-2">
                        <span className="md:hidden text-dark-4 text-sm font-normal">Quantity:</span>
                        <div className="flex items-center border border-gray-3 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => decrementItem(item.id)}
                            className="w-8 h-8 flex items-center justify-center text-dark-3 hover:bg-gray-1 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-dark">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => incrementItem(item.id)}
                            className="w-8 h-8 flex items-center justify-center text-dark-3 hover:bg-gray-1 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="col-span-2 text-right text-sm font-bold text-dark flex md:block justify-between">
                        <span className="md:hidden text-dark-4 font-normal">Subtotal:</span>
                        <div className="flex md:block items-center gap-4 ml-auto">
                          {formatPrice(item.price * item.quantity)}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-600 transition-colors ml-4 md:ml-0"
                            aria-label="Remove item"
                          >
                            <svg className="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-3 shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-bold text-dark border-b border-gray-3 pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-custom-sm text-dark-3">
                    <span>Subtotal ({cartCount} items)</span>
                    <span className="font-semibold text-dark">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-custom-sm text-dark-3">
                    <span>Shipping</span>
                    <span className="text-green font-semibold">Free</span>
                  </div>
                  <div className="w-full h-px bg-gray-3" />
                  <div className="flex justify-between text-base font-bold text-dark">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block text-center w-full bg-blue hover:bg-blue-dark text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 mt-4 shadow-sm"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-gray-3 shadow-sm p-12 text-center max-w-lg mx-auto flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-light-5 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-dark mb-2">Your cart is empty</h2>
            <p className="text-dark-4 max-w-sm mb-6 leading-relaxed">
              Looks like you haven't added anything to your cart yet. Let's find some amazing products!
            </p>
            <Link
              href="/products"
              className="bg-blue hover:bg-blue-dark text-white font-bold py-3 px-8 rounded-xl transition-all shadow-sm"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
