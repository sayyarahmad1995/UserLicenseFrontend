'use client';

import { useMutation, useQuery, keepPreviousData } from '@tanstack/react-query';
import { auditService, type GetAuditLogsParams } from '@/services/audit.service';
import { type AuditLogExportRequest } from '@/types/api';
import { toast } from 'sonner';

export const useAuditLogs = (params?: GetAuditLogsParams) => {
  return useQuery({
    queryKey: ['auditLogs', JSON.stringify(params)],
    queryFn: () => auditService.getAuditLogs(params),
    placeholderData: keepPreviousData,
  });
};

export const useAuditLog = (id: number) => {
  return useQuery({
    queryKey: ['auditLog', id],
    queryFn: () => auditService.getAuditLogById(id),
    enabled: !!id,
  });
};

export const useExportAuditLogs = () => {
  return useMutation({
    mutationFn: (request: AuditLogExportRequest) => auditService.exportAuditLogs(request),
    onSuccess: (blob, variables) => {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `audit_logs_export_${timestamp}.${variables.format}`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Audit logs exported as ${variables.format.toUpperCase()}`);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.status === 404
        ? 'Export endpoint not found on server. Please contact your administrator.'
        : error.response?.data?.message || error.message || 'Export failed';
      toast.error(errorMessage);
    },
  });
};

export const useAuditLogStatistics = () => {
  return useQuery({
    queryKey: ['auditLogStatistics'],
    queryFn: () => auditService.getAuditLogStatistics(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useComplianceReport = (period: string = '30d') => {
  return useQuery({
    queryKey: ['complianceReport', period],
    queryFn: () => auditService.getComplianceReport(period),
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
};
