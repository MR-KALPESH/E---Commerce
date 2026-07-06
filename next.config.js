/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  redirects: async () => {
    return [
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: true,
      },
      {
        source: "/signin",
        destination: "/auth/signin",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/auth/signin",
        permanent: true,
      },
      {
        source: "/shop-without-sidebar",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/popular",
        destination: "/shop-with-sidebar",
        permanent: true,
      },
      {
        source: "/blogs/blog-grid-with-sidebar",
        destination: "/blogs",
        permanent: true,
      },
      {
        source: "/blogs/blog-grid",
        destination: "/blogs",
        permanent: true,
      },
      {
        source: "/blogs/blog-details-with-sidebar",
        destination: "/blogs",
        permanent: true,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
};

module.exports = nextConfig;
