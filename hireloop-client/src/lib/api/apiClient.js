import { authClient } from "@/lib/auth-client";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Retrieve session token from BetterAuth and construct auth headers
 */
export async function getAuthHeaders() {
  const headers = {};
  if (typeof window !== "undefined") {
    try {
      const session = await authClient.getSession();
      const token = session?.data?.session?.token;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch {
      // Fallback: cookies will still be sent via credentials: 'include'
    }
  }
  return headers;
}

/**
 * Unified JSON fetch client with automatic headers and response parsing
 * @param {string} endpoint - API path (e.g. '/api/jobs' or full URL)
 * @param {RequestInit} [options={}] - Standard fetch options
 * @returns {Promise<{ ok: boolean, status: number, data: any, error?: string }>}
 */
export async function fetchJson(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  const authHeaders = await getAuthHeaders();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(options.headers || {}),
    },
    credentials: "include",
  };

  try {
    const res = await fetch(url, config);
    const contentType = res.headers.get("content-type") || "";
    let data = null;

    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMsg =
        (data && typeof data === "object" && (data.error || data.message)) ||
        `Request failed with status ${res.status}`;
      return {
        ok: false,
        status: res.status,
        data,
        error: errorMsg,
      };
    }

    return {
      ok: true,
      status: res.status,
      data,
    };
  } catch (err) {
    console.error(`API Fetch Error [${url}]:`, err);
    return {
      ok: false,
      status: 0,
      data: null,
      error: err.message || "Network error. Please ensure backend server is running.",
    };
  }
}
