'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService, auditService, type GetAuditLogsParams } from '@/services/dashboard.service';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboard(),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardService.getStats(),
    staleTime: 30 * 1000, // Cache for 30 seconds to catch updates quickly
    refetchInterval: 60 * 1000, // Auto-refetch every 60 seconds
  });
};

export const useDashboardUser = () => {
  return useQuery({
    queryKey: ['dashboardUser'],
    queryFn: () => dashboardService.getDashboardUser(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useLicenseForecast = () => {
  return useQuery({
    queryKey: ['licenseForecast'],
    queryFn: () => dashboardService.getLicenseForecast(),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

export const useActivityTimeline = (limit: number = 10) => {
  return useQuery({
    queryKey: ['activityTimeline', limit],
    queryFn: () => dashboardService.getActivityTimeline(limit),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
};

export const useAnalytics = (period: string = '7d') => {
  return useQuery({
    queryKey: ['analytics', period],
    queryFn: () => dashboardService.getAnalytics(period),
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
};

export const useEnhancedDashboard = () => {
  return useQuery({
    queryKey: ['enhancedDashboard'],
    queryFn: () => dashboardService.getEnhanced(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => dashboardService.getHealth(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useAuditLogs = (params?: GetAuditLogsParams) => {
  return useQuery({
    queryKey: ['auditLogs', params],
    queryFn: () => auditService.getAuditLogs(params),
  });
};
