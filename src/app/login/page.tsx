"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import Image from "next/image";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Both fields are required!");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/server/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("access_token", data.access_token);

      alert("Login successful! Redirecting...");
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
          Welcome Back
        </h2>
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-300">
              Email
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-500" />
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

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-300">
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
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#4a0d85] px-4 py-3 text-lg font-semibold text-white transition hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="font-medium text-blue-400 hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
