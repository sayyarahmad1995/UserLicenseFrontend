'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const SCROLL_KEY = 'dashboard-admin-licenses-scroll';
import { useCurrentUser } from '@/hooks/use-auth';
import { useLogoutDialog } from '@/hooks/use-logout-dialog';
import { useLicenses, useUpdateLicenseStatus, useRevokeLicense, useCreateLicense } from '@/hooks/use-licenses';
import { LogoutDialog } from '@/components/logout-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, MoreHorizontal, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import { LicenseStatus } from '@/types/api';
import { toast } from 'sonner';

type SortColumn = 'licenseKey' | 'userId' | 'status' | 'expiresAt' | 'activeActivations' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  Expired: 'bg-yellow-100 text-yellow-800',
  Revoked: 'bg-red-100 text-red-800',
  Suspended: 'bg-orange-100 text-orange-800',
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const truncateKey = (key: string) => {
  if (!key) return '';
  return key.substring(0, 8) + '...' + key.substring(key.length - 4);
};

export default function LicensesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableRef = useRef<HTMLDivElement>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const { data: user, isLoading: userLoading } = useCurrentUser();

  // Save scroll position before navigating away
  const handleBackClick = () => {
    sessionStorage.setItem(SCROLL_KEY, window.scrollY.toString());
    setIsNavigating(true);
    router.push('/dashboard');
  };

  // Restore scroll position when component mounts
  useEffect(() => {
    const savedScroll = sessionStorage.getItem(SCROLL_KEY);
    if (savedScroll && !isNavigating) {
      window.scrollTo(0, parseInt(savedScroll, 10));
      sessionStorage.removeItem(SCROLL_KEY);
    }
  }, [isNavigating]);
  const { open, setOpen, openLogoutDialog } = useLogoutDialog();
  const updateStatusMutation = useUpdateLicenseStatus();
  const revokeLicenseMutation = useRevokeLicense();
  const createLicenseMutation = useCreateLicense();

  // State for pagination and filters
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<LicenseStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedLicenseId, setSelectedLicenseId] = useState<number | null>(null);
  const [selectedLicenseKey, setSelectedLicenseKey] = useState<string>('');
  const [createFormData, setCreateFormData] = useState({
    userId: '',
    expiresAt: '',
    maxActivations: '1',
  });

  const { data: licensesData, isLoading: licensesLoading } = useLicenses({
    pageNumber,
    pageSize,
    status: statusFilter ? (statusFilter as LicenseStatus) : undefined,
    sortColumn: sortColumn as any,
    sortDirection,
  });

  // Protect page - only admins can access
  useEffect(() => {
    if (!userLoading && user && user.role !== 'Admin') {
      router.push('/dashboard');
    }
  }, [user, userLoading, router]);


  const handleStatusFilterChange = (value: LicenseStatus | '') => {
    setStatusFilter(value);
    setPageNumber(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPageNumber(1);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPageNumber(1);
  };

  const handlePreviousPage = () => {
    setPageNumber(Math.max(1, pageNumber - 1));
  };

  const handleNextPage = () => {
    if (licensesData) {
      setPageNumber(Math.min(licensesData.totalPages, pageNumber + 1));
    }
  };

  const handleLogout = () => {
    openLogoutDialog();
  };

  const handleStatusChange = (licenseId: number, newStatus: LicenseStatus) => {
    updateStatusMutation.mutate({ id: licenseId, status: newStatus });
  };

  const handleRevoke = (licenseId: number, licenseKey: string) => {
    setSelectedLicenseId(licenseId);
    setSelectedLicenseKey(licenseKey);
    setRevokeDialogOpen(true);
  };

  const confirmRevoke = () => {
    if (selectedLicenseId !== null) {
      revokeLicenseMutation.mutate(selectedLicenseId, {
        onSuccess: () => {
          setRevokeDialogOpen(false);
          setSelectedLicenseId(null);
          setSelectedLicenseKey('');
        },
      });
    }
  };

  const handleCreateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.userId || !createFormData.expiresAt) {
      return;
    }
    createLicenseMutation.mutate({
      userId: parseInt(createFormData.userId),
      expiresAt: createFormData.expiresAt,
      maxActivations: parseInt(createFormData.maxActivations) || 1,
    }, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        setCreateFormData({ userId: '', expiresAt: '', maxActivations: '1' });
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        router.push(`?${params.toString()}`);
      },
    });
  };

  const totalPages = licensesData?.totalPages || 1;
  const totalCount = licensesData?.totalCount || 0;
  const licenses = licensesData?.data || [];

  // Filter licenses based on search query (client-side for userId, backend handles license key)
  const filteredLicenses = licenses.filter((license) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const userId = license.userId?.toString() || '';
    return userId.includes(searchLower);
  });

  // Sort handling
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPageNumber(1); // Reset to first page when sorting changes
  };

  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="inline ml-1 w-4 h-4" /> : 
      <ChevronDown className="inline ml-1 w-4 h-4" />;
  };
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
              <h1 className="text-2xl font-bold text-gray-900">License Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage all licenses</p>
            </div>
            <div className="flex gap-2">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>Create License</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New License</DialogTitle>
                  <DialogDescription>
                    Create a new software license for a user
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateLicense} className="space-y-4">
                  <div>
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      type="number"
                      placeholder="User ID"
                      value={createFormData.userId}
                      onChange={(e) => setCreateFormData({ ...createFormData, userId: e.target.value })}
                      disabled={createLicenseMutation.isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiresAt">Expiration Date</Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={createFormData.expiresAt}
                      onChange={(e) => setCreateFormData({ ...createFormData, expiresAt: e.target.value })}
                      disabled={createLicenseMutation.isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxActivations">Max Activations</Label>
                    <Input
                      id="maxActivations"
                      type="number"
                      placeholder="1"
                      min="1"
                      value={createFormData.maxActivations}
                      onChange={(e) => setCreateFormData({ ...createFormData, maxActivations: e.target.value })}
                      disabled={createLicenseMutation.isPending}
                    />
                  </div>
                  <div className="flex gap-3 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                      disabled={createLicenseMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createLicenseMutation.isPending || !createFormData.userId || !createFormData.expiresAt}
                    >
                      {createLicenseMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create License'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
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
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <Label htmlFor="search" className="mb-2 block">
                    Search by Key or User ID
                  </Label>
                  <Input
                    id="search"
                    placeholder="Search by license key or user ID..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <Label htmlFor="status" className="mb-2 block">
                    Filter by Status
                  </Label>
                  <select
                    id="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value as LicenseStatus | '')}
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Revoked">Revoked</option>
                    <option value="Suspended">Suspended</option>
                  </select>
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

            {/* Licenses Table */}
            {licensesLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-gray-400" size={32} />
              </div>
            ) : (
              <>
                <div ref={tableRef} className="bg-white rounded-lg shadow overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200">
                        <TableHead className="px-4 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('licenseKey')}>
                          License Key {getSortIndicator('licenseKey')}
                        </TableHead>
                        <TableHead className="px-4 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('userId')}>
                          User ID {getSortIndicator('userId')}
                        </TableHead>
                        <TableHead className="px-4 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('status')}>
                          Status {getSortIndicator('status')}
                        </TableHead>
                        <TableHead className="px-4 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('expiresAt')}>
                          Expires {getSortIndicator('expiresAt')}
                        </TableHead>
                        <TableHead className="px-4 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('activeActivations')}>
                          Activations {getSortIndicator('activeActivations')}
                        </TableHead>
                        <TableHead className="px-4 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('createdAt')}>
                          Created {getSortIndicator('createdAt')}
                        </TableHead>
                        <TableHead className="px-4 py-2 bg-gray-50 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLicenses.length > 0 ? (
                        filteredLicenses.map((license) => (
                          <TableRow key={license.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <TableCell className="px-4 py-2 text-sm font-mono">
                              <code className="text-gray-700">{truncateKey(license.licenseKey)}</code>
                              <div className="text-xs text-gray-500 mt-1">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(license.licenseKey);
                                    toast.success('License key copied!');
                                  }}
                                  className="text-blue-600 hover:underline"
                                >
                                  Copy full key
                                </button>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-2 text-sm">{license.userId}</TableCell>
                            <TableCell className="px-4 py-2">
                              <Badge className={statusColors[license.status] || ''}>
                                {license.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-2 text-sm">
                              {formatDate(license.expiresAt)}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-sm">
                              <span className="text-gray-700">
                                {license.activeActivations} / {license.maxActivations}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {license.activeActivations > 0
                                  ? `${((license.activeActivations / license.maxActivations) * 100).toFixed(0)}% active`
                                  : 'Not activated'}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-2 text-sm">
                              {formatDate(license.createdAt)}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" disabled={updateStatusMutation.isPending || revokeLicenseMutation.isPending}>
                                    {updateStatusMutation.isPending || revokeLicenseMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <MoreHorizontal className="h-4 w-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {license.status !== LicenseStatus.Active && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(license.id, LicenseStatus.Active)}>
                                      Activate
                                    </DropdownMenuItem>
                                  )}
                                  {license.status !== LicenseStatus.Suspended && license.status !== LicenseStatus.Revoked && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(license.id, LicenseStatus.Suspended)}>
                                      Suspend
                                    </DropdownMenuItem>
                                  )}
                                  {license.status !== LicenseStatus.Revoked && (
                                    <DropdownMenuItem onClick={() => handleRevoke(license.id, license.licenseKey)}>
                                      <RotateCcw className="h-4 w-4 mr-2" />
                                      Revoke
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="px-4 py-4 text-center text-gray-500">
                            {searchQuery ? 'No licenses match your search' : 'No licenses found'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {licensesData && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {pageNumber} of {licensesData.totalPages} • Total {licensesData.totalCount} licenses
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handlePreviousPage}
                        disabled={pageNumber === 1 || licensesLoading}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleNextPage}
                        disabled={pageNumber >= licensesData.totalPages || licensesLoading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Revoke Confirmation Dialog */}
            <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Revoke License</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to revoke this license? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="mb-6 p-4 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700">License Key</p>
                  <code className="text-sm text-gray-600 font-mono mt-1">{truncateKey(selectedLicenseKey)}</code>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setRevokeDialogOpen(false)}
                    disabled={revokeLicenseMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmRevoke}
                    disabled={revokeLicenseMutation.isPending}
                  >
                    {revokeLicenseMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Revoking...
                      </>
                    ) : (
                      'Revoke License'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      {/* Logout Dialog */}
      <LogoutDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
