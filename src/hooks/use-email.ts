'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  emailService, 
  type GetEmailQueueParams,
  type GetEmailLogsParams,
} from '@/services/email.service';
import {
  type CreateEmailTemplateRequest,
  type UpdateEmailTemplateRequest,
  type NotificationSettings,
} from '@/types/api';
import { toast } from 'sonner';

// Email Templates
export const useEmailTemplates = () => {
  return useQuery({
    queryKey: ['emailTemplates'],
    queryFn: () => emailService.getEmailTemplates(),
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
};

export const useEmailTemplate = (id: string) => {
  return useQuery({
    queryKey: ['emailTemplate', id],
    queryFn: () => emailService.getEmailTemplate(id),
    enabled: !!id,
  });
};

export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateEmailTemplateRequest) => emailService.createEmailTemplate(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      toast.success('Email template created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create template');
    },
  });
};

export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateEmailTemplateRequest }) =>
      emailService.updateEmailTemplate(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      queryClient.invalidateQueries({ queryKey: ['emailTemplate', variables.id] });
      toast.success('Email template updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update template');
    },
  });
};

export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => emailService.deleteEmailTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      toast.success('Email template deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete template');
    },
  });
};

// Email Queue
export const useEmailQueue = (params?: GetEmailQueueParams) => {
  return useQuery({
    queryKey: ['emailQueue', params],
    queryFn: () => emailService.getEmailQueue(params),
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

export const useQueueStatus = () => {
  return useQuery({
    queryKey: ['queueStatus'],
    queryFn: () => emailService.getQueueStatus(),
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};

export const useRetryFailedEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (queueId: string) => emailService.retryFailedEmail(queueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailQueue'] });
      queryClient.invalidateQueries({ queryKey: ['queueStatus'] });
      toast.success('Email retry queued');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to retry email');
    },
  });
};

export const useClearQueue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => emailService.clearQueue(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailQueue'] });
      queryClient.invalidateQueries({ queryKey: ['queueStatus'] });
      toast.success('Email queue cleared');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to clear queue');
    },
  });
};

// Email Logs
export const useEmailLogs = (params?: GetEmailLogsParams) => {
  return useQuery({
    queryKey: ['emailLogs', params],
    queryFn: () => emailService.getEmailLogs(params),
  });
};

// Notification Settings
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ['notificationSettings'],
    queryFn: () => emailService.getNotificationSettings(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: Partial<NotificationSettings>) =>
      emailService.updateNotificationSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
      toast.success('Notification settings updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    },
  });
};

export const useSendBulkNotification = () => {
  return useMutation({
    mutationFn: ({
      userIds,
      content,
    }: {
      userIds: number[];
      content: { templateId?: string; variables?: Record<string, string> } | { subject: string; content: string };
    }) => emailService.sendBulkNotification(userIds, content),
    onSuccess: () => {
      toast.success('Bulk notification job created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send notifications');
    },
  });
};
