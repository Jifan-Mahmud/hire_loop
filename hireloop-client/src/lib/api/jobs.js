const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getCompanyJobs(companyId, status) {
  try {
    let url = `${baseUrl}/api/jobs`;
    const params = [];
    if (companyId) params.push(`companyId=${encodeURIComponent(companyId)}`);
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error("Failed to fetch jobs:", res.status, res.statusText);
      return [];
    }
    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error fetching company jobs:", error);
    return [];
  }
}

export async function deleteJob(jobId) {
  try {
    const res = await fetch(`${baseUrl}/api/jobs/${jobId}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    console.error("Error deleting job:", error);
    return { error: error.message };
  }
}

export async function updateJobStatus(jobId, status) {
  try {
    const res = await fetch(`${baseUrl}/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch (error) {
    console.error("Error updating job status:", error);
    return { error: error.message };
  }
}
