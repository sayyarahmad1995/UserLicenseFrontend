import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface BulkJob {
  id: string;
  type: 'user_export' | 'license_generation' | 'user_role_update' | 'license_revocation' | 'audit_report';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
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

export interface BulkJobsListResponse {
  jobs: BulkJob[];
  total: number;
  offset: number;
  limit: number;
}

export interface BulkJobDownloadResponse {
  url: string;
}

const BULK_JOBS_QUERY_KEY = ['bulk-jobs'];

/**
 * Hook to fetch all bulk jobs
 */
export function useBulkJobOperations(params?: { limit?: number; offset?: number }) {
  return useQuery<BulkJob[]>({
    queryKey: [...BULK_JOBS_QUERY_KEY, 'list', params],
    queryFn: async () => {
      const response = await apiClient.get<BulkJobsListResponse>('/bulk-jobs', {
        params: {
          limit: params?.limit || 50,
          offset: params?.offset || 0,
        },
      });
      return response.jobs || [];
    },
    staleTime: 5000,
  });
}

/**
 * Hook to fetch a specific bulk job
 */
export function useBulkJobStatus(jobId: string) {
  return useQuery<BulkJob>({
    queryKey: [...BULK_JOBS_QUERY_KEY, 'status', jobId],
    queryFn: async () => {
      return apiClient.get<BulkJob>(`/bulk-jobs/${jobId}`);
    },
    enabled: !!jobId,
    staleTime: 3000,
  });
}

/**
 * Hook to cancel a bulk job
 */
export function useBulkJobCancel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      return apiClient.post<{ success: boolean }>(`/bulk-jobs/${jobId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BULK_JOBS_QUERY_KEY });
    },
  });
}

/**
 * Hook to retry a failed bulk job
 */
export function useBulkJobRetry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      return apiClient.post<BulkJob>(`/bulk-jobs/${jobId}/retry`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BULK_JOBS_QUERY_KEY });
    },
  });
}

/**
 * Hook to download bulk job results
 */
export function useBulkJobDownload() {
  return useMutation({
    mutationFn: async (jobId: string) => {
      return apiClient.get<BulkJobDownloadResponse>(
        `/bulk-jobs/${jobId}/download`
      );
    },
  });
}

/**
 * Hook to create a new bulk job
 */
export interface BulkJobCreateRequest {
  type: 'user_export' | 'license_generation' | 'user_role_update' | 'license_revocation' | 'audit_report';
  filters?: Record<string, any>;
  options?: Record<string, any>;
}

export function useBulkJobCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkJobCreateRequest) => {
      return apiClient.post<BulkJob>('/bulk-jobs', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BULK_JOBS_QUERY_KEY });
    },
  });
}

/**
 * Hook to get bulk job statistics
 */
export interface BulkJobStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  successRate: number;
}

export function useBulkJobStats() {
  return useQuery<BulkJobStats>({
    queryKey: [...BULK_JOBS_QUERY_KEY, 'stats'],
    queryFn: async () => {
      return apiClient.get<BulkJobStats>('/bulk-jobs/stats');
    },
    staleTime: 10000,
  });
}
