"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AnimatedButton from "./animated-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TECH_ISSUES = [
  "Login / Authentication Failure",
  "Payment Processing Error",
  "Dashboard Not Loading",
  "API Connection Timeout",
  "Data Synchronization Issue",
  "Mobile App Crash",
  "Performance / Slow Loading",
  "Other Technical Bug",
];

export function ReportCase() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    techIssue: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch("http://localhost:3000/contact/case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
      setForm({ firstName: "", lastName: "", email: "", techIssue: "", message: "" });
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center shadow-sm">
        <div className="w-20 h-20 bg-red-50 rounded-full  flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 mb-2">Case Submitted</h3>
        <p className="text-zinc-500 max-w-xs mx-auto mb-8">Reference ID: #CASE-{Math.floor(Math.random() * 10000)}</p>
        <button onClick={() => setSubmitted(false)} className="text-sm font-semibold text-zinc-900 hover:underline">Report another issue</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
             <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">First Name</label>
             <Input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Jane" required className="bg-zinc-50 border-transparent focus:border-red-200 rounded-2xl h-14 px-5 text-base" />
          </div>
          <div className="space-y-2">
             <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">Last Name</label>
             <Input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" required className="bg-zinc-50 border-transparent focus:border-red-200 rounded-2xl h-14 px-5 text-base" />
          </div>
        </div>
        
        <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">Email</label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@company.com" required className="bg-zinc-50 border-transparent focus:border-red-200 rounded-2xl h-14 px-5 text-base" />
        </div>

        <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">Issue Type</label>
            <Select onValueChange={(val) => setForm({ ...form, techIssue: val })}>
            <SelectTrigger className="bg-zinc-50 border-transparent focus:border-red-200 rounded-2xl h-14 px-5 text-base">
                <SelectValue placeholder="Select issue type..." />
            </SelectTrigger>
            <SelectContent className="bg-white border-zinc-100 rounded-xl">
                {TECH_ISSUES.map((issue) => (
                <SelectItem key={issue} value={issue} className="py-3 px-4 focus:bg-red-50">{issue}</SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">Details</label>
            <Textarea name="message" value={form.message} onChange={handleChange} placeholder="Describe the bug..." required className="bg-zinc-50 border-transparent focus:border-red-200 rounded-2xl min-h-[160px] p-5 text-base resize-none" />
        </div>

        <div className="pt-2">
            <AnimatedButton 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-red-600 hover:bg-red-700 hover:text-white border-transparent"
                variant="dark"
            >
                {isSubmitting ? "Submitting..." : "Submit Case"}
            </AnimatedButton>
        </div>
      </form>
    </div>
  );
}
