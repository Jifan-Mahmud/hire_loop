"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowUpRightFromSquare,
  Briefcase,
  CircleCheck,
  CircleXmark,
  Clock,
  Globe,
  MapPin,
  Pencil,
  Person,
  Plus,
  Xmark,
} from "@gravity-ui/icons";
import { registerCompany, updateCompany } from "@/lib/api/company";
import { uploadToImgBB } from "@/lib/api/uploadImage";

export default function CompanyManagementView({ initialCompany = null, user = null }) {
  const [company, setCompany] = useState(initialCompany);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);

  // Form state pre-filled from existing company or blank defaults
  const [formData, setFormData] = useState({
    name: "",
    industry: "Technology",
    website: "",
    location: "",
    employeeRange: "1-10 employees",
    logo: "",
    description: "",
  });

  const openRegisterModal = () => {
    setFormData({
      name: "",
      industry: "Technology",
      website: "",
      location: "",
      employeeRange: "1-10 employees",
      logo: "",
      description: "",
    });
    setFormError("");
    setUploadSuccess(false);
    setIsModalOpen(true);
  };

  const openEditModal = () => {
    if (!company) return;
    setFormData({
      name: company.name || "",
      industry: company.industry || "Technology",
      website: (company.website || "").replace(/^https?:\/\//, ""),
      location: company.location || "",
      employeeRange: company.employeeRange || "1-10 employees",
      logo: company.logo || "",
      description: company.description || "",
    });
    setFormError("");
    setUploadSuccess(false);
    setIsModalOpen(true);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Logo file must be smaller than 5MB.");
      return;
    }

    setFormError("");
    setIsUploadingLogo(true);
    setUploadSuccess(false);

    // 1. Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, logo: previewUrl }));

    try {
      // 2. Upload to ImgBB
      const imgbbUrl = await uploadToImgBB(file);
      if (imgbbUrl) {
        setFormData((prev) => ({ ...prev, logo: imgbbUrl }));
        setUploadSuccess(true);
      } else {
        // Fallback to Base64 FileReader if ImgBB upload fails
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({ ...prev, logo: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Logo upload error:", err);
      // Fallback to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Company name is required.");
      return;
    }

    if (isUploadingLogo) {
      setFormError("Please wait for the logo image to finish uploading.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      industry: formData.industry,
      website: formData.website ? `https://${formData.website.replace(/^https?:\/\//, "").trim()}` : "",
      location: formData.location.trim(),
      employeeRange: formData.employeeRange,
      logo: formData.logo,
      description: formData.description.trim(),
      recruiterId: user?.id || "recruiter-default-id",
      recruiterEmail: user?.email || "recruiter@example.com",
    };

    try {
      if (company && company._id) {
        // Update existing company
        const res = await updateCompany(company._id, payload);
        if (res && !res.error) {
          setCompany((prev) => ({
            ...prev,
            ...payload,
            updatedAt: new Date().toISOString(),
          }));
          setIsModalOpen(false);
        } else {
          setFormError(res?.error || "Failed to update company.");
        }
      } else {
        // Register new company (starts with pending status per requirements)
        const res = await registerCompany({
          ...payload,
          status: "pending",
        });

        if (res && res.insertedId) {
          setCompany({
            _id: res.insertedId,
            ...payload,
            status: "pending",
            createdAt: new Date().toISOString(),
          });
          setIsModalOpen(false);
        } else {
          setFormError(res?.error || "Failed to register company.");
        }
      }
    } catch (err) {
      console.error("Form submit error:", err);
      setFormError("Network error. Please make sure the backend server is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for Status Badge
  const renderStatusBadge = (status = "pending") => {
    const s = status.toLowerCase();
    if (s === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
          <CircleCheck width={14} height={14} />
          <span>Approved</span>
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm">
          <CircleXmark width={14} height={14} />
          <span>Rejected</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-sm">
        <Clock width={14} height={14} />
        <span>Pending Review</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            My Company
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage your company identity, hiring profile, and verification status.
          </p>
        </div>

        {company && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={openEditModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all border border-white/10 shadow hover:border-white/20"
            >
              <Pencil width={16} height={16} />
              <span>Edit Company</span>
            </button>
            <Link
              href="/deshboard/recruiter/jobs/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-purple-500/20"
            >
              <Plus width={16} height={16} />
              <span>Post Job</span>
            </Link>
          </div>
        )}
      </div>

      {/* =========================================================
          STATE 1: NO COMPANY REGISTERED YET
         ========================================================= */}
      {!company ? (
        <div className="py-16 px-6 text-center rounded-3xl border border-dashed border-white/15 bg-neutral-900/40 backdrop-blur-sm max-w-3xl mx-auto shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 shadow-inner">
            <Briefcase width={36} height={36} />
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            No Company Registered
          </h2>

          <p className="text-neutral-400 text-sm max-w-lg mx-auto mt-2 mb-8 leading-relaxed">
            You haven&apos;t registered your company yet. Add your business profile so
            our admin team can verify your organization and you can start posting job
            openings to thousands of candidates.
          </p>

          <button
            onClick={openRegisterModal}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus width={18} height={18} />
            <span>Register Company</span>
          </button>
        </div>
      ) : (
        /* =========================================================
            STATE 2: COMPANY REGISTERED (DETAILS VIEW)
           ========================================================= */
        <div className="space-y-6">
          {/* Status Alert Banner */}
          {company.status === "pending" && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-3">
              <Clock width={20} height={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-300">
                  Company Under Review (Pending Admin Approval)
                </p>
                <p className="text-amber-200/80 mt-0.5">
                  Your company registration has been submitted and is currently awaiting
                  review. Once an administrator approves your account, your company
                  will be publicly visible and your job postings will be marked verified.
                </p>
              </div>
            </div>
          )}

          {company.status === "rejected" && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 flex items-start gap-3">
              <CircleXmark width={20} height={20} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-rose-300">Registration Not Approved</p>
                <p className="text-rose-200/80 mt-0.5">
                  Your company registration was not approved by the admin team. Please review
                  and edit your company information to re-submit for review.
                </p>
              </div>
            </div>
          )}

          {company.status === "approved" && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 flex items-start gap-3">
              <CircleCheck width={20} height={20} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-300">Verified & Approved Company</p>
                <p className="text-emerald-200/80 mt-0.5">
                  Your company has been verified by HireLoop. You can post active listings,
                  receive applications, and manage your hiring pipeline.
                </p>
              </div>
            </div>
          )}

          {/* Company Profile Hero Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-sm shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Logo Box */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-neutral-950 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                {company.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-purple-400">
                    {company.name?.charAt(0)?.toUpperCase() || "C"}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {company.name}
                  </h2>
                  {renderStatusBadge(company.status)}
                </div>

                <div className="flex items-center gap-3 mt-2 text-sm text-neutral-400 flex-wrap">
                  {company.industry && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {company.industry}
                    </span>
                  )}
                  {company.location && (
                    <span className="flex items-center gap-1 text-neutral-300">
                      <MapPin width={14} height={14} className="text-neutral-500" />
                      {company.location}
                    </span>
                  )}
                </div>

                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2.5 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    <Globe width={13} height={13} />
                    <span>{company.website.replace(/^https?:\/\//, "")}</span>
                    <ArrowUpRightFromSquare width={11} height={11} />
                  </a>
                )}
              </div>
            </div>

            <button
              onClick={openEditModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors self-end md:self-auto border border-white/10"
            >
              <Pencil width={16} height={16} />
              <span>Edit Details</span>
            </button>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-neutral-900/50 border border-white/10">
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium uppercase tracking-wider">
                <Briefcase width={14} height={14} className="text-purple-400" />
                <span>Industry</span>
              </div>
              <p className="text-base font-semibold text-white mt-2 capitalize">
                {company.industry || "Not specified"}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/50 border border-white/10">
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium uppercase tracking-wider">
                <MapPin width={14} height={14} className="text-purple-400" />
                <span>Location</span>
              </div>
              <p className="text-base font-semibold text-white mt-2">
                {company.location || "Not specified"}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/50 border border-white/10">
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium uppercase tracking-wider">
                <Person width={14} height={14} className="text-purple-400" />
                <span>Team Size</span>
              </div>
              <p className="text-base font-semibold text-white mt-2">
                {company.employeeRange || "1-10 employees"}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/50 border border-white/10">
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium uppercase tracking-wider">
                <Clock width={14} height={14} className="text-purple-400" />
                <span>Admin Status</span>
              </div>
              <p className="text-base font-semibold text-white mt-2 capitalize">
                {company.status || "Pending"}
              </p>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900/50 border border-white/10 space-y-3">
            <h3 className="text-base font-semibold text-white tracking-wide">
              About the Company
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
              {company.description ||
                "No description provided yet. Click the Edit button above to tell candidates about your mission, values, and workplace culture."}
            </p>
          </div>

          {/* Quick Action Navigation */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-white text-base">
                Ready to recruit top talent?
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Manage your job postings or publish a new position now.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/deshboard/recruiter/jobs"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
              >
                View Jobs
              </Link>
              <Link
                href="/deshboard/recruiter/jobs/new"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors shadow-lg shadow-purple-600/25"
              >
                Post New Job
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          REGISTER / EDIT COMPANY MODAL (MATCHES UPLOADED SCREENSHOT)
         ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#141416] border border-neutral-800 shadow-2xl p-6 md:p-7 text-white">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  {company ? "Edit Company Details" : "Register New Company"}
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Enter your business details to start hiring on HireLoop.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors"
                title="Close"
              >
                <Xmark width={18} height={18} />
              </button>
            </div>

            {/* Error Notice */}
            {formError && (
              <div className="p-3 my-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {/* Row 1: Company Name & Industry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1a1a1c] border border-neutral-700/60 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Industry / Category
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, industry: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1a1a1c] border border-neutral-700/60 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance & Banking">Finance & Banking</option>
                    <option value="Education">Education</option>
                    <option value="Design & Creative">Design & Creative</option>
                    <option value="Marketing & Sales">Marketing & Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Retail & E-commerce">Retail & E-commerce</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Website URL & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Website URL
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-neutral-700/60 focus-within:border-purple-500 transition-colors bg-[#1a1a1c]">
                    <span className="px-3 py-2.5 bg-neutral-800/80 text-neutral-400 text-xs border-r border-neutral-700/60 shrink-0">
                      https://
                    </span>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, website: e.target.value }))
                      }
                      placeholder="www.company.com"
                      className="w-full px-3 py-2.5 text-xs bg-transparent text-white placeholder-neutral-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Location
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                      <MapPin width={14} height={14} />
                    </span>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, location: e.target.value }))
                      }
                      placeholder="City, Country"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-[#1a1a1c] border border-neutral-700/60 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Employee Count Range & Company Logo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Employee Count Range
                  </label>
                  <select
                    value={formData.employeeRange}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        employeeRange: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1a1a1c] border border-neutral-700/60 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="1-10 employees">1-10 employees</option>
                    <option value="11-50 employees">11-50 employees</option>
                    <option value="51-200 employees">51-200 employees</option>
                    <option value="201-500 employees">201-500 employees</option>
                    <option value="500+ employees">500+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Company Logo
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border border-dashed transition-all group ${
                      isUploadingLogo
                        ? "border-purple-500/60 bg-purple-500/10 cursor-wait"
                        : uploadSuccess
                        ? "border-emerald-500/60 bg-emerald-500/5 cursor-pointer hover:bg-emerald-500/10"
                        : "border-neutral-700/70 bg-[#1a1a1c] hover:bg-neutral-800/40 cursor-pointer"
                    }`}
                  >
                    {isUploadingLogo ? (
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 animate-spin text-purple-400" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                      </div>
                    ) : formData.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.logo}
                        alt="Logo preview"
                        className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-neutral-400 group-hover:text-white shrink-0">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0l-4 4m4-4l4 4"
                          />
                        </svg>
                      </div>
                    )}

                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-neutral-200 group-hover:text-white flex items-center gap-1.5">
                        {isUploadingLogo
                          ? "Uploading to ImgBB..."
                          : uploadSuccess
                          ? "Uploaded to ImgBB ✓"
                          : formData.logo
                          ? "Change image"
                          : "Upload image"}
                      </p>
                      <p className="text-[10px] text-neutral-500 truncate">
                        {isUploadingLogo
                          ? "Optimizing and hosting..."
                          : uploadSuccess
                          ? "CDN hosted image ready"
                          : "PNG, JPG up to 5MB"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Brief Description */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Brief Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Tell us about your company's mission and culture..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#1a1a1c] border border-neutral-700/60 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Modal Actions matching screenshot */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingLogo}
                  className="px-5 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-all shadow-md disabled:opacity-50"
                >
                  {isUploadingLogo
                    ? "Uploading image..."
                    : isSubmitting
                    ? "Saving..."
                    : company
                    ? "Save Changes"
                    : "Register Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
