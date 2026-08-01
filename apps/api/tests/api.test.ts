import "./testEnv";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { Profile, Project } from "../src/models/content";
import { createInitialAdmin } from "../src/services/auth.service";

const app = createApp();

async function login(): Promise<{ token: string; cookie: string }> {
  await createInitialAdmin();
  const response = await request(app).post("/api/v1/auth/login").send({
    email: "admin@example.com",
    password: "StrongPassword123!"
  });
  const cookies = response.headers["set-cookie"];
  const cookie = Array.isArray(cookies) ? cookies[0] : String(cookies);
  return { token: String(response.body.accessToken), cookie };
}

describe("API", () => {
  it("returns health status", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  it("rejects invalid admin login", async () => {
    await createInitialAdmin();
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "admin@example.com",
      password: "wrong-password"
    });
    expect(response.status).toBe(401);
  });

  it("protects administrator routes and allows login", async () => {
    const unauthenticated = await request(app).get("/api/v1/admin/dashboard");
    expect(unauthenticated.status).toBe(401);

    const { token } = await login();
    const authenticated = await request(app).get("/api/v1/admin/dashboard").set("Authorization", `Bearer ${token}`);
    expect(authenticated.status).toBe(200);
    expect(authenticated.body).toHaveProperty("projects");
  });

  it("filters private profile fields from public responses", async () => {
    await Profile.create({
      name: "Ankita Singh",
      heading: "Research Analyst",
      rotatingTitles: ["Research Analyst"],
      heroIntroduction: "Quality-focused pharmaceutical research professional.",
      professionalBiography: "Professional biography for public viewing.",
      careerObjective: "Career objective for public viewing.",
      professionalSummary: "Professional summary for public viewing.",
      availabilityStatus: "Available",
      preferredEmploymentArea: "Pharmaceutical research",
      currentLocation: "Lucknow, India",
      keyStrengths: ["Time management"],
      publicProfessionalEmail: "public@example.com",
      privateAccountEmail: "private@example.com",
      fullPrivateAddress: "Private address",
      dateOfBirth: "2000-01-01",
      parentOrGuardian: "Private parent",
      city: "Lucknow",
      country: "India",
      visibility: {
        publicProfessionalEmail: true,
        city: true,
        country: true,
        fullPrivateAddress: false,
        dateOfBirth: false,
        parentOrGuardian: false
      },
      status: "published"
    });

    const response = await request(app).get("/api/v1/profile");
    expect(response.status).toBe(200);
    expect(response.body.profile.publicProfessionalEmail).toBe("public@example.com");
    expect(JSON.stringify(response.body)).not.toContain("private@example.com");
    expect(JSON.stringify(response.body)).not.toContain("Private address");
    expect(JSON.stringify(response.body)).not.toContain("Private parent");
  });

  it("persists profile media fields and syncs brand assets from the profile image", async () => {
    const { token } = await login();
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
      "base64",
    );
    const upload = await request(app)
      .post("/api/v1/admin/media/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", png, { filename: "profile.png", contentType: "image/png" })
      .field("bucketName", "profileImages")
      .field("category", "profile")
      .field("isPublic", "true");

    expect(upload.status, JSON.stringify(upload.body)).toBe(201);
    const assetId = String(upload.body.assets[0].id);

    const profileSave = await request(app)
      .patch("/api/v1/admin/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Ankita Singh",
        heading: "Research Analyst",
        rotatingTitles: ["Research Analyst"],
        heroIntroduction: "Quality-focused pharmaceutical research professional.",
        professionalBiography: "Professional biography for public viewing.",
        careerObjective: "Career objective for public viewing.",
        professionalSummary: "Professional summary for public viewing.",
        keyStrengths: ["Time management"],
        profileImage: assetId,
        status: "published"
      });

    expect(profileSave.status, JSON.stringify(profileSave.body)).toBe(200);

    const response = await request(app).get("/api/v1/profile");
    expect(response.status).toBe(200);
    expect(response.body.profile.profileImage.id).toBe(assetId);
    expect(response.body.profile.logo.id).toBe(assetId);
    expect(response.body.profile.favicon.id).toBe(assetId);
    expect(response.body.profile.aboutImage.id).toBe(assetId);
    expect(response.body.profile.heroImage.id).toBe(assetId);
    expect(response.body.profile.openGraphImage.id).toBe(assetId);
  });

  it("keeps draft projects hidden publicly", async () => {
    await Project.create({
      title: "Draft Project",
      slug: "draft-project",
      shortDescription: "This draft project should not appear publicly.",
      datePrecision: "duration",
      toolsAndTechnologies: [],
      objectives: [],
      responsibilities: [],
      mainFeatures: [],
      challenges: [],
      solutions: [],
      outcomes: [],
      learningOutcomes: [],
      status: "draft",
      displayOrder: 1
    });
    const response = await request(app).get("/api/v1/projects");
    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(0);
  });

  it("stores contact messages", async () => {
    const response = await request(app).post("/api/v1/contact").send({
      name: "Visitor",
      email: "visitor@example.com",
      subject: "Portfolio enquiry",
      message: "I would like to contact Ankita about a professional opportunity."
    });
    expect(response.status).toBe(201);
    expect(response.body.status).toBe("unread");
  });

  it("uploads and streams a resume PDF from GridFS", async () => {
    const { token } = await login();
    const pdf = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF");
    const upload = await request(app)
      .post("/api/v1/admin/resumes")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", pdf, { filename: "resume.pdf", contentType: "application/pdf" })
      .field("title", "Test Resume")
      .field("status", "published")
      .field("isActive", "true");

    expect(upload.status, JSON.stringify(upload.body)).toBe(201);

    const preview = await request(app).get("/api/v1/resume/preview");
    expect(preview.status, JSON.stringify(preview.body)).toBe(200);
    expect(preview.headers["content-type"]).toContain("application/pdf");
  });

  it("uploads image variants to GridFS", async () => {
    const { token } = await login();
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
      "base64",
    );
    const response = await request(app)
      .post("/api/v1/admin/media/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", png, { filename: "profile.png", contentType: "image/png" })
      .field("bucketName", "profileImages")
      .field("category", "profile")
      .field("isPublic", "true");
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(response.body.assets.length).toBeGreaterThan(1);
  });
});
