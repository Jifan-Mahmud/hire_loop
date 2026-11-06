const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getMyCompany(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.email) query.append("email", params.email);
    if (params.userId) query.append("userId", params.userId);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await fetch(`${baseUrl}/api/companies/my-company${queryString}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      console.warn("Could not fetch my-company:", res.status);
      return null;
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    return null;
  } catch (error) {
    console.error("Error in getMyCompany:", error);
    return null;
  }
}

export async function registerCompany(companyData) {
  try {
    const res = await fetch(`${baseUrl}/api/companies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(companyData),
    });

    const contentType = res.headers.get("content-type");
    if (!res.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errData = await res.json();
        return { error: errData.error || `Server error: ${res.status}` };
      }
      return {
        error: `Server error (${res.status}): Make sure backend server (hireloop-server) is running on port 5000.`,
      };
    }

    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    return { error: "Invalid response from server. Ensure hireloop-server is running." };
  } catch (error) {
    console.error("Error registering company:", error);
    return { error: error.message };
  }
}

export async function updateCompany(companyId, companyData) {
  try {
    const res = await fetch(`${baseUrl}/api/companies/${companyId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(companyData),
    });

    const contentType = res.headers.get("content-type");
    if (!res.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errData = await res.json();
        return { error: errData.error || `Server error: ${res.status}` };
      }
      return {
        error: `Server error (${res.status}): Make sure backend server is running on port 5000.`,
      };
    }

    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    return { error: "Invalid response from server. Ensure backend server is running." };
  } catch (error) {
    console.error("Error updating company:", error);
    return { error: error.message };
  }
}
