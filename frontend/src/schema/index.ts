import * as z from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const isKeyboardPattern = (password: string) => {
    const keyboardPatterns = ['123456', 'abcdef', 'qwerty', 'asdfgh', 'zxcvbn'];
    return keyboardPatterns.some(pattern => password.includes(pattern));
};




export const RequestOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export const VerifyOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits long"),
});

// Forgot Password Schema
export const ForgotPasswordSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }).max(128, {
    message: "Password must be at most 128 characters long",
  }).refine(value => passwordRegex.test(value), {
    message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  }).refine(value => !isKeyboardPattern(value), {
    message: "Password is too simple, please avoid keyboard patterns",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
  
// Register Schema Without OTP
export const RegisterSchemaWithoutOtp = z.object({
  username: z.string().min(1, "Please enter your username")
      .max(30, "Username must be at most 30 characters long")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(8, "Password must be at least 8 characters long")
      .max(128, "Password must be at most 128 characters long")
      .regex(passwordRegex, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
      .refine(value => !isKeyboardPattern(value), "Password is too simple, please avoid keyboard patterns"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const LoginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long"
  }).max(128, {
    message: "Password must be at most 128 characters long"
  })
});