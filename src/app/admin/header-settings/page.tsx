"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function AdminHeaderSettingsPage() {
  const [headerLogo, setHeaderLogo] = useState("");
  const [emailLogo, setEmailLogo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    axios
      .get("/api/admin/header-settings")
      .then((res) => {
        const settings = res.data.settings;
        if (settings) {
          setHeaderLogo(settings.headerLogo || "");
          setEmailLogo(settings.emailLogo || "");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load header settings");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleImageUpload = async (field: "header" | "email", file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const uploadToast = toast.loading(`Uploading ${field} logo...`);

    try {
      const res = await axios.post("/api/cloudinary/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (field === "header") {
        setHeaderLogo(res.data.url);
      } else {
        setEmailLogo(res.data.url);
      }
      toast.success("Logo uploaded!", { id: uploadToast });
    } catch (err) {
      console.error(err);
      toast.error("Upload failed", { id: uploadToast });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await axios.post("/api/admin/header-settings", {
        headerLogo,
        emailLogo,
      });
      toast.success("Header logo settings saved successfully!");
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
        Loading header configuration...
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Header Settings</h1>
        <p className="text-dark-4 text-sm mt-1">Configure global branding assets for the store layout and transactional emails.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-3 p-6 lg:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Logo */}
          <div className="border-b border-gray-3 pb-6">
            <label className="block text-sm font-semibold text-dark mb-3">Store Header Logo</label>
            <div className="flex items-center gap-6">
              <div className="relative w-44 h-16 bg-gray-1 border border-gray-3 rounded-lg overflow-hidden flex items-center justify-center p-2 flex-shrink-0">
                {headerLogo ? (
                  <img src={headerLogo} alt="Store Header Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-4">No logo configured</span>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="header-logo-file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload("header", file);
                  }}
                />
                <label
                  htmlFor="header-logo-file"
                  className="border border-gray-3 hover:border-blue text-dark-3 hover:text-blue py-2 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                >
                  Upload New Header Logo
                </label>
                <p className="text-xs text-dark-4 mt-2">Recommended size: 180x50px, transparent background PNG or SVG.</p>
              </div>
            </div>
          </div>

          {/* Email Logo */}
          <div className="pb-4">
            <label className="block text-sm font-semibold text-dark mb-3">Transactional Email Logo</label>
            <div className="flex items-center gap-6">
              <div className="relative w-44 h-16 bg-gray-1 border border-gray-3 rounded-lg overflow-hidden flex items-center justify-center p-2 flex-shrink-0">
                {emailLogo ? (
                  <img src={emailLogo} alt="Transactional Email Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-4">No logo configured</span>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="email-logo-file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload("email", file);
                  }}
                />
                <label
                  htmlFor="email-logo-file"
                  className="border border-gray-3 hover:border-blue text-dark-3 hover:text-blue py-2 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                >
                  Upload New Email Logo
                </label>
                <p className="text-xs text-dark-4 mt-2">Used in transactional order confirmations. Recommended size: 200x50px.</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue hover:bg-blue-dark text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? "Saving Configuration..." : "Save Branding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
