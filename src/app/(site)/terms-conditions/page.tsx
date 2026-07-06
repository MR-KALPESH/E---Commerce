export const metadata = {
  title: "Terms & Conditions | CozyCommerce",
  description: "Read our storefront terms of service and conditions.",
};

export default function TermsConditionsPage() {
  return (
    <main className="bg-gray-1 min-h-screen py-14">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl border border-gray-3 p-8 lg:p-12 shadow-sm space-y-6">
          <h1 className="text-heading-4 font-bold text-dark border-b border-gray-3 pb-4">
            Terms & Conditions
          </h1>
          <p className="text-sm text-dark-4">Last updated: July 5, 2026</p>

          <div className="prose prose-sm max-w-none text-dark-3 leading-relaxed space-y-4">
            <p>
              By accessing and using CozyCommerce, you agree to comply with and be bound by the following terms of service and usage conditions.
            </p>

            <h2 className="text-base font-bold text-dark pt-4">1. Store Terms</h2>
            <p>
              By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence.
            </p>

            <h2 className="text-base font-bold text-dark pt-4">2. Products & Pricing</h2>
            <p>
              Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue any product or category.
            </p>

            <h2 className="text-base font-bold text-dark pt-4">3. Governing Law</h2>
            <p>
              These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with local regulations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
