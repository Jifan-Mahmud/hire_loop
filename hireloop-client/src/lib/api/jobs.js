const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getAllJobs(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "all") params.append("category", filters.category);
    if (filters.type && filters.type !== "all") params.append("type", filters.type);
    if (filters.isRemote !== undefined && filters.isRemote !== null && filters.isRemote !== "all") {
      params.append("isRemote", filters.isRemote);
    }
    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${baseUrl}/api/jobs${queryString}`, { cache: "no-store" });
    if (!res.ok) {
      console.error("Failed to fetch jobs:", res.status);
      return [];
    }
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    return [];
  } catch (error) {
    console.error("Error in getAllJobs:", error);
    return [];
  }
}

export async function getJobById(jobId) {
  try {
    const res = await fetch(`${baseUrl}/api/jobs/${jobId}`, { cache: "no-store" });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    return null;
  } catch (error) {
    console.error("Error in getJobById:", error);
    return null;
  }
}

export async function getCompanyJobs(companyId, status) {
  if (!companyId) return [];
  try {
    let url = `${baseUrl}/api/jobs?companyId=${encodeURIComponent(companyId)}`;
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error("Failed to fetch jobs:", res.status, res.statusText);
      return [];
    }
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    return [];
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
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    return { error: `Server response: ${res.status}` };
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
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    return { error: `Server response: ${res.status}` };
  } catch (error) {
    console.error("Error updating job status:", error);
    return { error: error.message };
  }
}
