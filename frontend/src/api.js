const rawApiUrl = import.meta?.env?.VITE_API_URL;
const API_URL = (rawApiUrl ? rawApiUrl : "/api").replace(/\/+$/, "");

let authToken = localStorage.getItem("authToken");

function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
}

function getHeaders(includeJson = true) {
  const headers = {};
  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
}

async function request(method, endpoint, data = null, { skipAuth = false } = {}) {
  const normalizedEndpoint = endpoint.replace(/^\/+/, "");
  const url = `${API_URL}/${normalizedEndpoint}`;
  const options = { method, headers: {} };

  if (method !== "GET" && method !== "HEAD") {
    options.headers = getHeaders(true);
  } else {
    options.headers = getHeaders(false);
  }

  if (skipAuth && options.headers.Authorization) {
    delete options.headers.Authorization;
  }

  if (data !== null && method !== "GET" && method !== "HEAD") {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(payload?.error || payload?.message || "Une erreur est survenue");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function fetchData(endpoint) {
  return request("GET", endpoint);
}

async function postData(endpoint, data) {
  return request("POST", endpoint, data);
}

async function deleteData(endpoint, id) {
  return request("DELETE", `${endpoint}/${id}`);
}

async function login(email, password) {
  const result = await request("POST", "auth/login", { email, password }, { skipAuth: true });
  setAuthToken(result.token);
  return result;
}

async function logout() {
  try {
    await request("POST", "auth/logout", {});
  } catch (error) {
    if (error.status !== 401) {
      throw error;
    }
  } finally {
    setAuthToken(null);
  }
}

async function me() {
  return request("GET", "auth/me");
}

async function createUser(data) {
  return request("POST", "users", data);
}

export const api = {
  fetchData,
  postData,
  deleteData,
  login,
  logout,
  me,
  createUser,
  setAuthToken,
  get token() {
    return authToken;
  }
};
