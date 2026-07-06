"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  createdAt: string;
}

export default function BlogsListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/admin/blogs");
      setBlogs(response.data?.blogs || []);
    } catch (error) {
      console.error("[FETCH_BLOGS_ERROR]", error);
      toast.error("Failed to load blogs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this blog post!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3c50e0",
      cancelButtonColor: "#f23030",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/admin/blogs/${id}`);
          toast.success("Blog deleted successfully!");
          fetchBlogs();
        } catch (error) {
          console.error("[DELETE_BLOG_ERROR]", error);
          toast.error("Failed to delete blog.");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-gray-3">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Blogs</h1>
          <p className="text-xs text-dark-4">Create and manage storefront blog posts</p>
        </div>
        <Link
          href="/admin/blogs/add"
          className="bg-blue hover:bg-blue-dark text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Blog
        </Link>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-3 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin w-8 h-8 text-blue" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs text-dark-4">Loading blogs...</span>
            </div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-2 rounded-full flex items-center justify-center mx-auto mb-4 text-dark-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-dark mb-1">No blogs found</h3>
            <p className="text-xs text-dark-4 mb-4">Start writing your first blog post today.</p>
            <Link
              href="/admin/blogs/add"
              className="bg-blue hover:bg-blue-dark text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors inline-flex items-center gap-1.5"
            >
              Add New Blog
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-2 text-[10px] font-bold text-dark-3 uppercase tracking-wider border-b border-gray-3">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Published Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3 text-xs text-dark-2">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-1 transition-colors">
                    <td className="px-6 py-4 font-semibold text-dark truncate max-w-xs">
                      {blog.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue/10 text-blue font-semibold px-2 py-0.5 rounded text-[10px]">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">{blog.author}</td>
                    <td className="px-6 py-4">
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/blogs/${blog.id}/edit`}
                        className="inline-block border border-blue text-blue hover:bg-blue hover:text-white font-semibold py-1 px-3 rounded text-[10px] transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="border border-red text-red hover:bg-red hover:text-white font-semibold py-1 px-3 rounded text-[10px] transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
