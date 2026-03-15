import { apiClient } from '@/lib/api-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshRequest,
  TokenResponse,
  NotificationPreferences,
  User,
} from '@/types/api';

export const authService = {
  async login(credentials: LoginRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/login', credentials);
    // Tokens are set as HTTP-only cookies automatically by the server
    // No need to store them in localStorage
    return { message: response.message || 'Login successful' };
  },

  async register(data: RegisterRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/register', data);
    // Registration successful - user needs to verify email
    // No tokens are returned yet - user must log in after verification
    return { message: response.message || 'Registration successful. Please check your email to verify your account.' };
  },

  async refresh(): Promise<void> {
    // Refresh endpoint uses refresh token from HTTP-only cookie automatically
    // It will set new access token in cookie if successful, or 401 if expired
    await apiClient.post('/auth/refresh', {});
  },

  async validateSession(): Promise<boolean> {
    // Validates if user has a valid refresh token by attempting to refresh
    // Returns true if refresh token is valid, false otherwise
    try {
      await apiClient.post('/auth/refresh', {});
      return true;
    } catch (error) {
      // If refresh fails (401 or any other error), user is not authenticated
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      // Call logout endpoint to revoke the session
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      // Continue with logout even if revoke fails
      console.error('Failed to logout:', error);
    }
    // Cookies are automatically cleared by the backend response
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<any>('/auth/me');
    // Go-Chi may return data directly or wrapped
    return response.data || response.user || response;
  },

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get<any>('/auth/notifications');
    return response.data || response.preferences || response;
  },

  async updateNotificationPreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    const response = await apiClient.put<any>('/auth/notifications', preferences);
    return response.data || response.preferences || response;
  },

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { token });
  },

  async resendVerification(email: string): Promise<void> {
    await apiClient.post('/auth/resend-verification', { email });
  },

  async forgotPassword(email: string): Promise<void> {
    // Go-Chi uses request-password-reset instead of forgot-password
    await apiClient.post('/auth/request-password-reset', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Go-Chi uses confirm-password-reset instead of reset-password
    await apiClient.post('/auth/confirm-password-reset', { token, newPassword });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Go-Chi may not have this endpoint - use forgot/reset flow instead
    // Or this might be implemented differently
    // For now, throw an error indicating the endpoint is not available
    throw new Error('changePassword is not available in Go-Chi API. Use forgotPassword/resetPassword flow instead.');
  },

  // ===== NEW AUTH ENDPOINTS =====

  async rotateToken(): Promise<{ accessToken: string; refreshToken: string; expiresAt: string; refreshExpiresAt: string }> {
    // Rotate the current token for enhanced security
    // The refresh token is automatically read from the refreshToken cookie
    // New tokens are set in cookies by the backend
    const response = await apiClient.post<any>('/auth/rotate', {});
    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: response.expiresAt,
      refreshExpiresAt: response.refreshExpiresAt,
    };
  },

  async getSessions(): Promise<any[]> {
    // Get list of all active sessions for the current user
    const response = await apiClient.get<any>('/auth/sessions');
    return response.data || response.sessions || [];
  },

  async logoutAllOtherSessions(): Promise<{ message: string }> {
    // Logout from all other devices/sessions
    const response = await apiClient.post<any>('/auth/logout-all-others', {});
    return { message: response.message || 'Logged out from all other sessions' };
  },

  async revoke(): Promise<{ message: string }> {
    // Revoke the current token/session
    const response = await apiClient.post<any>('/auth/revoke', {});
    return { message: response.message || 'Token revoked successfully' };
  },

  async updateProfile(data: { email?: string; username?: string }): Promise<User> {
    // Update user profile information
    const response = await apiClient.put<any>('/auth/profile', data);
    return response.data || response.user || response;
  },

  async sendEmailNotification(data: { to: string; template?: string; subject?: string; body?: string }): Promise<{ message: string }> {
    // Send a custom email notification
    const response = await apiClient.post<any>('/auth/send-email', data);
    return { message: response.message || 'Email sent successfully' };
  },

  async getEmailTemplates(): Promise<any[]> {
    // Get available email templates
    const response = await apiClient.get<any>('/auth/email-templates');
    return response.data || response.templates || [];
  },

  async testEmailSend(email: string): Promise<{ message: string }> {
    // Send a test email to verify email functionality
    const response = await apiClient.post<any>('/auth/test-email', { email });
    return { message: response.message || 'Test email sent successfully' };
  },

  async getEmailQueueStatus(): Promise<any> {
    // Get status of the email notification queue
    const response = await apiClient.get<any>('/auth/email-queue-status');
    return response.data || response;
  },
};
