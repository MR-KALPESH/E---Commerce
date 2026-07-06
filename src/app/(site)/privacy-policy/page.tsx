export const metadata = {
  title: "Privacy Policy | CozyCommerce",
  description: "Read our privacy policy guidelines and information handling details.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-gray-1 min-h-screen py-14">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl border border-gray-3 p-8 lg:p-12 shadow-sm space-y-6">
          <h1 className="text-heading-4 font-bold text-dark border-b border-gray-3 pb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-dark-4">Last updated: July 5, 2026</p>

          <div className="prose prose-sm max-w-none text-dark-3 leading-relaxed space-y-4">
            <p>
              Welcome to CozyCommerce. We value your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and share information when you visit or shop on our website.
            </p>

            <h2 className="text-base font-bold text-dark pt-4">1. Information We Collect</h2>
            <p>
              When you purchase something from our store, we collect the personal information you give us such as your name, email, street address, and purchase details to fulfill orders and process checkout payments.
            </p>

            <h2 className="text-base font-bold text-dark pt-4">2. Payment Processing</h2>
            <p>
              Payments are securely encrypted and processed by Stripe. We do not store or inspect credit card credentials on our servers.
            </p>

            <h2 className="text-base font-bold text-dark pt-4">3. Security</h2>
            <p>
              To protect your personal information, we take reasonable precautions and follow industry best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, altered, or destroyed.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
