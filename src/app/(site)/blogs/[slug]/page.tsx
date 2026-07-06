import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBlogBySlug } from "@/get-api-data/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog Not Found | CozyCommerce",
    };
  }

  return {
    title: `${blog.title} | CozyCommerce`,
    description: blog.excerpt,
  };
}

export default async function BlogDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return (
    <main className="bg-gray-1 min-h-screen py-14">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-dark-4 hover:text-blue mb-6 transition-colors"
        >
          ← Back to Blogs
        </Link>

        <article className="bg-white rounded-2xl border border-gray-3 p-8 lg:p-12 shadow-sm space-y-6 overflow-hidden">
          {/* Header */}
          <div className="space-y-4">
            <span className="text-xs text-blue bg-blue-light-5 font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block">
              {blog.category}
            </span>
            <h1 className="text-heading-4 font-bold text-dark leading-tight">
              {blog.title}
            </h1>
            <div className="flex gap-4 text-xs text-dark-4 font-semibold border-b border-gray-3 pb-4">
              <span>By {blog.author}</span>
              <span>•</span>
              <span>
                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Feature Image */}
          {blog.image && (
            <div className="relative w-full aspect-[16/9] bg-gray-2 rounded-xl overflow-hidden shadow-sm">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="prose prose-sm max-w-none text-dark-3 leading-relaxed whitespace-pre-line space-y-4">
            {blog.content}
          </div>
        </article>
      </div>
    </main>
  );
}
