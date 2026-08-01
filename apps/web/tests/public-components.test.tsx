import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HeroSection } from "@/components/portfolio/hero-section";
import { ContactForm } from "@/components/forms/contact-form";
import type { ProfileDto } from "@ankita-portfolio/shared-types";

const profile: ProfileDto = {
  id: "profile-id",
  name: "Ankita Singh",
  heading: "Research Analyst",
  rotatingTitles: ["Research Analyst", "Pharmacy Graduate"],
  heroIntroduction: "Quality-focused pharmaceutical research professional.",
  professionalBiography: "Professional biography.",
  careerObjective: "Career objective.",
  professionalSummary: "Professional summary.",
  availabilityStatus: "Available",
  preferredEmploymentArea: "Pharmaceutical research",
  currentLocation: "Lucknow, India",
  keyStrengths: ["Time management"],
  city: "Lucknow",
  country: "India",
  status: "published"
};

describe("public components", () => {
  it("renders hero content from API-shaped data", () => {
    render(<HeroSection profile={profile} resume={null} />);
    expect(screen.getByRole("heading", { name: "Ankita Singh" })).toBeInTheDocument();
    expect(screen.getAllByText("Research Analyst").length).toBeGreaterThan(0);
    expect(screen.getByText("Quality-focused pharmaceutical research professional.")).toBeInTheDocument();
  });

  it("submits the contact form", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<ContactForm />);
    await user.type(screen.getByLabelText("Name"), "Visitor");
    await user.type(screen.getByLabelText("Email"), "visitor@example.com");
    await user.type(screen.getByLabelText("Subject"), "Professional opportunity");
    await user.type(screen.getByLabelText("Message"), "I would like to discuss a professional opportunity.");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(await screen.findByText("Message sent.")).toBeInTheDocument();
  });
});
