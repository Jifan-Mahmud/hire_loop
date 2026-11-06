import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMyCompany } from "@/lib/api/company";
import { getCompanyJobs } from "@/lib/api/jobs";
import RecruiterJobsView from "@/components/RecruiterJobs/RecruiterJobsView";

export const dynamic = "force-dynamic";

const RecruiterJobsPage = async () => {
  // Check user session on the server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If user is not authenticated, redirect to signin
  if (!session || !session.user) {
    redirect("/signin");
  }

  const user = session.user;

  // Dynamically fetch company profile belonging to this logged-in recruiter
  const company = await getMyCompany({ email: user.email, userId: user.id });
  const companyId = company?._id ? company._id.toString() : company?.id || null;

  // Dynamically fetch jobs for this specific company
  const jobs = companyId ? await getCompanyJobs(companyId) : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <RecruiterJobsView
        key={companyId || "no-company"}
        initialJobs={jobs || []}
        companyId={companyId}
        company={company}
      />
    </div>
  );
};

export default RecruiterJobsPage;
