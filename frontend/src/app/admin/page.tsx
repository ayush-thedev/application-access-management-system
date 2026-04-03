"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { AccessRequest } from "@/lib/types";
import { useToast } from "@/components/Toast";

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    approved: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    rejected: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  };
  const labels = { pending: "Pending", approved: "Approved", rejected: "Rejected" };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.pending}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles = {
    low: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
    medium: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    high: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[priority as keyof typeof styles] || styles.medium}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      const data = await api.getPendingRequests();
      setRequests(data);
    } catch (error) {
      showToast("Failed to load requests", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    if (!user) return;
    try {
      await api.approveRequest(requestId, user.username);
      showToast("Request approved successfully!", "success");
      loadPendingRequests();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to approve request", "error");
    }
  };

  const handleBulkApprove = async () => {
    if (!user || selectedRequests.length === 0) return;
    try {
      for (const id of selectedRequests) {
        await api.approveRequest(id, user.username);
      }
      showToast(`${selectedRequests.length} requests approved!`, "success");
      setSelectedRequests([]);
      loadPendingRequests();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to approve requests", "error");
    }
  };

  const handleRejectClick = (requestId: number) => {
    setSelectedRequestId(requestId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!user || !selectedRequestId || !rejectReason.trim()) return;
    try {
      await api.rejectRequest(selectedRequestId, user.username, rejectReason);
      showToast("Request rejected", "success");
      setShowRejectModal(false);
      loadPendingRequests();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to reject request", "error");
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

  const filteredRequests = requests.filter(
    (r) =>
      r.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.app_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review and manage access requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Requests</p>
            </div>
          </div>
        </div>
      </div>

      {selectedRequests.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-blue-700 dark:text-blue-300">{selectedRequests.length} request(s) selected</span>
          <button
            onClick={handleBulkApprove}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            Approve Selected
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Requests</h3>
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Application</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Justification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No pending requests
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id)}
                        onChange={() => toggleSelect(request.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{request.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{request.user_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{request.app_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{request.role_name}</td>
                    <td className="px-6 py-4"><PriorityBadge priority={request.priority} /></td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">{request.justification}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(request.request_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="px-3 py-1.5 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(request.id)}
                          className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reject Request</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for rejection</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
