
export const API_BASE_URL = import.meta.env.VITE_BACKEND_ADDRESS;

export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

export const getAuthHeader = (token) => ({
  ...DEFAULT_HEADERS,
  Authorization: `Bearer ${token}`,
});

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = options.headers || DEFAULT_HEADERS;

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    throw new Error("API request failed");
  }

  return response.json();
};
