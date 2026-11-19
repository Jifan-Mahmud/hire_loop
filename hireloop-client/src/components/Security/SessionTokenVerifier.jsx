"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Key,
  Copy,
  Check,
  Eye,
  EyeSlash,
  ArrowsRotateLeft,
  CircleCheck,
} from "@gravity-ui/icons";
import { authClient, useSession } from "@/lib/auth-client";
import { verifyServerToken } from "@/lib/api/auth";

export default function SessionTokenVerifier() {
  const { data: sessionData } = useSession();
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    async function loadToken() {
      // 1. Check direct session hook
      if (sessionData?.session?.token) {
        setToken(sessionData.session.token);
        return;
      }
      // 2. Fallback to authClient.getSession()
      try {
        const res = await authClient.getSession();
        if (res?.data?.session?.token) {
          setToken(res.data.session.token);
        }
      } catch (err) {
        console.error("Failed to load session token:", err);
      }
    }
    loadToken();
  }, [sessionData]);

  const handleCopy = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (!token) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const result = await verifyServerToken(token);
      setVerifyResult(result);
    } catch (err) {
      setVerifyResult({ success: false, error: err.message });
    } finally {
      setVerifying(false);
    }
  };

  const maskedToken = token
    ? `${token.slice(0, 8)}${"•".repeat(Math.max(12, token.length - 14))}${token.slice(-6)}`
    : "No active session token detected";

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-[#12121a] to-[#0e0e15] p-6 sm:p-7 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Token-Based User Authentication</span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                NO JWT
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Verified directly via MongoDB Database Session Collection (Opaque Token Architecture)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/5 px-2.5 py-1 text-xs text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            MongoDB Session
          </span>
        </div>
      </div>

      {/* Body: Token Details */}
      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-2">
            Active Session Token (Database Opaque Token)
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
              <input
                type="text"
                readOnly
                value={showToken ? token : maskedToken}
                placeholder="Session token will appear here when logged in"
                className="w-full h-11 pl-10 pr-24 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm font-mono text-neutral-200 outline-none select-all"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition text-xs flex items-center gap-1 px-1.5 py-1 rounded-md hover:bg-white/5"
                title={showToken ? "Hide token" : "Show token"}
              >
                {showToken ? <EyeSlash className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span className="text-[11px]">{showToken ? "Hide" : "Show"}</span>
              </button>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              disabled={!token}
              className="h-11 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white transition flex items-center justify-center gap-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Action Button: Live Verify */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-neutral-400">
            Click to send this token to <code className="text-purple-300 font-mono">/api/auth/verify-token</code> and find the valid user in MongoDB.
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying || !token}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <ArrowsRotateLeft className={`h-4 w-4 ${verifying ? "animate-spin" : ""}`} />
            <span>{verifying ? "Verifying with MongoDB..." : "Verify Token with Server"}</span>
          </button>
        </div>

        {/* Verification Result Showcase */}
        {verifyResult && (
          <div
            className={`mt-4 rounded-xl border p-4 text-xs space-y-2.5 animate-fadeIn ${
              verifyResult.success
                ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
                : "border-red-500/30 bg-red-950/20 text-red-200"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              {verifyResult.success ? (
                <>
                  <CircleCheck className="h-4 w-4 text-emerald-400" />
                  <span>Valid User Verified Successfully (No JWT used)!</span>
                </>
              ) : (
                <span>Verification Failed: {verifyResult.error}</span>
              )}
            </div>

            {verifyResult.success && (
              <div className="space-y-3 pt-2 border-t border-emerald-500/20 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                  <div>
                    <span className="text-neutral-400">Identified User: </span>
                    <span className="text-white font-semibold">{verifyResult.user?.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Email: </span>
                    <span className="text-white">{verifyResult.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Identified Role: </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        verifyResult.user?.role === "admin"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : verifyResult.user?.role === "recruiter"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {verifyResult.user?.role === "admin" && "🛡️ Admin (Alex Rivera)"}
                      {verifyResult.user?.role === "recruiter" && "💼 Recruiter (Company Manager)"}
                      {verifyResult.user?.role === "seeker" && "🎯 Seeker (Job Applicant)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Token Validity / Duration: </span>
                    <span className="text-amber-300 font-semibold">7 Days (৭ দিন মেয়াদ)</span>
                  </div>
                </div>

                {/* Expiry Details */}
                {verifyResult.session?.expiresAt && (
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono">
                    <span className="text-neutral-400">
                      Session Expiration:{" "}
                      <span className="text-neutral-200">
                        {new Date(verifyResult.session.expiresAt).toLocaleString("bn-BD", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </span>
                    <span className="text-emerald-400 font-medium">✓ Active & Valid in MongoDB</span>
                  </div>
                )}

                <div className="text-[11px] text-neutral-300 font-sans pt-1">
                  💡 <strong>সার্ভার কীভাবে রোল আলাদা করলো?</strong> ক্লায়েন্ট থেকে শুধু এই ওপেকের টোকেনটি সার্ভারে এসেছে। সার্ভার MongoDB-র <code className="text-emerald-400 font-mono">session</code> থেকে ইউজার আইডি পেয়ে <code className="text-emerald-400 font-mono">user.role</code> ফিল্ড চেক করেছে এবং স্বয়ংক্রিয়ভাবে ব্যবহারকারীকে <strong>{verifyResult.user?.role?.toUpperCase()}</strong> হিসেবে চিহ্নিত করেছে।
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
