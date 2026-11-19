const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getAdminStats() {
  try {
    const res = await fetch(`${API_URL}/api/admin/stats`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch admin stats");
    return await res.json();
  } catch (error) {
    console.error("Error getAdminStats:", error);
    return null;
  }
}

export async function getAdminUsers(params = {}) {
  try {
    const searchParams = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/admin/users?${searchParams}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch admin users");
    return await res.json();
  } catch (error) {
    console.error("Error getAdminUsers:", error);
    return { users: [], total: 0, page: 1, totalPages: 1 };
  }
}

export async function updateUserRole(userId, role) {
  try {
    const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    return await res.json();
  } catch (error) {
    console.error("Error updateUserRole:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserStatus(userId, status) {
  try {
    const res = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch (error) {
    console.error("Error updateUserStatus:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteUser(userId) {
  try {
    const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    console.error("Error deleteUser:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminCompanies(params = {}) {
  try {
    const searchParams = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/companies?${searchParams}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch companies");
    return await res.json();
  } catch (error) {
    console.error("Error getAdminCompanies:", error);
    return [];
  }
}

export async function updateCompanyStatus(companyId, status) {
  try {
    const res = await fetch(`${API_URL}/api/admin/companies/${companyId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch (error) {
    console.error("Error updateCompanyStatus:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminJobs(params = {}) {
  try {
    const searchParams = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/jobs?${searchParams}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch jobs");
    return await res.json();
  } catch (error) {
    console.error("Error getAdminJobs:", error);
    return [];
  }
}

export async function updateJobStatus(jobId, status) {
  try {
    const res = await fetch(`${API_URL}/api/admin/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch (error) {
    console.error("Error updateJobStatus:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteJob(jobId) {
  try {
    const res = await fetch(`${API_URL}/api/jobs/${jobId}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    console.error("Error deleteJob:", error);
    return { success: false, error: error.message };
  }
}
