import { apiClient } from '@/lib/api-client';
import type {
  License,
  LicenseStatus,
  LicenseActivation,
  PaginatedResponse,
  GenerateLicenseRequest,
  RevokeLicenseRequest,
  ExportLicensesRequest,
  LicenseCheckResponse,
  LicenseStatistics,
  BulkLicenseOperation,
  AsyncJobResult,
} from '@/types/api';

export interface GetLicensesParams {
  pageNumber?: number;
  pageSize?: number;
  status?: LicenseStatus;
  userId?: number;
}

export interface CreateLicenseRequest {
  userId: number;
  expiresAt: string;
  maxActivations?: number;
}

export interface ActivateLicenseRequest {
  licenseKey: string;
  machineFingerprint: string;
  hostname?: string;
}

export interface ValidateLicenseRequest {
  licenseKey: string;
  machineFingerprint: string;
}

export interface HeartbeatRequest {
  licenseKey: string;
  machineFingerprint: string;
}

export interface DeactivateLicenseRequest {
  licenseKey: string;
  machineFingerprint: string;
}

export const licenseService = {
  async getLicenses(params?: GetLicensesParams): Promise<PaginatedResponse<License>> {
    const queryParams = new URLSearchParams();
    
    // Go-Chi uses pageIndex instead of pageNumber
    if (params?.pageNumber) queryParams.append('pageIndex', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.userId) queryParams.append('user_id', params.userId.toString());
    
    const url = queryParams.toString() ? `/licenses?${queryParams}` : '/licenses';
    const response = await apiClient.get<any>(url);
    
    // Go-Chi returns data directly with pagination info at root level
    // Response format: { pageIndex, pageSize, total, totalPages, licenses or data, ... }
    return {
      pageNumber: response.pageIndex || 1,
      pageSize: response.pageSize || 10,
      totalCount: response.total || 0,
      totalPages: response.totalPages || 0,
      data: response.licenses || response.data || [],
    };
  },

  async getLicenseById(id: number): Promise<License> {
    const response = await apiClient.get<any>(`/licenses/${id}`);
    // Go-Chi returns the license directly, not wrapped in data field
    return response.license || response.data || response;
  },

  async createLicense(data: CreateLicenseRequest): Promise<License> {
    const response = await apiClient.post<any>('/licenses', data);
    return response.license || response.data || response;
  },

  async updateLicenseStatus(id: number, status: LicenseStatus): Promise<License> {
    // Use PATCH instead of PUT for Go-Chi
    const response = await apiClient.patch<any>(`/licenses/${id}/status`, { status });
    return response.license || response.data || response;
  },

  async revokeLicense(id: number): Promise<License> {
    // Use DELETE instead of POST for Go-Chi
    const response = await apiClient.delete<any>(`/licenses/${id}`);
    return response.license || response.data || response;
  },

  async activateLicense(data: ActivateLicenseRequest): Promise<void> {
    await apiClient.post('/licenses/activate', data);
  },

  async validateLicense(data: ValidateLicenseRequest): Promise<{ isValid: boolean; message: string }> {
    const response = await apiClient.post<any>('/licenses/validate', data);
    // Go-Chi returns the validation result directly
    return {
      isValid: response.isValid || response.is_valid || false,
      message: response.message || '',
    };
  },

  async heartbeat(data: HeartbeatRequest): Promise<void> {
    await apiClient.post('/licenses/heartbeat', data);
  },

  async deactivateLicense(data: DeactivateLicenseRequest): Promise<void> {
    await apiClient.post('/licenses/deactivate', data);
  },

  async getActivations(licenseId: number): Promise<LicenseActivation[]> {
    const response = await apiClient.get<any>(`/licenses/${licenseId}/activations`);
    return response.activations || response.data || response || [];
  },

  async generateLicense(request: GenerateLicenseRequest): Promise<License> {
    const response = await apiClient.post<any>('/licenses/generate', {
      userId: request.userId,
      maxActivations: request.maxActivations,
      expiresInDays: request.expiresInDays,
    });
    return response.license || response.data || response;
  },

  async revokeLicenseWithReason(request: RevokeLicenseRequest): Promise<License> {
    const response = await apiClient.post<any>(`/licenses/${request.licenseId}/revoke`, {
      reason: request.reason,
    });
    return response.license || response.data || response;
  },

  async checkLicense(licenseKey: string): Promise<LicenseCheckResponse> {
    const response = await apiClient.get<any>(`/licenses/check?key=${licenseKey}`);
    return response.data || response;
  },

  async exportLicenses(request: ExportLicensesRequest): Promise<Blob> {
    const response = await apiClient.get<any>('/licenses/export', {
      params: {
        format: request.format,
        status: request.filters?.status,
        userId: request.filters?.userId,
        createdAfter: request.filters?.createdAfter,
        createdBefore: request.filters?.createdBefore,
      },
      responseType: 'blob',
    });
    return response as Blob;
  },

  async getLicenseStatistics(): Promise<LicenseStatistics> {
    const response = await apiClient.get<any>('/licenses/statistics');
    return response.data || response || {} as LicenseStatistics;
  },

  async bulkLicenseOperation(operation: BulkLicenseOperation): Promise<AsyncJobResult> {
    const response = await apiClient.post<any>('/licenses/bulk', operation);
    return response.job || response.data || response;
  },

  async getActivationLimit(licenseId: number): Promise<{ maxActivations: number; activeActivations: number; canActivate: boolean }> {
    const response = await apiClient.get<any>(`/licenses/${licenseId}/activation-limit`);
    return response.data || response;
  },
};
