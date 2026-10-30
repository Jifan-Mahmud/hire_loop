"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import {
  Person,
  Envelope,
  Lock,
  ArrowLeft,
  Eye,
  EyeSlash,
} from "@gravity-ui/icons";
import {Description, Label, Radio, RadioGroup} from "@heroui/react";

import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    role: "seeker",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove messages while user is typing
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Basic validation
    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!formData.role) {
      setError("Please select your role.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await authClient.signUp.email({
        name: formData.name.trim(),
        role: formData.role,
        email: formData.email.trim(),
        password: formData.password,
        callbackURL: "/",
      });

      if (error) {
        setError(error.message || "Something went wrong. Please try again.");
        return;
      }

      setSuccess("Account created successfully! You can now sign in.");

      // Clear form after successful signup
      setFormData({
        name: "",
        role: "",
        email: "",
        password: "",
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center justify-center">
        <div className="w-full">
          {/* Back to Home */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Card */}
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-2xl sm:p-8">
            {/* Logo */}
            <div className="mb-8 text-center">
              <Link href="/" className="text-3xl font-bold tracking-tight">
                <span className="text-white">hire</span>
                <span className="text-blue-500">l</span>
                <span className="text-orange-500">oop</span>
              </Link>

              <h1 className="mt-6 text-2xl font-semibold">
                Create your account
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Start your journey with HireLoop
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div
                role="status"
                className="mb-5 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400"
              >
                {success}
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Name
                </label>

                <div className="relative">
                  <Person className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    autoComplete="name"
                    disabled={loading}
                    className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none placeholder:text-gray-600 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

             {/* Role */}
<div className="flex flex-col gap-3">
  <Label className="text-sm font-medium text-gray-300">
    Role
  </Label>

  <RadioGroup
    value={formData.role}
    onChange={(value) => {
      setFormData((prev) => ({
        ...prev,
        role: value,
      }));

      setError("");
      setSuccess("");
    }}
    orientation="horizontal"
    name="role"
  >
    <Radio value="seeker">
      <Radio.Content>
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>

        <span className="text-sm text-gray-300">
          Job Seeker
        </span>
      </Radio.Content>
    </Radio>

    <Radio value="recruiter">
      <Radio.Content>
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>

        <span className="text-sm text-gray-300">
          Recruiter
        </span>
      </Radio.Content>
    </Radio>
  </RadioGroup>
</div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Email
                </label>

                <div className="relative">
                  <Envelope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none placeholder:text-gray-600 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password */}
              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Password
                </label>

                <div className="relative">
                  {/* Lock Icon */}
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                  {/* Password Input */}
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    disabled={loading}
                    className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-10 pr-12 text-sm text-white outline-none placeholder:text-gray-600 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  {/* Show / Hide Password */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-500 transition hover:text-white"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeSlash className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-gray-600">
                  Password must contain at least 8 characters.
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                isDisabled={loading}
                radius="lg"
                className="h-12 w-full bg-gradient-to-r from-indigo-500 to-purple-500 font-medium text-white"
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            {/* Sign In */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-medium text-indigo-400 transition hover:text-indigo-300"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
