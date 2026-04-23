"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReviewForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    comment: "",
    designation: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch("http://localhost:3000/contact/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rating }),
      });
      setSubmitted(true);
      setForm({ name: "", email: "", comment: "", designation: "" });
      setRating(5);
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full  flex items-center justify-center mx-auto mb-6">
          <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
        </div>
        <h3 className="text-2xl font-semibold text-zinc-900 mb-3">Thank You</h3>
        <p className="text-zinc-500 max-w-md mx-auto mb-8">Your feedback helps us improve. We appreciate you taking the time to share your experience.</p>
        <button onClick={() => setSubmitted(false)} className="text-sm font-medium text-zinc-700 underline underline-offset-4">Leave another review</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Stars */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-3">Your rating</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star className={cn("w-7 h-7 transition-colors", (hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-zinc-300")} />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Your name</label>
          <Input name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" required className="bg-zinc-50 border-zinc-200 rounded-xl h-12" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">Email</label>
          <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@company.com" required className="bg-zinc-50 border-zinc-200 rounded-xl h-12" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">Title / Company (optional)</label>
        <Input name="designation" value={form.designation} onChange={handleChange} placeholder="CTO, Acme Inc." className="bg-zinc-50 border-zinc-200 rounded-xl h-12" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">Your experience</label>
        <Textarea name="comment" value={form.comment} onChange={handleChange} placeholder="Tell us what you liked, what could be improved..." required className="bg-zinc-50 border-zinc-200 rounded-xl min-h-[120px]" />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full bg-zinc-900 text-white rounded-xl h-12 text-base font-semibold">
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
