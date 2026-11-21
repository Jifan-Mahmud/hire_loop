import { Suspense } from "react";
import { getAllJobs } from "@/lib/api/jobs";
import BrowseJobsView from "@/components/BrowseJobs/BrowseJobsView";
import LoadingSpinner from "@/components/Common/LoadingSpinner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse Jobs | HireLoop",
  description: "Explore 30+ verified tech career opportunities from premier companies like Apple, Google, Meta, Amazon, and Airbnb.",
};

export default async function BrowseJobsPage({ searchParams }) {
  const sp = searchParams ? await searchParams : {};
  const page = parseInt(sp.page || "1", 10) || 1;
  const category = sp.category || "all";
  const type = sp.type || "all";
  const remote = sp.remote || "all";
  const search = sp.q || "";
  const sort = sp.sort || "newest";

  const data = await getAllJobs({
    status: "active",
    page,
    limit: 9,
    category,
    type,
    isRemote: remote === "remote" ? true : remote === "onsite" ? false : "all",
    search,
    sort,
  });

  const initialJobs = Array.isArray(data) ? data : data?.jobs || [];
  const initialTotal = Array.isArray(data) ? data.length : data?.total || initialJobs.length;
  const initialTotalPages = Array.isArray(data)
    ? Math.ceil(data.length / 9) || 1
    : data?.totalPages || 1;

  return (
    <Suspense fallback={<LoadingSpinner message="Loading jobs..." />}>
      <BrowseJobsView
        initialJobs={initialJobs}
        initialTotal={initialTotal}
        initialTotalPages={initialTotalPages}
        initialPage={page}
      />
    </Suspense>
  );
}
