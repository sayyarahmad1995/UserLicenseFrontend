'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionService } from '@/services/session.service';
import { toast } from 'sonner';

/**
 * Get all active sessions for the current user
 */
export const useActiveSessions = () => {
  return useQuery({
    queryKey: ['activeSessions'],
    queryFn: () => sessionService.getActiveSessions(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false,
    throwOnError: false,
  });
};

/**
 * Get detailed session information
 */
export const useSessionDetails = () => {
  return useQuery({
    queryKey: ['sessionDetails'],
    queryFn: () => sessionService.getSessionDetails(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Logout from all other sessions
 */
export const useLogoutAllOtherSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sessionService.logoutAllOtherSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessionDetails'] });
      toast.success('Logged out from all other sessions');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to logout from other sessions'
      );
    },
  });
};

/**
 * Logout from a specific session
 */
export const useLogoutSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => sessionService.logoutSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessionDetails'] });
      toast.success('Session logged out');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to logout from session'
      );
    },
  });
};

/**
 * Parse user agent string to get browser/device info
 */
export const useParseUserAgent = (userAgent: string) => {
  return useMutation({
    mutationFn: () => {
      const result = sessionService.parseUserAgent(userAgent);
      return Promise.resolve(result);
    },
  });
};

/**
 * Utility hook to format session information for display
 */
export const useFormatSession = (userAgent?: string) => {
  if (!userAgent) {
    return {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'Unknown',
    };
  }

  return sessionService.parseUserAgent(userAgent);
};
