'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { type CreateCustomReportRequest } from '@/types/api';
import { toast } from 'sonner';

// User Growth Analytics
export const useUserGrowthAnalytics = (period: string = '30d') => {
  return useQuery({
    queryKey: ['userGrowthAnalytics', period],
    queryFn: () => analyticsService.getUserGrowthAnalytics(period),
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
};

// License Usage Analytics
export const useLicenseUsageAnalytics = (period: string = '30d') => {
  return useQuery({
    queryKey: ['licenseUsageAnalytics', period],
    queryFn: () => analyticsService.getLicenseUsageAnalytics(period),
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
};

// Activation Analytics
export const useActivationAnalytics = (period: string = '30d') => {
  return useQuery({
    queryKey: ['activationAnalytics', period],
    queryFn: () => analyticsService.getActivationAnalytics(period),
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
};

// System Health Analytics
export const useSystemHealthAnalytics = (period: string = '7d') => {
  return useQuery({
    queryKey: ['systemHealthAnalytics', period],
    queryFn: () => analyticsService.getSystemHealthAnalytics(period),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes (health data should be fresher)
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

// Revenue Analytics
export const useRevenueAnalytics = (period: string = '30d') => {
  return useQuery({
    queryKey: ['revenueAnalytics', period],
    queryFn: () => analyticsService.getRevenueAnalytics(period),
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
};

// Custom Reports
export const useCustomReports = (pageNumber?: number, pageSize?: number) => {
  return useQuery({
    queryKey: ['customReports', pageNumber, pageSize],
    queryFn: () => analyticsService.getCustomReports(pageNumber, pageSize),
  });
};

export const useCustomReport = (id: string) => {
  return useQuery({
    queryKey: ['customReport', id],
    queryFn: () => analyticsService.getCustomReport(id),
    enabled: !!id,
  });
};

export const useCreateCustomReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateCustomReportRequest) => analyticsService.createCustomReport(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customReports'] });
      toast.success('Custom report created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create report');
    },
  });
};

export const useGenerateCustomReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => analyticsService.generateCustomReport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['customReports'] });
      queryClient.invalidateQueries({ queryKey: ['customReport', id] });
      toast.success('Report generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate report');
    },
  });
};

export const useDeleteCustomReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => analyticsService.deleteCustomReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customReports'] });
      toast.success('Report deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    },
  });
};

export const useExportCustomReport = () => {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'csv' | 'json' | 'pdf' }) =>
      analyticsService.exportCustomReport(id, format),
    onSuccess: (blob, variables) => {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `report_${timestamp}.${variables.format}`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Report exported as ${variables.format.toUpperCase()}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to export report');
    },
  });
};

export const useScheduleCustomReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, config }: { id: string; config: { frequency: 'daily' | 'weekly' | 'monthly'; recipients: string[] } }) =>
      analyticsService.scheduleCustomReport(id, config),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customReports'] });
      queryClient.invalidateQueries({ queryKey: ['customReport', variables.id] });
      toast.success('Report scheduled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to schedule report');
    },
  });
};

// Predictive Analytics
export const usePredictiveLicenseChurn = () => {
  return useQuery({
    queryKey: ['predictiveLicenseChurn'],
    queryFn: () => analyticsService.getPredictiveLicenseChurn(),
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
};

export const usePredictiveRevenue = (months: number = 12) => {
  return useQuery({
    queryKey: ['predictiveRevenue', months],
    queryFn: () => analyticsService.getPredictiveRevenue(months),
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
};

// Anomaly Detection
export const useAnomalyDetection = () => {
  return useQuery({
    queryKey: ['anomalyDetection'],
    queryFn: () => analyticsService.getAnomalyDetection(),
    staleTime: 15 * 60 * 1000, // Cache for 15 minutes
  });
};

// Export Analytics
export const useExportAnalyticsReport = () => {
  return useMutation({
    mutationFn: ({ reportType, format }: { reportType: string; format: 'csv' | 'json' | 'pdf' }) =>
      analyticsService.exportAnalyticsReport(reportType, format),
    onSuccess: (blob, variables) => {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${variables.reportType}_${timestamp}.${variables.format}`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Analytics exported as ${variables.format.toUpperCase()}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to export analytics');
    },
  });
};
