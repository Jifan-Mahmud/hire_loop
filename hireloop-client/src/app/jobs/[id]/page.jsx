import { notFound } from "next/navigation";
import { getJobById } from "@/lib/api/jobs";
import JobDetailView from "@/components/BrowseJobs/JobDetailView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) return { title: "Job Not Found | HireLoop" };
  return {
    title: `${job.title} at ${job.companyName || "HireLoop"}`,
    description: job.responsibilities || "View job details and apply on HireLoop.",
  };
}

export default async function JobDetailPage({ params }) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  return <JobDetailView job={job} />;
}
