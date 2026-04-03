export interface User {
  id: number;
  username: string;
  email: string;
  department: string | null;
  role: "user" | "admin";
  status: "active" | "inactive";
  created_at: string;
}

export interface Application {
  id: number;
  name: string;
  description: string | null;
  status: "active" | "inactive";
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  app_id: number;
  description: string | null;
  created_at: string;
  app_name?: string;
}

export interface UserRole {
  id: number;
  user_id: number;
  role_id: number;
  assigned_at: string;
  expires_at: string | null;
  role_name?: string;
  app_name?: string;
  user_name?: string;
}

export interface AccessRequest {
  id: number;
  user_id: number;
  role_id: number;
  justification: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected";
  request_type: "new" | "renewal";
  denial_reason: string | null;
  request_date: string;
  approval_date: string | null;
  approved_by: number | null;
  expires_at: string | null;
  created_at: string;
  username?: string;
  user_email?: string;
  role_name?: string;
  app_name?: string;
  approved_by_name?: string;
}

export interface LoginResponse {
  user: User;
  message: string;
}
