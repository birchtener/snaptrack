import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useSignIn } from "@clerk/react";
import { type OAuthStrategy } from "@clerk/shared/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ForgotForm } from "./login/ForgotForm";
import { ForgotVerifyForm } from "./login/ForgotVerifyForm";
import { NewPasswordForm } from "./login/NewPasswordForm";
import {
  loginSchema,
  type LoginFormData,
  emailSchema,
  type EmailFormData,
  passwordSchema,
  type PasswordFormData,
} from "./login/types/loginTypes";
import { Eye, EyeOff } from "lucide-react";
import { VerifyTrustForm } from "./login/VerifyTrustForm";

export default function LoginForm() {
  const { signIn } = useSignIn();
  const navigate = useNavigate();
  const [forgot, setForgot] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );
  const [resendCountdown, setResendCountdown] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsClientTrust, setNeedsClientTrust] = useState(false);
  const {
    register,
    handleSubmit,
    watch: emailWatch,
    formState: { errors: formErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    watch,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const emailvalue = forgot ? watch("email") : emailWatch("email");

  const onSubmit = async (values: LoginFormData) => {
    const { error } = await signIn.password({
      emailAddress: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message);
      console.error("Login error:", error);
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: () => navigate("/"),
      });
    } else if (signIn.status === "needs_client_trust") {
      const { error: sendCodeError } = await signIn.mfa.sendEmailCode();
      if (sendCodeError) {
        toast.error(sendCodeError.message);
        console.error("MFA send code error:", sendCodeError);
        return;
      }
      setVerificationCode("");
      setNeedsClientTrust(true);
    } else {
      toast.error("Unexpected sign-in error. Please try again.");
      console.error("Unexpected sign-in status:", signIn);
    }
  };

  const onEmailSubmit = async (values: EmailFormData) => {
    const { error } = await signIn.create({
      identifier: values.email,
    });

    if (error) {
      toast.error(error.message);
      console.error("Forgot password error:", error);
      return;
    }

    const { error: sendCodeError } =
      await signIn.resetPasswordEmailCode.sendCode();
    if (sendCodeError) {
      toast.error(sendCodeError.message);
      console.error("Send code error:", sendCodeError);
      return;
    }

    toast.success("A verification code has been sent to your email.");
    setVerifying(true);
  };

  const onPasswordSubmit = async (values: PasswordFormData) => {
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: values.password,
      signOutOfOtherSessions: true,
    });

    if (error) {
      toast.error(error.message);
      console.error("Password reset error:", error);
      return;
    }

    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize({
        navigate: () => navigate("/"),
      });

      if (finalizeError) {
        toast.error(finalizeError.message);
        console.error("Finalize error:", finalizeError);
        return;
      }

      setForgot(false);
      setVerifying(false);
      setVerified(false);
      setVerificationCode("");
      toast.success("Password reset successful! You are now logged in.");
    } else {
      toast.error("Unexpected error during password reset. Please try again.");
      console.error("Unexpected sign-in status during password reset:", signIn);
    }
  };

  const signInWithGoogle = async () => {
    const { error: googleError } = await signIn.sso({
      strategy: "oauth_google" as OAuthStrategy,
      redirectUrl: "",
      redirectCallbackUrl: "",
    });

    if (googleError) {
      toast.error(googleError.message);
      console.error("Google sign-in error:", googleError);
    }
  };

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(
      () => setResendCountdown((prev) => prev - 1),
      1000,
    );
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleTrustResendCode = async () => {
    if (resendCountdown > 0) return;
    const { error: sendCodeError } = await signIn.mfa.sendEmailCode();
    if (sendCodeError) {
      toast.error(sendCodeError.message);
      console.error("Failed to resend code. error:", sendCodeError);
      setVerificationCode("");
      return;
    }
    setResendCountdown(60);
    setVerificationCode("");
    setVerificationError(null);
    toast.success("A new verification code has been sent.");
  };

  const onTrustVerifyCodeSubmit = async (code: string) => {
    if (fetching) return;

    setFetching(true);
    const { error } = await signIn.mfa.verifyEmailCode({ code });
    setVerificationCode("");
    setFetching(false);
    if (error) {
      console.error("Verification error:", error);
      return;
    }
    setNeedsClientTrust(false);
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: () => navigate("/"),
      });
    } else {
      toast.error("Unexpected sign-in error. Please try again.");
      console.error("Unexpected sign-in status:", signIn);
    }
  };

  const handleTrustCodeChange = (val: string) => {
    setVerificationCode(val);

    if (val.length === 6 && needsClientTrust && !fetching) {
      onTrustVerifyCodeSubmit(val);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;
    const { error: sendCodeError } =
      await signIn.resetPasswordEmailCode.sendCode();
    if (sendCodeError) {
      toast.error(sendCodeError.message);
      console.error("Failed to resend code. error:", sendCodeError);
      return;
    }
    setResendCountdown(60);
    setVerificationCode("");
    setVerificationError(null);
    toast.success("A new verification code has been sent.");
  };

  const onVerifyCodeSubmit = async (code: string) => {
    if (fetching) return;

    setFetching(true);
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({
      code,
    });
    setVerificationCode("");
    setFetching(false);
    if (error) {
      console.error("Verification error:", error);
      return;
    }
    setVerified(true);
  };

  const handleCodeChange = (val: string) => {
    setVerificationCode(val);

    if (val.length === 6 && verifying && !fetching) {
      onVerifyCodeSubmit(val);
    }
  };

  useEffect(() => {
    if (verificationCode.length === 6 && verifying && !fetching) {
      onVerifyCodeSubmit(verificationCode);
    }
  }, [verificationCode, onVerifyCodeSubmit, verifying, fetching]);

  if (forgot) {
    if (verifying) {
      if (verified) {
        return (
          <NewPasswordForm
            handlePasswordSubmit={handlePasswordSubmit}
            onPasswordSubmit={onPasswordSubmit}
            registerPassword={registerPassword}
            passwordErrors={passwordErrors}
          />
        );
      }
      return (
        <ForgotVerifyForm
          emailvalue={emailvalue}
          verificationCode={verificationCode}
          handleCodeChange={handleCodeChange}
          fetching={fetching}
          verificationError={verificationError}
          handleResendCode={handleResendCode}
          resendCountdown={resendCountdown}
          setVerifying={setVerifying}
          setForgot={setForgot}
        />
      );
    }
    return (
      <ForgotForm
        onEmailSubmit={onEmailSubmit}
        handleEmailSubmit={handleEmailSubmit}
        registerEmail={registerEmail}
        emailErrors={emailErrors}
        setVerifying={setVerifying}
        setForgot={setForgot}
      />
    );
  }

  if (needsClientTrust) {
    return (
      <VerifyTrustForm
        emailvalue={emailvalue}
        verificationCode={verificationCode}
        handleCodeChange={handleTrustCodeChange}
        fetching={fetching}
        verificationError={verificationError}
        handleResendCode={handleTrustResendCode}
        resendCountdown={resendCountdown}
        setNeedsClientTrust={setNeedsClientTrust}
      />
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>

        <Field>
          <Button variant="outline" type="button" onClick={signInWithGoogle}>
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
            Login with Google
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="youremail@email.com"
            required
            {...register("email")}
          />
          <FieldError errors={[formErrors.email]} />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <p
              className="ml-auto text-sm underline-offset-4 hover:underline cursor-default text-muted-foreground"
              onClick={() => setForgot(true)}
            >
              Forgot your password?
            </p>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
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
        <div id="clerk-captcha" />
        <Field>
          <Button type="submit">Login</Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
