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

export const generateColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};
