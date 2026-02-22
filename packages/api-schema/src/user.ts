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

export const SignInInput = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
export type SignInInputType = z.infer<typeof SignInInput>;

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(
    /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
    "Password must contain both letters and numbers"
  );

export const ChangePasswordInput = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});
export type ChangePasswordInputType = z.infer<typeof ChangePasswordInput>;

export const RequestPasswordResetInput = z.object({
  email: z.string().email(),
});
export type RequestPasswordResetInputType = z.infer<typeof RequestPasswordResetInput>;

export const ResetPasswordInput = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: passwordSchema,
});
export type ResetPasswordInputType = z.infer<typeof ResetPasswordInput>;
