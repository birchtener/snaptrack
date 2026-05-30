import { FieldGroup } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { type Dispatch, type SetStateAction } from "react";

export function VerifyEmail({
  emailvalue,
  verificationCode,
  fetchStatus,
  setVerificationCode,
  verificationError,
  setVerificationError,
  handleResendCode,
  resendCountdown,
  setVerifying,
}: {
  emailvalue: string;
  verificationCode: string;
  fetchStatus: "idle" | "fetching";
  setVerificationCode: Dispatch<SetStateAction<string>>;
  verificationError: string | null;
  setVerificationError: Dispatch<SetStateAction<string | null>>;
  handleResendCode: () => Promise<void>;
  resendCountdown: number;
  setVerifying: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto w-full justify-center">
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-sm text-balance text-muted-foreground">
            We sent a verification code to{" "}
            <span className="text-foreground font-medium">
              {emailvalue || "your email"}
            </span>
            .
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 py-2">
          <InputOTP
            maxLength={6}
            value={verificationCode}
            onChange={(value) => setVerificationCode(value)}
            disabled={fetchStatus === "fetching"}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          {verificationError && (
            <p className="text-sm text-destructive font-medium text-center">
              {verificationError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleResendCode}
            disabled={resendCountdown > 0 || fetchStatus === "fetching"}
          >
            {resendCountdown > 0
              ? `Resend code in ${resendCountdown}s`
              : "Resend Code"}
          </Button>

          <Button
            variant="link"
            type="button"
            className="text-xs text-muted-foreground self-center"
            onClick={() => {
              setVerifying(false);
              setVerificationCode("");
              setVerificationError(null);
            }}
          >
            ← Back to Sign Up
          </Button>
        </div>
      </FieldGroup>
    </div>
  );
}
