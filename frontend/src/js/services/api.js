const configuredApiUrl = process.env.REACT_APP_API_URL || "/api";

export const API_URL = configuredApiUrl.replace(/\/+$/, "");

export function apiUrl(path) {
  return `${API_URL}/${path.replace(/^\/+/, "")}`;
}

export function getOfficePatient() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !["doctor", "admin"].includes(user.role)) return null;
    return JSON.parse(localStorage.getItem("ivi_office_patient") || "null");
  } catch (error) {
    return null;
  }
}
