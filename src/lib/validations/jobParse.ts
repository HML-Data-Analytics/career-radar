import { z } from "zod";

export const parsedJobSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().nullable(),
  remoteType: z.enum(["remote", "hybrid", "on_site", "unknown"]),
  employmentType: z.string().nullable(),
  salaryMin: z.number().nullable(),
  salaryMax: z.number().nullable(),
  currency: z.string().nullable(),
  requirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  skills: z.array(z.string()),
  technologies: z.array(z.string()),
  industry: z.string().nullable(),
  seniority: z.string().nullable(),
});

export type ParsedJob = z.infer<typeof parsedJobSchema>;
