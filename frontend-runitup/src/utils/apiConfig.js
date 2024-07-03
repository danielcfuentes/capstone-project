export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

// auth.js
export const getHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};
