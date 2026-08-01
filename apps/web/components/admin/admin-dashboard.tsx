"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  BarChart3,
  Check,
  Database,
  FileText,
  ImageUp,
  Loader2,
  LogOut,
  MessageSquare,
  Pencil,
  Plus,
  Save,
  Share2,
  Trash2,
  Upload
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { FooterSettingsDto, ProfileDto } from "@ankita-portfolio/shared-types";
import { adminApi, type ListResponse } from "@/services/admin-api";
import { useAuth } from "@/providers/auth-provider";
import { cn, compact } from "@/lib/utils";

type FieldType = "text" | "textarea" | "array" | "checkbox" | "number" | "select";

type FieldDefinition = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
};

type ResourceDefinition = {
  endpoint: string;
  label: string;
  fields: FieldDefinition[];
};

type FooterFormState = {
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  website: string;
  github: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  x: string;
  youtube: string;
};

const statusOptions = ["draft", "published", "archived"];
const datePrecisionOptions = ["exact", "month", "year", "duration"];
const proficiencyOptions = ["", "beginner", "familiar", "intermediate", "advanced", "expert"];
const resumeFileAccept =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const emptyFooterState: FooterFormState = {
  contactEmail: "",
  contactPhone: "",
  contactLocation: "",
  website: "",
  github: "",
  linkedin: "",
  instagram: "",
  facebook: "",
  x: "",
  youtube: ""
};

function footerStateFromSettings(settings: FooterSettingsDto | null | undefined): FooterFormState {
  return {
    contactEmail: settings?.contactEmail ?? "",
    contactPhone: settings?.contactPhone ?? "",
    contactLocation: settings?.contactLocation ?? "",
    website: settings?.socialLinks.website ?? "",
    github: settings?.socialLinks.github ?? "",
    linkedin: settings?.socialLinks.linkedin ?? "",
    instagram: settings?.socialLinks.instagram ?? "",
    facebook: settings?.socialLinks.facebook ?? "",
    x: settings?.socialLinks.x ?? "",
    youtube: settings?.socialLinks.youtube ?? ""
  };
}

function footerStateFromProfile(profile: ProfileDto | null | undefined): FooterFormState {
  return {
    contactEmail: profile?.publicProfessionalEmail ?? "",
    contactPhone: profile?.publicTelephoneNumber ?? "",
    contactLocation: profile ? profile.currentLocation || compact([profile.city, profile.state, profile.country]).join(", ") : "",
    website: "",
    github: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    x: "",
    youtube: ""
  };
}

function footerStateFromSources(
  settings: FooterSettingsDto | null | undefined,
  profile: ProfileDto | null | undefined,
): FooterFormState {
  const profileState = footerStateFromProfile(profile);
  const settingsState = footerStateFromSettings(settings);
  return {
    contactEmail: settingsState.contactEmail || profileState.contactEmail,
    contactPhone: settingsState.contactPhone || profileState.contactPhone,
    contactLocation: settingsState.contactLocation || profileState.contactLocation,
    website: settingsState.website,
    github: settingsState.github,
    linkedin: settingsState.linkedin,
    instagram: settingsState.instagram,
    facebook: settingsState.facebook,
    x: settingsState.x,
    youtube: settingsState.youtube
  };
}

function footerPayloadFromState(state: FooterFormState): FooterSettingsDto {
  return {
    contactEmail: state.contactEmail.trim() || undefined,
    contactPhone: state.contactPhone.trim() || undefined,
    contactLocation: state.contactLocation.trim() || undefined,
    socialLinks: {
      website: state.website.trim() || undefined,
      github: state.github.trim() || undefined,
      linkedin: state.linkedin.trim() || undefined,
      instagram: state.instagram.trim() || undefined,
      facebook: state.facebook.trim() || undefined,
      x: state.x.trim() || undefined,
      youtube: state.youtube.trim() || undefined
    }
  };
}

function acceptForBucket(bucketName: string): string {
  if (bucketName === "resumes" || bucketName === "documents") {
    return resumeFileAccept;
  }
  if (bucketName === "certificates") {
    return `${resumeFileAccept},image/*`;
  }
  return "image/*";
}

const resourceDefinitions: ResourceDefinition[] = [
  {
    endpoint: "experiences",
    label: "Experience",
    fields: [
      { name: "jobTitle", label: "Job title", type: "text" },
      { name: "organisation", label: "Organisation", type: "text" },
      { name: "employmentType", label: "Employment type", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "startDate", label: "Start date", type: "text" },
      { name: "endDate", label: "End date", type: "text" },
      { name: "isCurrent", label: "Current position", type: "checkbox" },
      { name: "approximateDuration", label: "Approximate duration", type: "text" },
      { name: "datePrecision", label: "Date precision", type: "select", options: datePrecisionOptions },
      { name: "professionalSummary", label: "Professional summary", type: "textarea" },
      { name: "responsibilities", label: "Responsibilities", type: "array" },
      { name: "keyAchievements", label: "Key achievements", type: "array" },
      { name: "researchAreas", label: "Research areas", type: "array" },
      { name: "toolsUsed", label: "Tools used", type: "array" },
      { name: "organisationLogo", label: "Organisation logo ID", type: "text" },
      { name: "isFeatured", label: "Featured", type: "checkbox" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
      { name: "displayOrder", label: "Display order", type: "number" }
    ]
  },
  {
    endpoint: "education",
    label: "Education",
    fields: [
      { name: "institution", label: "Institution", type: "text" },
      { name: "qualification", label: "Qualification", type: "text" },
      { name: "fieldOfStudy", label: "Field of study", type: "text" },
      { name: "startDate", label: "Start date", type: "text" },
      { name: "completionDate", label: "Completion date", type: "text" },
      { name: "datePrecision", label: "Date precision", type: "select", options: datePrecisionOptions },
      { name: "grade", label: "Grade", type: "text" },
      { name: "percentage", label: "Percentage", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "subjects", label: "Subjects", type: "array" },
      { name: "academicAchievements", label: "Academic achievements", type: "array" },
      { name: "institutionLogo", label: "Institution logo ID", type: "text" },
      { name: "supportingDocument", label: "Supporting document ID", type: "text" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
      { name: "displayOrder", label: "Display order", type: "number" }
    ]
  },
  {
    endpoint: "training",
    label: "Training",
    fields: [
      { name: "organisation", label: "Organisation", type: "text" },
      { name: "trainingTitle", label: "Training title", type: "text" },
      { name: "department", label: "Department", type: "text" },
      { name: "trainingType", label: "Training type", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "startDate", label: "Start date", type: "text" },
      { name: "endDate", label: "End date", type: "text" },
      { name: "duration", label: "Duration", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "responsibilities", label: "Responsibilities", type: "array" },
      { name: "learningOutcomes", label: "Learning outcomes", type: "array" },
      { name: "skillsDeveloped", label: "Skills developed", type: "array" },
      { name: "certificateImage", label: "Certificate image ID", type: "text" },
      { name: "certificatePdf", label: "Certificate PDF ID", type: "text" },
      { name: "organisationLogo", label: "Organisation logo ID", type: "text" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
      { name: "displayOrder", label: "Display order", type: "number" }
    ]
  },
  {
    endpoint: "skill-categories",
    label: "Skill Categories",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "displayOrder", label: "Display order", type: "number" }
    ]
  },
  {
    endpoint: "skills",
    label: "Skills",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "category", label: "Category ID", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "proficiencyLevel", label: "Proficiency", type: "select", options: proficiencyOptions },
      { name: "proficiencyPercentage", label: "Percentage", type: "number" },
      { name: "yearsOfExperience", label: "Years", type: "number" },
      { name: "icon", label: "Icon", type: "text" },
      { name: "logoImage", label: "Logo image ID", type: "text" },
      { name: "isFeatured", label: "Featured", type: "checkbox" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
      { name: "displayOrder", label: "Display order", type: "number" }
    ]
  },
  {
    endpoint: "personal-skills",
    label: "Personal Skills",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
      { name: "displayOrder", label: "Display order", type: "number" }
    ]
  },
  {
    endpoint: "languages",
    label: "Languages",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "readingProficiency", label: "Reading", type: "select", options: proficiencyOptions },
      { name: "writingProficiency", label: "Writing", type: "select", options: proficiencyOptions },
      { name: "speakingProficiency", label: "Speaking", type: "select", options: proficiencyOptions },
      { name: "isNative", label: "Native", type: "checkbox" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
      { name: "displayOrder", label: "Display order", type: "number" }
    ]
  },
  {
    endpoint: "interests",
    label: "Interests",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "icon", label: "Icon", type: "text" },
      { name: "image", label: "Image ID", type: "text" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
      { name: "displayOrder", label: "Display order", type: "number" }
    ]
  },
  {
    endpoint: "projects",
    label: "Projects",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "slug", label: "Slug", type: "text" },
      { name: "shortDescription", label: "Short description", type: "textarea" },
      { name: "fullDescription", label: "Full description", type: "textarea" },
      { name: "category", label: "Category", type: "text" },
      { name: "duration", label: "Duration", type: "text" },
      { name: "startDate", label: "Start date", type: "text" },
      { name: "completionDate", label: "Completion date", type: "text" },
      { name: "datePrecision", label: "Date precision", type: "select", options: datePrecisionOptions },
      { name: "projectStatus", label: "Project status", type: "text" },
      { name: "objectives", label: "Objectives", type: "array" },
      { name: "problemStatement", label: "Problem statement", type: "textarea" },
      { name: "methodology", label: "Methodology", type: "textarea" },
      { name: "toolsAndTechnologies", label: "Tools and technologies", type: "array" },
      { name: "responsibilities", label: "Responsibilities", type: "array" },
      { name: "mainFeatures", label: "Main features", type: "array" },
      { name: "challenges", label: "Challenges", type: "array" },
      { name: "solutions", label: "Solutions", type: "array" },
      { name: "outcomes", label: "Outcomes", type: "array" },
      { name: "learningOutcomes", label: "Learning outcomes", type: "array" },
      { name: "thumbnail", label: "Thumbnail ID", type: "text" },
      { name: "galleryImages", label: "Gallery image IDs", type: "array" },
      { name: "supportingDocuments", label: "Supporting document IDs", type: "array" },
      { name: "githubUrl", label: "GitHub URL", type: "text" },
      { name: "liveUrl", label: "Live URL", type: "text" },
      { name: "externalCaseStudyUrl", label: "Case study URL", type: "text" },
      { name: "isFeatured", label: "Featured", type: "checkbox" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
      { name: "displayOrder", label: "Display order", type: "number" },
      { name: "seoTitle", label: "SEO title", type: "text" },
      { name: "seoDescription", label: "SEO description", type: "textarea" },
      { name: "seoKeywords", label: "SEO keywords", type: "array" },
      { name: "openGraphImage", label: "Open Graph image ID", type: "text" }
    ]
  }
];

function titleFor(item: Record<string, unknown>): string {
  for (const key of ["name", "title", "jobTitle", "qualification", "trainingTitle", "subject"]) {
    const value = item[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return String(item.id ?? "Untitled");
}

function readValueAtPath(item: Record<string, unknown> | null, path: string): unknown {
  if (!item) {
    return undefined;
  }
  return path.split(".").reduce<unknown>((value, segment) => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return undefined;
    }
    return (value as Record<string, unknown>)[segment];
  }, item);
}

function writeValueAtPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const [head, ...tail] = path.split(".");
  if (!head) {
    return;
  }
  if (!tail.length) {
    target[head] = value;
    return;
  }
  const existing = target[head];
  const nextTarget =
    existing && typeof existing === "object" && !Array.isArray(existing) ? (existing as Record<string, unknown>) : {};
  target[head] = nextTarget;
  writeValueAtPath(nextTarget, tail.join("."), value);
}

function valueForField(item: Record<string, unknown> | null, field: FieldDefinition): string | boolean {
  if (!item) {
    if (field.type === "checkbox") {
      return false;
    }
    if (field.name === "status") {
      return "published";
    }
    if (field.name === "datePrecision") {
      return "year";
    }
    return "";
  }
  const value = readValueAtPath(item, field.name);
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") {
          return entry;
        }
        if (typeof entry === "object" && entry !== null && "id" in entry) {
          return String((entry as { id: unknown }).id);
        }
        return "";
      })
      .filter(Boolean)
      .join(", ");
  }
  if (field.type === "checkbox") {
    return Boolean(value);
  }
  if (typeof value === "object" && value !== null && "id" in value) {
    return String((value as { id: unknown }).id);
  }
  return typeof value === "number" || typeof value === "string" ? String(value) : "";
}

function payloadFromState(fields: FieldDefinition[], state: Record<string, string | boolean>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const value = state[field.name];
    let parsed: unknown;
    if (field.type === "array") {
      parsed =
        typeof value === "string"
          ? value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [];
    } else if (field.type === "checkbox") {
      parsed = Boolean(value);
    } else if (field.type === "number") {
      parsed = value === "" ? undefined : Number(value);
    } else {
      parsed = value === "" ? undefined : value;
    }
    if (parsed === undefined) {
      continue;
    }
    writeValueAtPath(payload, field.name, parsed);
  }
  return payload;
}

function ResourceForm({
  definition,
  editing,
  onCancel,
  onSaved
}: {
  definition: ResourceDefinition;
  editing: Record<string, unknown> | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [state, setState] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(definition.fields.map((field) => [field.name, valueForField(editing, field)])),
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = payloadFromState(definition.fields, state);
      if (definition.endpoint === "profile") {
        await adminApi.patch("/admin/profile", payload);
      } else if (editing?.id) {
        await adminApi.patch(`/admin/${definition.endpoint}/${editing.id}`, payload);
      } else {
        await adminApi.post(`/admin/${definition.endpoint}`, payload);
      }
    },
    onSuccess: onSaved
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
      className="rounded border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {definition.fields.map((field) => (
          <label key={field.name} className={cn("block", field.type === "textarea" && "md:col-span-2")}>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{field.label}</span>
            {field.type === "textarea" ? (
              <textarea
                rows={4}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                value={String(state[field.name] ?? "")}
                onChange={(event) => setState((current) => ({ ...current, [field.name]: event.target.value }))}
              />
            ) : field.type === "select" ? (
              <select
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                value={String(state[field.name] ?? "")}
                onChange={(event) => setState((current) => ({ ...current, [field.name]: event.target.value }))}
              >
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option || "Unselected"}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <input
                type="checkbox"
                className="mt-3 h-5 w-5 rounded border-slate-300 text-aqua"
                checked={Boolean(state[field.name])}
                onChange={(event) => setState((current) => ({ ...current, [field.name]: event.target.checked }))}
              />
            ) : (
              <input
                type={field.type === "number" ? "number" : "text"}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                value={String(state[field.name] ?? "")}
                onChange={(event) => setState((current) => ({ ...current, [field.name]: event.target.value }))}
              />
            )}
          </label>
        ))}
      </div>
      {mutation.isError ? <p className="mt-4 text-sm text-red-600">Save failed. Check required fields and formats.</p> : null}
      <div className="mt-5 flex gap-3">
        <button type="submit" className="inline-flex items-center gap-2 rounded bg-aqua px-4 py-2 font-semibold text-white">
          <Save className="h-4 w-4" aria-hidden />
          Save
        </button>
        <button type="button" onClick={onCancel} className="rounded border border-slate-300 px-4 py-2 font-semibold dark:border-slate-700">
          Cancel
        </button>
      </div>
    </form>
  );
}

function ResourceManager({ definition }: { definition: ResourceDefinition }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [creating, setCreating] = useState(false);
  const query = useQuery({
    queryKey: ["resource", definition.endpoint],
    queryFn: async () => (await adminApi.get<ListResponse>(`/admin/${definition.endpoint}?limit=100`)).data
  });
  const remove = useMutation({
    mutationFn: async (id: string) => adminApi.delete(`/admin/${definition.endpoint}/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["resource", definition.endpoint] });
    }
  });

  const items = query.data?.items ?? [];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-ink dark:text-white">{definition.label}</h2>
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
          className="inline-flex items-center gap-2 rounded bg-aqua px-4 py-2 font-semibold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add
        </button>
      </div>
      {creating || editing ? (
        <ResourceForm
          definition={definition}
          editing={editing}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            void queryClient.invalidateQueries({ queryKey: ["resource", definition.endpoint] });
          }}
        />
      ) : null}
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        {query.isLoading ? (
          <div className="flex items-center gap-2 p-5 text-slate-600 dark:text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading
          </div>
        ) : items.length ? (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {items.map((item) => (
              <li key={String(item.id)} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-ink dark:text-white">{titleFor(item)}</p>
                  <p className="text-xs text-slate-500">{String(item.id)}</p>
                  {typeof item.status === "string" ? <p className="mt-1 text-sm text-slate-500">{item.status}</p> : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    className="grid h-10 w-10 place-items-center rounded border border-slate-300 text-cobalt dark:border-slate-700 dark:text-teal-200"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove.mutate(String(item.id))}
                    className="grid h-10 w-10 place-items-center rounded border border-slate-300 text-red-600 dark:border-slate-700"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-5 text-slate-600 dark:text-slate-300">No records.</p>
        )}
      </div>
    </div>
  );
}

function ProfileEditor() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await adminApi.get<{ profile: Record<string, unknown> | null }>("/admin/profile")).data.profile
  });
  const fields: FieldDefinition[] = [
    { name: "name", label: "Name", type: "text" },
    { name: "heading", label: "Heading", type: "text" },
    { name: "rotatingTitles", label: "Rotating titles", type: "array" },
    { name: "heroIntroduction", label: "Hero introduction", type: "textarea" },
    { name: "professionalBiography", label: "Biography", type: "textarea" },
    { name: "careerObjective", label: "Career objective", type: "textarea" },
    { name: "professionalSummary", label: "Professional summary", type: "textarea" },
    { name: "availabilityStatus", label: "Availability", type: "text" },
    { name: "preferredEmploymentArea", label: "Preferred area", type: "text" },
    { name: "currentLocation", label: "Current location", type: "text" },
    { name: "keyStrengths", label: "Key strengths", type: "array" },
    { name: "profileImage", label: "Profile image ID", type: "text" },
    { name: "heroImage", label: "Hero image ID", type: "text" },
    { name: "aboutImage", label: "About image ID", type: "text" },
    { name: "logo", label: "Logo ID", type: "text" },
    { name: "favicon", label: "Favicon ID", type: "text" },
    { name: "openGraphImage", label: "Open Graph image ID", type: "text" },
    { name: "publicProfessionalEmail", label: "Public email", type: "text" },
    { name: "privateAccountEmail", label: "Private account email", type: "text" },
    { name: "publicTelephoneNumber", label: "Public telephone", type: "text" },
    { name: "privateTelephoneNumber", label: "Private telephone", type: "text" },
    { name: "city", label: "City", type: "text" },
    { name: "state", label: "State", type: "text" },
    { name: "country", label: "Country", type: "text" },
    { name: "fullPrivateAddress", label: "Private address", type: "textarea" },
    { name: "dateOfBirth", label: "Date of birth", type: "text" },
    { name: "parentOrGuardian", label: "Parent or guardian", type: "text" },
    { name: "gender", label: "Gender", type: "text" },
    { name: "nationality", label: "Nationality", type: "text" },
    { name: "visibility.publicProfessionalEmail", label: "Show public email", type: "checkbox" },
    { name: "visibility.publicTelephoneNumber", label: "Show public telephone", type: "checkbox" },
    { name: "visibility.city", label: "Show city", type: "checkbox" },
    { name: "visibility.state", label: "Show state", type: "checkbox" },
    { name: "visibility.country", label: "Show country", type: "checkbox" },
    { name: "visibility.privateAccountEmail", label: "Show private account email", type: "checkbox" },
    { name: "visibility.privateTelephoneNumber", label: "Show private telephone", type: "checkbox" },
    { name: "visibility.fullPrivateAddress", label: "Show private address", type: "checkbox" },
    { name: "visibility.dateOfBirth", label: "Show date of birth", type: "checkbox" },
    { name: "visibility.parentOrGuardian", label: "Show parent or guardian", type: "checkbox" },
    { name: "visibility.gender", label: "Show gender", type: "checkbox" },
    { name: "visibility.nationality", label: "Show nationality", type: "checkbox" },
    { name: "status", label: "Status", type: "select", options: statusOptions }
  ];
  return query.isLoading ? (
    <div className="flex items-center gap-2 text-slate-600">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      Loading profile
    </div>
  ) : (
    <ResourceForm
      definition={{ endpoint: "profile", label: "Profile", fields }}
      editing={query.data ?? null}
      onCancel={() => undefined}
      onSaved={() => void queryClient.invalidateQueries({ queryKey: ["profile"] })}
    />
  );
}

function SiteSettingsManager() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<FooterFormState>(emptyFooterState);
  const query = useQuery({
    queryKey: ["site-settings-footer"],
    queryFn: async () => (await adminApi.get<{ footer: FooterSettingsDto | null }>("/admin/site-settings/footer")).data.footer
  });
  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => (await adminApi.get<{ profile: ProfileDto | null }>("/admin/profile")).data.profile
  });

  useEffect(() => {
    if (!query.isLoading && !profileQuery.isLoading) {
      setState(footerStateFromSources(query.data, profileQuery.data));
    }
  }, [query.data, query.isLoading, profileQuery.data, profileQuery.isLoading]);

  const mutation = useMutation({
    mutationFn: async () => {
      await adminApi.patch("/admin/site-settings/footer", footerPayloadFromState(state));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["site-settings-footer"] });
    }
  });

  const fields: Array<{ key: keyof FooterFormState; label: string; type?: "textarea" | "email" | "tel" | "url" }> = [
    { key: "contactEmail", label: "Contact email", type: "email" },
    { key: "contactPhone", label: "Contact phone", type: "tel" },
    { key: "contactLocation", label: "Contact location", type: "textarea" },
    { key: "website", label: "Website", type: "url" },
    { key: "github", label: "GitHub", type: "url" },
    { key: "linkedin", label: "LinkedIn", type: "url" },
    { key: "instagram", label: "Instagram", type: "url" },
    { key: "facebook", label: "Facebook", type: "url" },
    { key: "x", label: "X", type: "url" },
    { key: "youtube", label: "YouTube", type: "url" }
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold text-ink dark:text-white">Contact & Social</h2>
      {query.isLoading ? (
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading settings
        </div>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
        className="grid gap-4 rounded border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2"
      >
        {fields.map((field) => (
          <label key={field.key} className={cn("block", field.type === "textarea" && "md:col-span-2")}>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{field.label}</span>
            {field.type === "textarea" ? (
              <textarea
                rows={3}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                value={state[field.key]}
                onChange={(event) => setState((current) => ({ ...current, [field.key]: event.target.value }))}
              />
            ) : (
              <input
                type={field.type ?? "text"}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                value={state[field.key]}
                onChange={(event) => setState((current) => ({ ...current, [field.key]: event.target.value }))}
              />
            )}
          </label>
        ))}
        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded bg-aqua px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden />
            Save settings
          </button>
          {mutation.isSuccess ? <p className="text-sm font-medium text-leaf">Settings updated.</p> : null}
          {mutation.isError ? <p className="text-sm font-medium text-red-600">Settings update failed.</p> : null}
        </div>
      </form>
    </div>
  );
}

function MediaManager() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [bucketName, setBucketName] = useState("contentImages");
  const [category, setCategory] = useState("content");
  const [isPublic, setIsPublic] = useState(true);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [associatedModel, setAssociatedModel] = useState("");
  const [associatedDocumentId, setAssociatedDocumentId] = useState("");
  const query = useQuery({
    queryKey: ["media"],
    queryFn: async () => (await adminApi.get<ListResponse>("/admin/media?limit=100")).data
  });
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error("Missing file");
      }
      const form = new FormData();
      form.append("file", file);
      form.append("bucketName", bucketName);
      form.append("category", category);
      form.append("isPublic", String(isPublic));
      form.append("altText", altText);
      form.append("caption", caption);
      form.append("associatedModel", associatedModel);
      form.append("associatedDocumentId", associatedDocumentId);
      await adminApi.post("/admin/media/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: async () => {
      setFile(null);
      setAltText("");
      setCaption("");
      setAssociatedModel("");
      setAssociatedDocumentId("");
      await queryClient.invalidateQueries({ queryKey: ["media"] });
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => adminApi.delete(`/admin/media/${id}`),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["media"] })
  });

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold text-ink dark:text-white">Media Library</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          uploadMutation.mutate();
        }}
        className="grid gap-4 rounded border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:grid-cols-4"
      >
        <label className="block">
          <span className="text-sm font-medium">File</span>
          <input
            className="mt-1 w-full text-sm"
            type="file"
            accept={acceptForBucket(bucketName)}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Bucket</span>
          <select className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={bucketName} onChange={(event) => setBucketName(event.target.value)}>
            {["profileImages", "contentImages", "projectImages", "documents", "resumes", "certificates", "logos"].map((bucket) => (
              <option key={bucket} value={bucket}>
                {bucket}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Category</span>
          <input className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={category} onChange={(event) => setCategory(event.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Alt text</span>
          <input className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={altText} onChange={(event) => setAltText(event.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Caption</span>
          <input className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={caption} onChange={(event) => setCaption(event.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Associated model</span>
          <input className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={associatedModel} onChange={(event) => setAssociatedModel(event.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Associated document ID</span>
          <input className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={associatedDocumentId} onChange={(event) => setAssociatedDocumentId(event.target.value)} />
        </label>
        <div className="flex items-end gap-3 md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />
            Public
          </label>
          <button type="submit" className="inline-flex items-center gap-2 rounded bg-aqua px-4 py-2 font-semibold text-white">
            <ImageUp className="h-4 w-4" aria-hidden />
            Upload
          </button>
        </div>
      </form>
      <div className="rounded border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        {(query.data?.items ?? []).map((item) => (
          <div key={String(item.id)} className="flex flex-col gap-3 border-b border-slate-200 p-4 last:border-b-0 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-ink dark:text-white">{String(item.originalName ?? "Media")}</p>
              <p className="text-sm text-slate-500">{String(item.bucketName)} | {String(item.mimeType)} | {String(item.id)}</p>
            </div>
            <button
              type="button"
              onClick={() => deleteMutation.mutate(String(item.id))}
              className="grid h-10 w-10 place-items-center rounded border border-slate-300 text-red-600 dark:border-slate-700"
              aria-label="Delete media"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResumeManager() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("Ankita Singh Resume");
  const query = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => (await adminApi.get<ListResponse>("/admin/resumes?limit=100")).data
  });
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error("Missing file");
      }
      const form = new FormData();
      form.append("file", file);
      form.append("title", title);
      form.append("status", "published");
      await adminApi.post("/admin/resumes", form, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["resumes"] })
  });
  const activateMutation = useMutation({
    mutationFn: async (id: string) => adminApi.patch(`/admin/resumes/${id}/activate`),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["resumes"] })
  });
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => adminApi.patch(`/admin/resumes/${id}/archive`),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["resumes"] })
  });

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold text-ink dark:text-white">Resume Manager</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          uploadMutation.mutate();
        }}
        className="grid gap-4 rounded border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:grid-cols-3"
      >
        <label>
          <span className="text-sm font-medium">Title</span>
          <input className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          <span className="text-sm font-medium">Resume file</span>
          <input
            className="mt-1 w-full text-sm"
            type="file"
            accept={resumeFileAccept}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <div className="flex items-end">
          <button type="submit" className="inline-flex items-center gap-2 rounded bg-aqua px-4 py-2 font-semibold text-white">
            <Upload className="h-4 w-4" aria-hidden />
            Upload
          </button>
        </div>
      </form>
      <div className="rounded border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        {(query.data?.items ?? []).map((item) => (
          <div key={String(item.id)} className="flex flex-col gap-3 border-b border-slate-200 p-4 last:border-b-0 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-ink dark:text-white">{String(item.title ?? "Resume")}</p>
              <p className="text-sm text-slate-500">{String(item.status)} {item.isActive ? "| Active" : ""}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => activateMutation.mutate(String(item.id))} className="grid h-10 w-10 place-items-center rounded border border-slate-300 text-leaf dark:border-slate-700" aria-label="Activate resume">
                <Check className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" onClick={() => archiveMutation.mutate(String(item.id))} className="grid h-10 w-10 place-items-center rounded border border-slate-300 text-saffron dark:border-slate-700" aria-label="Archive resume">
                <Archive className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactMessages() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["contact-messages"],
    queryFn: async () => (await adminApi.get<ListResponse>("/admin/contact-messages?limit=100")).data
  });
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      adminApi.patch(`/admin/contact-messages/${id}/status`, { status }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["contact-messages"] })
  });
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold text-ink dark:text-white">Contact Messages</h2>
      <div className="rounded border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        {(query.data?.items ?? []).map((item) => (
          <div key={String(item.id)} className="border-b border-slate-200 p-4 last:border-b-0 dark:border-slate-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-ink dark:text-white">{String(item.subject)}</p>
                <p className="text-sm text-slate-500">{String(item.name)} | {String(item.email)} | {String(item.status)}</p>
                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{String(item.message ?? "")}</p>
              </div>
              <div className="flex gap-2">
                {["read", "unread", "replied", "archived"].map((status) => (
                  <button key={status} type="button" className="rounded border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-700" onClick={() => updateStatus.mutate({ id: String(item.id), status })}>
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditLogs() {
  const query = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => (await adminApi.get<ListResponse>("/admin/audit-logs?limit=100")).data
  });

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold text-ink dark:text-white">Audit Logs</h2>
      <div className="rounded border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        {(query.data?.items ?? []).map((item) => (
          <div key={String(item.id)} className="border-b border-slate-200 p-4 last:border-b-0 dark:border-slate-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-ink dark:text-white">
                  {String(item.action)} <span className="text-slate-500">|</span> {String(item.resourceType)}
                </p>
                <p className="text-sm text-slate-500">
                  {String(item.createdAt)}
                  {item.requestId ? ` | ${String(item.requestId)}` : ""}
                </p>
                {item.resourceId ? <p className="text-sm text-slate-500">Resource: {String(item.resourceId)}</p> : null}
              </div>
              {item.metadata && Object.keys(item.metadata as Record<string, unknown>).length ? (
                <pre className="max-w-full overflow-auto rounded bg-mist p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {JSON.stringify(item.metadata, null, 2)}
                </pre>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Overview() {
  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await adminApi.get<Record<string, number>>("/admin/dashboard")).data
  });
  const entries = Object.entries(query.data ?? {});
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium capitalize text-slate-500">{key.replace(/([A-Z])/g, " $1")}</p>
          <p className="mt-2 text-3xl font-semibold text-ink dark:text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboard() {
  const { admin, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (!loading && !admin) {
      router.replace("/admin/login");
    }
  }, [admin, loading, router]);

  const tabs = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: BarChart3 },
      { id: "profile", label: "Profile", icon: Pencil },
      { id: "site-settings", label: "Contact & Social", icon: Share2 },
      ...resourceDefinitions.map((definition) => ({ id: definition.endpoint, label: definition.label, icon: Database })),
      { id: "media", label: "Media", icon: ImageUp },
      { id: "resumes", label: "Resumes", icon: FileText },
      { id: "messages", label: "Messages", icon: MessageSquare },
      { id: "audit-logs", label: "Audit Logs", icon: FileText }
    ],
    [],
  );

  if (loading || !admin) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center gap-2 px-4 text-slate-600 dark:text-slate-300">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Loading
      </div>
    );
  }

  const activeResource = resourceDefinitions.find((definition) => definition.endpoint === tab);

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
      <aside className="rounded border border-slate-200 bg-white p-3 shadow-soft dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-auto">
        <div className="mb-3 px-2">
          <p className="font-semibold text-ink dark:text-white">{admin.name}</p>
          <p className="text-sm text-slate-500">{admin.email}</p>
        </div>
        <nav className="space-y-1" aria-label="Admin navigation">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-mist dark:text-slate-200 dark:hover:bg-slate-800",
                  tab === item.id && "bg-teal-50 text-aqua dark:bg-teal-950/60",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => void logout().then(() => router.replace("/admin/login"))}
            className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Logout
          </button>
        </nav>
      </aside>
      <section>
        {tab === "overview" ? <Overview /> : null}
        {tab === "profile" ? <ProfileEditor /> : null}
        {tab === "site-settings" ? <SiteSettingsManager /> : null}
        {activeResource ? <ResourceManager key={activeResource.endpoint} definition={activeResource} /> : null}
        {tab === "media" ? <MediaManager /> : null}
        {tab === "resumes" ? <ResumeManager /> : null}
        {tab === "messages" ? <ContactMessages /> : null}
        {tab === "audit-logs" ? <AuditLogs /> : null}
      </section>
    </div>
  );
}
