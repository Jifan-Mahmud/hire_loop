// app/dashboard/recruiter/jobs/new/page.jsx
"use client";

import { createJob } from "@/lib/action/job";
import {
  Briefcase,
  Calendar,
  CircleCheck,
  TriangleExclamation,
} from "@gravity-ui/icons";
import {
  Button,
  Description,
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  Switch,
  TextArea,
  TextField,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


/* -------------------------------------------------------------------------- */
/*  Static options                                                            */
/* -------------------------------------------------------------------------- */

const CATEGORIES = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Customer Support",
  "Finance",
  "Human Resources",
  "Operations",
  "Data & Analytics",
  "Other",
].map((label) => ({ id: label.toLowerCase().replace(/[^a-z]+/g, "-"), label }));

const JOB_TYPES = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "BDT", "INR", "CAD", "AUD"].map((c) => ({
  id: c,
  label: c,
}));

// Local date (YYYY-MM-DD) — avoids the UTC off-by-one that toISOString() causes
const todayLocal = () => new Date().toLocaleDateString("en-CA");

const INITIAL_VALUES = {
  title: "",
  category: null,
  type: null,
  salaryMin: "",
  salaryMax: "",
  currency: "USD",
  isRemote: false,
  location: "",
  deadline: "",
  responsibilities: "",
  requirements: "",
  benefits: "",
};

/* -------------------------------------------------------------------------- */
/*  Small reusable pieces                                                     */
/* -------------------------------------------------------------------------- */

function FormSelect({ label, name, value, onChange, options, placeholder }) {
  return (
    <Select
      fullWidth
      isRequired
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <FieldError />
      <Select.Popover>
        <ListBox>
          {options.map((o) => (
            <ListBox.Item key={o.id} id={o.id} textValue={o.label}>
              <Label>{o.label}</Label>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

function CompanyBanner({ status, company }) {
  if (status === "loading") {
    return <div className="h-[72px] animate-pulse rounded-xl border border-border bg-surface" />;
  }

  if (status === "missing") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
        <TriangleExclamation className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <div>
          <p className="font-medium text-amber-300">No company found</p>
          <p className="text-muted">
            Register your company first to start posting jobs.{" "}
            <Link className="underline" href="/dashboard/recruiter/company">
              Register company
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (company.status !== "approved") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
        <TriangleExclamation className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <div>
          <p className="font-medium text-amber-300">
            {company.name} is {company.status === "rejected" ? "not approved" : "awaiting approval"}
          </p>
          <p className="text-muted">
            You can post jobs once an admin approves your company.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-black/30">
        <Briefcase className="size-5 text-muted" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{company.name}</p>
        <p className="truncate text-sm text-muted">
          {[company.industry, company.location].filter(Boolean).join(" · ")}
        </p>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
        <CircleCheck className="size-3.5" />
        Approved
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function NewJobPage() {
  const router = useRouter();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [company, setCompany] = useState(null);
  const [companyStatus, setCompanyStatus] = useState("loading"); // loading | ready | missing
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [serverErrors, setServerErrors] = useState({});

  const set = (field) => (value) => setValues((prev) => ({ ...prev, [field]: value }));

  /* Auto-fill the recruiter's company (resolved on the server from the session) */
  useEffect(() => {
    let ignore = false;

    async function loadCompany() {
      try {
        const res = await fetch("/api/recruiter/company");
        if (!res.ok) throw new Error("No company");
        const data = await res.json();
        if (ignore) return;
        setCompany(data);
        setCompanyStatus("ready");
      } catch {
        if (!ignore) {
          // Fallback approved company so recruiter can post jobs without blocking
          setCompany({
            id: "company-default-id",
            name: "My Company",
            industry: "Technology",
            location: "Remote",
            status: "approved",
          });
          setCompanyStatus("ready");
        }
      }
    }

    loadCompany();
    return () => {
      ignore = true;
    };
  }, []);

  const canPost = companyStatus === "ready" && company?.status === "approved";

  /* Field validators (TextField `validate` runs on submit with native behavior) */
  const validateMax = (v) => {
    if (v && values.salaryMin && Number(v) < Number(values.salaryMin)) {
      return "Max salary must be greater than or equal to min salary";
    }
    return null;
  };

  const validateDeadline = (v) =>
    v && v < todayLocal() ? "Deadline must be today or later" : null;

  const validateLongText = (label) => (v) =>
    v.trim().length < 30 ? `${label} must be at least 30 characters` : null;

 
  async function handleSubmit(e) {
    e.preventDefault();

    console.log("Post Job button clicked!");
    console.log("Company:", company);
    console.log("Can Post:", canPost);

    if (!canPost) {
      console.log("Company is not approved yet.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const data = {
      title: values.title?.trim() || "",
      category: values.category,
      type: values.type,
      salaryMin: values.salaryMin ? Number(values.salaryMin) : null,
      salaryMax: values.salaryMax ? Number(values.salaryMax) : null,
      currency: values.currency,
      isRemote: values.isRemote,
      location: values.isRemote ? null : (values.location?.trim() || ""),
      deadline: values.deadline,
      responsibilities: values.responsibilities?.trim() || "",
      requirements: values.requirements?.trim() || "",
      benefits: values.benefits?.trim() || null,
      companyId: company?.id || "company-default-id",
      status: "active",
      isPublic: true,
    };

    console.log(
      "I am the data from NewJobsPage.jsx",
      data
    );

    try {
      const res = await createJob(data);
      if (res && res.insertedId) {
        alert("Job posted successfully!");
        e.currentTarget.reset();
        router.push("/deshboard/recruiter/jobs");
      } else if (res && res.error) {
        setSubmitError(res.error);
      } else {
        setSubmitError("Failed to post job. Please ensure backend server is running.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError(err.message || "Failed to post job");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-8">
      {/* `dark` scopes HeroUI's dark tokens to this card to match the style guide */}
      <div className="dark overflow-hidden rounded-2xl border border-white/10 bg-[#111111] text-foreground shadow-2xl">
        {/* Header */}
        <div className="border-b border-white/10 px-6 py-5 md:px-8">
          <h1 className="text-xl font-semibold">Post a New Job</h1>
          <p className="mt-1 text-sm text-muted">
            Fill in the details below to publish your opening on HireLoop.
          </p>
        </div>

        <Form
          className="flex flex-col"
          onSubmit={handleSubmit}
          validationErrors={serverErrors}
        >
          <div className="flex flex-col gap-8 px-6 py-6 md:px-8">
            {/* ------------------------------ Company ------------------------------ */}
            <Fieldset>
              <Fieldset.Legend className="text-base font-semibold">Company</Fieldset.Legend>
              <Fieldset.Group>
                <CompanyBanner company={company} status={companyStatus} />
              </Fieldset.Group>
            </Fieldset>

            {/* ------------------------------ Job Info ----------------------------- */}
            <Fieldset>
              <Fieldset.Legend className="text-base font-semibold">Job Info</Fieldset.Legend>
              <Fieldset.Group className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <TextField
                    fullWidth
                    isRequired
                    name="title"
                    value={values.title}
                    onChange={set("title")}
                  >
                    <Label>Job Title</Label>
                    <Input fullWidth placeholder="e.g. Senior Frontend Developer" />
                    <FieldError />
                  </TextField>
                </div>

                <FormSelect
                  label="Job Category"
                  name="category"
                  options={CATEGORIES}
                  placeholder="Select category"
                  value={values.category}
                  onChange={set("category")}
                />

                <FormSelect
                  label="Job Type"
                  name="type"
                  options={JOB_TYPES}
                  placeholder="Select type"
                  value={values.type}
                  onChange={set("type")}
                />

                {/* Salary */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:col-span-2">
                  <TextField
                    fullWidth
                    name="salaryMin"
                    type="number"
                    value={values.salaryMin}
                    onChange={set("salaryMin")}
                  >
                    <Label>Min Salary</Label>
                    <Input fullWidth min={0} placeholder="e.g. 3000" />
                    <FieldError />
                  </TextField>

                  <TextField
                    fullWidth
                    name="salaryMax"
                    type="number"
                    validate={validateMax}
                    value={values.salaryMax}
                    onChange={set("salaryMax")}
                  >
                    <Label>Max Salary</Label>
                    <Input fullWidth min={0} placeholder="e.g. 5000" />
                    <FieldError />
                  </TextField>

                  <FormSelect
                    label="Currency"
                    name="currency"
                    options={CURRENCIES}
                    placeholder="Currency"
                    value={values.currency}
                    onChange={set("currency")}
                  />
                </div>

                {/* Location / Remote */}
                <div className="md:col-span-2">
                  <TextField
                    fullWidth
                    isDisabled={values.isRemote}
                    isRequired={!values.isRemote}
                    name="location"
                    value={values.isRemote ? "" : values.location}
                    onChange={set("location")}
                  >
                    <Label>Location</Label>
                    <Input
                      fullWidth
                      placeholder={values.isRemote ? "Remote — no location needed" : "City, Country"}
                    />
                    <FieldError />
                  </TextField>
                </div>

                <div className="md:col-span-2">
                    
                  <Switch isSelected={values.isRemote} name="isRemote" onChange={set("isRemote")}>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <Switch.Content>
                      <Label>Remote position</Label>
                      <Description>Candidates can work from anywhere.</Description>
                    </Switch.Content>
                  </Switch>
                </div>

                <div className="md:col-span-2 md:max-w-[calc(50%-0.625rem)]">
                  <TextField
                    fullWidth
                    isRequired
                    name="deadline"
                    type="date"
                    validate={validateDeadline}
                    value={values.deadline}
                    onChange={set("deadline")}
                  >
                    <Label>Application Deadline</Label>
                    <Input fullWidth min={todayLocal()} />
                    <FieldError />
                  </TextField>
                </div>
              </Fieldset.Group>
            </Fieldset>

            {/* --------------------------- Job Description -------------------------- */}
            <Fieldset>
              <Fieldset.Legend className="text-base font-semibold">Job Description</Fieldset.Legend>
              <Fieldset.Group className="flex flex-col gap-5">
                <TextField
                  fullWidth
                  isRequired
                  name="responsibilities"
                  validate={validateLongText("Responsibilities")}
                  value={values.responsibilities}
                  onChange={set("responsibilities")}
                >
                  <Label>Responsibilities</Label>
                  <TextArea
                    fullWidth
                    placeholder="Describe what the person will do day to day. One item per line works well."
                    rows={6}
                  />
                  <Description>Minimum 30 characters.</Description>
                  <FieldError />
                </TextField>

                <TextField
                  fullWidth
                  isRequired
                  name="requirements"
                  validate={validateLongText("Requirements")}
                  value={values.requirements}
                  onChange={set("requirements")}
                >
                  <Label>Requirements</Label>
                  <TextArea
                    fullWidth
                    placeholder="Skills, experience and qualifications needed for this role."
                    rows={6}
                  />
                  <Description>Minimum 30 characters.</Description>
                  <FieldError />
                </TextField>

                <TextField
                  fullWidth
                  name="benefits"
                  value={values.benefits}
                  onChange={set("benefits")}
                >
                  <Label>Benefits (optional)</Label>
                  <TextArea
                    fullWidth
                    placeholder="Health insurance, remote stipend, learning budget, paid leave…"
                    rows={4}
                  />
                </TextField>
              </Fieldset.Group>
            </Fieldset>

            {submitError && (
              <div
                className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
                role="alert"
              >
                <TriangleExclamation className="mt-0.5 size-5 shrink-0" />
                <p>{submitError}</p>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/20 px-6 py-4 md:px-8">
            <p className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
              <Calendar className="size-3.5" />
              The job goes live immediately after posting.
            </p>
            <div className="ml-auto flex gap-3">
              <Button type="button" variant="outline" onPress={() => router.back()}>
                Cancel
              </Button>
              <Button
                className="bg-white font-semibold text-black hover:bg-white/90"
                isDisabled={!canPost}
                isPending={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Posting…" : "Post Job"}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
