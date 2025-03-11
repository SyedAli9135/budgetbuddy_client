"use client";

import { useState } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Import Next.js Image component

interface SignupForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export default function Signup() {
  const [form, setForm] = useState<SignupForm>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !form.fullName ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("All fields are required!");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!form.termsAccepted) {
      setError("You must accept the terms and conditions.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/server/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      localStorage.setItem("access_token", data.access_token);

      alert("Signup successful! Redirecting...");
      router.push("/home");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#4a0d85] to-[#1b1f3b] px-4">
      <div className="w-full max-w-md rounded-xl bg-[#0d1b2a] p-8 shadow-2xl">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Image src="/logo.png" alt="Logo" width={160} height={160} />
        </div>

        <h2 className="mb-6 text-center text-3xl font-bold text-white drop-shadow-md">
          Create an Account
        </h2>

        {error && (
          <p className="mb-4 text-center text-sm text-red-400">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-left">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Full Name
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-[#102a43] p-3 pl-10 text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div className="text-left">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-500" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-[#102a43] p-3 pl-10 text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="text-left">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-500" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-[#102a43] p-3 pl-10 text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Create a password"
              />
            </div>
          </div>

          <div className="text-left">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-500" />
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-[#102a43] p-3 pl-10 text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={form.termsAccepted}
              onChange={handleChange}
              className="h-4 w-4 accent-blue-500"
            />
            <span className="text-sm text-gray-400">
              I accept the{" "}
              <a href="#" className="text-blue-400 hover:underline">
                Terms & Conditions
              </a>
            </span>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#4a0d85] px-4 py-3 text-lg font-semibold text-white transition hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-blue-400 hover:underline"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
