"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      if (response.data?.success) {
        toast.success("Account created successfully! Please sign in.");
        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }
    } catch (err: any) {
      console.error("[SIGNUP_ERROR]", err);
      const errorMessage =
        err.response?.data?.error || "Failed to create account. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-1 flex items-center justify-center px-4 py-16">
      {/* Background decorative blobs */}
      <div
        aria-hidden="true"
        className="fixed inset-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-light-5 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-light-4 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-3 border border-gray-3 p-8 lg:p-10 flex flex-col gap-6">
          {/* Logo & Brand */}
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-xl bg-blue flex items-center justify-center shadow-2 text-white">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a3 3 0 110 6 3 3 0 010-6zm0 14.5a7.5 7.5 0 01-5.998-2.998C7.363 14.772 9.578 14 12 14s4.637.772 5.998 2.002A7.5 7.5 0 0112 19.5z" />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-dark tracking-tight">CozyCommerce</h1>
              <p className="text-xs text-dark-4">Create a new account</p>
            </div>
          </div>

          <div className="w-full h-px bg-gray-3" />

          {/* Registration Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-dark uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full border border-gray-3 rounded-lg px-3 py-2 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-dark uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full border border-gray-3 rounded-lg px-3 py-2 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-dark uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-3 rounded-lg px-3 py-2 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue hover:bg-blue-dark text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-3" />
            </div>
            <span className="relative bg-white px-3 text-[10px] font-bold uppercase text-dark-4 tracking-wider">
              Or
            </span>
          </div>

          {/* Redirect to sign in */}
          <div className="text-center">
            <p className="text-xs text-dark-2">
              Already have an account?{" "}
              <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-blue hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>

          {/* Privacy */}
          <p className="text-[10px] text-dark-4 text-center leading-relaxed">
            By signing up, you agree to our{" "}
            <a href="/terms-conditions" className="text-blue hover:underline font-semibold">Terms & Conditions</a> and{" "}
            <a href="/privacy-policy" className="text-blue hover:underline font-semibold">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-1 flex items-center justify-center py-16">
        <div className="animate-spin w-10 h-10 text-blue border-t-2 border-blue rounded-full" />
      </main>
    }>
      <SignUpForm />
    </Suspense>
  );
}
