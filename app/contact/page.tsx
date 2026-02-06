"use client";

import Link from "next/link";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    setSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        phone: "",
        organization: "",
        message: "",
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-b from-indigo-950 via-black to-purple-950"></div>
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => {
            const size = Math.random() * 2;
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const opacity = Math.random() * 0.7 + 0.3;
            const duration = Math.random() * 3 + 2;
            return (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${left}%`,
                  top: `${top}%`,
                  opacity: opacity,
                  animation: `twinkle ${duration}s infinite`
                }}
              ></div>
            );
          })}
        </div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-3000"></div>
      </div>
      <div className="relative z-10">
      {/* Navigation */}
      <nav className="bg-slate-900/50 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <img
              src="/image2.png"
              alt="TrackU Logo"
              className="w-14 h-14 rounded-lg"
            />
            <div className="hidden md:flex gap-8">
              <Link href="/" className="text-gray-300 hover:text-white transition">
                Home
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition">
                About
              </Link>
              <Link href="/company" className="text-gray-300 hover:text-white transition">
                Company
              </Link>
              <Link href="/blog" className="text-gray-300 hover:text-white transition">
                Blog
              </Link>
              <Link href="/contact" className="text-white border-b-2 border-purple-500">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Get In Touch</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Have questions about TrackU? We'd love to hear from you. Get in touch with our team today.
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-12 mb-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="text-3xl text-purple-400 shrink-0">📧</div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Email</h4>
                    <a href="mailto:divyanshjain883@gmail.com" className="text-gray-300 hover:text-purple-400 transition">
                      divyanshjain883@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-3xl text-blue-400 shrink-0">📱</div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Phone</h4>
                    <a href="tel:+919761854883" className="text-gray-300 hover:text-blue-400 transition">
                      +91 9761854883
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-3xl text-green-400 shrink-0">📍</div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Address</h4>
                    <p className="text-gray-300">
                      Bennett University<br />
                      Greater Noida, Uttar Pradesh<br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-3xl text-pink-400 shrink-0">🕐</div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Business Hours</h4>
                    <p className="text-gray-300">
                      Monday - Friday: 9:00 AM - 6:00 PM IST<br />
                      Saturday - Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Response Time</h3>
              <p className="text-gray-300 mb-4">
                We typically respond to inquiries within 24 hours during business days.
              </p>
              <p className="text-gray-400 text-sm">
                For urgent support, please call our hotline during business hours.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-bold text-white mb-2">How do I get started?</h4>
              <p className="text-gray-300">Simply register as a club leader and start tracking your members immediately. It takes less than 5 minutes.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Is my data secure?</h4>
              <p className="text-gray-300">Yes, we use enterprise-grade encryption and follow industry best practices to protect your data.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Do you offer support?</h4>
              <p className="text-gray-300">Absolutely! Our support team is available via email and phone during business hours.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">What is the pricing?</h4>
              <p className="text-gray-300">Visit our pricing page to see plans that fit your organization's needs.</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
