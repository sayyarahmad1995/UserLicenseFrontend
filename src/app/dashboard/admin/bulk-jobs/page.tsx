'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import {
  useBulkJobOperations,
  useBulkJobStatus,
  useBulkJobCancel,
  useBulkJobRetry,
} from '@/hooks/use-bulk-operations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Download,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
type JobType = 'user_export' | 'license_generation' | 'user_role_update' | 'license_revocation' | 'audit_report';

interface BulkJob {
  id: string;
  type: JobType;
  status: JobStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  createdBy: string;
  estimatedDuration?: number;
  currentDuration?: number;
}

const STATUS_CONFIG: Record<JobStatus, { icon: React.ReactNode; color: string; label: string }> = {
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800',
    label: 'Pending',
  },
  running: {
    icon: <Play className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800',
    label: 'Running',
  },
  completed: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800',
    label: 'Completed',
  },
  failed: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'bg-red-100 text-red-800',
    label: 'Failed',
  },
  cancelled: {
    icon: <Pause className="h-4 w-4" />,
    color: 'bg-yellow-100 text-yellow-800',
    label: 'Cancelled',
  },
};

const JOB_TYPE_LABELS: Record<JobType, string> = {
  user_export: 'User Export',
  license_generation: 'License Generation',
  user_role_update: 'User Role Update',
  license_revocation: 'License Revocation',
  audit_report: 'Audit Report',
};

const ProgressBar = ({
  processed,
  total,
  failed,
}: {
  processed: number;
  total: number;
  failed: number;
}) => {
  const percentage = total > 0 ? (processed / total) * 100 : 0;
  const failedPercentage = total > 0 ? (failed / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">
          {processed} / {total}
        </span>
        <span className="text-gray-600">{percentage.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="flex h-full">
          <div
            className="bg-green-500 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
          <div
            className="bg-red-500 transition-all duration-300"
            style={{ width: `${failedPercentage}%` }}
          />
        </div>
      </div>
      {failed > 0 && <p className="text-xs text-red-600 mt-1">{failed} failed</p>}
    </div>
  );
};

const JobRow = ({
  job,
  onCancel,
  onRetry,
  onDownload,
}: {
  job: BulkJob;
  onCancel: (jobId: string) => void;
  onRetry: (jobId: string) => void;
  onDownload: (jobId: string) => void;
}) => {
  const statusConfig = STATUS_CONFIG[job.status];
  const isRunning = job.status === 'running';
  const canCancel = isRunning || job.status === 'pending';
  const canRetry = job.status === 'failed';
  const canDownload = job.status === 'completed' && job.processedItems > 0;

  return (
    <TableRow>
      <TableCell className="font-medium">{job.id.slice(0, 8)}</TableCell>
      <TableCell>{JOB_TYPE_LABELS[job.type]}</TableCell>
      <TableCell>
        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded ${statusConfig.color}`}>
          {statusConfig.icon}
          {statusConfig.label}
        </div>
      </TableCell>
      <TableCell>
        <ProgressBar processed={job.processedItems} total={job.totalItems} failed={job.failedItems} />
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {new Date(job.createdAt).toLocaleDateString()} {new Date(job.createdAt).toLocaleTimeString()}
      </TableCell>
      <TableCell className="text-sm text-gray-600">{job.createdBy}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          {canCancel && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCancel(job.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {canRetry && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRetry(job.id)}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          {canDownload && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDownload(job.id)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default function BulkJobsPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  // Role guard - only admins can access this page
  useEffect(() => {
    if (!userLoading && user?.role !== 'Admin') {
      router.push('/dashboard/user');
      return;
    }
  }, [user, userLoading, router]);

  // Show loading while checking auth
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (user?.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { data: jobs, isLoading, refetch } = useBulkJobOperations({
    limit: 50,
    offset: 0,
  });
  const cancelJob = useBulkJobCancel();
  const retryJob = useBulkJobRetry();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<JobStatus | 'all'>('all');

  // Auto-refresh for running jobs
  useEffect(() => {
    if (!jobs?.some((job: BulkJob) => job.status === 'running' || job.status === 'pending')) {
      return;
    }

    const interval = setInterval(() => {
      refetch();
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [jobs, refetch]);

  const filteredJobs = (jobs || [])
    .filter(
      (job: BulkJob) =>
        (filterStatus === 'all' || job.status === filterStatus) &&
        (job.id.includes(searchTerm) ||
          JOB_TYPE_LABELS[job.type].toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.createdBy.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a: BulkJob, b: BulkJob) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats = {
    total: jobs?.length || 0,
    running: jobs?.filter((j: BulkJob) => j.status === 'running').length || 0,
    pending: jobs?.filter((j: BulkJob) => j.status === 'pending').length || 0,
    completed: jobs?.filter((j: BulkJob) => j.status === 'completed').length || 0,
    failed: jobs?.filter((j: BulkJob) => j.status === 'failed').length || 0,
  };

  const handleCancel = (jobId: string) => {
    cancelJob.mutate(jobId, {
      onSuccess: () => {
        toast.success('Job cancelled successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to cancel job');
      },
    });
  };

  const handleRetry = (jobId: string) => {
    retryJob.mutate(jobId, {
      onSuccess: () => {
        toast.success('Job retry started');
        refetch();
      },
      onError: () => {
        toast.error('Failed to retry job');
      },
    });
  };

  const handleDownload = (jobId: string) => {
    // Trigger download through iframe
    const downloadUrl = `/api/bulk-jobs/${jobId}/download`;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = downloadUrl;
    document.body.appendChild(iframe);
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Jobs Monitor</h1>
          <p className="text-gray-600 mt-2">Track and manage long-running bulk operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Running</p>
              <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by job ID, type, or creator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as JobStatus | 'all')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bulk Jobs</CardTitle>
            <CardDescription>
              {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No bulk jobs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job: BulkJob) => (
                      <JobRow
                        key={job.id}
                        job={job}
                        onCancel={handleCancel}
                        onRetry={handleRetry}
                        onDownload={handleDownload}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
