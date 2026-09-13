import { z } from "zod";

export const parsedResumeSchema = z.object({
  headline: z.string().nullable(),
  professionalSummary: z.string().nullable(),
  currentTitle: z.string().nullable(),
  currentCompany: z.string().nullable(),
  currentLocation: z.string().nullable(),
  yearsOfExperience: z.number().nullable(),
  experiences: z.array(
    z.object({
      company: z.string().nullable(),
      title: z.string().nullable(),
      location: z.string().nullable(),
      startDate: z.string().nullable().describe("YYYY-MM-DD or YYYY-MM if day is unknown"),
      endDate: z.string().nullable().describe("null if this is the current role"),
      isCurrent: z.boolean(),
      description: z.string().nullable(),
      responsibilities: z.array(z.string()),
      achievements: z.array(z.string()),
    }),
  ),
  skills: z.array(
    z.object({
      skill: z.string().nullable(),
      category: z
        .enum(["technical", "leadership", "soft", "domain", "tool", "language", "other"])
        .nullable()
        .catch(null)
        .describe("Best-fit category for this skill"),
      proficiency: z
        .enum(["beginner", "intermediate", "advanced", "expert"])
        .nullable()
        .catch(null)
        .describe("Only set if the resume text actually indicates a level - never guess"),
      yearsExperience: z
        .number()
        .nullable()
        .catch(null)
        .describe("Only set if the resume text states or clearly implies a duration for this specific skill - never guess"),
    }),
  ),
  certifications: z.array(
    z.object({
      name: z.string().nullable(),
      issuer: z.string().nullable(),
      issueDate: z.string().nullable(),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string().nullable(),
      degree: z.string().nullable(),
      field: z.string().nullable(),
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
    }),
  ),
});

export type ParsedResume = z.infer<typeof parsedResumeSchema>;
