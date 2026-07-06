"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface Review {
  id: number;
  name: string;
  email: string;
  comment: string;
  ratings: number;
  isApproved: boolean;
  productSlug: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await axios.get("/api/admin/reviews");
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApproveToggle = async (id: number, currentApproved: boolean) => {
    try {
      await axios.put(`/api/admin/reviews/${id}`, {
        isApproved: !currentApproved,
      });
      toast.success(currentApproved ? "Review unapproved!" : "Review approved!");
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isApproved: !currentApproved } : r))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this review deletion!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3c50e0",
      cancelButtonColor: "#f23030",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/admin/reviews/${id}`);
        toast.success("Review deleted successfully");
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete review");
      }
    }
  };

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-0.5 text-yellow">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-base">
            {i < count ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">Reviews</h1>
        <p className="text-dark-4 text-sm mt-1">Approve or moderate customer product reviews.</p>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-3 shadow-1 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-dark-4">
            <svg className="animate-spin w-8 h-8 text-blue mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading reviews...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-3 bg-gray-1 text-xs font-semibold text-dark-4 uppercase tracking-wider">
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Comment</th>
                  <th className="px-6 py-4">Product Link</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-dark-4">
                      No reviews found.
                    </td>
                  </tr>
                ) : (
                  reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-1 transition-colors text-dark-2">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-dark block">{r.name}</span>
                        <span className="text-xs text-dark-4">{r.email}</span>
                      </td>
                      <td className="px-6 py-4">{renderStars(r.ratings)}</td>
                      <td className="px-6 py-4 max-w-sm truncate" title={r.comment}>
                        {r.comment}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-blue hover:underline">
                        <a href={`/products/${r.productSlug}`} target="_blank" rel="noopener noreferrer">
                          {r.productSlug}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        {r.isApproved ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-light-6 text-green-dark">
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-light-2 text-yellow-dark-2">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApproveToggle(r.id, r.isApproved)}
                            className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                              r.isApproved
                                ? "border-gray-3 hover:border-yellow-dark-2 text-dark-3 hover:text-yellow-dark-2 hover:bg-yellow-light-4"
                                : "border-gray-3 hover:border-green-dark text-dark-3 hover:text-green-dark hover:bg-green-light-6"
                            }`}
                          >
                            {r.isApproved ? "Unapprove" : "Approve"}
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
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
    </div>
  );
}
