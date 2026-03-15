import { apiClient } from '@/lib/api-client';
import type {
  MachineFingerprint,
  MachineFingerprintRequest,
  BlockMachineFingerprintRequest,
  TrustMachineFingerprintRequest,
  MachineFingerprintStatistics,
  PaginatedResponse,
} from '@/types/api';

export interface GetMachineFingerprintsParams {
  pageNumber?: number;
  pageSize?: number;
  userId?: number;
  trustLevel?: 'trusted' | 'untrusted' | 'unknown';
  isBlocked?: boolean;
}

export const machineFingerprintService = {
  async getMachineFingerprints(params?: GetMachineFingerprintsParams): Promise<PaginatedResponse<MachineFingerprint>> {
    const queryParams = new URLSearchParams();
    
    if (params?.pageNumber) queryParams.append('pageIndex', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.userId) queryParams.append('userId', params.userId.toString());
    if (params?.trustLevel) queryParams.append('trustLevel', params.trustLevel);
    if (params?.isBlocked !== undefined) queryParams.append('isBlocked', params.isBlocked.toString());
    
    const url = queryParams.toString() ? `/machine-fingerprints?${queryParams}` : '/machine-fingerprints';
    const response = await apiClient.get<any>(url);
    
    return {
      pageNumber: response.pageIndex || 1,
      pageSize: response.pageSize || 10,
      totalCount: response.total || 0,
      totalPages: response.totalPages || 0,
      data: response.fingerprints || response.data || [],
    };
  },

  async getMachineFingerprint(id: string): Promise<MachineFingerprint> {
    const response = await apiClient.get<any>(`/machine-fingerprints/${id}`);
    return response.data || response || {} as MachineFingerprint;
  },

  async registerFingerprint(request: MachineFingerprintRequest): Promise<MachineFingerprint> {
    const response = await apiClient.post<any>('/machine-fingerprints/register', request);
    return response.data || response || {} as MachineFingerprint;
  },

  async updateFingerprint(id: string, request: Partial<MachineFingerprintRequest>): Promise<MachineFingerprint> {
    const response = await apiClient.patch<any>(`/machine-fingerprints/${id}`, request);
    return response.data || response || {} as MachineFingerprint;
  },

  async blockFingerprint(request: BlockMachineFingerprintRequest): Promise<MachineFingerprint> {
    const response = await apiClient.post<any>('/machine-fingerprints/block', request);
    return response.data || response || {} as MachineFingerprint;
  },

  async unblockFingerprint(deviceFingerprint: string): Promise<MachineFingerprint> {
    const response = await apiClient.post<any>(`/machine-fingerprints/${deviceFingerprint}/unblock`, {});
    return response.data || response || {} as MachineFingerprint;
  },

  async trustFingerprint(request: TrustMachineFingerprintRequest): Promise<MachineFingerprint> {
    const response = await apiClient.post<any>('/machine-fingerprints/trust', request);
    return response.data || response || {} as MachineFingerprint;
  },

  async removeTrust(deviceFingerprint: string): Promise<MachineFingerprint> {
    const response = await apiClient.post<any>(`/machine-fingerprints/${deviceFingerprint}/remove-trust`, {});
    return response.data || response || {} as MachineFingerprint;
  },

  async getMachineFingerprintStatistics(): Promise<MachineFingerprintStatistics> {
    const response = await apiClient.get<any>('/machine-fingerprints/statistics');
    return response.data || response || {} as MachineFingerprintStatistics;
  },

  async getUserDevices(userId: number): Promise<MachineFingerprint[]> {
    const response = await apiClient.get<any>(`/users/${userId}/devices`);
    return Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
  },

  async deleteOldFingerprints(olderThanDays: number): Promise<{ deletedCount: number }> {
    const response = await apiClient.post<any>('/machine-fingerprints/cleanup', {
      olderThanDays,
    });
    return response.data || response;
  },
};
