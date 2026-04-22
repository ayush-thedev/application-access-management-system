"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { AccessRequest, Application, UserRole, AuditLog } from "@/lib/types";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  AlertCircle,
  Plus,
  Pencil,
  Building2,
  Trash2,
  Timer,
  TrendingUp,
  Mail,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    approved: "default",
    rejected: "destructive",
  };
  const labels: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
  return (
    <Badge variant={variantMap[status] || "outline"}>
      {labels[status] || status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    low: "outline",
    medium: "secondary",
    high: "destructive",
  };
  return (
    <Badge variant={variantMap[priority] || "outline"}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "overview";

  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");

  const [users, setUsers] = useState<Array<{ id: number; username: string; email: string; department: string | null; role: string; status: string; created_at: string; access_count: number }>>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [showAppDialog, setShowAppDialog] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [appFormData, setAppFormData] = useState({ name: "", description: "" });
  
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [userFormData, setUserFormData] = useState({ username: "", email: "", department: "", password: "" });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(true);

  useEffect(() => {
    loadPendingRequests();
    loadUsers();
    loadApplications();
    loadUserRoles();
    loadAuditLogs();
  }, []);

  const loadPendingRequests = async () => {
    try {
      const data = await api.getPendingRequests();
      setRequests(data);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getAllUsers();
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadApplications = async () => {
    try {
      const data = await api.getAllApplications();
      setApplications(data);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setIsLoadingApps(false);
    }
  };

  const loadUserRoles = async () => {
    try {
      const data = await api.getAllUserRoles();
      setUserRoles(data);
    } catch {
      toast.error("Failed to load user roles");
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const data = await api.getSystemAuditLogs();
      setAuditLogs(data);
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    if (!user) return;
    try {
      await api.approveRequest(requestId, user.username);
      toast.success("Request approved successfully!");
      loadPendingRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve request");
    }
  };

  const handleBulkApprove = async () => {
    if (!user || selectedRequests.length === 0) return;
    try {
      for (const id of selectedRequests) {
        await api.approveRequest(id, user.username);
      }
      toast.success(`${selectedRequests.length} request(s) approved!`);
      setSelectedRequests([]);
      loadPendingRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve requests");
    }
  };

  const handleRejectClick = (requestId: number) => {
    setSelectedRequestId(requestId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!user || !selectedRequestId) return;
    try {
      await api.rejectRequest(selectedRequestId, user.username, rejectReason);
      toast.success("Request rejected");
      setShowRejectModal(false);
      loadPendingRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject request");
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedRequests((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map((r) => r.id));
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.app_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || r.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApps = applications.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRoles = userRoles.filter(
    (r) =>
      r.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.app_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  interface GroupedUser {
    user_id: number;
    user_name: string;
    apps: {
      [app_name: string]: {
        role_name: string;
        assigned_at: string;
        expires_at: string | null;
      }[];
    };
  }

  const groupedRoles = filteredRoles.reduce((acc, role) => {
    if (!role.user_name) return acc;
    if (!acc[role.user_id]) {
        acc[role.user_id] = { user_id: role.user_id, user_name: role.user_name, apps: {} };
    }
    const appName = role.app_name || "Unknown Application";
    if (!acc[role.user_id].apps[appName]) {
        acc[role.user_id].apps[appName] = [];
    }
    acc[role.user_id].apps[appName].push({
        role_name: role.role_name || "Unknown Role",
        assigned_at: role.assigned_at,
        expires_at: role.expires_at,
    });
    return acc;
  }, {} as Record<number, GroupedUser>);

  const groupedRolesArray = Object.values(groupedRoles);

  const filteredAudit = auditLogs.filter(
    (a) =>
      a.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.action_details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateApp = async () => {
    try {
      await api.createApplication({ name: appFormData.name, description: appFormData.description || undefined });
      toast.success("Application created!");
      setShowAppDialog(false);
      setAppFormData({ name: "", description: "" });
      loadApplications();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create application");
    }
  };

  const handleUpdateApp = async () => {
    if (!editingApp) return;
    try {
      await api.updateApplication(editingApp.id, { name: appFormData.name, description: appFormData.description || undefined });
      toast.success("Application updated!");
      setShowAppDialog(false);
      setEditingApp(null);
      setAppFormData({ name: "", description: "" });
      loadApplications();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update application");
    }
  };

  const handleDeleteApp = async (appId: number) => {
    try {
      await api.deleteApplication(appId);
      toast.success("Application deactivated");
      loadApplications();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete application");
    }
  };

  const openEditDialog = (app: Application) => {
    setEditingApp(app);
    setAppFormData({ name: app.name, description: app.description || "" });
    setShowAppDialog(true);
  };

  const openCreateDialog = () => {
    setEditingApp(null);
    setAppFormData({ name: "", description: "" });
    setShowAppDialog(true);
  };

  const handleCreateUser = async () => {
    if (!userFormData.username || !userFormData.email || !userFormData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsCreatingUser(true);
    try {
      await api.createUser(userFormData);
      toast.success("User created successfully!");
      setShowUserDialog(false);
      setUserFormData({ username: "", email: "", department: "", password: "" });
      loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "overview") {
      router.push("/admin");
    } else {
      router.push(`/admin?tab=${value}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-1 h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">Review and manage access requests across all applications.</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Pending"
              value={requests.length}
              icon={Clock}
              description="Awaiting your review"
            />
            <StatCard
              title="High Priority"
              value={requests.filter((r) => r.priority === "high").length}
              icon={AlertCircle}
              description="Urgent requests"
            />
            <StatCard
              title="Avg Response"
              value={0}
              icon={Timer}
              description="Days to respond"
            />
            <StatCard
              title="Approval Rate"
              value={requests.length > 0 ? Math.round((requests.filter((r) => r.status === "approved").length / requests.length) * 100) : 0}
              icon={TrendingUp}
              description="Of reviewed requests"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest access requests pending your review.</CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <Empty>
                  <EmptyTitle>No pending requests</EmptyTitle>
                  <EmptyDescription>All caught up! There are no access requests waiting for review.</EmptyDescription>
                </Empty>
              ) : (
                <div className="space-y-4">
                  {requests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-medium text-primary">
                            {request.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{request.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.app_name} — {request.role_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <PriorityBadge priority={request.priority} />
                        <span className="text-sm text-muted-foreground">
                          {new Date(request.request_date).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleApprove(request.id)}>
                            <CheckCircle2 className="size-3" data-icon="inline-start" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRejectClick(request.id)}>
                            <XCircle className="size-3" data-icon="inline-start" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 pt-6">
          {selectedRequests.length > 0 && (
            <Alert>
              <AlertCircle className="size-4" />
              <AlertTitle>{selectedRequests.length} request(s) selected</AlertTitle>
              <AlertDescription className="flex items-center gap-2 pt-2">
                <Button size="sm" onClick={handleBulkApprove}>
                  <CheckCircle2 className="size-3" data-icon="inline-start" />
                  Approve Selected
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedRequests([])}>
                  Clear Selection
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Review and approve or reject access requests.</CardDescription>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Search className="size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user, app, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <Empty>
                  <EmptyTitle>No pending requests</EmptyTitle>
                  <EmptyDescription>
                    {searchTerm || filterPriority !== "all"
                      ? "No requests match your filters. Try adjusting your search."
                      : "All caught up! There are no access requests waiting for review."}
                  </EmptyDescription>
                </Empty>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                            onCheckedChange={toggleSelectAll}
                            aria-label="Select all requests"
                          />
                        </TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Application</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Justification</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead className="w-48">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRequests.includes(request.id)}
                              onCheckedChange={() => toggleSelect(request.id)}
                              aria-label={`Select request from ${request.username}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.username}</p>
                              <p className="text-sm text-muted-foreground">{request.user_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{request.app_name}</TableCell>
                          <TableCell className="text-muted-foreground">{request.role_name}</TableCell>
                          <TableCell><PriorityBadge priority={request.priority} /></TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground">
                            {request.justification}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(request.request_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(request.id)}
                              >
                                <CheckCircle2 className="size-3" data-icon="inline-start" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectClick(request.id)}
                              >
                                <XCircle className="size-3" data-icon="inline-start" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 pt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>All users in the organization with their access details.</CardDescription>
                </div>
                <Button onClick={() => setShowUserDialog(true)}>
                  <Plus className="size-4" data-icon="inline-start" />
                  New User
                </Button>
              </div>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Search className="size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username, email, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <Empty>
                  <EmptyTitle>No users found</EmptyTitle>
                  <EmptyDescription>
                    {searchTerm ? "No users match your search." : "No users in the system."}
                  </EmptyDescription>
                </Empty>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Active Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.username}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="size-3" />
                              {u.email}
                            </span>
                          </TableCell>
                          <TableCell>
                            {u.department ? (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Building2 className="size-3" />
                                {u.department}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                              {u.role === "admin" ? "Admin" : "User"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.status === "active" ? "default" : "outline"}>
                              {u.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.access_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4 pt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Applications</CardTitle>
                  <CardDescription>Manage application entries. Deactivating an app hides it from user requests.</CardDescription>
                </div>
                <Button onClick={openCreateDialog}>
                  <Plus className="size-4" data-icon="inline-start" />
                  New Application
                </Button>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingApps ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredApps.length === 0 ? (
                <Empty>
                  <EmptyTitle>No applications found</EmptyTitle>
                  <EmptyDescription>
                    {searchTerm ? "No applications match your search." : "No applications configured yet."}
                  </EmptyDescription>
                </Empty>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApps.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.name}</TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground">
                            {app.description || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={app.status === "active" ? "default" : "outline"}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(app.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(app)}
                                disabled={app.status === "inactive"}
                              >
                                <Pencil className="size-3" data-icon="inline-start" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteApp(app.id)}
                                disabled={app.status === "inactive"}
                              >
                                <Trash2 className="size-3" data-icon="inline-start" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4 pt-6">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-xl font-semibold">User Role Assignments</h2>
            <p className="text-muted-foreground text-sm">View all roles currently assigned to users across the platform.</p>
            <div className="flex items-center gap-2 pt-2">
              <Search className="size-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, application, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
          
          {isLoadingRoles ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : groupedRolesArray.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <Empty>
                  <EmptyTitle>No roles assigned</EmptyTitle>
                  <EmptyDescription>
                    {searchTerm ? "No assignments match your search." : "No users currently have active roles."}
                  </EmptyDescription>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedRolesArray.map((user) => (
                <Card key={user.user_id} className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b bg-muted/40">
                    <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
                      <AvatarFallback className="bg-primary/10 text-primary uppercase text-lg font-bold">
                        {user.user_name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <CardTitle className="text-lg">{user.user_name}</CardTitle>
                      <CardDescription className="text-xs">Active Roles</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-5">
                    {Object.entries(user.apps).map(([appName, roles]) => (
                      <div key={appName} className="space-y-2.5">
                        <h4 className="text-sm font-semibold flex items-center text-foreground/80">
                          <Building2 className="mr-2 h-4 w-4 text-primary/60" />
                          {appName}
                        </h4>
                        <div className="flex flex-wrap gap-2 pl-6">
                          {roles.map((role, idx) => {
                            // Determine a pastel class based on the role length or name for a consistent random feel
                            const colors = [
                              "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200", 
                              "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200",
                              "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
                              "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200",
                              "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200"
                            ];
                            const colorClass = colors[role.role_name.length % colors.length];

                            return (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className={`px-2.5 py-0.5 rounded-md ${colorClass} transition-colors`}
                              >
                                {role.role_name}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Log</CardTitle>
              <CardDescription>A complete trail of access modifications and system changes.</CardDescription>
              <div className="flex items-center gap-2 pt-2">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  placeholder="Search audit details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAudit ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredAudit.length === 0 ? (
                <Empty>
                  <EmptyTitle>No audit logs</EmptyTitle>
                  <EmptyDescription>
                    {searchTerm ? "No logs match your search." : "System has not recorded any actions yet."}
                  </EmptyDescription>
                </Empty>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-48">Timestamp</TableHead>
                        <TableHead>Action Type</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Record ID</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAudit.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={log.action_type === 'UPDATE' ? 'secondary' : (log.action_type === 'DELETE' ? 'destructive' : 'default')}>
                              {log.action_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{log.table_name}</TableCell>
                          <TableCell className="font-mono text-xs">#{log.record_id}</TableCell>
                          <TableCell className="max-w-md">{log.action_details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Optionally provide a reason for rejecting this access request. The user will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="reject-reason">Reason for rejection</Label>
              <Textarea
                id="reject-reason"
                placeholder="Please provide a reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
            >
              <Trash2 className="size-4" data-icon="inline-start" />
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAppDialog} onOpenChange={setShowAppDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingApp ? "Edit Application" : "New Application"}</DialogTitle>
            <DialogDescription>
              {editingApp
                ? "Update the application details. Users will see the changes immediately."
                : "Add a new application that users can request access to."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="app-name">Name</Label>
              <Input
                id="app-name"
                placeholder="e.g., Salesforce, Jira, GitHub"
                value={appFormData.name}
                onChange={(e) => setAppFormData({ ...appFormData, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="app-desc">Description</Label>
              <Textarea
                id="app-desc"
                placeholder="Explain the purpose of this application..."
                value={appFormData.description}
                onChange={(e) => setAppFormData({ ...appFormData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppDialog(false)}>
              Cancel
            </Button>
            <Button onClick={editingApp ? handleUpdateApp : handleCreateApp}>
              {editingApp ? "Update Application" : "Create Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New User Account</DialogTitle>
            <DialogDescription>
              Create a new user profile. They will be able to log in with the credentials provided.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="jdoe"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jdoe@company.com"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="Engineering, Finance, HR..."
                value={userFormData.department}
                onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Initial Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={isCreatingUser}>
              {isCreatingUser ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
