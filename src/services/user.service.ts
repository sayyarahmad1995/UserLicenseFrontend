import { apiClient } from '@/lib/api-client';
import type {
  User,
  UserStatus,
  UserRole,
  PaginatedResponse,
  UpdateUserRoleRequest,
  ExportUsersRequest,
  BulkUserOperation,
  AsyncJobResult,
  KickOutUserRequest,
} from '@/types/api';

export interface GetUsersParams {
  pageNumber?: number;
  pageSize?: number;
  status?: UserStatus;
  role?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const userService = {
  async getUsers(params?: GetUsersParams): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    
    // Go-Chi uses pageIndex instead of pageNumber
    if (params?.pageNumber) queryParams.append('pageIndex', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.searchTerm) queryParams.append('search', params.searchTerm);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = queryParams.toString() ? `/users?${queryParams}` : '/users';
    const response = await apiClient.get<any>(url);
    
    // Go-Chi returns data directly with pagination info at root level
    // Response format: { pageIndex, pageSize, total, totalPages, users, ... }
    return {
      pageNumber: response.pageIndex || 1,
      pageSize: response.pageSize || 10,
      totalCount: response.total || 0,
      totalPages: response.totalPages || 0,
      data: response.users || response.data || [],
    };
  },

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<any>(`/users/${id}`);
    return response.user || response.data || response;
  },

  async updateUserStatus(id: number, status: UserStatus): Promise<User> {
    // Use PATCH instead of PUT for Go-Chi
    const response = await apiClient.patch<any>(`/users/${id}/status`, { status });
    return response.user || response.data || response;
  },

  async deleteUser(id: number, hardDelete: boolean = false): Promise<void> {
    await apiClient.delete(`/users/${id}?hardDelete=${hardDelete}`);
  },

  async createUser(data: { username: string; email: string; password: string }): Promise<User> {
    // Go-Chi endpoint for creating users by admin - check exact path from routes
    const response = await apiClient.post<any>('/users', data);
    return response.user || response.data || response;
  },

  async updateUserRole(request: UpdateUserRoleRequest): Promise<User> {
    const response = await apiClient.patch<any>(`/users/${request.userId}/role`, {
      role: request.newRole,
    });
    return response.user || response.data || response;
  },

  async kickOutUser(request: KickOutUserRequest): Promise<void> {
    await apiClient.post(`/users/${request.userId}/kick-out`, {
      reason: request.reason,
    });
  },

  async exportUsers(request: ExportUsersRequest): Promise<Blob> {
    const response = await apiClient.get<any>('/users/export', {
      params: {
        format: request.format,
        fields: request.includedFields?.join(','),
        status: request.filters?.status,
        role: request.filters?.role,
      },
      responseType: 'blob',
    });
    return response as Blob;
  },

  async bulkOperation(operation: BulkUserOperation): Promise<AsyncJobResult> {
    const response = await apiClient.post<any>('/users/bulk', operation);
    return response.job || response.data || response;
  },

  async getAsyncJob(jobId: string): Promise<AsyncJobResult> {
    const response = await apiClient.get<any>(`/jobs/${jobId}`);
    return response.job || response.data || response;
  },

  async listAsyncJobs(status?: string): Promise<AsyncJobResult[]> {
    const url = status ? `/jobs?status=${status}` : '/jobs';
    const response = await apiClient.get<any>(url);
    return Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
  },
};
