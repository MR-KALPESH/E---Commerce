"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate contact form submission
    setTimeout(() => {
      toast.success("Thank you! Your message has been sent successfully.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <main className="bg-gray-1 min-h-screen py-14">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-heading-4 font-bold text-dark mb-8 border-b border-gray-3 pb-4">
          Contact Us
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Details */}
          <div className="bg-white rounded-2xl border border-gray-3 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-dark border-b border-gray-3 pb-3">Get in Touch</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 bg-blue-light-5 rounded-xl flex items-center justify-center text-blue flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-dark-4 uppercase tracking-wider">Phone Support</h4>
                  <p className="text-sm font-semibold text-dark mt-0.5">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 bg-blue-light-5 rounded-xl flex items-center justify-center text-blue flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-dark-4 uppercase tracking-wider">Email Inquiry</h4>
                  <p className="text-sm font-semibold text-dark mt-0.5">support@cozycommerce.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 bg-blue-light-5 rounded-xl flex items-center justify-center text-blue flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-dark-4 uppercase tracking-wider">Office Address</h4>
                  <p className="text-sm font-semibold text-dark mt-0.5">123 Cozy Lane, Suite 400, NY</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-gray-3 p-6 lg:p-8 shadow-sm md:col-span-2">
            <h2 className="text-lg font-bold text-dark border-b border-gray-3 pb-3 mb-6">Send Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-3 rounded-lg px-3 py-2 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1">Your Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-3 rounded-lg px-3 py-2 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-3 rounded-lg px-3 py-2 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="Inquiry about product..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark mb-1">Message *</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full border border-gray-3 rounded-lg px-3 py-2 text-xs text-dark bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue hover:bg-blue-dark text-white font-bold py-2.5 px-6 rounded-lg text-xs transition-colors shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Submit Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
