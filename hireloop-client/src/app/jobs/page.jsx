import { getAllJobs } from "@/lib/api/jobs";
import BrowseJobsView from "@/components/BrowseJobs/BrowseJobsView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse Jobs | HireLoop",
  description: "Explore 30+ verified tech career opportunities from premier companies like Apple, Google, Meta, Amazon, and Airbnb.",
};

export default async function BrowseJobsPage() {
  const jobs = await getAllJobs({ status: "active" });

  return <BrowseJobsView initialJobs={jobs || []} />;
}
