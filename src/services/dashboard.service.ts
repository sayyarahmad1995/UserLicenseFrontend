import { apiClient } from '@/lib/api-client';
import type {
  DashboardStats,
  DashboardUserStats,
  LicenseForecast,
  ActivityTimelineEntry,
  AnalyticsData,
  EnhancedDashboard,
  AuditLog,
  PaginatedResponse,
  DashboardSnapshot,
} from '@/types/api';

export interface GetAuditLogsParams {
  pageNumber?: number;
  pageSize?: number;
  userId?: number;
  action?: string;
}

export const dashboardService = {
  async getDashboard(): Promise<DashboardSnapshot> {
    const response = await apiClient.get<any>('/dashboard');
    // Map the response to ensure we handle the data structure correctly
    const data = response.data || response;
    
    return {
      userId: data.userId || 0,
      licenses: data.licenses || { total: 0, active: 0, expired: 0, expiringSoon: 0 },
      activations: data.activations || { total: 0 },
      recentActivity: (Array.isArray(data.recentActivity) ? data.recentActivity : []).map((entry: any) => ({
        id: entry.id,
        action: entry.action,
        description: entry.details,
        timestamp: entry.timestamp,
        username: entry.username,
      })) as ActivityTimelineEntry[],
    } as DashboardSnapshot;
  },

  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<any>('/dashboard/stats');
    // Go-Chi returns data directly, no nested 'data' field
    // Handle both direct response and potential wrapped response
    return response.data || response.stats || response || {} as DashboardStats;
  },

  async getDashboardUser(): Promise<DashboardUserStats> {
    const response = await apiClient.get<any>('/dashboard/');
    return response.data || response || {} as DashboardUserStats;
  },

  async getLicenseForecast(): Promise<LicenseForecast> {
    const response = await apiClient.get<any>('/dashboard/forecast');
    return response.data || response || {};
  },

  async getActivityTimeline(limit: number = 10): Promise<ActivityTimelineEntry[]> {
    const response = await apiClient.get<any>('/dashboard');
    // Backend returns { recentActivity: [...] } from /dashboard endpoint
    const timeline = response.data?.recentActivity || response.recentActivity || [];
    
    // Map details field to description and limit results
    return (Array.isArray(timeline) ? timeline.slice(0, limit) : []).map((entry: any) => ({
      id: entry.id,
      action: entry.action,
      description: entry.details,
      timestamp: entry.timestamp,
    })) as ActivityTimelineEntry[];
  },

  async getAnalytics(period: string = '7d'): Promise<AnalyticsData> {
    const response = await apiClient.get<any>(`/dashboard/analytics?period=${period}`);
    return response.data || response || {} as AnalyticsData;
  },

  async getEnhanced(): Promise<EnhancedDashboard> {
    const response = await apiClient.get<any>('/dashboard/enhanced');
    return response.data || response || {} as EnhancedDashboard;
  },

  async getHealth(): Promise<{ api_status: string; database: any; redis: any }> {
    const response = await apiClient.get<any>('/health');
    return response;
  },
};

export const auditService = {
  async getAuditLogs(params?: GetAuditLogsParams): Promise<PaginatedResponse<AuditLog>> {
    const queryParams = new URLSearchParams();
    
    if (params?.pageNumber) queryParams.append('pageIndex', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.userId) queryParams.append('userId', params.userId.toString());
    if (params?.action) queryParams.append('action', params.action);
    
    const url = queryParams.toString() ? `/audit-logs?${queryParams}` : '/audit-logs';
    const response = await apiClient.get<any>(url);
    // Go-Chi returns data directly with pagination info at root level
    return response.data || response || {} as PaginatedResponse<AuditLog>;
  },
};
