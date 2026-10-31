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

    const data = await res.json();
    return data;
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

    const result = await res.json();
    return result;
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

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error updating company:", error);
    return { error: error.message };
  }
}
