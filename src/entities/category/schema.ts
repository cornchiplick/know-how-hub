import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "폴더명을 입력해주세요.")
    .max(30, "폴더명은 30자 이하로 입력해주세요."),
  description: z
    .string()
    .max(500, "설명은 500자 이하로 입력해주세요."),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
