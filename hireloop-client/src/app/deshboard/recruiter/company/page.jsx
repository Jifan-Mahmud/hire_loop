import { getMyCompany } from "@/lib/api/company";
import CompanyManagementView from "@/components/RecruiterCompany/CompanyManagementView";

export const dynamic = "force-dynamic";

const RecruiterCompanyPage = async () => {
  const company = await getMyCompany();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      <CompanyManagementView initialCompany={company} />
    </div>
  );
};

export default RecruiterCompanyPage;
