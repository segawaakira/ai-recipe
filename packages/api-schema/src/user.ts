import { z } from "zod";

export const CreateUserInput = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
      "Password must contain both letters and numbers"
    ),
});

export type CreateUserInputType = z.infer<typeof CreateUserInput>;
