"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import baseApi from "@/src/api/baseApi";
import { ENDPOINTS } from "@/src/api/endPoints";
import { toast } from "sonner";
import axios from "axios";

export default function Forget() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const validateEmail = () => {
        if (!email.trim()) {
            setError("This field is required");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEmail()) {
            return;
        }

        setLoading(true);

        try {
            const response = await baseApi.post(ENDPOINTS.forgetPassword, {
                email: email.trim(),
            });

            if (response.status === 200 || response.status === 201) {
                localStorage.setItem("reset_password_email", email.trim());
                toast.success(response.data?.msg || "Password reset OTP sent. Please check your email.");

                router.push(
                    `/auth/verify?email=${encodeURIComponent(email.trim())}&mode=reset`
                );
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                toast.error(
                    err.response?.data?.message ||
                    err.response?.data?.msg ||
                    "Failed to send reset link. Please try again."
                );
            } else {
                toast.error("Failed to send reset link. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-white flex  justify-center px-6 py-10">
            <div className="w-full max-w-sm flex flex-col gap-6 min-h-full">

                {/* Back Button */}
                <div className="flex items-center gap-2 text-gray-800 hover:text-gray-800 transition-colors">
                    <Link href="/auth/login">
                        <FiArrowLeft size={20} />
                    </Link>
                    <span className="text-sm">Forgot Password</span>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold" style={{ color: "#ba5f23" }}>
                        Forgot Password
                    </h1>
                    <p className="text-sm leading-relaxed mt-2" style={{ color: "#888" }}>
                        Select which contact details should we use to reset your password
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* Email */}
                    <div>
                        <div className={`relative border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 pt-4 pb-2`}>
                            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={validateEmail}
                                placeholder="email@domain.com"
                                className="w-full pb-1.5 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                            />
                        </div>
                        {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
                    </div>

                </form>

                {/* Back to Sign In */}


                {/* Send Button - Fixed at bottom */}
                <div className="mt-auto">
                    <button
                        type="submit"
                        disabled={loading}
                        onClick={handleSubmit}
                        className="w-full py-4 rounded-xl text-white font-semibold text-base cursor-pointer shadow bg-[#ba5f23] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </div>
                <p className="text-center text-sm text-gray-500">
                    Remember your password?{" "}
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
