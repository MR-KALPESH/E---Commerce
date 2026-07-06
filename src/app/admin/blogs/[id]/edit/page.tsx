"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/admin/blogs/${id}`);
        const blog = response.data?.blog;
        if (blog) {
          setTitle(blog.title);
          setSlug(blog.slug);
          setCategory(blog.category);
          setExcerpt(blog.excerpt);
          setContent(blog.content);
          setAuthor(blog.author);
          setImage(blog.image || "");
        } else {
          toast.error("Blog post not found.");
          router.push("/admin/blogs");
        }
      } catch (error) {
        console.error("[FETCH_BLOG_DETAILS_ERROR]", error);
        toast.error("Failed to load blog post details.");
        router.push("/admin/blogs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogDetails();
  }, [id, router]);

  // Generate slug dynamically from Title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove invalid chars
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/-+/g, "-") // Remove duplicate -
      .trim();
    setSlug(generatedSlug);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const response = await axios.post("/api/cloudinary/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImage(response.data?.url || "");
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("[IMAGE_UPLOAD_ERROR]", error);
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !category || !excerpt || !content) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.put(`/api/admin/blogs/${id}`, {
        title,
        slug,
        category,
        excerpt,
        content,
        author,
        image,
      });

      toast.success("Blog post updated successfully!");
      router.push("/admin/blogs");
    } catch (error: any) {
      console.error("[UPDATE_BLOG_ERROR]", error);
      toast.error(error.response?.data?.error || "Failed to update blog post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-xs text-dark-4">Loading blog details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-gray-3">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Edit Blog</h1>
          <p className="text-xs text-dark-4">Edit and update your blog article</p>
        </div>
        <Link
          href="/admin/blogs"
          className="border border-gray-3 hover:bg-gray-2 text-dark font-semibold py-2 px-4 rounded-lg text-xs transition-colors"
        >
          Cancel
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-3 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
              Title <span className="text-red">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. 5 Benefits of Multani Mitti for Skin Glow"
              className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
              Slug <span className="text-red">*</span>
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. 5-benefits-of-multani-mitti-for-skin-glow"
              className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
              Category <span className="text-red">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
            >
              <option value="Skin Care">Skin Care</option>
              <option value="Beauty Tips">Beauty Tips</option>
              <option value="Organic Soap">Organic Soap</option>
              <option value="D-Tan Removal">D-Tan Removal</option>
              <option value="Hair Care">Hair Care</option>
            </select>
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
              Author
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="CozyCommerce Admin"
              className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
            Excerpt <span className="text-red">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short summary of the blog post (shown on the blog list grid)..."
            className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
            Blog Content <span className="text-red">*</span>
          </label>
          <textarea
            required
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your main article content here. Supporting basic HTML tags if required..."
            className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
            Feature Image
          </label>
          <div className="flex items-center gap-4">
            <label className="flex flex-col items-center justify-center border border-dashed border-gray-3 hover:border-blue hover:bg-gray-1 rounded-xl p-4 cursor-pointer transition-colors w-40 h-24">
              <svg className="w-6 h-6 text-dark-3 mb-1" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span className="text-[10px] text-dark-4 font-semibold">Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {isUploading && (
              <div className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4 text-blue" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-[10px] text-dark-4">Uploading image...</span>
              </div>
            )}

            {image && (
              <div className="relative w-40 h-24 border border-gray-3 rounded-xl overflow-hidden shadow-sm">
                <Image src={image} alt="Feature Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="absolute top-1 right-1 bg-red text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-red/80 transition-colors shadow-sm"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="w-full bg-blue hover:bg-blue-dark text-white font-bold py-3 px-6 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-60"
        >
          {isSubmitting ? "Updating article..." : "Update Article"}
        </button>
      </form>
    </div>
  );
}
