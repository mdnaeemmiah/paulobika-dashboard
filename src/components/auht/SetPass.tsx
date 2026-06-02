"use client";

import { useState, useEffect } from "react";
import { FiArrowLeft, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import baseApi from "@/src/api/baseApi";
import { ENDPOINTS } from "@/src/api/endPoints";
import { toast } from "sonner";
import axios from "axios";

export default function SetPass() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    } else if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("reset_password_email");
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }

    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("reset_token");
      if (savedToken) {
        setResetToken(savedToken);
      }
    }
  }, [searchParams]);

  const validateField = (field: string, value: string) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, [field]: "This field is required" }));
      return false;
    }
    if (field === "confirmPassword" && value !== formData.newPassword) {
      setErrors(prev => ({ ...prev, [field]: "Passwords do not match" }));
      return false;
    }
    setErrors(prev => ({ ...prev, [field]: "" }));
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPasswordValid = validateField("newPassword", formData.newPassword);
    const confirmPasswordValid = validateField("confirmPassword", formData.confirmPassword);
    
    if (!newPasswordValid || !confirmPasswordValid) {
      return;
    }

    if (!email) {
      toast.error("Email not found. Please restart password reset.");
      router.push("/auth/forgetPassword");
      return;
    }

    if (!resetToken) {
      toast.error("Reset token not found. Please verify OTP again.");
      router.push("/auth/forgetPassword");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        reset_token: resetToken,
        new_password: formData.newPassword,
        new_password2: formData.confirmPassword,
      };

      const response = await baseApi.post(ENDPOINTS.setNewPassword, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data?.msg || "Password changed successfully.");
        localStorage.removeItem("reset_password_email");
        localStorage.removeItem("reset_token");
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message ||
          err.response?.data?.msg ||
          "Failed to change password. Please try again."
        );
      } else {
        toast.error("Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push("/auth/login");
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full bg-white flex pt-50 justify-center px-6 py-6">
        <div className="w-full max-w-sm flex flex-col gap-8 items-center text-center">
          
          {/* Success Icon */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#ba5f23" }}>
                <FiCheck size={32} className="text-white" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900">
              Success!
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your password has been changed. Please log in again<br />
              with a new password.
            </p>
          </div>

          {/* Continue Button */}
          <div className="w-full mt-34">
            <button
              onClick={handleContinue}
              className="w-full py-4 rounded-xl text-white font-semibold text-base cursor-pointer shadow"
              style={{ backgroundColor: "#ba5f23" }}
            >
              Continue
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex justify-center px-6 py-10">
      <div className="w-full max-w-sm flex flex-col gap-6 min-h-full">

        {/* Back Button */}
        <Link href="/auth/verify" className="flex items-center gap-2 text-gray-800 hover:text-gray-800 transition-colors">
          <FiArrowLeft size={20} />
          <span className="text-sm">Change Password</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold" style={{ color: "#ba5f23" }}>
            Create New Password
          </h1>
          <p className="text-sm leading-relaxed mt-2" style={{ color: "#888" }}>
            Please enter new password to change
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
          
          {/* New Password */}
          <div>
            <div className={`relative border mt-2 ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 pt-4 pb-2 flex items-center`}>
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-700">
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                onBlur={() => validateField("newPassword", formData.newPassword)}
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
            {errors.newPassword && <p className="text-xs text-red-500 mt-1 ml-1">{errors.newPassword}</p>}
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
                onChange={handleInputChange}
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

        </form>

        {/* Change Password Button - Fixed at bottom */}
        <div className="mt-auto">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-xl text-white font-semibold text-base cursor-pointer shadow bg-[#ba5f23] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </div>

      </div>
    </div>
  );
}
