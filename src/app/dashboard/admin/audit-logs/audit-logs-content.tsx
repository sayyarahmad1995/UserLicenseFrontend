'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const SCROLL_KEY = 'dashboard-admin-audit-logs-scroll';
import { useQueryClient } from '@tanstack/react-query';
import { useLogout, useCurrentUser } from '@/hooks/use-auth';
import { useAuditLogs, useExportAuditLogs } from '@/hooks/use-audit-logs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, Download, Trash2, MoreVertical } from 'lucide-react';

const actionColors: Record<string, string> = {
  'Login': 'bg-blue-100 text-blue-800',
  'Logout': 'bg-gray-100 text-gray-800',
  'Create': 'bg-green-100 text-green-800',
  'Update': 'bg-yellow-100 text-yellow-800',
  'Delete': 'bg-red-100 text-red-800',
  'Revoke': 'bg-red-100 text-red-800',
  'Activate': 'bg-green-100 text-green-800',
  'Suspend': 'bg-orange-100 text-orange-800',
};

const getActionBadgeColor = (action: string | undefined): string => {
  if (!action) return 'bg-gray-100 text-gray-800';
  
  for (const [key, color] of Object.entries(actionColors)) {
    if (action.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  return 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export default function AuditLogsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  // State for details modal
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  
  // State for export dialog
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  // State for clear logs confirmation
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // State for user filter debouncing
  const [localUserFilter, setLocalUserFilter] = useState(searchParams.get('userId') || '');
  const userFilterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  
  // State for pagination and filters
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Query client for cache invalidation
  const queryClient = useQueryClient();
  
  // Export mutation
  const exportMutation = useExportAuditLogs();

  const { data: logsData, isLoading: logsLoading } = useAuditLogs({
    pageNumber,
    pageSize,
    action: actionFilter || undefined,
    userId: userFilter ? parseInt(userFilter) : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  // Protect page - only admins can access
  useEffect(() => {
    if (!userLoading && user && user.role !== 'Admin') {
      router.push('/dashboard');
    }
  }, [user, userLoading, router]);

  // Cleanup user filter debounce timer on unmount
  useEffect(() => {
    return () => {
      if (userFilterTimerRef.current) {
        clearTimeout(userFilterTimerRef.current);
      }
    };
  }, []);

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPageNumber(1);
  };

  const handlePreviousPage = () => {
    setPageNumber(Math.max(1, pageNumber - 1));
  };

  const handleNextPage = () => {
    if (logsData) {
      setPageNumber(Math.min(logsData.totalPages, pageNumber + 1));
    }
  };

  const handleActionFilterChange = (value: string) => {
    setActionFilter(value);
    setPageNumber(1);
  };

  const handleUserFilterChange = (value: string) => {
    setLocalUserFilter(value);
    
    // Clear existing timeout
    if (userFilterTimerRef.current) {
      clearTimeout(userFilterTimerRef.current);
    }

    // Set new timeout for debounced update
    userFilterTimerRef.current = setTimeout(() => {
      setUserFilter(value);
      setPageNumber(1);
    }, 500);
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    setPageNumber(1);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    setPageNumber(1);
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/login');
      },
    });
  };

  const handleExport = () => {
    exportMutation.mutate(
      {
        format: 'csv',
        dateRange: {
          startDate: startDate || '',
          endDate: endDate || '',
        },
        filters: {
          action: actionFilter || undefined,
          userId: userFilter ? parseInt(userFilter) : undefined,
        },
      },
      {
        onSuccess: () => {
          setExportDialogOpen(false);
        },
      }
    );
  };

  const handleClearLogs = async () => {
    setIsClearing(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/audit-logs`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to clear logs: ${response.statusText}`);
      }

      setClearDialogOpen(false);
      
      // Invalidate audit logs query to refetch immediately
      await queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
      
      // Show success message
      const { toast } = await import('sonner');
      toast.success('All audit logs cleared successfully');
    } catch (error: any) {
      const { toast } = await import('sonner');
      toast.error(error.message || 'Failed to clear audit logs');
    } finally {
      setIsClearing(false);
    }
  };

  const totalPages = logsData?.totalPages || 1;
  const totalCount = logsData?.totalCount || 0;
  const logs = logsData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2 flex justify-between items-center gap-4">
            <div>
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="mb-1"
              >
                ← Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
              <p className="text-gray-600 mt-1">View system audit trail</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {userLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : (
          <>
            {/* Actions Dropdown */}
            <div className="mb-4 flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => setExportDialogOpen(true)}
                    disabled={totalCount === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </DropdownMenuItem>
                  {user?.role === 'Admin' && (
                    <DropdownMenuItem
                      onClick={() => setClearDialogOpen(true)}
                      disabled={totalCount === 0}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Logs
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Action Filter */}
                <div>
                  <Label htmlFor="action" className="mb-2 block">
                    Action
                  </Label>
                  <select
                    id="action"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={actionFilter}
                    onChange={(e) => handleActionFilterChange(e.target.value)}
                  >
                    <option value="">All Actions</option>
                    <option value="Login">Login</option>
                    <option value="Logout">Logout</option>
                    <option value="Create">Create</option>
                    <option value="Update">Update</option>
                    <option value="Delete">Delete</option>
                    <option value="Revoke">Revoke</option>
                  </select>
                </div>

                {/* User Filter */}
                <div>
                  <Label htmlFor="user" className="mb-2 block">
                    User ID
                  </Label>
                  <Input
                    id="user"
                    type="number"
                    placeholder="Filter by user ID"
                    value={localUserFilter}
                    onChange={(e) => handleUserFilterChange(e.target.value)}
                  />
                </div>

                {/* Start Date */}
                <div>
                  <Label htmlFor="startDate" className="mb-2 block">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                  />
                </div>

                {/* End Date */}
                <div>
                  <Label htmlFor="endDate" className="mb-2 block">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                  />
                </div>

                {/* Per Page */}
                <div>
                  <Label htmlFor="pageSize" className="mb-2 block">
                    Per Page
                  </Label>
                  <select
                    id="pageSize"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Audit Logs Table */}
            {logsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-gray-400" size={32} />
              </div>
            ) : (
              <>
                <div ref={tableRef} className="bg-white rounded-lg shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200">
                        <TableHead className="px-4 py-2 bg-gray-50">Timestamp</TableHead>
                        <TableHead className="px-4 py-2 bg-gray-50">User</TableHead>
                        <TableHead className="px-4 py-2 bg-gray-50">Action</TableHead>
                        <TableHead className="px-4 py-2 bg-gray-50">IP Address</TableHead>
                        <TableHead className="px-4 py-2 bg-gray-50">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.length > 0 ? (
                        logs.map((log, index) => (
                          <TableRow key={log.id || `log-${index}`} className="border-b border-gray-200 hover:bg-gray-50">
                            <TableCell className="px-4 py-2 text-sm whitespace-nowrap">
                              {formatDate(log.timestamp)}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-sm">
                              <div>
                                <p className="font-medium">{log.username || 'Anonymous'}</p>
                                <p className="text-gray-500 text-xs">ID: {log.userId || 'N/A'}</p>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-2">
                              <Badge className={getActionBadgeColor(log.action)}>
                                {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-2 text-sm font-mono text-gray-600">
                              {log.ipAddress || 'N/A'}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-sm max-w-xs">
                              <p className="text-gray-700">{log.details || 'No details'}</p>
                              {log.entityType && (
                                <p className="text-gray-500 text-xs mt-1">
                                  Entity: {log.entityType} (ID: {log.entityId || 'N/A'})
                                </p>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="px-4 py-4 text-center text-gray-500">
                            No audit logs found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {pageNumber} of {totalPages} • Total {totalCount} logs
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handlePreviousPage}
                      disabled={pageNumber === 1 || logsLoading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNextPage}
                      disabled={pageNumber >= totalPages || logsLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Details Modal */}
        <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Audit Log Details</DialogTitle>
            </DialogHeader>
            <DialogDescription className="hidden">
              Detailed information about the selected audit log entry
            </DialogDescription>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs font-semibold">Action</p>
                    <Badge className={getActionBadgeColor(selectedLog.action)}>
                      {selectedLog.action}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold">User</p>
                    <p className="font-medium">{selectedLog.username || 'Anonymous'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold">User ID</p>
                    <p className="font-mono">{selectedLog.userId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold">Entity ID</p>
                    <p className="font-mono">{selectedLog.entityId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold">Entity Type</p>
                    <p>{selectedLog.entityType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold">IP Address</p>
                    <p className="font-mono">{selectedLog.ipAddress || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold mb-2">Timestamp</p>
                  <p className="font-mono text-sm">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold mb-2">Details</p>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm">
                    {selectedLog.details || 'No details available'}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Audit Logs as CSV</DialogTitle>
            </DialogHeader>
            <DialogDescription className="hidden">
              Export audit logs to CSV format with applied filters
            </DialogDescription>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                <p className="font-semibold mb-2">Export Details:</p>
                <ul className="text-xs space-y-1">
                  <li>• Format: <span className="font-mono">CSV</span></li>
                  {actionFilter && <li>• Filtered by action: <span className="font-mono">{actionFilter}</span></li>}
                  {userFilter && <li>• Filtered by user ID: <span className="font-mono">{userFilter}</span></li>}
                  {startDate && <li>• Start date: <span className="font-mono">{startDate}</span></li>}
                  {endDate && <li>• End date: <span className="font-mono">{endDate}</span></li>}
                  {!actionFilter && !userFilter && !startDate && !endDate && <li>• Exporting all logs</li>}
                </ul>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setExportDialogOpen(false)}
                  disabled={exportMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={exportMutation.isPending}
                  className="gap-2"
                >
                  {exportMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export to CSV
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clear Logs Dialog */}
        <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Clear All Audit Logs</DialogTitle>
            </DialogHeader>
            <DialogDescription className="hidden">
              Permanently delete all audit logs from the system
            </DialogDescription>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">
                  <span className="font-semibold">⚠️ Warning:</span> This action will permanently delete all audit logs. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setClearDialogOpen(false)}
                  disabled={isClearing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearLogs}
                  disabled={isClearing}
                  className="gap-2"
                >
                  {isClearing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Clear All Logs
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
