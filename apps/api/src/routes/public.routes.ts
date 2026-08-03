import { Router } from "express";
import { Types } from "mongoose";
import { slugSchema } from "@ankita-portfolio/validation";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { contactRateLimit } from "../middleware/security.js";
import { streamMedia } from "../services/media.service.js";
import {
  getActiveResume,
  getPublicPortfolio,
  getPublicProject,
  submitContactMessage
} from "../services/portfolio.service.js";
import { AppError } from "../errors/appError.js";

export const publicRouter = Router();

publicRouter.get(
  "/portfolio",
  asyncHandler(async (_req, res) => {
    res.json(await getPublicPortfolio());
  }),
);

publicRouter.get(
  "/profile",
  asyncHandler(async (_req, res) => {
    const portfolio = await getPublicPortfolio();
    res.json({ profile: portfolio.profile });
  }),
);

publicRouter.get(
  "/experiences",
  asyncHandler(async (_req, res) => {
    const portfolio = await getPublicPortfolio();
    res.json({ items: portfolio.experiences });
  }),
);

publicRouter.get(
  "/education",
  asyncHandler(async (_req, res) => {
    const portfolio = await getPublicPortfolio();
    res.json({ items: portfolio.education });
  }),
);

publicRouter.get(
  "/training",
  asyncHandler(async (_req, res) => {
    const portfolio = await getPublicPortfolio();
    res.json({ items: portfolio.training });
  }),
);

publicRouter.get(
  "/skills",
  asyncHandler(async (_req, res) => {
    const portfolio = await getPublicPortfolio();
    res.json({
      categories: portfolio.skillCategories,
      skills: portfolio.skills,
      personalSkills: portfolio.personalSkills
    });
  }),
);

publicRouter.get(
  "/projects",
  asyncHandler(async (_req, res) => {
    const portfolio = await getPublicPortfolio();
    res.json({ items: portfolio.projects });
  }),
);

publicRouter.get(
  "/projects/:slug",
  asyncHandler(async (req, res) => {
    const slug = slugSchema.parse(req.params.slug);
    res.json({ project: await getPublicProject(slug) });
  }),
);

publicRouter.get(
  "/resume/active",
  asyncHandler(async (_req, res) => {
    res.json({ resume: await getActiveResume() });
  }),
);

publicRouter.get(
  "/resume/preview",
  asyncHandler(async (req, res) => {
    const resume = await getActiveResume();
    if (!resume) {
      throw new AppError(404, "RESUME_NOT_FOUND", "Active resume was not found");
    }
    await streamMedia(req, res, resume.mediaAssetId, { publicOnly: true, disposition: "inline" });
  }),
);

publicRouter.get(
  "/resume/download",
  asyncHandler(async (req, res) => {
    const resume = await getActiveResume();
    if (!resume) {
      throw new AppError(404, "RESUME_NOT_FOUND", "Active resume was not found");
    }
    await streamMedia(req, res, resume.mediaAssetId, { publicOnly: true, disposition: "attachment" });
  }),
);

publicRouter.get(
  "/media/:id/stream",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError(400, "INVALID_ID", "Media ID is required");
    }
    await streamMedia(req, res, id, { publicOnly: true, disposition: "inline" });
  }),
);

publicRouter.get(
  "/media/:id/download",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError(400, "INVALID_ID", "Media ID is required");
    }
    await streamMedia(req, res, id, { publicOnly: true, disposition: "attachment" });
  }),
);

publicRouter.post(
  "/contact",
  contactRateLimit,
  asyncHandler(async (req, res) => {
    const result = await submitContactMessage(req.body, req.ip, req.get("user-agent"));
    res.status(201).json(result);
  }),
);
