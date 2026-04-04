"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { AccessRequest } from "@/lib/types";
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
  Trash2,
  Timer,
  TrendingUp,
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
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    loadPendingRequests();
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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

        <TabsContent value="pending" className="space-y-4">
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
    </div>
  );
}
