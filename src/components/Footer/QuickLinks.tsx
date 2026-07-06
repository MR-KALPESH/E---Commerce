import Link from "next/link";

const quickLinks = [
  {
    id: 1,
    label: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    id: 2,
    label: "Return & Refund Policy",
    href: "/return-policy",
  },
  {
    id: 3,
    label: "Terms & Conditions",
    href: "/terms-conditions",
  },
  {
    id: 4,
    label: "Order Tracking",
    href: "/order-tracking",
  },
  {
    id: 5,
    label: "Contact",
    href: "/contact",
  },
];

export default function QuickLinks() {
  return (
    <div className="w-full sm:w-auto">
      <h2 className="mb-7.5 text-xl font-semibold text-dark">Quick Link</h2>

      <ul className="flex flex-col gap-3">
        {quickLinks.map((link) => (
          <li key={link.id}>
            <Link
              className="text-base duration-200 ease-out hover:text-blue"
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
