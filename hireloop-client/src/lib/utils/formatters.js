/**
 * Universal Formatter Utilities for HireLoop
 * Centralized formatting for dates, salaries, currency, and user text.
 */

/**
 * Format salary range or single value with currency symbol
 * @param {number|string} min - Minimum salary
 * @param {number|string} max - Maximum salary
 * @param {string} currency - Currency code (e.g., 'USD', 'BDT', 'EUR')
 * @returns {string} Formatted salary string (e.g. "$120k - $150k / yr" or "From $90k / yr")
 */
export function formatSalary(min, max, currency = "USD") {
  const numMin = typeof min === "number" ? min : parseFloat(min);
  const numMax = typeof max === "number" ? max : parseFloat(max);

  const hasMin = !isNaN(numMin) && numMin > 0;
  const hasMax = !isNaN(numMax) && numMax > 0;

  if (!hasMin && !hasMax) return "Competitive Salary";

  const currSymbol = currency === "USD" ? "$" : `${currency} `;

  const formatK = (val) => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(0)}k`;
    }
    return val.toLocaleString();
  };

  if (hasMin && hasMax) {
    return `${currSymbol}${formatK(numMin)} - ${currSymbol}${formatK(numMax)} / yr`;
  }
  if (hasMin) {
    return `From ${currSymbol}${formatK(numMin)} / yr`;
  }
  return `Up to ${currSymbol}${formatK(numMax)} / yr`;
}

/**
 * Safe date formatter with configurable options
 * @param {string|Date|number} dateInput - ISO string, timestamp, or Date object
 * @param {Intl.DateTimeFormatOptions} options - Intl options
 * @returns {string} Formatted date string (e.g. "Oct 24, 2026")
 */
export function formatDate(dateInput, options = { month: "short", day: "2-digit", year: "numeric" }) {
  if (!dateInput) return "N/A";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString("en-US", options);
  } catch {
    return String(dateInput);
  }
}

/**
 * Extract 1 or 2 letter initials from a name or email address
 * @param {string} name - User's full name
 * @param {string} email - Fallback email
 * @returns {string} 2-letter uppercase monogram (e.g. "JD")
 */
export function getInitials(name, email = "") {
  if (name && typeof name === "string") {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length === 1) {
      return parts[0].toUpperCase();
    }
  }

  if (email && typeof email === "string") {
    const cleanEmail = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    if (cleanEmail.length >= 2) {
      return cleanEmail.slice(0, 2).toUpperCase();
    }
    if (cleanEmail.length === 1) {
      return cleanEmail.toUpperCase();
    }
  }

  return "HL";
}

/**
 * Safe text truncation with ellipsis
 * @param {string} text - Source string
 * @param {number} maxLen - Maximum length
 * @returns {string} Truncated string
 */
export function truncateText(text, maxLen = 120) {
  if (!text || typeof text !== "string") return "";
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).trim()}...`;
}
