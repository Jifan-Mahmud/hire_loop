import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMyCompany } from "@/lib/api/company";
import CompanyManagementView from "@/components/RecruiterCompany/CompanyManagementView";

export const dynamic = "force-dynamic";

const RecruiterCompanyPage = async () => {
  // Check user session on the server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If user is not authenticated (signed out), redirect to signin
  if (!session || !session.user) {
    redirect("/signin");
  }

  const user = session.user;
  // Fetch company strictly for this logged-in recruiter
  const company = await getMyCompany({ email: user.email, userId: user.id });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <CompanyManagementView initialCompany={company} user={user} />
    </div>
  );
};

export default RecruiterCompanyPage;
