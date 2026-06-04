"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import Link from "next/link";
// import baseApi from "@/src/api/baseApi";
import { ENDPOINTS } from "@/src/api/endPoints";
import { toast } from "sonner";
import axios from "axios";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    try {
      return localStorage.getItem("remember_email") || "";
    } catch {
      return "";
    }
  });
  const [remember, setRemember] = useState(() => Boolean(email));
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validateField = (field: string, value: string) => {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [field]: "This field is required" }));
      return false;
    }

    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors((prev) => ({ ...prev, [field]: "Please enter a valid email" }));
      return false;
    }

    setErrors((prev) => ({ ...prev, [field]: "" }));
    return true;
  };

  const getApiErrorMessage = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return "Login failed. Please try again.";
    }

    const data = error.response?.data as
      | {
          message?: string;
          msg?: string;
          detail?: string;
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

    return data?.detail || data?.message || data?.msg || "Login failed. Please try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailValid = validateField("email", email);
    const passwordValid = validateField("password", password);

    if (!emailValid || !passwordValid) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: email.trim(),
        password,
      };

      // const response = await baseApi.post(ENDPOINTS.login, payload);
      // const accessToken = response.data?.access;
      // const refreshToken = response.data?.refresh;
      // const user = response.data?.user;

      // if (!accessToken || !refreshToken || !user) {
      //   toast.error("Invalid login response from server.");
      //   return;
      // }

      // localStorage.setItem("access_token", accessToken);
      // localStorage.setItem("refresh_token", refreshToken);
      // localStorage.setItem("user", JSON.stringify(user));
      // localStorage.setItem("is_admin", String(Boolean(user?.is_admin)));

      if (remember) {
        localStorage.setItem("remember_email", payload.email);
      } else {
        localStorage.removeItem("remember_email");
      }

      toast.success("Login successful");

      router.push("/admin/productManagement");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold" style={{ color: "#ba5f23" }}>
            Welcome Back !
          </h1>
          <p className="text-sm leading-relaxed mt-2" style={{ color: "#888" }}>
            Sign in with your email and password<br />or social media to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Email */}
          <div>
            <div className={`relative border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 pt-4 pb-2`}>
              <label className="absolute -top-2.5  left-3 bg-white px-1 text-xs text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => validateField("email", email)}
                placeholder="brooklynsim@gm"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => validateField("password", password)}
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

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="accent-[#ba5f23] w-4 h-4"
              />
              Remember me
            </label>
            <Link
              href="/auth/forgetPassword"
              className="text-sm font-medium"
              style={{ color: "#ba5f23" }}
            >
              Forgot password ?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-4 rounded-xl text-white font-semibold text-base cursor-pointer shadow"
            style={{ backgroundColor: "#ba5f23" }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Or divider */}
        <p className="text-center text-sm text-gray-400">Or</p>

        {/* Social buttons */}
        <div className="flex items-center justify-center gap-5">
          <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center shadow-sm cursor-pointer hover:shadow-md transition">
            <FcGoogle size={22} />
          </button>
          <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center shadow-sm cursor-pointer hover:shadow-md transition">
            <FaApple size={22} className="text-gray-800" />
          </button>
        </div>

        {/* Sign up */}
        <p className="text-center text-sm text-gray-500">
          Don&apos;t have account?{" "}
          <Link
            href="/admin/productManagement"
            className="font-bold"
            style={{ color: "#ba5f23" }}
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}

