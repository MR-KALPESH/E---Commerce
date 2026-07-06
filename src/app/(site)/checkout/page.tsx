"use client";

import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatePrice";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import Image from "next/image";

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { cartDetails, totalPrice, cartCount } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Please sign in to proceed with checkout");
      router.push("/auth/signin?callbackUrl=/checkout");
    }
  }, [status, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    defaultValues: {
      email: session?.user?.email || "",
    },
  });

  // Pre-fill email once session details are loaded
  useEffect(() => {
    if (session?.user?.email) {
      setValue("email", session.user.email);
    }
  }, [session, setValue]);

  const items = Object.values(cartDetails || {});

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/stripe/checkout", {
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          slug: item.slug,
        })),
        customerEmail: data.email,
      });

      if (response.data?.url) {
        // Redirect to Stripe checkout page
        router.push(response.data.url);
      } else {
        toast.error("Failed to initiate payment session.");
      }
    } catch (error: any) {
      console.error("[CHECKOUT_SUBMIT_ERROR]", error);
      toast.error(error.response?.data?.error || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="bg-gray-1 min-h-screen py-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-10 h-10 text-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-semibold text-dark-2">Verifying session...</span>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return null; // Let the useEffect redirect
  }

  if (cartCount === 0) {
    return (
      <main className="bg-gray-1 min-h-screen py-20 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl border border-gray-3 max-w-sm">
          <h2 className="text-xl font-bold text-dark mb-4">No items to checkout</h2>
          <p className="text-dark-4 mb-6">Add items to your cart first.</p>
          <button
            onClick={() => router.push("/products")}
            className="bg-blue hover:bg-blue-dark text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Go to Shop
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-1 min-h-screen py-14">
      <div className="container mx-auto px-4">
        <h1 className="text-heading-4 font-bold text-dark mb-8 border-b border-gray-3 pb-4">
          Checkout
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Billing Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-3 shadow-sm p-6 lg:p-8">
              <h2 className="text-lg font-bold text-dark mb-6">Billing Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-dark mb-2">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    {...register("firstName", { required: "First name is required" })}
                    className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                  />
                  {errors.firstName && <span className="text-xs text-red mt-1">{errors.firstName.message}</span>}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-dark mb-2">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    {...register("lastName", { required: "Last name is required" })}
                    className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                  />
                  {errors.lastName && <span className="text-xs text-red mt-1">{errors.lastName.message}</span>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-dark mb-2">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                  />
                  {errors.email && <span className="text-xs text-red mt-1">{errors.email.message}</span>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-semibold text-dark mb-2">Street Address</label>
                  <input
                    id="address"
                    type="text"
                    {...register("address", { required: "Address is required" })}
                    className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                  />
                  {errors.address && <span className="text-xs text-red mt-1">{errors.address.message}</span>}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-dark mb-2">City</label>
                  <input
                    id="city"
                    type="text"
                    {...register("city", { required: "City is required" })}
                    className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                  />
                  {errors.city && <span className="text-xs text-red mt-1">{errors.city.message}</span>}
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-semibold text-dark mb-2">State / Province</label>
                  <input
                    id="state"
                    type="text"
                    {...register("state", { required: "State is required" })}
                    className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                  />
                  {errors.state && <span className="text-xs text-red mt-1">{errors.state.message}</span>}
                </div>

                <div>
                  <label htmlFor="zip" className="block text-sm font-semibold text-dark mb-2">ZIP / Postal Code</label>
                  <input
                    id="zip"
                    type="text"
                    {...register("zip", { required: "ZIP code is required" })}
                    className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                  />
                  {errors.zip && <span className="text-xs text-red mt-1">{errors.zip.message}</span>}
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-semibold text-dark mb-2">Country</label>
                  <input
                    id="country"
                    type="text"
                    {...register("country", { required: "Country is required" })}
                    className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                  />
                  {errors.country && <span className="text-xs text-red mt-1">{errors.country.message}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar checkout summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-3 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-bold text-dark border-b border-gray-3 pb-3">Your Order</h2>

              <div className="divide-y divide-gray-3 max-h-60 overflow-y-auto no-scrollbar pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-gray-1 border border-gray-3 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image && (
                          <Image src={item.image} alt={item.name} fill className="object-contain p-1" sizes="48px" />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-dark line-clamp-1">{item.name}</span>
                        <span className="text-xs text-dark-4">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-dark">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-3">
                <div className="flex justify-between text-custom-sm text-dark-3">
                  <span>Subtotal</span>
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

              <button
                id="btn-pay-now"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-blue hover:bg-blue-dark text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Pay Now"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
