import { getCompanyJobs } from "@/lib/api/jobs";
import RecruiterJobsView from "@/components/RecruiterJobs/RecruiterJobsView";

export const dynamic = "force-dynamic";

const RecruiterJobsPage = async () => {
  const companyId = "company-default-id";
  const jobs = await getCompanyJobs(companyId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <RecruiterJobsView initialJobs={jobs || []} companyId={companyId} />
    </div>
  );
};

export default RecruiterJobsPage;
