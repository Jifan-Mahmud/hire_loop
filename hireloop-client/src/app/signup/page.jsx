"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@heroui/react";
import {
  Person,
  Envelope,
  Lock,
  ArrowLeft,
  Eye,
  EyeSlash,
  CircleInfo,
} from "@gravity-ui/icons";
import { Label, Radio, RadioGroup } from "@heroui/react";

import { authClient } from "@/lib/auth-client";

function SignupContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

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

      setSuccess("Account created successfully! Logging you in...");

      // Automatically sign in the user
      try {
        await authClient.signIn.email({
          email: formData.email.trim(),
          password: formData.password,
          callbackURL: "/",
        });

        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }

        if (formData.role === "recruiter") {
          window.location.href = "/deshboard/recruiter";
        } else {
          window.location.href = "/jobs";
        }
      } catch (signErr) {
        // If automatic signin was not immediate, redirect to signin page
        window.location.href = redirectUrl
          ? `/signin?redirect=${encodeURIComponent(redirectUrl)}`
          : "/signin";
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Back to Home / Jobs */}
      <Link
        href={redirectUrl || "/jobs"}
        className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        {redirectUrl ? "Back to previous page" : "Back to jobs"}
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

          <h1 className="mt-6 text-2xl font-semibold">Create your account</h1>

          <p className="mt-2 text-sm text-gray-400">
            {redirectUrl?.includes("/apply")
              ? "Create your Job Seeker account to apply for positions"
              : "Start your journey with HireLoop"}
          </p>
        </div>

        {/* Notice if redirected from Apply */}
        {redirectUrl?.includes("/apply") && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-xs text-indigo-300">
            <CircleInfo className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>After registration, you will be taken straight to submit your application.</span>
          </div>
        )}

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
              Full Name
            </label>

            <div className="relative">
              <Person className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                autoComplete="name"
                disabled={loading}
                className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none placeholder:text-gray-600 transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium text-gray-300">Role</Label>

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
                    Job Seeker (Candidate)
                  </span>
                </Radio.Content>
              </Radio>

              <Radio value="recruiter">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>

                  <span className="text-sm text-gray-300">
                    Recruiter (Company)
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
              Email Address
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
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

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

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-500 transition hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlash className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Password must contain at least 8 characters.
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            isDisabled={loading}
            radius="lg"
            className="h-12 w-full bg-gradient-to-r from-indigo-500 to-purple-500 font-medium text-white shadow-lg shadow-indigo-500/20"
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            href={
              redirectUrl
                ? `/signin?redirect=${encodeURIComponent(redirectUrl)}`
                : "/signin"
            }
            className="font-medium text-indigo-400 transition hover:text-indigo-300"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center justify-center">
        <Suspense
          fallback={
            <div className="p-8 text-center text-neutral-400">Loading signup...</div>
          }
        >
          <SignupContent />
        </Suspense>
      </div>
    </main>
  );
}
