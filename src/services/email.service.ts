import { apiClient } from '@/lib/api-client';
import type {
  EmailTemplate,
  EmailQueue,
  QueueStatus,
  SendEmailNotificationRequest,
  EmailLog,
  NotificationSettings,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
  PaginatedResponse,
} from '@/types/api';

export interface GetEmailQueueParams {
  pageNumber?: number;
  pageSize?: number;
  status?: 'pending' | 'sent' | 'failed';
}

export interface GetEmailLogsParams {
  pageNumber?: number;
  pageSize?: number;
  status?: 'sent' | 'failed' | 'bounced';
  userId?: number;
  startDate?: string;
  endDate?: string;
}

export const emailService = {
  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const response = await apiClient.get<any>('/email-templates');
    return Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
  },

  async getEmailTemplate(id: string): Promise<EmailTemplate> {
    const response = await apiClient.get<any>(`/email-templates/${id}`);
    return response.data || response || {} as EmailTemplate;
  },

  async createEmailTemplate(request: CreateEmailTemplateRequest): Promise<EmailTemplate> {
    const response = await apiClient.post<any>('/email-templates', request);
    return response.data || response || {} as EmailTemplate;
  },

  async updateEmailTemplate(id: string, request: UpdateEmailTemplateRequest): Promise<EmailTemplate> {
    const response = await apiClient.patch<any>(`/email-templates/${id}`, request);
    return response.data || response || {} as EmailTemplate;
  },

  async deleteEmailTemplate(id: string): Promise<void> {
    await apiClient.delete(`/email-templates/${id}`);
  },

  // Email Queue
  async getEmailQueue(params?: GetEmailQueueParams): Promise<PaginatedResponse<EmailQueue>> {
    const queryParams = new URLSearchParams();
    
    if (params?.pageNumber) queryParams.append('pageIndex', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const url = queryParams.toString() ? `/email-queue?${queryParams}` : '/email-queue';
    const response = await apiClient.get<any>(url);
    
    return {
      pageNumber: response.pageIndex || 1,
      pageSize: response.pageSize || 10,
      totalCount: response.total || 0,
      totalPages: response.totalPages || 0,
      data: response.queue || response.data || [],
    };
  },

  async getQueueStatus(): Promise<QueueStatus> {
    const response = await apiClient.get<any>('/email-queue/status');
    return response.data || response || {} as QueueStatus;
  },

  async retryFailedEmail(queueId: string): Promise<void> {
    await apiClient.post(`/email-queue/${queueId}/retry`, {});
  },

  async clearQueue(): Promise<void> {
    await apiClient.post('/email-queue/clear', {});
  },

  // Email Logs
  async getEmailLogs(params?: GetEmailLogsParams): Promise<PaginatedResponse<EmailLog>> {
    const queryParams = new URLSearchParams();
    
    if (params?.pageNumber) queryParams.append('pageIndex', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.userId) queryParams.append('userId', params.userId.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const url = queryParams.toString() ? `/email-logs?${queryParams}` : '/email-logs';
    const response = await apiClient.get<any>(url);
    
    return {
      pageNumber: response.pageIndex || 1,
      pageSize: response.pageSize || 10,
      totalCount: response.total || 0,
      totalPages: response.totalPages || 0,
      data: response.logs || response.data || [],
    };
  },

  // Notification Settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await apiClient.get<any>('/notification-settings');
    return response.data || response || {} as NotificationSettings;
  },

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await apiClient.patch<any>('/notification-settings', settings);
    return response.data || response || {} as NotificationSettings;
  },

  async sendBulkNotification(
    userIds: number[],
    templateIdOrContent: { templateId?: string; variables?: Record<string, string> } | { subject: string; content: string }
  ): Promise<{ jobId: string; queuedCount: number }> {
    const response = await apiClient.post<any>('/notifications/bulk-send', {
      userIds,
      ...templateIdOrContent,
    });
    return response.data || response;
  },
};
