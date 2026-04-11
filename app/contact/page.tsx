"use client";

import ThemedPageShell from '@/app/components/ThemedPageShell';
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
    <ThemedPageShell
      title="Get In Touch"
      subtitle="Have a question about TrackU? Reach out and our team will respond as soon as possible."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-[#d7e9e1] bg-white p-7 sm:p-8">
          <h2 className="text-lg font-bold text-[#1f2623] sm:text-xl">Contact Information</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[#55615d] sm:text-base">
            <p><strong>Email:</strong> divyanshjain883@gmail.com</p>
            <p><strong>Phone:</strong> +91 9761854883</p>
            <p><strong>Location:</strong> Bennett University, Greater Noida, Uttar Pradesh, India</p>
            <p><strong>Hours:</strong> Monday to Friday, 9:00 AM to 6:00 PM IST</p>
          </div>
          <p className="mt-6 rounded-xl bg-[#f5fbf8] px-4 py-3 text-xs text-[#6a7671] sm:text-sm">
            Typical response time is within 24 hours during business days.
          </p>
        </article>

        <article className="rounded-3xl border border-[#d7e9e1] bg-white p-7 sm:p-8">
          <h2 className="text-lg font-bold text-[#1f2623] sm:text-xl">Send us a message</h2>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full rounded-xl border border-[#d7e9e1] bg-[#f8fcfa] px-4 py-3 text-sm outline-none"
            />
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email"
              className="w-full rounded-xl border border-[#d7e9e1] bg-[#f8fcfa] px-4 py-3 text-sm outline-none"
            />
            <textarea
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="How can we help?"
              className="w-full rounded-xl border border-[#d7e9e1] bg-[#f8fcfa] px-4 py-3 text-sm outline-none"
            ></textarea>
            <button type="submit" className="rounded-lg bg-[#49c89f] px-5 py-3 text-sm font-semibold text-white">
              Send Message
            </button>
            {submitted ? <p className="text-sm font-medium text-[#2f8f71]">Message sent successfully.</p> : null}
          </form>
        </article>
      </div>
    </ThemedPageShell>
  );
}
