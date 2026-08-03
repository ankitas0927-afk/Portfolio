'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, SendHorizonal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { webEnv } from '@/lib/env';
import { cn } from '@/lib/utils';

const contactFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your name'),
  email: z.string().trim().email('Please enter a valid email address'),
  company: z.string().trim().optional(),
  subject: z.string().trim().min(2, 'Please enter a subject'),
  message: z.string().trim().min(10, 'Please enter a longer message'),
  phone: z.string().trim().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const inputClassName =
  'w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent';

export function ContactForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      company: '',
      subject: '',
      message: '',
      phone: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await fetch(`${webEnv.browserApiBaseUrl}/public/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
 
      if (!response.ok) {
        throw new Error('Unable to send the message right now.');
      }
 
      form.reset();
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    }
  });
 
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground/74" htmlFor="fullName">
            Full name
          </label>
          <input id="fullName" className={inputClassName} {...form.register('fullName')} />
          <p className="mt-2 text-xs text-rose-500">{form.formState.errors.fullName?.message}</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground/74" htmlFor="email">
            Email
          </label>
          <input id="email" type="email" className={inputClassName} {...form.register('email')} />
          <p className="mt-2 text-xs text-rose-500">{form.formState.errors.email?.message}</p>
        </div>
      </div>
 
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground/74" htmlFor="company">
            Company
          </label>
          <input id="company" className={inputClassName} {...form.register('company')} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground/74" htmlFor="phone">
            Phone
          </label>
          <input id="phone" className={inputClassName} {...form.register('phone')} />
          <p className="mt-2 text-xs text-rose-500">{form.formState.errors.phone?.message}</p>
        </div>
      </div>
 
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground/74" htmlFor="subject">
          Subject
        </label>
        <input id="subject" className={inputClassName} {...form.register('subject')} />
        <p className="mt-2 text-xs text-rose-500">{form.formState.errors.subject?.message}</p>
      </div>
 
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground/74" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          rows={6}
          className={cn(inputClassName, 'resize-y')}
          {...form.register('message')}
        />
        <p className="mt-2 text-xs text-rose-500">{form.formState.errors.message?.message}</p>
      </div>
 
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {form.formState.isSubmitting ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <SendHorizonal className="h-4 w-4" />
        )}
        Send Message
      </button>
    </form>
  );
}
