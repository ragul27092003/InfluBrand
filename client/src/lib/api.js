// Thin fetch wrapper around the Influbrand Express/MongoDB API.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "influbrand_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiFetch(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed with status ${res.status}`, res.status);
  }
  return data;
}

export const auth = {
  async signup(payload) {
    const data = await apiFetch("/api/auth/signup", { method: "POST", body: payload, auth: false });
    setToken(data.token);
    return data.user;
  },
  async login(email, password) {
    const data = await apiFetch("/api/auth/login", { method: "POST", body: { email, password }, auth: false });
    setToken(data.token);
    return data.user;
  },
  async me() {
    const data = await apiFetch("/api/auth/me");
    return data.user;
  },
  logout() {
    setToken(null);
  },
};

export const influencers = {
  list() {
    return apiFetch("/api/influencers", { auth: false });
  },
  get(id) {
    return apiFetch(`/api/influencers/${id}`, { auth: false });
  },
  me() {
    return apiFetch("/api/influencers/me");
  },
  updateMe(patch) {
    return apiFetch("/api/influencers/me", { method: "PATCH", body: patch });
  },
};

export const brands = {
  me() {
    return apiFetch("/api/brands/me");
  },
  updateMe(patch) {
    return apiFetch("/api/brands/me", { method: "PATCH", body: patch });
  },
};

export const campaigns = {
  list() {
    return apiFetch("/api/campaigns");
  },
  create(payload) {
    return apiFetch("/api/campaigns", { method: "POST", body: payload });
  },
  update(id, patch) {
    return apiFetch(`/api/campaigns/${id}`, { method: "PATCH", body: patch });
  },
  remove(id) {
    return apiFetch(`/api/campaigns/${id}`, { method: "DELETE" });
  },
};

export const shortlists = {
  list() {
    return apiFetch("/api/shortlists");
  },
  create(payload) {
    return apiFetch("/api/shortlists", { method: "POST", body: payload });
  },
  respond(id, response) {
    return apiFetch(`/api/shortlists/${id}`, { method: "PATCH", body: { response } });
  },
};

export const messages = {
  list() {
    return apiFetch("/api/messages");
  },
  send(payload) {
    return apiFetch("/api/messages", { method: "POST", body: payload });
  },
  markRead(id) {
    return apiFetch(`/api/messages/${id}/read`, { method: "PATCH" });
  },
};

export const contact = {
  submit(payload) {
    return apiFetch("/api/contact", { method: "POST", body: payload, auth: false });
  },
};

export { ApiError };
