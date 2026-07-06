"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function AdminSeoSettingsPage() {
  const [siteName, setSiteName] = useState("");
  const [metadescription, setMetadescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    axios
      .get("/api/admin/seo-settings")
      .then((res) => {
        const settings = res.data.settings;
        if (settings) {
          setSiteName(settings.siteName || "");
          setMetadescription(settings.metadescription || "");
          setMetaKeywords(settings.metaKeywords || "");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load SEO settings");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await axios.post("/api/admin/seo-settings", {
        siteName,
        metadescription,
        metaKeywords,
      });
      toast.success("SEO settings saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-dark-4">
        <svg className="animate-spin w-8 h-8 text-blue mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading SEO configuration...
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">SEO Settings</h1>
        <p className="text-dark-4 text-sm mt-1">Configure global search engine optimization defaults.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-3 p-6 lg:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Site Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
              placeholder="e.g. CozyCommerce Store"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Meta Description</label>
            <textarea
              value={metadescription}
              onChange={(e) => setMetadescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
              placeholder="Provide a description of your ecommerce shop for search engines..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Meta Keywords (Comma-separated)</label>
            <input
              type="text"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              className="w-full border border-gray-3 rounded-lg px-4 py-2.5 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all"
              placeholder="e.g. shop, cosmetics, clothes, cozycommerce"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue hover:bg-blue-dark text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? "Saving Configuration..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
