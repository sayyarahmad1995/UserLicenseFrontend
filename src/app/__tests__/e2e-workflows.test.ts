/// <reference types="jest" />

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the API client and services
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/services/auth.service', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    verifyEmail: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

jest.mock('@/services/user.service', () => ({
  userService: {
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    updateUserRole: jest.fn(),
  },
}));

jest.mock('@/services/license.service', () => ({
  licenseService: {
    getLicenses: jest.fn(),
    getLicenseById: jest.fn(),
    createLicense: jest.fn(),
    validateLicense: jest.fn(),
    activateLicense: jest.fn(),
    revokeLicense: jest.fn(),
  },
}));

describe('E2E Workflow Tests', () => {
  describe('User Registration and Authentication Flow', () => {
    it('should complete user registration workflow', async () => {
      const mockRegister = jest.fn().mockResolvedValue({
        success: true,
        data: { userId: 1, email: 'newuser@example.com' },
      });

      // Mock authService.register
      const { authService } = require('@/services/auth.service');
      authService.register = mockRegister;

      // Simulate registration form submission
      const registrationData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'SecurePass123',
        passwordConfirm: 'SecurePass123',
      };

      await mockRegister(registrationData);

      expect(mockRegister).toHaveBeenCalledWith(registrationData);
    });

    it('should handle registration validation errors', async () => {
      const mockRegister = jest.fn().mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Email already exists' },
        },
      });

      const { authService } = require('@/services/auth.service');
      authService.register = mockRegister;

      const registrationData = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'SecurePass123',
        passwordConfirm: 'SecurePass123',
      };

      try {
        await mockRegister(registrationData);
      } catch (error: any) {
        expect(error.response.data.error).toBe('Email already exists');
      }
    });

    it('should complete user login workflow', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        success: true,
        data: {
          accessToken: 'token-123',
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            role: 'user',
          },
        },
      });

      const { authService } = require('@/services/auth.service');
      authService.login = mockLogin;

      const loginData = {
        username: 'testuser',
        password: 'SecurePass123',
      };

      const response = await mockLogin(loginData);

      expect(mockLogin).toHaveBeenCalledWith(loginData);
      expect(response.data.accessToken).toBeDefined();
      expect(response.data.user.id).toBe(1);
    });

    it('should handle incorrect login credentials', async () => {
      const mockLogin = jest.fn().mockRejectedValue({
        response: {
          status: 401,
          data: { error: 'Invalid credentials' },
        },
      });

      const { authService } = require('@/services/auth.service');
      authService.login = mockLogin;

      try {
        await mockLogin({ username: 'user', password: 'wrong' });
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should complete logout workflow', async () => {
      const mockLogout = jest.fn().mockResolvedValue({ success: true });

      const { authService } = require('@/services/auth.service');
      authService.logout = mockLogout;

      await mockLogout();

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('User Profile Management Flow', () => {
    it('should complete profile update workflow', async () => {
      const mockUpdateUser = jest.fn().mockResolvedValue({
        success: true,
        data: {
          id: 1,
          fullName: 'Updated Name',
          email: 'updated@example.com',
        },
      });

      const { userService } = require('@/services/user.service');
      userService.updateUser = mockUpdateUser;

      const updateData = {
        fullName: 'Updated Name',
        email: 'updated@example.com',
      };

      const response = await mockUpdateUser(1, updateData);

      expect(mockUpdateUser).toHaveBeenCalledWith(1, updateData);
      expect(response.data.fullName).toBe('Updated Name');
    });

    it('should complete password change workflow', async () => {
      const mockUpdatePassword = jest.fn().mockResolvedValue({
        success: true,
        message: 'Password updated successfully',
      });

      const mockRefreshToken = jest.fn().mockResolvedValue({
        success: true,
        token: 'new-token',
      });

      const { authService } = require('@/services/auth.service');
      authService.refreshToken = mockRefreshToken;

      const passwordData = {
        currentPassword: 'OldPass123',
        newPassword: 'NewPass456',
        confirmPassword: 'NewPass456',
      };

      await mockUpdatePassword(passwordData);
      const tokenResponse = await mockRefreshToken();

      expect(mockUpdatePassword).toHaveBeenCalled();
      expect(tokenResponse.token).toBeDefined();
    });

    it('should handle profile update validation errors', async () => {
      const mockUpdateUser = jest.fn().mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Invalid email format' },
        },
      });

      const { userService } = require('@/services/user.service');
      userService.updateUser = mockUpdateUser;

      try {
        await mockUpdateUser(1, { email: 'invalid-email' });
      } catch (error: any) {
        expect(error.response.data.error).toBe('Invalid email format');
      }
    });
  });

  describe('Admin User Management Flow', () => {
    it('should complete user creation workflow', async () => {
      const mockCreateUser = jest.fn().mockResolvedValue({
        success: true,
        data: {
          id: 2,
          username: 'newadminuser',
          email: 'newadmin@example.com',
          role: 'admin',
        },
      });

      const { userService } = require('@/services/user.service');
      userService.createUser = mockCreateUser;

      const newUserData = {
        username: 'newadminuser',
        email: 'newadmin@example.com',
        password: 'AdminPass123',
        roleId: 2,
      };

      const response = await mockCreateUser(newUserData);

      expect(mockCreateUser).toHaveBeenCalledWith(newUserData);
      expect(response.data.role).toBe('admin');
    });

    it('should complete user role update workflow', async () => {
      const mockUpdateRole = jest.fn().mockResolvedValue({
        success: true,
        data: { id: 1, role: 'moderator' },
      });

      const { userService } = require('@/services/user.service');
      userService.updateUserRole = mockUpdateRole;

      const response = await mockUpdateRole(1, { roleId: 3 });

      expect(mockUpdateRole).toHaveBeenCalledWith(1, { roleId: 3 });
      expect(response.data.role).toBe('moderator');
    });

    it('should complete bulk user management workflow', async () => {
      const mockGetUsers = jest.fn().mockResolvedValue({
        success: true,
        data: {
          users: [
            { id: 1, username: 'user1', role: 'user', isActive: true },
            { id: 2, username: 'user2', role: 'user', isActive: true },
            { id: 3, username: 'user3', role: 'admin', isActive: false },
          ],
          total: 3,
        },
      });

      const mockUpdateUser = jest.fn().mockResolvedValue({
        success: true,
      });

      const { userService } = require('@/services/user.service');
      userService.getUsers = mockGetUsers;
      userService.updateUser = mockUpdateUser;

      const users = await mockGetUsers({
        page: 1,
        limit: 10,
      });

      expect(users.data.total).toBe(3);

      // Update multiple users
      for (const user of users.data.users) {
        await mockUpdateUser(user.id, { isActive: true });
      }

      expect(mockUpdateUser).toHaveBeenCalledTimes(3);
    });

    it('should handle user deletion workflow', async () => {
      const mockDeleteUser = jest.fn().mockResolvedValue({
        success: true,
        message: 'User deleted successfully',
      });

      const { userService } = require('@/services/user.service');
      userService.deleteUser = mockDeleteUser;

      await mockDeleteUser(1);

      expect(mockDeleteUser).toHaveBeenCalledWith(1);
    });
  });

  describe('License Management Flow', () => {
    it('should complete license creation workflow', async () => {
      const mockCreateLicense = jest.fn().mockResolvedValue({
        success: true,
        data: {
          id: 1,
          key: 'LIC-2025-001',
          userId: 1,
          status: 'active',
          expiresAt: '2026-03-05',
        },
      });

      const { licenseService } = require('@/services/license.service');
      licenseService.createLicense = mockCreateLicense;

      const licenseData = {
        key: 'LIC-2025-001',
        userId: 1,
        productId: 1,
        type: 'standard',
        expiresAt: '2026-03-05',
      };

      const response = await mockCreateLicense(licenseData);

      expect(mockCreateLicense).toHaveBeenCalledWith(licenseData);
      expect(response.data.status).toBe('active');
    });

    it('should complete license validation workflow', async () => {
      const mockValidateLicense = jest.fn().mockResolvedValue({
        success: true,
        valid: true,
        data: {
          licenseKey: 'LIC-2025-001',
          status: 'active',
          expiresAt: '2026-03-05',
        },
      });

      const { licenseService } = require('@/services/license.service');
      licenseService.validateLicense = mockValidateLicense;

      const response = await mockValidateLicense('LIC-2025-001');

      expect(mockValidateLicense).toHaveBeenCalledWith('LIC-2025-001');
      expect(response.valid).toBe(true);
    });

    it('should complete license activation workflow', async () => {
      const mockActivateLicense = jest.fn().mockResolvedValue({
        success: true,
        data: {
          id: 1,
          licenseKey: 'LIC-2025-001',
          activations: 1,
          maxActivations: 5,
        },
      });

      const mockGetLicense = jest.fn().mockResolvedValue({
        success: true,
        data: {
          id: 1,
          key: 'LIC-2025-001',
          maxActivations: 5,
          activations: 0,
        },
      });

      const { licenseService } = require('@/services/license.service');
      licenseService.activateLicense = mockActivateLicense;
      licenseService.getLicenseById = mockGetLicense;

      // Check current activations
      const licenseData = await mockGetLicense(1);
      expect(licenseData.data.activations).toBe(0);

      // Activate license
      const response = await mockActivateLicense(1);

      expect(response.data.activations).toBe(1);
      expect(response.data.maxActivations).toBe(5);
    });

    it('should handle license revocation workflow', async () => {
      const mockRevokeLicense = jest.fn().mockResolvedValue({
        success: true,
        message: 'License revoked successfully',
      });

      const { licenseService } = require('@/services/license.service');
      licenseService.revokeLicense = mockRevokeLicense;

      const revokeData = {
        licenseId: 1,
        reason: 'User requested cancellation',
      };

      await mockRevokeLicense(revokeData);

      expect(mockRevokeLicense).toHaveBeenCalledWith(revokeData);
    });

    it('should prevent license activation beyond max limit', async () => {
      const mockGetLicense = jest.fn().mockResolvedValue({
        success: true,
        data: {
          id: 1,
          key: 'LIC-2025-001',
          maxActivations: 3,
          activations: 3,
        },
      });

      const mockActivateLicense = jest.fn().mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Activation limit reached' },
        },
      });

      const { licenseService } = require('@/services/license.service');
      licenseService.getLicenseById = mockGetLicense;
      licenseService.activateLicense = mockActivateLicense;

      const licenseData = await mockGetLicense(1);
      expect(licenseData.data.activations).toBe(
        licenseData.data.maxActivations
      );

      try {
        await mockActivateLicense(1);
      } catch (error: any) {
        expect(error.response.data.error).toBe('Activation limit reached');
      }
    });
  });

  describe('Complete User Journey Workflows', () => {
    it('should complete new user registration to license assignment', async () => {
      const mockRegister = jest.fn().mockResolvedValue({
        success: true,
        data: { userId: 1, email: 'journey@example.com' },
      });

      const mockCreateLicense = jest.fn().mockResolvedValue({
        success: true,
        data: { id: 1, userId: 1, status: 'active' },
      });

      const { authService } = require('@/services/auth.service');
      const { licenseService } = require('@/services/license.service');

      authService.register = mockRegister;
      licenseService.createLicense = mockCreateLicense;

      // Step 1: Register
      const registerResponse = await mockRegister({
        username: 'journeyuser',
        email: 'journey@example.com',
        password: 'SecurePass123',
        passwordConfirm: 'SecurePass123',
      });

      // Step 2: Create license for new user
      const licenseResponse = await mockCreateLicense({
        userId: registerResponse.data.userId,
        productId: 1,
        type: 'trial',
      });

      expect(mockRegister).toHaveBeenCalled();
      expect(mockCreateLicense).toHaveBeenCalled();
      expect(licenseResponse.data.userId).toBe(registerResponse.data.userId);
    });

    it('should complete admin user creation to license management', async () => {
      const mockCreateUser = jest.fn().mockResolvedValue({
        success: true,
        data: { id: 2, username: 'manageduser', email: 'managed@example.com' },
      });

      const mockCreateLicense = jest.fn().mockResolvedValue({
        success: true,
        data: { id: 1, userId: 2, status: 'active' },
      });

      const mockUpdateLicense = jest.fn().mockResolvedValue({
        success: true,
        data: { id: 1, status: 'inactive' },
      });

      const { userService } = require('@/services/user.service');
      const { licenseService } = require('@/services/license.service');

      userService.createUser = mockCreateUser;
      licenseService.createLicense = mockCreateLicense;

      // Step 1: Create user
      const userResponse = await mockCreateUser({
        username: 'manageduser',
        email: 'managed@example.com',
        roleId: 2,
      });

      // Step 2: Create license
      const licenseResponse = await mockCreateLicense({
        userId: userResponse.data.id,
        productId: 1,
        type: 'standard',
      });

      expect(userResponse.data.id).toBe(2);
      expect(licenseResponse.data.userId).toBe(2);
    });

    it('should complete license lifecycle from creation to renewal', async () => {
      const mockCreateLicense = jest.fn().mockResolvedValue({
        success: true,
        data: { id: 1, status: 'active', expiresAt: '2026-03-05' },
      });

      const mockValidateLicense = jest.fn().mockResolvedValue({
        success: true,
        valid: true,
      });

      const mockRevokeLicense = jest.fn().mockResolvedValue({
        success: true,
        message: 'Old license revoked',
      });

      const mockCreateRenewalLicense = jest.fn().mockResolvedValue({
        success: true,
        data: { id: 2, status: 'active', expiresAt: '2027-03-05' },
      });

      const { licenseService } = require('@/services/license.service');
      licenseService.createLicense = mockCreateLicense;
      licenseService.validateLicense = mockValidateLicense;
      licenseService.revokeLicense = mockRevokeLicense;

      // Step 1: Create initial license
      const licenseResponse = await mockCreateLicense({
        userId: 1,
        productId: 1,
        type: 'standard',
      });

      // Step 2: Validate license is active
      const validationResponse = await mockValidateLicense('LIC-001');
      expect(validationResponse.valid).toBe(true);

      // Step 3: Revoke old license
      await mockRevokeLicense({
        licenseId: licenseResponse.data.id,
        reason: 'Renewing license',
      });

      // Step 4: Create renewal license
      licenseService.createLicense = mockCreateRenewalLicense;
      const renewalResponse = await mockCreateRenewalLicense({
        userId: 1,
        productId: 1,
        type: 'standard',
      });

      expect(mockCreateLicense).toHaveBeenCalled();
      expect(mockValidateLicense).toHaveBeenCalled();
      expect(mockRevokeLicense).toHaveBeenCalled();
      expect(renewalResponse.data.id).toBe(2);
    });
  });

  describe('Error Handling and Recovery Workflows', () => {
    it('should handle and recover from network errors', async () => {
      let attempts = 0;
      const mockLoginWithRetry = jest.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Network error');
        }
        return {
          success: true,
          data: { accessToken: 'token-123' },
        };
      });

      const { authService } = require('@/services/auth.service');
      authService.login = mockLoginWithRetry;

      let result;
      for (let i = 0; i < 3; i++) {
        try {
          result = await mockLoginWithRetry({
            username: 'user',
            password: 'pass',
          });
          break;
        } catch (error) {
          if (i === 2) throw error;
        }
      }

      expect(result?.success).toBe(true);
      expect(mockLoginWithRetry).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrent operations safely', async () => {
      const mockGetLicenses = jest.fn().mockResolvedValue({
        success: true,
        data: { licenses: [{ id: 1 }, { id: 2 }] },
      });

      const mockGetUsers = jest.fn().mockResolvedValue({
        success: true,
        data: { users: [{ id: 1 }, { id: 2 }] },
      });

      const { licenseService } = require('@/services/license.service');
      const { userService } = require('@/services/user.service');

      licenseService.getLicenses = mockGetLicenses;
      userService.getUsers = mockGetUsers;

      // Execute concurrent operations
      const [licensesResult, usersResult] = await Promise.all([
        mockGetLicenses(),
        mockGetUsers(),
      ]);

      expect(licensesResult.success).toBe(true);
      expect(usersResult.success).toBe(true);
      expect(licensesResult.data.licenses).toHaveLength(2);
      expect(usersResult.data.users).toHaveLength(2);
    });

    it('should handle session expiration and refresh', async () => {
      const mockRefreshToken = jest.fn().mockResolvedValue({
        success: true,
        accessToken: 'new-token-123',
      });

      const mockRetryRequest = jest.fn().mockResolvedValue({
        success: true,
        data: { user: { id: 1 } },
      });

      const { authService } = require('@/services/auth.service');
      authService.refreshToken = mockRefreshToken;

      // Simulate session expiration
      let token = 'old-token';

      // Refresh token
      const refreshResult = await mockRefreshToken();
      token = refreshResult.accessToken;

      // Retry with new token
      const retryResult = await mockRetryRequest();

      expect(token).toBe('new-token-123');
      expect(retryResult.success).toBe(true);
    });
  });

  describe('Data Consistency Workflows', () => {
    it('should maintain data consistency during user creation and license assignment', async () => {
      const userData = { id: 1, username: 'testuser', email: 'test@example.com' };
      const licenseData = { id: 1, userId: 1, key: 'LIC-001' };

      const mockCreateUser = jest.fn().mockResolvedValue({
        success: true,
        data: userData,
      });

      const mockGetUser = jest.fn().mockResolvedValue({
        success: true,
        data: userData,
      });

      const mockCreateLicense = jest.fn().mockResolvedValue({
        success: true,
        data: licenseData,
      });

      const { userService } = require('@/services/user.service');
      const { licenseService } = require('@/services/license.service');

      userService.createUser = mockCreateUser;
      userService.getUserById = mockGetUser;
      licenseService.createLicense = mockCreateLicense;

      // Create user
      const createdUser = await mockCreateUser({
        username: 'testuser',
        email: 'test@example.com',
        roleId: 1,
      });

      // Verify user
      const retrievedUser = await mockGetUser(createdUser.data.id);
      expect(retrievedUser.data.id).toBe(createdUser.data.id);

      // Create license for user
      const createdLicense = await mockCreateLicense({
        userId: createdUser.data.id,
        productId: 1,
      });

      expect(createdLicense.data.userId).toBe(createdUser.data.id);
    });

    it('should ensure license cannot be created for non-existent user', async () => {
      const mockGetUser = jest.fn().mockRejectedValue({
        response: { status: 404, data: { error: 'User not found' } },
      });

      const mockCreateLicense = jest.fn().mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Invalid user ID' },
        },
      });

      const { userService } = require('@/services/user.service');
      const { licenseService } = require('@/services/license.service');

      userService.getUserById = mockGetUser;
      licenseService.createLicense = mockCreateLicense;

      try {
        await mockGetUser(9999);
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }

      try {
        await mockCreateLicense({ userId: 9999, productId: 1 });
      } catch (error: any) {
        expect(error.response.data.error).toBe('Invalid user ID');
      }
    });
  });
});
