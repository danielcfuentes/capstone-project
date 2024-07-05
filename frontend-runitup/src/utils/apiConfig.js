export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

export const getHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
    // Don't include 'Content-Type' here as it will be set automatically for FormData
  };
};
