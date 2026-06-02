"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { toast } from "sonner";
import baseApi from "@/src/api/baseApi";
import { ENDPOINTS } from "@/src/api/endPoints";
import axios from "axios";

const OTP_LENGTH = 6;

export default function Otp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(Array.from({ length: OTP_LENGTH }, () => ""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = useMemo(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) {
      return emailFromQuery;
    }
    if (typeof window !== "undefined") {
      return localStorage.getItem("otp_verification_email") || "";
    }
    return "";
  }, [searchParams]);

  const expiresInMinutes = searchParams.get("expires") || "15";
  const mode = searchParams.get("mode") || "registration";

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1 || !/^\d*$/.test(value)) {
      return;
    }

    const next = [...code];
    next[index] = value;
    setCode(next);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) {
      return;
    }

    e.preventDefault();
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] || "");
    setCode(next);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otp = code.join("");

    if (!email) {
      toast.error("Email missing. Please try again.");
      router.push(mode === "reset" ? "/auth/forgetPassword" : "/auth/register");
      return;
    }

    if (otp.length !== OTP_LENGTH) {
      toast.error("Please enter the 6 digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      let endpoint = ENDPOINTS.verifyOtp;
      const payload: { email: string; otp: string } = {
        email,
        otp,
      };

      if (mode === "reset") {
        endpoint = ENDPOINTS.reSetPassword;
      }

      const response = await baseApi.post(endpoint, payload);

      if (response.status === 200 || response.status === 201) {
        if (mode === "reset") {
          const resetToken = response.data?.reset_token;
          if (resetToken) {
            localStorage.setItem("reset_token", resetToken);
          }
          localStorage.setItem("reset_password_email", email);
          toast.success(response.data?.msg || "OTP verified successfully.");
          router.push(`/auth/setPass`);
        } else {
          toast.success(response.data?.msg || "Email verified successfully.");
          localStorage.removeItem("otp_verification_email");
          router.push("/auth/login");
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.msg ||
            "Invalid or expired OTP. Please try again.",
        );
      } else {
        toast.error("Invalid or expired OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email missing. Please try again.");
      router.push("/auth/forgetPassword");
      return;
    }

    setResendLoading(true);
    try {
      const endpoint = mode === "reset" ? ENDPOINTS.forgetPassword : ENDPOINTS.resendOtp;

      const response = await baseApi.post(endpoint, {
        email,
      });

      if (response.status === 200 || response.status === 201) {
        setCode(Array.from({ length: OTP_LENGTH }, () => ""));
        inputRefs.current[0]?.focus();
        if (mode === "reset") {
          localStorage.setItem("reset_password_email", email);
          toast.success(response.data?.msg || "Reset code sent. Please check your email.");
        } else {
          localStorage.setItem("otp_verification_email", email);
          toast.success(response.data?.msg || "New OTP sent to your email.");
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const apiErrors = error.response?.data?.errors;
        const firstFieldError = apiErrors
          ? Object.values(apiErrors)[0]
          : undefined;

        toast.error(
          (Array.isArray(firstFieldError) ? firstFieldError[0] : firstFieldError) ||
          error.response?.data?.message ||
            error.response?.data?.msg ||
            "Failed to resend code. Please try again.",
        );
      } else {
        toast.error("Failed to resend code. Please try again.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex justify-center px-6 py-10">
      <div className="w-full max-w-sm flex flex-col gap-6 min-h-full">
        <div className="flex items-center gap-2 text-gray-800 hover:text-gray-800 transition-colors">
          <Link href={mode === "reset" ? "/auth/forgetPassword" : "/auth/register"}>
            <FiArrowLeft size={20} />
          </Link>
          <span className="text-sm">Verification</span>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold" style={{ color: "#ba5f23" }}>
            {mode === "reset" ? "Reset Password" : "Verify your Email"}
          </h1>
          <p className="text-sm leading-relaxed mt-2" style={{ color: "#888" }}>
            {mode === "reset"
              ? "Enter the verification code sent to your email to reset your password"
              : "Please enter the 6 digit verification code sent to"}
          </p>
          <p className="text-sm font-semibold break-all" style={{ color: "#4b5563" }}>
            {email || "your email"}
          </p>
          <p className="text-xs mt-1" style={{ color: "#888" }}>
            OTP expires in {expiresInMinutes} minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex justify-center gap-2.5 sm:gap-3.5 md:gap-4 mt-4">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onPaste={handlePaste}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`h-12 w-10 sm:w-11 md:w-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ba5f23] focus:border-[#ba5f23] ${
                  digit ? "bg-[#ba5f23] text-white border-[#ba5f23]" : "bg-white border-gray-300"
                }`}
              />
            ))}
          </div>

          <div className="text-center mt-1">
            <p className="text-sm text-gray-600">
              Don&apos;t receive code?{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="font-medium text-[#f87171] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resendLoading ? "Sending..." : "Resend code"}
              </button>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl text-white font-semibold text-base cursor-pointer shadow bg-[#ba5f23] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-auto">
          {mode === "reset" ? (
            <>
              Remember your password?{" "}
              <Link href="/auth/login" className="font-bold" style={{ color: "#ba5f23" }}>
                Sign in
              </Link>
            </>
          ) : (
            <>
              Need to register again?{" "}
              <Link href="/auth/register" className="font-bold" style={{ color: "#ba5f23" }}>
                Register
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
