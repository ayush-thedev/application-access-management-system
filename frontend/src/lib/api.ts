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

  getAllApplications: () =>
    fetchApi<import("./types").Application[]>("/applications/all"),

  getApplicationRoles: (appId: number) =>
    fetchApi<import("./types").Role[]>(`/applications/${appId}/roles`),

  createApplication: (data: { name: string; description?: string }) =>
    fetchApi<import("./types").Application>("/applications", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateApplication: (appId: number, data: { name?: string; description?: string }) =>
    fetchApi<import("./types").Application>(`/applications/${appId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteApplication: (appId: number) =>
    fetchApi<{ message: string }>(`/applications/${appId}`, {
      method: "DELETE",
    }),

  // Users
  getAllUsers: () =>
    fetchApi<Array<{ id: number; username: string; email: string; department: string | null; role: string; status: string; created_at: string; access_count: number }>>("/users"),

  createUser: (data: { username: string; email: string; department?: string; password?: string }) =>
    fetchApi<import("./types").User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

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

  // Notifications
  getNotifications: (username: string) =>
    fetchApi<Array<{ id: number; user_id: number; type: string; title: string; message: string; is_read: boolean; request_id: number | null; created_at: string }>>(`/notifications?username=${username}`),

  getUnreadCount: (username: string) =>
    fetchApi<{ count: number }>(`/notifications/unread-count?username=${username}`),

  markAsRead: (notificationId: number, username: string) =>
    fetchApi<{ message: string }>(`/notifications/${notificationId}/read?username=${username}`, {
      method: "PATCH",
    }),

  markAllAsRead: (username: string) =>
    fetchApi<{ message: string }>(`/notifications/read-all?username=${username}`, {
      method: "PATCH",
    }),

  // Settings
  getProfile: (username: string) =>
    fetchApi<import("./types").User>(`/settings/profile?username=${username}`),

  updateProfile: (username: string, data: { email?: string; department?: string }) =>
    fetchApi<import("./types").User>(`/settings/profile?username=${username}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  changePassword: (username: string, data: { current_password: string; new_password: string }) =>
    fetchApi<{ message: string }>(`/settings/password?username=${username}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Roles
  getRoles: (appId?: number) =>
    fetchApi<Array<{ id: number; name: string; app_id: number; description: string | null; created_at: string; app_name?: string }>>(`/roles${appId ? `?app_id=${appId}` : ""}`),

  createRole: (data: { name: string; app_id: number; description?: string }) =>
    fetchApi<{ id: number; name: string; app_id: number; description: string | null; created_at: string }>("/roles", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateRole: (roleId: number, data: { name?: string; app_id?: number; description?: string }) =>
    fetchApi<{ id: number; name: string; app_id: number; description: string | null; created_at: string }>(`/roles/${roleId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteRole: (roleId: number) =>
    fetchApi<{ message: string }>(`/roles/${roleId}`, {
      method: "DELETE",
    }),

  // Audit Log
  getAuditLog: (username?: string, status?: string) =>
    fetchApi<import("./types").AccessRequest[]>(`/requests/history${username ? `?username=${username}` : ""}${status ? `${username ? "&" : "?"}status=${status}` : ""}`),
};
