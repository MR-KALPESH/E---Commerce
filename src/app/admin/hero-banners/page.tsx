"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface Product {
  id: string;
  title: string;
}

interface HeroBanner {
  id: number;
  bannerName?: string | null;
  bannerImage: string;
  slug: string;
  productId: string;
  product?: Product | null;
}

export default function AdminHeroBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [bannerName, setBannerName] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [slug, setSlug] = useState("");
  const [productId, setProductId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [bannersRes, productsRes] = await Promise.all([
        axios.get("/api/admin/hero-banners"),
        axios.get("/api/admin/products"),
      ]);
      setBanners(bannersRes.data.heroBanners || []);
      setProducts(productsRes.data.products || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load hero banners or products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const uploadToast = toast.loading("Uploading image...");

    try {
      const res = await axios.post("/api/cloudinary/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setBannerImage(res.data.url);
      toast.success("Image uploaded!", { id: uploadToast });
    } catch (err) {
      console.error(err);
      toast.error("Upload failed", { id: uploadToast });
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setBannerName("");
    setBannerImage("");
    setSlug("");
    setProductId("");
    setIsFormOpen(true);
  };

  const openEditForm = (b: HeroBanner) => {
    setEditingId(b.id);
    setBannerName(b.bannerName || "");
    setBannerImage(b.bannerImage || "");
    setSlug(b.slug || "");
    setProductId(b.productId || "");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerImage || !slug || !productId) {
      toast.error("Image, Slug, and Product are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        bannerName: bannerName || undefined,
        bannerImage,
        slug,
        productId,
      };

      if (editingId) {
        await axios.put(`/api/admin/hero-banners/${editingId}`, payload);
        toast.success("Hero banner updated successfully");
      } else {
        await axios.post("/api/admin/hero-banners", payload);
        toast.success("Hero banner created successfully");
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Error saving hero banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this hero banner deletion!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3c50e0",
      cancelButtonColor: "#f23030",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/admin/hero-banners/${id}`);
        toast.success("Hero banner deleted");
        setBanners((prev) => prev.filter((b) => b.id !== id));
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete hero banner");
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark">Hero Banners</h1>
          <p className="text-dark-4 text-sm mt-1">Manage promotional banners displayed on the homepage.</p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-blue hover:bg-blue-dark text-white font-bold py-2.5 px-5 rounded-lg text-sm transition-all shadow-sm"
        >
          Add New Banner
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table list */}
        <div className={`bg-white rounded-xl border border-gray-3 shadow-1 overflow-hidden ${isFormOpen ? "lg:col-span-2" : "lg:col-span-3"}`}>
          {isLoading ? (
            <div className="p-12 text-center text-dark-4">
              <svg className="animate-spin w-8 h-8 text-blue mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading hero banners...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-3 bg-gray-1 text-xs font-semibold text-dark-4 uppercase tracking-wider">
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Linked Product</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-3">
                  {banners.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-dark-4">
                        No hero banners found.
                      </td>
                    </tr>
                  ) : (
                    banners.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-1 transition-colors text-dark-2">
                        <td className="px-6 py-4">
                          <div className="relative w-20 h-10 bg-gray-1 border border-gray-3 rounded-lg overflow-hidden flex items-center justify-center">
                            {b.bannerImage ? (
                              <img src={b.bannerImage} alt={b.bannerName || ""} className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-[9px] text-gray-4">No Image</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-dark">{b.bannerName || <span className="text-dark-4">Unnamed</span>}</td>
                        <td className="px-6 py-4">{b.product?.title || <span className="text-red font-medium">Unlinked / Missing</span>}</td>
                        <td className="px-6 py-4 font-mono text-xs">{b.slug}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditForm(b)}
                              className="border border-gray-3 hover:border-blue text-dark-3 hover:text-blue py-1.5 px-3 rounded-lg text-xs font-semibold transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(b.id)}
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

        {/* Sidebar form */}
        {isFormOpen && (
          <div className="bg-white rounded-xl border border-gray-3 p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-3 pb-2.5">
              <h2 className="text-base font-semibold text-dark">
                {editingId ? "Edit Banner" : "Add Banner"}
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
                <label className="block text-xs font-semibold text-dark mb-1">Banner Name</label>
                <input
                  type="text"
                  value={bannerName}
                  onChange={(e) => setBannerName(e.target.value)}
                  className="w-full border border-gray-3 rounded-lg px-3 py-2 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="e.g. New Year Sale Banner"
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
                  placeholder="e.g. products-slug"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Link to Product *</label>
                <select
                  required
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full border border-gray-3 rounded-lg px-3 py-2 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue cursor-pointer"
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark mb-1.5">Banner Image *</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-10 bg-gray-1 border border-gray-3 rounded-lg flex items-center justify-center flex-shrink-0">
                    {bannerImage ? (
                      <img src={bannerImage} alt="Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-[8px] text-gray-4 text-center px-1">No Image</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    id="banner-image-file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  <label
                    htmlFor="banner-image-file"
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
                  {isSubmitting ? "Saving..." : "Save Banner"}
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
