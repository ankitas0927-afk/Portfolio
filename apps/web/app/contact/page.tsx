import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { Section } from "@/components/common/section";
import { ContactForm } from "@/components/forms/contact-form";
import { fetchPortfolio } from "@/services/portfolio";
import { compact } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Ankita Singh."
};

export default async function ContactPage() {
  const portfolio = await fetchPortfolio();
  const profile = portfolio?.profile;
  const footer = portfolio?.footer;
  const location = footer?.contactLocation || (profile ? profile.currentLocation || compact([profile.city, profile.state, profile.country]).join(", ") : "");
  const email = footer?.contactEmail || profile?.publicProfessionalEmail;
  const phone = footer?.contactPhone || profile?.publicTelephoneNumber;

  return (
    <Section title="Contact" eyebrow="Message" description="Use the contact form for professional enquiries.">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4 rounded border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          {email ? (
            <a className="flex items-center gap-3 text-slate-700 transition-colors duration-200 hover:text-aqua dark:text-slate-200" href={`mailto:${email}`}>
              <Mail className="h-5 w-5 text-aqua" aria-hidden />
              {email}
            </a>
          ) : null}
          {phone ? (
            <a
              className="flex items-center gap-3 text-slate-700 transition-colors duration-200 hover:text-aqua dark:text-slate-200"
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            >
              <Phone className="h-5 w-5 text-aqua" aria-hidden />
              {phone}
            </a>
          ) : null}
          {location ? (
            <p className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
              <MapPin className="h-5 w-5 text-aqua" aria-hidden />
              {location}
            </p>
          ) : null}
        </div>
        <ContactForm />
      </div>
    </Section>
  );
}
