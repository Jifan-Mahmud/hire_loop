import { API_URL as baseUrl } from "./apiClient";

/**
 * Verify Session Token directly with backend server (No JWT - Database Session Token lookup)
 * @param {string} token
 * @returns {Promise<{success: boolean, user?: object, session?: object, error?: string}>}
 */
export async function verifyServerToken(token) {
  if (!token) {
    return { success: false, error: "Token is required." };
  }

  try {
    const res = await fetch(`${baseUrl}/api/auth/verify-token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("verifyServerToken error:", error);
    return { success: false, error: error.message || "Failed to connect to authentication server." };
  }
}

/**
 * Fetch authenticated user profile using session token
 * @param {string} token
 */
export async function getMe(token) {
  if (!token) return null;

  try {
    const res = await fetch(`${baseUrl}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("getMe error:", error);
    return null;
  }
}
