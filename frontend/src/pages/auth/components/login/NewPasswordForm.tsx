import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  type UseFormHandleSubmit,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function NewPasswordForm({
  handlePasswordSubmit,
  onPasswordSubmit,
  registerPassword,
  passwordErrors,
}: {
  handlePasswordSubmit: UseFormHandleSubmit<any>;
  onPasswordSubmit: (data: {
    password: string;
    confirmPassword: string;
  }) => void;
  registerPassword: UseFormRegister<any>;
  passwordErrors: FieldErrors<any>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return (
    <form
      className="flex flex-col gap-6 max-w-sm mx-auto w-full justify-center"
      onSubmit={handlePasswordSubmit(onPasswordSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">New Password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              {...registerPassword("password")}
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
          <FieldError errors={[passwordErrors.password]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">
            Confirm New Password
          </FieldLabel>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              {...registerPassword("confirmPassword")}
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

          <FieldError errors={[passwordErrors.confirmPassword]} />
        </Field>
        <div id="clerk-captcha" />
        <Field>
          <Button type="submit">Confirm Password</Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
