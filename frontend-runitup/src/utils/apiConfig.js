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
