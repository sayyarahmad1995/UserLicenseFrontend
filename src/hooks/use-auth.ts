'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { apiClient } from '@/lib/api-client';
import type { LoginRequest, RegisterRequest, NotificationPreferences } from '@/types/api';
import { toast } from 'sonner';

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: () => {
      // Mark client as logged in to enable token refresh
      apiClient.markLoggedIn();
      // Tokens are stored in HTTP-only cookies, no need to manage them manually
      toast.success('Logged in successfully');
      // Invalidate any cached queries that depend on authentication
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: any) => {
      const apiResponse = error.response?.data;
      const errorMessage = 
        (typeof apiResponse === 'string' ? apiResponse : null) ||
        apiResponse?.error?.message ||
        apiResponse?.message ||
        apiResponse?.Message ||
        apiResponse?.error?.error ||
        apiResponse?.error ||
        apiResponse?.Error ||
        error.message ||
        'Login failed';
      
      // Don't show toast for inactive account or rate limiting errors - let the form handle it
      const lowerMessage = errorMessage?.toLowerCase() || '';
      if (lowerMessage.includes('not active') || lowerMessage.includes('too many') || lowerMessage.includes('rate limit')) {
        return;
      }
      
      toast.error(errorMessage);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      toast.success('Registration successful! Please check your email to verify your account.');
    },
    onError: (error: any) => {
      // Don't show toast for validation errors - let the form handle it
      if (error.response?.data?.Errors) {
        return;
      }
      toast.error(error.response?.data?.Message || 'Registration failed');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Mark client as logged out to prevent token refresh attempts
      apiClient.markLoggedOut();
      // Cancel all active queries immediately to prevent 401 errors
      queryClient.cancelQueries();
      // Invalidate current user query first before clearing all
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      // Clear all cached queries immediately
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (error: any) => {
      // Even if logout fails, mark as logged out and clear cache
      apiClient.markLoggedOut();
      // Cancel all active queries immediately
      queryClient.cancelQueries();
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.clear();
      toast.error('Logged out');
    },
  });
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: () => authService.getNotificationPreferences(),
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (preferences: NotificationPreferences) => 
      authService.updateNotificationPreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast.success('Preferences updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.Message || 'Update failed');
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: () => {
      toast.success('Email verified successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.Message || 'Verification failed');
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
    onSuccess: () => {
      toast.success('Verification email sent');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.Message || 'Failed to send email');
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success('Password reset email sent');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.Message || 'Failed to send email');
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) => 
      authService.resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.Message || 'Password reset failed');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => 
      authService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.Message || 'Failed to change password');
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on failure - if user is not logged in, fail immediately
    // If the user is not logged in (401), treat it as no user data rather than an error
    throwOnError: false,
  });
};

export const useValidateSession = () => {
  return useQuery({
    queryKey: ['validateSession'],
    queryFn: () => authService.validateSession(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    throwOnError: false,
  });
};

// ===== NEW AUTH HOOKS =====

export const useRotateToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.rotateToken(),
    onSuccess: (data) => {
      // Invalidate auth-related queries since tokens have been rotated
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      toast.success('Token rotated successfully');
    },
    onError: (error: any) => {
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Failed to rotate token';
      toast.error(errorMessage);
    },
  });
};

export const useActiveSessions = () => {
  return useQuery({
    queryKey: ['activeSessions'],
    queryFn: () => authService.getSessions(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useLogoutAllOtherSessions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logoutAllOtherSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      toast.success('Logged out from all other sessions');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to logout from other sessions');
    },
  });
};

export const useRevokeToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.revoke(),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Token revoked successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to revoke token');
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { email?: string; username?: string }) => 
      authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

export const useSendEmailNotification = () => {
  return useMutation({
    mutationFn: (data: { to: string; template?: string; subject?: string; body?: string }) => 
      authService.sendEmailNotification(data),
    onSuccess: () => {
      toast.success('Email sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send email');
    },
  });
};

export const useEmailTemplates = () => {
  return useQuery({
    queryKey: ['emailTemplates'],
    queryFn: () => authService.getEmailTemplates(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useTestEmailSend = () => {
  return useMutation({
    mutationFn: (email: string) => authService.testEmailSend(email),
    onSuccess: () => {
      toast.success('Test email sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send test email');
    },
  });
};

export const useEmailQueueStatus = () => {
  return useQuery({
    queryKey: ['emailQueueStatus'],
    queryFn: () => authService.getEmailQueueStatus(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};