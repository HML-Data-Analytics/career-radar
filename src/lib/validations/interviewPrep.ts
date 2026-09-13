import { z } from "zod";

const questionSchema = z.object({
  question: z.string(),
  suggestedApproach: z.string(),
});

export const interviewPrepResultSchema = z.object({
  likelyQuestions: z.array(questionSchema),
  technicalQuestions: z.array(questionSchema),
  leadershipQuestions: z.array(questionSchema),
  behavioralQuestions: z.array(questionSchema),
  companySpecificQuestions: z.array(questionSchema),
  jdSpecificQuestions: z.array(questionSchema),
  potentialConcerns: z.array(z.string()),
  recommendedStories: z.array(
    z.object({
      title: z.string(),
      story: z.string(),
      relevantFor: z.array(z.string()).describe("Which question types/topics this story fits"),
    }),
  ),
});

export type InterviewPrepResult = z.infer<typeof interviewPrepResultSchema>;
