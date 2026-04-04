"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { Application, AccessRequest, Role } from "@/lib/types";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import {
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FolderOpen,
  Plus,
  Search,
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

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="mt-1 h-3 w-28" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [myAccess, setMyAccess] = useState<{ id: number }[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ role_id: "", justification: "", priority: "medium" });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [apps, reqs, access] = await Promise.all([
        api.getApplications(),
        api.getMyRequests(user.username),
        api.getMyAccess(user.username),
      ]);
      setApplications(apps);
      setRequests(reqs);
      setMyAccess(access);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppClick = async (app: Application) => {
    setSelectedApp(app);
    try {
      const appRoles = await api.getApplicationRoles(app.id);
      setRoles(appRoles);
      setShowModal(true);
    } catch {
      toast.error("Failed to load roles");
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.role_id) return;
    try {
      await api.createRequest(user.username, {
        role_id: Number(formData.role_id),
        justification: formData.justification,
        priority: formData.priority,
      });
      toast.success("Request submitted successfully!");
      setShowModal(false);
      setFormData({ role_id: "", justification: "", priority: "medium" });
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit request");
    }
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.app_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.status.includes(searchTerm.toLowerCase())
  );

  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.username}!</h1>
        <p className="text-muted-foreground">Manage your application access requests and track their status.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Requests"
          value={requests.length}
          icon={FileText}
          description="All time requests submitted"
        />
        <StatCard
          title="Pending"
          value={pendingCount}
          icon={Clock}
          description="Awaiting review"
        />
        <StatCard
          title="Approved"
          value={approvedCount}
          icon={CheckCircle2}
          description="Granted access"
        />
        <StatCard
          title="Rejected"
          value={rejectedCount}
          icon={XCircle}
          description="Denied requests"
        />
        <StatCard
          title="Active Access"
          value={myAccess.length}
          icon={ShieldCheck}
          description="Current permissions"
        />
        <StatCard
          title="Applications"
          value={applications.length}
          icon={FolderOpen}
          description="Available to request"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
          <CardDescription>Track the status of your access requests.</CardDescription>
          <div className="flex items-center gap-2 pt-2">
            <Search className="size-4 text-muted-foreground" />
            <Input
              placeholder="Search by application, role, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <Empty>
              <EmptyTitle>No requests found</EmptyTitle>
              <EmptyDescription>
                {searchTerm
                  ? "No requests match your search. Try a different term."
                  : "You haven't submitted any access requests yet. Browse applications below to get started."}
              </EmptyDescription>
            </Empty>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.app_name}</TableCell>
                      <TableCell className="text-muted-foreground">{request.role_name}</TableCell>
                      <TableCell><PriorityBadge priority={request.priority} /></TableCell>
                      <TableCell><StatusBadge status={request.status} /></TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(request.request_date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Applications</CardTitle>
          <CardDescription>Request access to applications you need for your work.</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <Empty>
              <EmptyTitle>No applications available</EmptyTitle>
              <EmptyDescription>There are no applications available to request access to at this time.</EmptyDescription>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app)}
                  className="flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors duration-200 hover:bg-accent cursor-pointer"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <FolderOpen className="size-5 text-primary" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4 className="font-medium">{app.name}</h4>
                    {app.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{app.description}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Access</DialogTitle>
            <DialogDescription>
              Request access to {selectedApp?.name}. Select a role. Justification is optional.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitRequest}>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role_id} onValueChange={(v) => setFormData({ ...formData, role_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="justification">Justification</Label>
                <Textarea
                  id="justification"
                  placeholder="Why do you need this access?"
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!formData.role_id}
              >
                <Plus className="size-4" data-icon="inline-start" />
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
