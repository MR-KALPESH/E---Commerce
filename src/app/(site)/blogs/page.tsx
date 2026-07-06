import Link from "next/link";
import Image from "next/image";
import { getBlogs } from "@/get-api-data/blog";

export const metadata = {
  title: "Blog | CozyCommerce",
  description: "Browse our collection of beauty, skin care, organic soaps, and shopping guidelines.",
};

export default async function BlogGridPage() {
  const posts = await getBlogs();

  return (
    <main className="bg-gray-1 min-h-screen py-14">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10 text-center max-w-xl mx-auto">
          <h1 className="text-heading-4 font-bold text-dark mb-3">Our Blog</h1>
          <p className="text-dark-4 text-sm leading-relaxed">
            Stay updated with beauty secrets, skin care routines, organic soap insights, and natural glow tips from CozyCommerce.
          </p>
        </div>

        {/* Grid */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-3 shadow-sm py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-2 rounded-full flex items-center justify-center mx-auto mb-4 text-dark-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-dark mb-1">No articles found</h3>
            <p className="text-xs text-dark-4">Please check back later for exciting beauty and skin care updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blogs/${post.slug}`}
                className="bg-white rounded-2xl border border-gray-3 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-blue/30 transition-all duration-200"
              >
                {/* Image Preview */}
                <div className="relative w-full aspect-[16/10] bg-gray-2 overflow-hidden flex items-center justify-center">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-blue-light-5 flex items-center justify-center text-blue font-bold text-xs uppercase tracking-wider group-hover:scale-105 transition-transform duration-200 p-4 text-center">
                      {post.title}
                    </div>
                  )}
                </div>

                {/* Info content */}
                <div className="p-6 flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-3.5 text-xs text-dark-4 font-semibold">
                    <span className="text-blue bg-blue-light-5 px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px]">
                      {post.category}
                    </span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="font-bold text-dark text-base leading-snug group-hover:text-blue transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-dark-3 text-xs leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Read more button */}
                  <div className="mt-auto pt-4 border-t border-gray-3 flex items-center justify-between text-xs">
                    <span className="font-medium text-dark-4">By {post.author}</span>
                    <div className="font-bold text-blue group-hover:text-blue-dark flex items-center gap-1 transition-colors">
                      Read More
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
