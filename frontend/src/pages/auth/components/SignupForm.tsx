import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldError,
} from "@/components/ui/field";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth, useSignUp } from "@clerk/react";
import { type OAuthStrategy } from "@clerk/shared/types";
import { toast } from "sonner";
import { VerifyEmail } from "./signup/VerifyEmail";
import { signUpSchema, type SignUpFormData } from "./signup/types/signupTypes";
import { Eye, EyeOff } from "lucide-react";
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { signUp, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resendCountdown, setResendCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors: formErrors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const emailvalue = watch("email");

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(
      () => setResendCountdown((prev) => prev - 1),
      1000,
    );
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const signUpWithGoogle = async () => {
    if (!signUp) return;
    try {
      await signUp.sso({
        strategy: "oauth_google" as OAuthStrategy,
        redirectUrl: "/",
        redirectCallbackUrl: "/sso-callback",
      });
    } catch (error) {
      toast.error("An error occurred while signing up with Google.");
      console.error("Google Sign-Up Error:", error);
    }
  };

  const onSubmit = async (values: SignUpFormData) => {
    if (!signUp) return;
    setVerificationError(null);

    try {
      const { error: passwordError } = await signUp.password({
        emailAddress: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });

      if (passwordError) {
        toast.error(
          passwordError.message ||
            "Failed to create account with email and password.",
        );
        return;
      }

      const { error: emailError } = await signUp.verifications.sendEmailCode();

      if (emailError) {
        toast.error(emailError.message || "Failed to send verification code.");
        return;
      }

      setVerifying(true);
      setResendCountdown(15);
      toast.success("Verification code sent to your email.");
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.message || "An error occurred during registration.";
      toast.error(msg);
      console.error("Sign-Up Error:", err);
    }
  };

  const onVerifyCodeSubmit = useCallback(
    async (codeToVerify: string) => {
      if (!signUp) return;
      setVerificationError(null);

      try {
        await signUp.verifications.verifyEmailCode({
          code: codeToVerify,
        });

        if (signUp.status === "complete") {
          await signUp.finalize({
            navigate: () => navigate("/"),
          });
        }
      } catch (err: any) {
        const msg =
          err?.errors?.[0]?.message ||
          "Verification failed. Please check the code.";
        setVerificationError(msg);
        setVerificationCode("");
        toast.error(msg);
      }
    },
    [signUp, navigate],
  );

  useEffect(() => {
    if (verificationCode.length === 6) {
      onVerifyCodeSubmit(verificationCode);
    }
  }, [verificationCode, onVerifyCodeSubmit]);

  const handleResendCode = async () => {
    if (!signUp || resendCountdown > 0) return;
    const { error: sendCodeError } = await signUp.verifications.sendEmailCode();
    setResendCountdown(60);
    setVerificationCode("");
    setVerificationError(null);
    toast.success("A new verification code has been sent.");

    if (sendCodeError) {
      toast.error(
        sendCodeError.message || "Failed to resend verification code.",
      );
      console.error("Resend Code Error:", sendCodeError);
      return;
    }
  };

  if (signUp?.status === "complete" || isSignedIn) {
    return null;
  }

  if (
    verifying ||
    (signUp?.status === "missing_requirements" &&
      signUp.unverifiedFields.includes("email_address") &&
      signUp.missingFields.length === 0)
  ) {
    return (
      <VerifyEmail
        emailvalue={emailvalue}
        verificationCode={verificationCode}
        fetchStatus={fetchStatus}
        setVerificationCode={setVerificationCode}
        verificationError={verificationError}
        handleResendCode={handleResendCode}
        resendCountdown={resendCountdown}
        setVerifying={setVerifying}
        setVerificationError={setVerificationError}
      />
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>

        <Field>
          <Button variant="outline" type="button" onClick={signUpWithGoogle}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="100"
              height="100"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              ></path>
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              ></path>
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
            </svg>
            Sign up with Google
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="firstName">First Name</FieldLabel>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              {...register("firstName")}
            />
            <FieldError errors={[formErrors.firstName]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              {...register("lastName")}
            />
            <FieldError errors={[formErrors.lastName]} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="youremail@email.com"
            {...register("email")}
          />
          <FieldError errors={[formErrors.email]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              {...register("password")}
            />
            {showPassword ? (
              <EyeOff
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer h-4 w-4 text-muted-foreground"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <Eye
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer h-4 w-4 text-muted-foreground"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>
          <FieldError errors={[formErrors.password]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
            />
            {showConfirmPassword ? (
              <EyeOff
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer h-4 w-4 text-muted-foreground"
                onClick={() => setShowConfirmPassword(false)}
              />
            ) : (
              <Eye
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer h-4 w-4 text-muted-foreground"
                onClick={() => setShowConfirmPassword(true)}
              />
            )}
          </div>

          <FieldError errors={[formErrors.confirmPassword]} />
        </Field>

        <div id="clerk-captcha" />

        <Field>
          <Button
            type="submit"
            className="w-full"
            disabled={fetchStatus === "fetching"}
          >
            {fetchStatus === "fetching"
              ? "Creating Account..."
              : "Create Account"}
          </Button>
          <FieldDescription className="px-6 text-center mt-2">
            Already have an account?{" "}
            <Link to="/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
