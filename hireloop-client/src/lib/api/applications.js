const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Submit a job application (Seeker only)
 */
export async function submitApplication(applicationData) {
  try {
    const res = await fetch(`${baseUrl}/api/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(applicationData),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to submit application." };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error submitting application:", error);
    return { success: false, error: error.message || "Network error. Please try again." };
  }
}

/**
 * Check if a candidate has already applied to a specific job
 */
export async function checkApplicationStatus(jobId, applicantEmail) {
  if (!jobId || !applicantEmail) return { hasApplied: false };
  try {
    const res = await fetch(
      `${baseUrl}/api/applications/check?jobId=${encodeURIComponent(jobId)}&applicantEmail=${encodeURIComponent(applicantEmail)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return { hasApplied: false };
    return await res.json();
  } catch (error) {
    console.error("Error checking application status:", error);
    return { hasApplied: false };
  }
}

/**
 * Fetch candidate applications
 */
export async function getCandidateApplications(applicantEmail) {
  if (!applicantEmail) return [];
  try {
    const res = await fetch(
      `${baseUrl}/api/applications?applicantEmail=${encodeURIComponent(applicantEmail)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error fetching applications:", error);
    return [];
  }
}
