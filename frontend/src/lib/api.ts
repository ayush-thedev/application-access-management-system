const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "An error occurred" }));
    throw new Error(error.detail || "An error occurred");
  }

  return response.json();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    fetchApi<import("./types").LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  // Applications
  getApplications: () =>
    fetchApi<import("./types").Application[]>("/applications"),

  getApplicationRoles: (appId: number) =>
    fetchApi<import("./types").Role[]>(`/applications/${appId}/roles`),

  // User Roles
  getMyAccess: (username: string) =>
    fetchApi<import("./types").UserRole[]>(`/user-roles/current-user/${username}`),

  // Requests
  getMyRequests: (username: string) =>
    fetchApi<import("./types").AccessRequest[]>(`/requests?username=${username}`),

  getPendingRequests: () =>
    fetchApi<import("./types").AccessRequest[]>("/requests/pending"),

  createRequest: (username: string, data: { role_id: number; justification: string; priority: string }) =>
    fetchApi<import("./types").AccessRequest>(`/requests?username=${username}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  approveRequest: (requestId: number, adminUsername: string, expiresAt?: string) =>
    fetchApi<import("./types").AccessRequest>(`/requests/${requestId}/approve?admin_username=${adminUsername}${expiresAt ? `&expires_at=${expiresAt}` : ""}`, {
      method: "PATCH",
    }),

  rejectRequest: (requestId: number, adminUsername: string, denialReason: string) =>
    fetchApi<import("./types").AccessRequest>(`/requests/${requestId}/reject?admin_username=${adminUsername}&denial_reason=${encodeURIComponent(denialReason)}`, {
      method: "PATCH",
    }),
};
