import { apiClient } from '@/lib/api-client';
import type {
  AuditLog,
  PaginatedResponse,
  AuditLogExportRequest,
  AuditLogStatistics,
  ComplianceReport,
} from '@/types/api';

export interface GetAuditLogsParams {
  pageNumber?: number;
  pageSize?: number;
  userId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export const auditService = {
  async getAuditLogs(params?: GetAuditLogsParams): Promise<PaginatedResponse<AuditLog>> {
    const queryParams = new URLSearchParams();
    
    // Go-Chi uses pageIndex instead of pageNumber
    if (params?.pageNumber) queryParams.append('pageIndex', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.userId) queryParams.append('userId', params.userId.toString());
    if (params?.action) queryParams.append('action', params.action);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const url = queryParams.toString() ? `/audit-logs?${queryParams}` : '/audit-logs';
    const response = await apiClient.get<any>(url);
    
    // Backend returns logs in either format:
    // Format 1: { logs: [...], pageIndex, pageSize, total, totalPages }
    // Format 2: { data: [...], pageIndex, pageSize, total, totalPages }
    const logsArray = response.logs || response.data || [];
    
    return {
      pageNumber: response.pageIndex || 1,
      pageSize: response.pageSize || 10,
      totalCount: response.total || response.count || 0,
      totalPages: response.totalPages || 0,
      data: logsArray,
    };
  },

  async getAuditLogById(id: number): Promise<AuditLog> {
    const response = await apiClient.get<any>(`/audit-logs/${id}`);
    return response.log || response.data || response;
  },

  async exportAuditLogs(request: AuditLogExportRequest): Promise<Blob> {
    const response = await apiClient.get<any>('/audit-logs/export', {
      params: {
        format: request.format,
        startDate: request.dateRange?.startDate,
        endDate: request.dateRange?.endDate,
        userId: request.filters?.userId,
        action: request.filters?.action,
        ipAddress: request.filters?.ipAddress,
      },
      responseType: 'blob',
    });
    return response as Blob;
  },

  async getAuditLogStatistics(): Promise<AuditLogStatistics> {
    const response = await apiClient.get<any>('/audit-logs/statistics');
    return response.data || response || {} as AuditLogStatistics;
  },

  async getComplianceReport(period: string = '30d'): Promise<ComplianceReport> {
    const response = await apiClient.get<any>(`/audit-logs/compliance-report?period=${period}`);
    return response.data || response || {} as ComplianceReport;
  },

  async clearAuditLogs(): Promise<void> {
    await apiClient.delete('/audit-logs');
  },
};
