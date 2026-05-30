import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
export function ForgotForm({
  onEmailSubmit,
  handleEmailSubmit,
  registerEmail,
  emailErrors,
  setVerifying,
  setForgot,
}: {
  onEmailSubmit: (data: { email: string }) => void;
  handleEmailSubmit: UseFormHandleSubmit<{ email: string }>;
  registerEmail: UseFormRegister<{ email: string }>;
  emailErrors: FieldErrors<{ email: string }>;
  setVerifying: (verifying: boolean) => void;
  setForgot: (forgot: boolean) => void;
}) {
  return (
    <form
      className="flex flex-col gap-6 max-w-sm mx-auto w-full justify-center"
      onSubmit={handleEmailSubmit(onEmailSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to receive password reset code.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            {...registerEmail("email")}
          />
          <FieldError errors={[emailErrors.email]} />
        </Field>
        <Field>
          <Button type="submit">Send Reset Code</Button>
          <Button
            variant="link"
            type="button"
            className="text-xs text-muted-foreground self-center"
            onClick={() => {
              setVerifying(false);
              setForgot(false);
            }}
          >
            ← Back to Log In
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
