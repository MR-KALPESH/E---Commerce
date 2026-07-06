"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const normalizedEmail = email.toLowerCase();
      const isAdmin = normalizedEmail === "admin@cozycommerce.com";

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: isAdmin ? "/admin" : callbackUrl,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else if (result?.url) {
        toast.success("Successfully logged in!");
        window.location.href = result.url;
      }
    } catch (err) {
      console.error("[SIGNIN_ERROR]", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl: callbackUrl });
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
              <p className="text-xs text-dark-4">Sign in to your account</p>
            </div>
          </div>

          <div className="w-full h-px bg-gray-3" />

          {/* Credentials Sign In Form */}
          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-dark uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@cozycommerce.com"
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
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-blue hover:bg-blue-dark text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign In"}
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

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-2.5 bg-white border border-gray-3 hover:border-blue hover:shadow-sm text-dark font-semibold py-2.5 px-4 rounded-lg text-xs transition-all duration-150 disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <svg className="animate-spin w-4 h-4 text-blue" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Link to sign up */}
          <div className="text-center">
            <p className="text-xs text-dark-2">
              Don't have an account?{" "}
              <Link href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-blue hover:underline font-semibold">
                Sign Up
              </Link>
            </p>
          </div>

          {/* Privacy */}
          <p className="text-[10px] text-dark-4 text-center leading-relaxed">
            By signing in, you agree to our{" "}
            <a href="/terms-conditions" className="text-blue hover:underline font-semibold">Terms & Conditions</a> and{" "}
            <a href="/privacy-policy" className="text-blue hover:underline font-semibold">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-1 flex items-center justify-center py-16">
        <div className="animate-spin w-10 h-10 text-blue border-t-2 border-blue rounded-full" />
      </main>
    }>
      <SignInForm />
    </Suspense>
  );
}
