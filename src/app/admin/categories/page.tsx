"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface Category {
  id: number;
  title: string;
  slug: string;
  image?: string | null;
  description?: string | null;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states (Add/Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/admin/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setSlug(generatedSlug);
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const uploadToast = toast.loading("Uploading image to Cloudinary...");

    try {
      const res = await axios.post("/api/cloudinary/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImage(res.data.url);
      toast.success("Image uploaded!", { id: uploadToast });
    } catch (err) {
      console.error(err);
      toast.error("Upload failed", { id: uploadToast });
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setImage("");
    setDescription("");
    setIsFormOpen(true);
  };

  const openEditForm = (cat: Category) => {
    setEditingId(cat.id);
    setTitle(cat.title);
    setSlug(cat.slug);
    setImage(cat.image || "");
    setDescription(cat.description || "");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug) {
      toast.error("Title and Slug are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title,
        slug,
        image: image || undefined,
        description: description || undefined,
      };

      if (editingId) {
        await axios.put(`/api/admin/categories/${editingId}`, payload);
        toast.success("Category updated successfully");
      } else {
        await axios.post("/api/admin/categories", payload);
        toast.success("Category created successfully");
      }
      setIsFormOpen(false);
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Error saving category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Deleting this category will unlink any associated products!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3c50e0",
      cancelButtonColor: "#f23030",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/admin/categories/${id}`);
        toast.success("Category deleted");
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete category");
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark">Categories</h1>
          <p className="text-dark-4 text-sm mt-1">Organize products into categories.</p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-blue hover:bg-blue-dark text-white font-bold py-2.5 px-5 rounded-lg text-sm transition-all shadow-sm"
        >
          Add New Category
        </button>
      </div>

      {/* Main Grid: Form Sidebar & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Category List Table */}
        <div className={`bg-white rounded-xl border border-gray-3 shadow-1 overflow-hidden ${isFormOpen ? "lg:col-span-2" : "lg:col-span-3"}`}>
          {isLoading ? (
            <div className="p-12 text-center text-dark-4">
              <svg className="animate-spin w-8 h-8 text-blue mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading categories...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-3 bg-gray-1 text-xs font-semibold text-dark-4 uppercase tracking-wider">
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-3">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-dark-4">
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-1 transition-colors text-dark-2">
                        <td className="px-6 py-4">
                          <div className="relative w-10 h-10 bg-gray-1 border border-gray-3 rounded-lg overflow-hidden flex items-center justify-center">
                            {cat.image ? (
                              <img src={cat.image} alt={cat.title} className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-[9px] text-gray-4">No Image</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-dark">{cat.title}</td>
                        <td className="px-6 py-4 font-mono text-xs">{cat.slug}</td>
                        <td className="px-6 py-4 max-w-xs truncate">{cat.description || "—"}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditForm(cat)}
                              className="border border-gray-3 hover:border-blue text-dark-3 hover:text-blue py-1.5 px-3 rounded-lg text-xs font-semibold transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="border border-gray-3 hover:border-red hover:bg-red-50 text-dark-3 hover:text-red py-1.5 px-3 rounded-lg text-xs font-semibold transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* inline form sidebar */}
        {isFormOpen && (
          <div className="bg-white rounded-xl border border-gray-3 p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-3 pb-2.5">
              <h2 className="text-base font-semibold text-dark">
                {editingId ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-xs text-dark-4 hover:text-dark transition-colors"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full border border-gray-3 rounded-lg px-3 py-2 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="e.g. Skin Care"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full border border-gray-3 rounded-lg px-3 py-2 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="e.g. skin-care"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-3 rounded-lg px-3 py-2 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Category description..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark mb-1.5">Category Image</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 bg-gray-1 border border-gray-3 rounded-lg flex items-center justify-center flex-shrink-0">
                    {image ? (
                      <img src={image} alt="Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-[8px] text-gray-4 text-center px-1">No Image</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    id="cat-image-file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  <label
                    htmlFor="cat-image-file"
                    className="border border-gray-3 hover:border-blue text-dark-3 hover:text-blue py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Upload
                  </label>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue hover:bg-blue-dark text-white font-bold py-2 px-4 rounded-lg text-xs transition-all shadow-sm"
                >
                  {isSubmitting ? "Saving..." : "Save Category"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="border border-gray-3 hover:bg-gray-1 text-dark-3 py-2 px-4 rounded-lg text-xs font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
