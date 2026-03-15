import { apiClient } from '@/lib/api-client';
import type {
  UserGrowthAnalytics,
  LicenseUsageAnalytics,
  ActivationAnalytics,
  SystemHealthAnalytics,
  RevenueAnalytics,
  CustomReport,
  CreateCustomReportRequest,
  PaginatedResponse,
} from '@/types/api';

export const analyticsService = {
  // User Growth Analytics
  async getUserGrowthAnalytics(period: string = '30d'): Promise<UserGrowthAnalytics> {
    const response = await apiClient.get<any>(`/analytics/user-growth?period=${period}`);
    return response.data || response || {} as UserGrowthAnalytics;
  },

  // License Usage Analytics
  async getLicenseUsageAnalytics(period: string = '30d'): Promise<LicenseUsageAnalytics> {
    const response = await apiClient.get<any>(`/analytics/license-usage?period=${period}`);
    return response.data || response || {} as LicenseUsageAnalytics;
  },

  // Activation Analytics
  async getActivationAnalytics(period: string = '30d'): Promise<ActivationAnalytics> {
    const response = await apiClient.get<any>(`/analytics/activations?period=${period}`);
    return response.data || response || {} as ActivationAnalytics;
  },

  // System Health Analytics
  async getSystemHealthAnalytics(period: string = '7d'): Promise<SystemHealthAnalytics> {
    const response = await apiClient.get<any>(`/analytics/system-health?period=${period}`);
    return response.data || response || {} as SystemHealthAnalytics;
  },

  // Revenue Analytics
  async getRevenueAnalytics(period: string = '30d'): Promise<RevenueAnalytics> {
    const response = await apiClient.get<any>(`/analytics/revenue?period=${period}`);
    return response.data || response || {} as RevenueAnalytics;
  },

  // Custom Reports
  async getCustomReports(pageNumber?: number, pageSize?: number): Promise<PaginatedResponse<CustomReport>> {
    const queryParams = new URLSearchParams();
    
    if (pageNumber) queryParams.append('pageIndex', pageNumber.toString());
    if (pageSize) queryParams.append('pageSize', pageSize.toString());
    
    const url = queryParams.toString() ? `/reports?${queryParams}` : '/reports';
    const response = await apiClient.get<any>(url);
    
    return {
      pageNumber: response.pageIndex || 1,
      pageSize: response.pageSize || 10,
      totalCount: response.total || 0,
      totalPages: response.totalPages || 0,
      data: response.reports || response.data || [],
    };
  },

  async getCustomReport(id: string): Promise<CustomReport> {
    const response = await apiClient.get<any>(`/reports/${id}`);
    return response.data || response || {} as CustomReport;
  },

  async createCustomReport(request: CreateCustomReportRequest): Promise<CustomReport> {
    const response = await apiClient.post<any>('/reports', request);
    return response.data || response || {} as CustomReport;
  },

  async generateCustomReport(id: string): Promise<CustomReport> {
    const response = await apiClient.post<any>(`/reports/${id}/generate`, {});
    return response.data || response || {} as CustomReport;
  },

  async deleteCustomReport(id: string): Promise<void> {
    await apiClient.delete(`/reports/${id}`);
  },

  async exportCustomReport(id: string, format: 'csv' | 'json' | 'pdf'): Promise<Blob> {
    const response = await apiClient.get<any>(`/reports/${id}/export?format=${format}`, {
      responseType: 'blob',
    });
    return response as Blob;
  },

  async scheduleCustomReport(
    id: string,
    config: { frequency: 'daily' | 'weekly' | 'monthly'; recipients: string[] }
  ): Promise<CustomReport> {
    const response = await apiClient.post<any>(`/reports/${id}/schedule`, config);
    return response.data || response || {} as CustomReport;
  },

  // Predictive Analytics
  async getPredictiveLicenseChurn(): Promise<{
    riskUsers: { userId: number; username: string; riskScore: number }[];
    predictions: { timeframe: string; predictedChurn: number }[];
  }> {
    const response = await apiClient.get<any>('/analytics/predictive/churn');
    return response.data || response;
  },

  async getPredictiveRevenue(months: number = 12): Promise<{
    forecast: { month: string; revenue: number; confidence: number }[];
    trend: string; // 'uptrend', 'downtrend', 'stable'
  }> {
    const response = await apiClient.get<any>(`/analytics/predictive/revenue?months=${months}`);
    return response.data || response;
  },

  // Anomaly Detection
  async getAnomalyDetection(): Promise<{
    anomalies: { type: string; severity: 'low' | 'medium' | 'high'; description: string; timestamp: string }[];
    lastScan: string;
  }> {
    const response = await apiClient.get<any>('/analytics/anomalies');
    return response.data || response;
  },

  // Export Analytics
  async exportAnalyticsReport(reportType: string, format: 'csv' | 'json' | 'pdf'): Promise<Blob> {
    const response = await apiClient.get<any>(`/analytics/export?type=${reportType}&format=${format}`, {
      responseType: 'blob',
    });
    return response as Blob;
  },
};
