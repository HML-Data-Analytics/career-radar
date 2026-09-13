import { z } from "zod";

export const careerProfileSchema = z.object({
  headline: z.string().trim().max(200).optional(),
  professionalSummary: z.string().trim().max(4000).optional(),
  yearsOfExperience: z.coerce.number().min(0).max(80).optional(),
  currentTitle: z.string().trim().max(200).optional(),
  currentCompany: z.string().trim().max(200).optional(),
  currentLocation: z.string().trim().max(200).optional(),
  careerLevel: z.string().trim().max(100).optional(),
  careerDirection: z.string().trim().max(2000).optional(),
  careerAmbition: z.string().trim().max(2000).optional(),
});

export type CareerProfileInput = z.infer<typeof careerProfileSchema>;

export const careerExperienceSchema = z.object({
  company: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(200),
  location: z.string().trim().max(200).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().trim().max(4000).optional(),
  responsibilities: z.array(z.string().trim().max(500)).default([]),
  achievements: z.array(z.string().trim().max(500)).default([]),
});

export type CareerExperienceInput = z.infer<typeof careerExperienceSchema>;

export const careerSkillSchema = z.object({
  skill: z.string().trim().min(1).max(100),
  category: z.string().trim().max(100).optional(),
  proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
  yearsExperience: z.coerce.number().min(0).max(60).optional(),
});

export type CareerSkillInput = z.infer<typeof careerSkillSchema>;

export const careerEvidenceSchema = z.object({
  experienceId: z.string().uuid().optional(),
  type: z.enum([
    "project",
    "achievement",
    "leadership",
    "technical_implementation",
    "business_result",
    "certification",
    "client_experience",
    "industry_experience",
    "other",
  ]),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).optional(),
  source: z.string().trim().max(200).optional(),
  evidenceDate: z.string().optional(),
  relatedSkills: z.array(z.string().trim().max(100)).default([]),
});

export type CareerEvidenceInput = z.infer<typeof careerEvidenceSchema>;

export const careerPreferencesSchema = z.object({
  targetRoles: z.array(z.string().trim().max(200)).default([]),
  targetTitles: z.array(z.string().trim().max(200)).default([]),
  seniority: z.array(z.string().trim().max(100)).default([]),
  industries: z.array(z.string().trim().max(200)).default([]),
  locations: z.array(z.string().trim().max(200)).default([]),
  remotePreference: z.enum(["remote", "hybrid", "on_site", "no_preference"]).optional(),
  minSalary: z.coerce.number().min(0).optional(),
  salaryCurrency: z.string().trim().max(10).optional(),
  employmentType: z.array(z.string().trim().max(100)).default([]),
  preferredCompanies: z.array(z.string().trim().max(200)).default([]),
  excludedCompanies: z.array(z.string().trim().max(200)).default([]),
  requiredTechnologies: z.array(z.string().trim().max(100)).default([]),
  preferredTechnologies: z.array(z.string().trim().max(100)).default([]),
  maxCommuteMinutes: z.coerce.number().min(0).optional(),
  visaSponsorshipNeeded: z.boolean().optional(),
  openToRelocation: z.boolean().optional(),
  travelTolerance: z.string().trim().max(100).optional(),
  careerDirection: z.string().trim().max(2000).optional(),
  preferredCompanySize: z.array(z.string().trim().max(100)).default([]),
});

export type CareerPreferencesInput = z.infer<typeof careerPreferencesSchema>;

export const jobPasteSchema = z.object({
  jobUrl: z.string().url().optional(),
  jobDescription: z.string().trim().min(50).optional(),
}).refine((data) => data.jobUrl || data.jobDescription, {
  message: "Provide either a job URL or a pasted job description.",
});

export type JobPasteInput = z.infer<typeof jobPasteSchema>;
