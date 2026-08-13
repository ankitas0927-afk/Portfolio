'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, SendHorizonal } from 'lucide-react';
import type { ReactNode } from 'react';
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

const inputClassName = 'glass-input text-sm';

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

  const messageValue = form.watch('message');
  const messageLength = messageValue?.length ?? 0;

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
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <FieldBlock
          id="fullName"
          label="Full name"
          error={form.formState.errors.fullName?.message}
          hint="Enter the name you would like used in reply."
        >
          <input
            id="fullName"
            placeholder="Your full name"
            className={inputClassName}
            aria-invalid={Boolean(form.formState.errors.fullName)}
            {...form.register('fullName')}
          />
        </FieldBlock>

        <FieldBlock
          id="email"
          label="Email"
          error={form.formState.errors.email?.message}
          hint="A response will be sent to this address."
        >
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            className={inputClassName}
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register('email')}
          />
        </FieldBlock>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldBlock id="company" label="Company" hint="Optional.">
          <input
            id="company"
            placeholder="Organization or institute"
            className={inputClassName}
            {...form.register('company')}
          />
        </FieldBlock>

        <FieldBlock id="phone" label="Phone" error={form.formState.errors.phone?.message} hint="Optional.">
          <input
            id="phone"
            placeholder="+91 ..."
            className={inputClassName}
            aria-invalid={Boolean(form.formState.errors.phone)}
            {...form.register('phone')}
          />
        </FieldBlock>
      </div>

      <FieldBlock
        id="subject"
        label="Subject"
        error={form.formState.errors.subject?.message}
        hint="Keep the subject short and specific."
      >
        <input
          id="subject"
          placeholder="How can we collaborate?"
          className={inputClassName}
          aria-invalid={Boolean(form.formState.errors.subject)}
          {...form.register('subject')}
        />
      </FieldBlock>

      <FieldBlock
        id="message"
        label="Message"
        error={form.formState.errors.message?.message}
        hint="Include the purpose of your message and any helpful context."
        trailing={`${messageLength} characters`}
      >
        <textarea
          id="message"
          rows={7}
          placeholder="Write your message with enough context to make a thoughtful reply easier."
          className={cn(inputClassName, 'min-h-[11rem] resize-y')}
          aria-invalid={Boolean(form.formState.errors.message)}
          {...form.register('message')}
        />
      </FieldBlock>

      <div className="flex flex-col gap-4 border-t border-border/50 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm leading-7 text-foreground/66">
          Professional enquiries are reviewed carefully and answered as appropriate.
        </div>

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="gradient-button w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-70"
        >
          {form.formState.isSubmitting ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizonal className="h-4 w-4" />
          )}
          Send Message
        </button>
      </div>
    </form>
  );
}

function FieldBlock({
  id,
  label,
  hint,
  error,
  trailing,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  trailing?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="block text-sm font-medium text-foreground/82" htmlFor={id}>
          {label}
        </label>
        {trailing ? <span className="text-xs uppercase tracking-[0.2em] text-foreground/45">{trailing}</span> : null}
      </div>
      {children}
      {hint ? <p className="mt-2 text-xs leading-6 text-foreground/48">{hint}</p> : null}
      <p className="mt-2 min-h-[1rem] text-xs text-rose-500">{error ?? ''}</p>
    </div>
  );
}
