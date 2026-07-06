"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

interface Category {
  id: number;
  title: string;
}

interface Variant {
  image: string;
  color: string;
  size: string;
  isDefault: boolean;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [price, setPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sku, setSku] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [offersInput, setOffersInput] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Product Variants
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    // Load Product Data & Categories
    const loadData = async () => {
      try {
        const [catsRes, prodRes] = await Promise.all([
          axios.get("/api/admin/categories"),
          axios.get(`/api/admin/products/${id}`),
        ]);

        setCategories(catsRes.data.categories || []);

        const product = prodRes.data.product;
        if (product) {
          setTitle(product.title || "");
          setSlug(product.slug || "");
          setShortDescription(product.shortDescription || "");
          setDescription(product.description || "");
          setBody(product.body || "");
          setPrice(product.price?.toString() || "");
          setDiscountedPrice(product.discountedPrice?.toString() || "");
          setQuantity(product.quantity?.toString() || "0");
          setSku(product.sku || "");
          setTagsInput(product.tags?.join(", ") || "");
          setOffersInput(product.offers?.join(", ") || "");
          setCategoryId(product.categoryId?.toString() || "");
          setVariants(
            product.productVariants.map((v: any) => ({
              image: v.image,
              color: v.color,
              size: v.size,
              isDefault: v.isDefault,
            }))
          );
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setSlug(generatedSlug);
  };

  const handleImageUpload = async (index: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const uploadToast = toast.loading("Uploading image to Cloudinary...");

    try {
      const res = await axios.post("/api/cloudinary/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newVariants = [...variants];
      newVariants[index].image = res.data.url;
      setVariants(newVariants);
      toast.success("Image uploaded successfully!", { id: uploadToast });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image.", { id: uploadToast });
    }
  };

  const addVariant = () => {
    setVariants([...variants, { image: "", color: "", size: "", isDefault: variants.length === 0 }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length === 1) {
      toast.error("At least one variant is required");
      return;
    }
    const newVariants = variants.filter((_, idx) => idx !== index);
    if (variants[index].isDefault) {
      newVariants[0].isDefault = true;
    }
    setVariants(newVariants);
  };

  const updateVariantField = (index: number, field: keyof Variant, value: any) => {
    const newVariants = variants.map((v, idx) => {
      if (idx === index) {
        return { ...v, [field]: value };
      }
      if (field === "isDefault" && value === true) {
        return { ...v, isDefault: false };
      }
      return v;
    });
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !shortDescription || !price) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (variants.some((v) => !v.image)) {
      toast.error("All variants must have an image uploaded.");
      return;
    }

    setIsSaving(true);

    try {
      const productBody = {
        title,
        slug,
        shortDescription,
        description: description || null,
        body: body || null,
        price: parseFloat(price),
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
        quantity: parseInt(quantity || "0", 10),
        sku: sku || null,
        tags: tagsInput ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean) : [],
        offers: offersInput ? offersInput.split(",").map((o) => o.trim()).filter(Boolean) : [],
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        productVariants: variants,
      };

      await axios.put(`/api/admin/products/${id}`, productBody);
      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-dark-4">
        <svg className="animate-spin w-8 h-8 text-blue mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading product details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark">Edit Product</h1>
          <p className="text-dark-4 text-sm mt-1">Modify details for product &quot;{title}&quot;.</p>
        </div>
        <Link
          href="/admin/products"
          className="border border-gray-3 hover:border-blue hover:bg-white text-dark-3 hover:text-blue py-2 px-4 rounded-lg text-sm font-semibold transition-all"
        >
          Back to List
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-3 p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-semibold text-dark border-b border-gray-3 pb-2.5">
                Product Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">
                    Slug (URL identifier) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Main Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Inventory & Pricing */}
            <div className="bg-white rounded-xl border border-gray-3 p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-semibold text-dark border-b border-gray-3 pb-2.5">
                Pricing & Inventory
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">
                    Original Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">Discounted Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(e.target.value)}
                    className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">
                    Inventory Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">SKU Reference</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Product Variants */}
            <div className="bg-white rounded-xl border border-gray-3 p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-3 pb-2.5">
                <div>
                  <h2 className="text-base font-semibold text-dark">Product Variants</h2>
                  <p className="text-xs text-dark-4 mt-0.5">
                    To add multiple views (like <strong>Front View</strong>, <strong>Back View</strong>, <strong>Side View</strong>, or <strong>Zoom View</strong>), click <strong>+ Add Variant</strong> and type the view name in the <strong>Color</strong> or <strong>Size</strong> field.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="text-xs font-semibold text-blue hover:text-blue-dark transition-colors flex-shrink-0 ml-4"
                >
                  + Add Variant
                </button>
              </div>

              <div className="space-y-4 divide-y divide-gray-3 pt-2">
                {variants.map((variant, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-4 first:pt-0">
                    {/* Image preview & upload */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="relative w-14 h-14 bg-gray-1 border border-gray-3 rounded-lg flex items-center justify-center flex-shrink-0">
                        {variant.image ? (
                          <img src={variant.image} alt="Preview" className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="text-[10px] text-gray-4 text-center px-1">No Image</span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        id={`variant-upload-${idx}`}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(idx, file);
                        }}
                      />
                      <label
                        htmlFor={`variant-upload-${idx}`}
                        className="border border-gray-3 hover:border-blue text-dark-3 hover:text-blue py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Upload
                      </label>
                    </div>

                    {/* Color */}
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) => updateVariantField(idx, "color", e.target.value)}
                        className="w-full border border-gray-3 rounded-lg px-3 py-1.5 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                        placeholder="Color"
                      />
                    </div>

                    {/* Size */}
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => updateVariantField(idx, "size", e.target.value)}
                        className="w-full border border-gray-3 rounded-lg px-3 py-1.5 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                        placeholder="Size"
                      />
                    </div>

                    {/* Defaults & Remove */}
                    <div className="col-span-2 flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-dark-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={variant.isDefault}
                          onChange={(e) => updateVariantField(idx, "isDefault", e.target.checked)}
                          className="rounded border-gray-3 text-blue focus:ring-blue"
                        />
                        Default
                      </label>
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          {/* Categorization (moved to full width under variants) */}
          <div className="bg-white rounded-xl border border-gray-3 p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-semibold text-dark border-b border-gray-3 pb-2.5">
              Categorization
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border border-gray-3 rounded-lg px-3 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                  placeholder="e.g. gaming, accessories, console"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Offers (Comma-separated)</label>
              <input
                type="text"
                value={offersInput}
                onChange={(e) => setOffersInput(e.target.value)}
                className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
                placeholder="e.g. Free Shipping, 10% instant discount"
              />
            </div>
          </div>

          {/* Actions at the very bottom (side-by-side Save & Cancel buttons) */}
          <div className="flex gap-4 items-center justify-end pt-6 border-t border-gray-3">
            <Link
              href="/admin/products"
              className="border border-gray-3 hover:bg-gray-1 text-dark-3 py-2.5 px-6 rounded-lg font-bold transition-all text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center bg-blue hover:bg-blue-dark text-white font-bold py-2.5 px-8 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving Changes...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
