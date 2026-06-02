"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import Link from "next/link";
import baseApi from "@/src/api/baseApi";
import { ENDPOINTS } from "@/src/api/endPoints";
import { toast } from "sonner";
import axios from "axios";

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const getApiErrorMessage = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return "Failed to register, please try again.";
    }

    const data = error.response?.data as
      | {
          message?: string;
          msg?: string;
          errors?: Record<string, string[] | string>;
        }
      | undefined;

    if (data?.errors) {
      const firstErrorValue = Object.values(data.errors)[0];
      if (Array.isArray(firstErrorValue) && firstErrorValue.length > 0) {
        return firstErrorValue[0];
      }
      if (typeof firstErrorValue === "string" && firstErrorValue) {
        return firstErrorValue;
      }
    }

    return data?.message || data?.msg || "Failed to register, please try again.";
  };

  const validateField = (field: string, value: string) => {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [field]: "This field is required" }));
      return false;
    }
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors((prev) => ({ ...prev, [field]: "Please enter a valid email" }));
      return false;
    }
    if (field === "password" && value.length < 6) {
      setErrors((prev) => ({ ...prev, [field]: "Password must be at least 6 characters" }));
      return false;
    }
    if (field === "confirmPassword" && value !== formData.password) {
      setErrors((prev) => ({ ...prev, [field]: "Passwords do not match" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, [field]: "" }));
    return true;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullNameValid = validateField("name", formData.name);
    const emailValid = validateField("email", formData.email);
    const passwordValid = validateField("password", formData.password);
    const confirmPasswordValid = validateField("confirmPassword", formData.confirmPassword);

    if (!agreeTerms) {
      toast.error("Please agree with terms and privacy");
      return;
    }

    if (!fullNameValid || !emailValid || !passwordValid || !confirmPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password2: formData.confirmPassword,
      };

      const response = await baseApi.post(ENDPOINTS.registration, payload);

      if (response.status === 201 || response.status === 200) {
        const email = response.data?.email || payload.email;
        const expiresInMinutes = response.data?.expires_in_minutes || 15;

        localStorage.setItem("otp_verification_email", email);

        toast.success(
          response.data?.msg ||
            "Registration successful. Please check your email for OTP verification.",
        );

        router.push(
          `/auth/verify?email=${encodeURIComponent(email)}&expires=${encodeURIComponent(
            String(expiresInMinutes),
          )}`,
        );
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-6 py-6">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold" style={{ color: "#ba5f23" }}>
            Register Account
          </h1>
          <p className="text-sm leading-relaxed mt-2" style={{ color: "#888" }}>
            Sign in with your email and password<br />or social media to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Full Name */}
          <div>
            <div className={`relative border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-lg px-3 pt-4 pb-2`}>
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-700">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => validateField("name", formData.name)}
                placeholder="Your Name"
                className="w-full pb-1.5 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1 ml-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <div className={`relative border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 pt-4 pb-2`}>
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => validateField("email", formData.email)}
                placeholder="email@domain.com"
                className="w-full pb-1.5 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1 ml-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div className={`relative border mt-2 ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 pt-4 pb-2 flex items-center`}>
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-700">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => validateField("password", formData.password)}
                placeholder="••••••••"
                className="w-full pb-1.5 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 cursor-pointer ml-2 pb-1.5"
              >
                {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1 ml-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <div className={`relative border mt-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 pt-4 pb-2 flex items-center`}>
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-700">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                onBlur={() => validateField("confirmPassword", formData.confirmPassword)}
                placeholder="••••••••"
                className="w-full pb-1.5 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 cursor-pointer ml-2 pb-1.5"
              >
                {showConfirmPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 ml-1">{errors.confirmPassword}</p>}
          </div>

          {/* Terms and Privacy Checkbox */}
          <div className="flex items-center justify-start">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={() => setAgreeTerms(!agreeTerms)}
                className="accent-[#ba5f23] w-4 h-4"
              />
              Agree with terms and privacy
            </label>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={!agreeTerms || loading}
            className="w-full mt-3 py-4 rounded-xl text-white font-semibold text-base cursor-pointer shadow  bg-[#ba5f23] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {/* Or divider */}
        <p className="text-center text-sm text-[#ba5f23]">Or</p>

        {/* Social buttons */}
        <div className="flex items-center justify-center gap-5">
          <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center shadow-sm cursor-pointer hover:shadow-md transition">
            <FcGoogle size={22} />
          </button>
          <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center shadow-sm cursor-pointer hover:shadow-md transition">
            <FaApple size={22} className="text-gray-800" />
          </button>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-bold"
            style={{ color: "#ba5f23" }}
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
