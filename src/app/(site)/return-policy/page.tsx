export const metadata = {
  title: "Return & Refund Policy | CozyCommerce",
  description:
    "Learn about our return and refund policy for skincare and beauty products purchased from CozyCommerce.",
};

export default function ReturnPolicyPage() {
  return (
    <main className="bg-gray-1 min-h-screen py-14">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl border border-gray-3 p-8 lg:p-12 shadow-sm space-y-6">
          <h1 className="text-heading-4 font-bold text-dark border-b border-gray-3 pb-4">
            Return &amp; Refund Policy
          </h1>
          <p className="text-sm text-dark-4">Last updated: July 5, 2026</p>

          <div className="prose prose-sm max-w-none text-dark-3 leading-relaxed space-y-4">
            <p>
              At CozyCommerce, we want you to love every product you purchase. If you&apos;re not completely satisfied with your skincare or beauty order, we&apos;re here to help. Please read our return and refund guidelines below.
            </p>

            {/* Eligibility */}
            <h2 className="text-base font-bold text-dark pt-4">1. Return Eligibility</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Items must be returned within <strong>30 days</strong> of the delivery date.</li>
              <li>Products must be <strong>unused, unopened, and in their original packaging</strong>.</li>
              <li>Proof of purchase (order confirmation email or Order ID) is required.</li>
              <li>Items purchased during clearance or final-sale promotions are <strong>non-returnable</strong>.</li>
            </ul>

            {/* Non-Returnable */}
            <h2 className="text-base font-bold text-dark pt-4">2. Non-Returnable Items</h2>
            <p>For hygiene and safety reasons, the following items cannot be returned:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Opened or used skincare, makeup, and personal care products.</li>
              <li>Gift cards and promotional vouchers.</li>
              <li>Sample-size or complimentary products.</li>
              <li>Bundled items sold as a set (unless the entire set is returned unopened).</li>
            </ul>

            {/* How to Return */}
            <h2 className="text-base font-bold text-dark pt-4">3. How to Initiate a Return</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Visit the{" "}
                <a href="/order-tracking" className="text-blue font-semibold hover:underline">
                  Order Tracking
                </a>{" "}
                page and locate your order using your Order ID and email.
              </li>
              <li>
                Email us at{" "}
                <a href="mailto:support@cozycommerce.com" className="text-blue font-semibold hover:underline">
                  support@cozycommerce.com
                </a>{" "}
                with your Order ID, the item(s) you wish to return, and the reason for the return.
              </li>
              <li>Our team will respond within <strong>1–2 business days</strong> with return instructions and a prepaid shipping label (where applicable).</li>
              <li>Pack the item securely in its original packaging and ship it using the provided label.</li>
            </ol>

            {/* Refund Process */}
            <h2 className="text-base font-bold text-dark pt-4">4. Refund Process</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Refunds are processed once the returned item is received and inspected.</li>
              <li>You will receive an email confirmation when the refund is approved.</li>
              <li>Refunds will be credited to your <strong>original payment method</strong> within <strong>5–10 business days</strong>, depending on your bank or card issuer.</li>
              <li>Original shipping charges are <strong>non-refundable</strong> unless the return is due to a defective or incorrect product.</li>
            </ul>

            {/* Exchanges */}
            <h2 className="text-base font-bold text-dark pt-4">5. Exchanges</h2>
            <p>
              We currently do not offer direct exchanges. If you would like a different product or variant, please return the original item for a refund and place a new order.
            </p>

            {/* Damaged / Incorrect Items */}
            <h2 className="text-base font-bold text-dark pt-4">6. Damaged or Incorrect Items</h2>
            <p>
              If you receive a damaged, defective, or incorrect product, please contact us within <strong>48 hours</strong> of delivery with:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your Order ID</li>
              <li>A photo of the damaged or incorrect item</li>
              <li>A photo of the packaging</li>
            </ul>
            <p>
              We will send a replacement or issue a full refund (including shipping) at no additional cost to you.
            </p>

            {/* Late or Missing Refunds */}
            <h2 className="text-base font-bold text-dark pt-4">7. Late or Missing Refunds</h2>
            <p>If you haven&apos;t received your refund within the expected timeframe:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Check your bank account or credit card statement again.</li>
              <li>Contact your bank or card issuer, as processing times may vary.</li>
              <li>
                If you&apos;ve done all of this and still haven&apos;t received your refund, email us at{" "}
                <a href="mailto:support@cozycommerce.com" className="text-blue font-semibold hover:underline">
                  support@cozycommerce.com
                </a>.
              </li>
            </ol>

            {/* Contact */}
            <h2 className="text-base font-bold text-dark pt-4">8. Contact Us</h2>
            <p>
              If you have any questions about our return and refund policy, please don&apos;t hesitate to reach out:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Email:{" "}
                <a href="mailto:support@cozycommerce.com" className="text-blue font-semibold hover:underline">
                  support@cozycommerce.com
                </a>
              </li>
              <li>
                Contact Page:{" "}
                <a href="/contact" className="text-blue font-semibold hover:underline">
                  cozycommerce.com/contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
