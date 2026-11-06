import { getJobById, getAllJobs } from "@/lib/api/jobs";
import JobApplyView from "@/components/BrowseJobs/JobApplyView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const { jobId } = (await searchParams) || {};
  if (jobId) {
    const job = await getJobById(jobId);
    if (job) {
      return {
        title: `Apply for ${job.title} at ${job.companyName} | HireLoop`,
        description: `Submit your application for the ${job.title} opening at ${job.companyName}.`,
      };
    }
  }
  return {
    title: "Apply for Jobs | HireLoop",
    description: "Submit your application, resume, and cover letter for premier tech roles on HireLoop.",
  };
}

export default async function JobApplyPage({ searchParams }) {
  const { jobId } = (await searchParams) || {};
  let initialJob = null;

  if (jobId) {
    initialJob = await getJobById(jobId);
  }

  const activeJobs = await getAllJobs({ status: "active" });

  return (
    <JobApplyView
      key={jobId || "default"}
      initialJob={initialJob}
      initialJobId={jobId}
      activeJobs={activeJobs || []}
    />
  );
}
