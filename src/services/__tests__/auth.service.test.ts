/// <reference types="jest" />

import { authService } from '@/services/auth.service';
import { apiClient } from '@/lib/api-client';

jest.mock('@/lib/api-client');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should send credentials and return success message', async () => {
      const credentials = {
        username: 'testuser',
        password: 'password123',
      };

      mockApiClient.post.mockResolvedValue({ message: 'Login successful' });

      const result = await authService.login(credentials);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result.message).toBe('Login successful');
    });

    it('should handle login errors with invalid credentials', async () => {
      const error = new Error('Invalid credentials') as any;
      error.response = { status: 401, data: { message: 'Invalid credentials' } };

      mockApiClient.post.mockRejectedValue(error);

      await expect(
        authService.login({ username: 'user', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      mockApiClient.post.mockRejectedValue(error);

      await expect(
        authService.login({ username: 'user', password: 'pass' })
      ).rejects.toThrow('Network error');
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registration = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'Password123!',
      };

      mockApiClient.post.mockResolvedValue({
        message: 'Registration successful. Please check your email to verify your account.',
      });

      const result = await authService.register(registration);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', registration);
      expect(result.message).toContain('Registration successful');
    });

    it('should handle validation errors during registration', async () => {
      const error = new Error('Validation failed') as any;
      error.response = {
        status: 400,
        data: {
          message: 'Validation failed',
          errors: { email: ['Invalid email'], password: ['Too weak'] },
        },
      };

      mockApiClient.post.mockRejectedValue(error);

      await expect(
        authService.register({
          username: 'user',
          email: 'invalid',
          password: '123',
        })
      ).rejects.toThrow('Validation failed');
    });

    it('should handle duplicate user error', async () => {
      const error = new Error('User already exists') as any;
      error.response = { status: 409, data: { message: 'User already exists' } };

      mockApiClient.post.mockRejectedValue(error);

      await expect(
        authService.register({
          username: 'existing',
          email: 'existing@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow('User already exists');
    });
  });

  describe('refresh', () => {
    it('should call refresh endpoint', async () => {
      mockApiClient.post.mockResolvedValue({});

      await authService.refresh();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', {});
    });

    it('should handle refresh token expiration', async () => {
      const error = new Error('Unauthorized') as any;
      error.response = { status: 401, data: { message: 'Token expired' } };

      mockApiClient.post.mockRejectedValue(error);

      await expect(authService.refresh()).rejects.toThrow('Unauthorized');
    });
  });

  describe('validateSession', () => {
    it('should return true when session is valid', async () => {
      mockApiClient.post.mockResolvedValue({});

      const result = await authService.validateSession();

      expect(result).toBe(true);
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', {});
    });

    it('should return false when session is invalid', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Unauthorized'));

      const result = await authService.validateSession();

      expect(result).toBe(false);
    });
  });

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      mockApiClient.post.mockResolvedValue({});

      await authService.logout();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout', {});
    });

    it('should continue logout even if endpoint fails', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Server error'));

      // Should not throw
      await expect(authService.logout()).resolves.not.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user data', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        roleId: 2,
      };

      mockApiClient.get.mockResolvedValue({ data: user });

      const result = await authService.getCurrentUser();

      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(user);
    });

    it('should handle user not found', async () => {
      const error = new Error('Not found') as any;
      error.response = { status: 404 };

      mockApiClient.get.mockRejectedValue(error);

      await expect(authService.getCurrentUser()).rejects.toThrow('Not found');
    });
  });

  describe('getNotificationPreferences', () => {
    it('should fetch notification preferences', async () => {
      const prefs = { emailNotifications: true, pushNotifications: false };
      mockApiClient.get.mockResolvedValue({ data: prefs });

      const result = await authService.getNotificationPreferences();

      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/notifications');
      expect(result).toEqual(prefs);
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update notification preferences', async () => {
      const prefs = { emailNotifications: true, pushNotifications: true };
      mockApiClient.put.mockResolvedValue({ data: prefs });

      const result = await authService.updateNotificationPreferences(prefs);

      expect(mockApiClient.put).toHaveBeenCalledWith('/auth/notifications', prefs);
      expect(result).toEqual(prefs);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with token', async () => {
      const token = 'verify-token-123';
      mockApiClient.post.mockResolvedValue({});

      await authService.verifyEmail(token);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/verify-email', { token });
    });

    it('should handle invalid verification token', async () => {
      const error = new Error('Invalid token') as any;
      error.response = { status: 400 };

      mockApiClient.post.mockRejectedValue(error);

      await expect(authService.verifyEmail('invalid')).rejects.toThrow('Invalid token');
    });
  });

  describe('resendVerification', () => {
    it('should resend verification email', async () => {
      const email = 'test@example.com';
      mockApiClient.post.mockResolvedValue({});

      await authService.resendVerification(email);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/resend-verification', { email });
    });
  });

  describe('forgotPassword', () => {
    it('should request password reset', async () => {
      const email = 'test@example.com';
      mockApiClient.post.mockResolvedValue({});

      await authService.forgotPassword(email);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/request-password-reset', { email });
    });
  });

  describe('resetPassword', () => {
    it('should reset password with token', async () => {
      const token = 'reset-token-123';
      const newPassword = 'NewPassword123!';

      mockApiClient.post.mockResolvedValue({});

      await authService.resetPassword(token, newPassword);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/confirm-password-reset', {
        token,
        newPassword,
      });
    });

    it('should handle expired reset token', async () => {
      const error = new Error('Token expired') as any;
      error.response = { status: 400 };

      mockApiClient.post.mockRejectedValue(error);

      await expect(
        authService.resetPassword('expired-token', 'NewPass123!')
      ).rejects.toThrow('Token expired');
    });
  });

  describe('changePassword', () => {
    it('should throw error as endpoint not available', async () => {
      await expect(
        authService.changePassword('oldpass', 'newpass')
      ).rejects.toThrow('changePassword is not available');
    });
  });

  describe('rotateToken', () => {
    it('should rotate current token', async () => {
      mockApiClient.post.mockResolvedValue({ message: 'Token rotated successfully' });

      const result = await authService.rotateToken();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/rotate', {});
      expect(result.message).toBe('Token rotated successfully');
    });
  });
});
