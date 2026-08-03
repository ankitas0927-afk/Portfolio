import { ContactForm } from '@/components/forms/contact-form';
import { SectionHeading } from '@/components/common/section-heading';
import { getPublicProfile } from '@/services/public';

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const profile = await getPublicProfile();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Contact"
        title="Get in touch"
        description="Public contact details come from MongoDB and can be updated safely from the private dashboard."
      />
      <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.28em] text-accent/70">Professional contact</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-foreground/72">
            {profile?.publicEmail ? <a href={`mailto:${profile.publicEmail}`}>{profile.publicEmail}</a> : null}
            {profile?.publicPhone ? <a href={`tel:${profile.publicPhone}`}>{profile.publicPhone}</a> : null}
            <p>{profile?.generalLocation ?? 'Lucknow, India'}</p>
          </div>
        </div>
        <div className="rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
