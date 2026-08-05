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
  list(filters = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return apiFetch(`/api/influencers${qs ? `?${qs}` : ""}`, { auth: false });
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

// Platforms & niches are DB-backed (see server/models) so new ones can be
// added later without a code change — this just reads whatever exists.
export const catalog = {
  listPlatforms() {
    return apiFetch("/api/platforms", { auth: false });
  },
  listAllPlatforms() {
    return apiFetch("/api/platforms?all=true", { auth: false });
  },
  listNiches() {
    return apiFetch("/api/niches", { auth: false });
  },
  listAllNiches() {
    return apiFetch("/api/niches?all=true", { auth: false });
  },
  // Admin-only — used by the AdminCatalog page.
  createPlatform(patch) {
    return apiFetch("/api/platforms", { method: "POST", body: patch });
  },
  updatePlatform(id, patch) {
    return apiFetch(`/api/platforms/${id}`, { method: "PATCH", body: patch });
  },
  deactivatePlatform(id) {
    return apiFetch(`/api/platforms/${id}`, { method: "DELETE" });
  },
  createNiche(patch) {
    return apiFetch("/api/niches", { method: "POST", body: patch });
  },
  updateNiche(id, patch) {
    return apiFetch(`/api/niches/${id}`, { method: "PATCH", body: patch });
  },
  deactivateNiche(id) {
    return apiFetch(`/api/niches/${id}`, { method: "DELETE" });
  },
};

// States & districts come from the india-location-kit package on the server
// (plus any admin-added custom districts) — never hardcoded on the client.
export const locations = {
  listStates() {
    return apiFetch("/api/locations/states", { auth: false });
  },
  listDistricts(stateCode) {
    return apiFetch(`/api/locations/districts?state=${encodeURIComponent(stateCode)}`, {
      auth: false,
    });
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

export const connects = {
  packages() {
    return apiFetch("/api/connects/packages");
  },
  purchase(packageKey) {
    return apiFetch("/api/connects/purchase", { method: "POST", body: { packageKey } });
  },
  purchaseHistory() {
    return apiFetch("/api/connects/purchases");
  },
  wallet() {
    return apiFetch("/api/connects/wallet");
  },
};

export const campaigns = {
  list() {
    return apiFetch("/api/campaigns");
  },
  browse() {
    return apiFetch("/api/campaigns/browse");
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
  applicants(id) {
    return apiFetch(`/api/campaigns/${id}/applicants`);
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
