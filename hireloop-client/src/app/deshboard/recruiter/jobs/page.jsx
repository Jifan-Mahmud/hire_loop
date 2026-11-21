import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMyCompany } from "@/lib/api/company";
import { getCompanyJobs } from "@/lib/api/jobs";
import RecruiterJobsView from "@/components/RecruiterJobs/RecruiterJobsView";
import { MongoClient, ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

let cachedClient = null;
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_DB_URI);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.AUTH_DB_NAME || "hire_Loop");
}

const RecruiterJobsPage = async () => {
  // Check user session on the server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If user is not authenticated, redirect to signin
  if (!session || !session.user) {
    redirect("/signin");
  }

  // Get live user from DB to guarantee freshest role
  const db = await getDb();
  const liveUser = await db.collection("user").findOne({
    $or: [
      ...(ObjectId.isValid(session.user.id) ? [{ _id: new ObjectId(session.user.id) }] : []),
      { email: session.user.email },
    ],
  });

  const currentRole = liveUser?.role || session.user.role;

  // Restrict to Recruiter only: Seekers are redirected to their dashboard
  if (currentRole !== "recruiter") {
    redirect("/deshboard/seekers");
  }

  const user = { ...session.user, ...liveUser };

  // Dynamically fetch company profile belonging to this logged-in recruiter
  const company = await getMyCompany({ email: user.email, userId: user.id });
  const companyId = company?._id ? company._id.toString() : company?.id || null;

  // Dynamically fetch jobs for this specific company
  const jobs = companyId ? await getCompanyJobs(companyId) : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <RecruiterJobsView initialJobs={jobs} company={company} user={user} />
    </div>
  );
};

export default RecruiterJobsPage;
