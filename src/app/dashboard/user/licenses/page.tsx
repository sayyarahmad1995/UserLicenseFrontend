'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { useLogoutDialog } from '@/hooks/use-logout-dialog';
import { useLicenses } from '@/hooks/use-licenses';
import { LogoutDialog } from '@/components/logout-dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'suspended':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function UserLicensesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { open, setOpen, openLogoutDialog } = useLogoutDialog();

  // Read from URL query parameters
  const pageNumber = parseInt(searchParams.get('pageIndex') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  const { data: licensesData, isLoading: licensesLoading } = useLicenses({
    pageNumber,
    pageSize,
    userId: user?.id,
  });



  const handlePageSizeChange = (value: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('pageSize', value.toString());
    params.set('pageIndex', '1');
    router.push(`?${params.toString()}`);
  };

  const handlePreviousPage = () => {
    const params = new URLSearchParams(searchParams);
    params.set('pageIndex', Math.max(1, pageNumber - 1).toString());
    router.push(`?${params.toString()}`);
  };

  const handleNextPage = () => {
    if (licensesData) {
      const params = new URLSearchParams(searchParams);
      params.set('pageIndex', Math.min(licensesData.totalPages, pageNumber + 1).toString());
      router.push(`?${params.toString()}`);
    }
  };

  if (userLoading || licensesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Not authorized</p>
          <Button onClick={() => router.push('/login')}>Back to Login</Button>
        </div>
      </div>
    );
  }

  const licenses = licensesData?.data || [];
  const totalPages = licensesData?.totalPages || 1;
  const totalCount = licensesData?.totalCount || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex justify-between items-center gap-4">
            <div>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
                className="mb-2"
              >
                ← Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">My Licenses</h1>
              <p className="text-gray-600 mt-1">View and manage your software licenses</p>
            </div>
            <Button variant="outline" onClick={openLogoutDialog}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{licenses.length}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> licenses
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Licenses Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {licenses.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">No licenses found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Activations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses.map((license: any) => (
                  <TableRow key={license.id}>
                    <TableCell className="font-mono text-sm">{license.licenseKey}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(license.status)}>
                        {license.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(license.createdAt)}</TableCell>
                    <TableCell>
                      {license.expiresAt
                        ? formatDate(license.expiresAt)
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {license.activationCount || 0}/{license.maxActivations || '∞'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={pageNumber === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page <span className="font-semibold">{pageNumber}</span> of{' '}
              <span className="font-semibold">{totalPages}</span>
            </span>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={pageNumber === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Logout Dialog */}
      <LogoutDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
