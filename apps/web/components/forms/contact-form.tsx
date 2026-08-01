"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { contactMessageSchema } from "@ankita-portfolio/validation";
import { env } from "@/lib/env";

type ContactFormValues = z.infer<typeof contactMessageSchema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful }
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactMessageSchema) });

  async function onSubmit(values: ContactFormValues): Promise<void> {
    const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    if (!response.ok) {
      throw new Error("Contact request failed");
    }
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Name</span>
          <input className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" {...register("name")} />
          {errors.name ? <span className="mt-1 block text-sm text-red-600">{errors.name.message}</span> : null}
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</span>
          <input className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" {...register("email")} />
          {errors.email ? <span className="mt-1 block text-sm text-red-600">{errors.email.message}</span> : null}
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Subject</span>
        <input className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" {...register("subject")} />
        {errors.subject ? <span className="mt-1 block text-sm text-red-600">{errors.subject.message}</span> : null}
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Message</span>
        <textarea rows={6} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" {...register("message")} />
        {errors.message ? <span className="mt-1 block text-sm text-red-600">{errors.message.message}</span> : null}
      </label>
      {isSubmitSuccessful ? <p className="text-sm font-medium text-leaf">Message sent.</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded bg-aqua px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-5 w-5" aria-hidden />
        Send
      </button>
    </form>
  );
}
