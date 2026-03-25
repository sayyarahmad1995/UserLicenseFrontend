'use client';

import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/use-auth';
import { useLogoutDialog } from '@/hooks/use-logout-dialog';
import { useUsers, useUpdateUserStatus, useDeleteUser, useCreateUser } from '@/hooks/use-users';
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
import { Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { UserStatus } from '@/types/api';

const statusColors: Record<string, string> = {
  Unverified: 'bg-yellow-100 text-yellow-800',
  Verified: 'bg-blue-100 text-blue-800',
  Active: 'bg-green-100 text-green-800',
  Blocked: 'bg-red-100 text-red-800',
};

export default function UsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { open, setOpen, openLogoutDialog } = useLogoutDialog();
  const updateStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();
  const createUserMutation = useCreateUser();

  // State for all parameters - initialize from URL
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [sortBy, setSortBy] = useState(() => searchParams.get('sortBy') || '');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [createFormData, setCreateFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  // Fetch users data with current filters and pagination
  const { data: usersData, isLoading: usersLoading } = useUsers({
    pageNumber,
    pageSize,
    searchTerm: debouncedSearchTerm || undefined,
    status: statusFilter ? (statusFilter as UserStatus) : undefined,
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
  });

  // Debounce search input - update query only after user stops typing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(localSearchTerm);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localSearchTerm]);

  // Update table loading state based on usersLoading
  useEffect(() => {
    if (!usersLoading && !hasInitialLoaded) {
      setHasInitialLoaded(true);
    }
    setIsTableLoading(usersLoading);
  }, [usersLoading, hasInitialLoaded]);

  // Protect page - only admins can access
  useEffect(() => {
    if (!userLoading && user && user.role !== 'Admin') {
      router.push('/dashboard');
    }
  }, [user, userLoading, router]);

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
  };

  const handleStatusFilterChange = (value: UserStatus | '') => {
    setStatusFilter(value);
    setPageNumber(1);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPageNumber(1);
  };

  const handleSort = (column: string) => {
    // If clicking the same column, toggle sort order; otherwise set to asc
    let newOrder: 'asc' | 'desc' = 'asc';
    if (sortBy === column) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    
    setSortBy(column);
    setSortOrder(newOrder);
    setPageNumber(1);
  };

  const renderSortHeader = (column: string, label: string) => {
    const isSorted = sortBy === column;
    const indicator = isSorted ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : '';

    return (
      <TableHead
        onClick={() => handleSort(column)}
        className="cursor-pointer select-none hover:bg-gray-100"
      >
        {label}{indicator}
      </TableHead>
    );
  };

  const handlePreviousPage = () => {
    setPageNumber(Math.max(1, pageNumber - 1));
  };

  const handleNextPage = () => {
    if (usersData) {
      setPageNumber(Math.min(usersData.totalPages, pageNumber + 1));
    }
  };

  const handleLogout = () => {
    openLogoutDialog();
  };

  const handleStatusChange = (userId: number, newStatus: UserStatus) => {
    updateStatusMutation.mutate({ id: userId, status: newStatus });
  };

  const handleDeleteUser = () => {
    if (selectedUserId) {
      deleteUserMutation.mutate({ id: selectedUserId, hardDelete: false });
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.username || !createFormData.email || !createFormData.password) {
      return;
    }
    createUserMutation.mutate(createFormData, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        setCreateFormData({ username: '', email: '', password: '' });
        setPageNumber(1);
      },
    });
  };

  // Show full-page loader only on initial load, not when searching
  if ((userLoading || !hasInitialLoaded) && usersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">You don't have permission to access this page</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage all user accounts</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Create User</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Create a new user account
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="username"
                        value={createFormData.username}
                        onChange={(e) => setCreateFormData({ ...createFormData, username: e.target.value })}
                        disabled={createUserMutation.isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={createFormData.email}
                        onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                        disabled={createUserMutation.isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={createFormData.password}
                        onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                        disabled={createUserMutation.isPending}
                      />
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateDialogOpen(false)}
                        disabled={createUserMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createUserMutation.isPending || !createFormData.username || !createFormData.email || !createFormData.password}
                      >
                        {createUserMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create User'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                onClick={handleLogout}
                variant="outline"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Username, email..."
                value={localSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value as UserStatus | '')}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="">All Statuses</option>
                <option value={UserStatus.Unverified}>Unverified</option>
                <option value={UserStatus.Verified}>Verified</option>
                <option value={UserStatus.Active}>Active</option>
                <option value={UserStatus.Blocked}>Blocked</option>
              </select>
            </div>
            <div>
              <Label htmlFor="pageSize">Per Page</Label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div ref={tableRef} className="bg-white rounded-lg shadow overflow-hidden relative">
          {isTableLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                {renderSortHeader('username', 'Username')}
                {renderSortHeader('email', 'Email')}
                {renderSortHeader('role', 'Role')}
                {renderSortHeader('status', 'Status')}
                {renderSortHeader('createdAt', 'Created')}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData?.data && usersData.data.length > 0 ? (
                usersData.data.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[u.status]}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            disabled={updateStatusMutation.isPending || deleteUserMutation.isPending}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {u.status !== UserStatus.Active && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(u.id, UserStatus.Active)}
                              disabled={updateStatusMutation.isPending}
                              className="text-green-600"
                            >
                              Activate
                            </DropdownMenuItem>
                          )}
                          {u.status !== UserStatus.Verified && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(u.id, UserStatus.Verified)}
                              disabled={updateStatusMutation.isPending}
                            >
                              Verify
                            </DropdownMenuItem>
                          )}
                          {u.status === UserStatus.Verified && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(u.id, UserStatus.Unverified)}
                              disabled={updateStatusMutation.isPending}
                            >
                              Unverify
                            </DropdownMenuItem>
                          )}
                          {u.status !== UserStatus.Blocked && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(u.id, UserStatus.Blocked)}
                              disabled={updateStatusMutation.isPending}
                            >
                              Suspend/Block
                            </DropdownMenuItem>
                          )}
                          {u.status === UserStatus.Blocked && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(u.id, UserStatus.Active)}
                              disabled={updateStatusMutation.isPending}
                            >
                              Unblock
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedUserId(u.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {usersData && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing page {pageNumber} of {usersData.totalPages} ({usersData.totalCount} total users)
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handlePreviousPage}
                disabled={pageNumber === 1}
                variant="outline"
              >
                Previous
              </Button>
              <Button
                onClick={handleNextPage}
                disabled={pageNumber === usersData.totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Dialog */}
      <LogoutDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
