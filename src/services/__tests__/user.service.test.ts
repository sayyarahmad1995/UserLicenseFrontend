/// <reference types="jest" />

import { userService } from '@/services/user.service';
import { apiClient } from '@/lib/api-client';

jest.mock('@/lib/api-client');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should fetch users with pagination', async () => {
      const mockResponse = {
        pageIndex: 1,
        pageSize: 10,
        total: 25,
        totalPages: 3,
        users: [
          { id: 1, username: 'user1', email: 'user1@example.com', roleId: 2 },
          { id: 2, username: 'user2', email: 'user2@example.com', roleId: 2 },
        ],
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await userService.getUsers({ pageNumber: 1, pageSize: 10 });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.totalCount).toBe(25);
      expect(result.pageNumber).toBe(1);
    });

    it('should fetch users with search filter', async () => {
      const mockResponse = {
        pageIndex: 1,
        pageSize: 10,
        total: 1,
        users: [{ id: 1, username: 'admin', email: 'admin@example.com' }],
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await userService.getUsers({ searchTerm: 'admin' });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result.data[0].username).toBe('admin');
    });

    it('should handle empty user list', async () => {
      mockApiClient.get.mockResolvedValue({
        pageIndex: 1,
        pageSize: 10,
        total: 0,
        users: [],
      });

      const result = await userService.getUsers();

      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should handle fetch errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(userService.getUsers()).rejects.toThrow('Network error');
    });
  });

  describe('getUserById', () => {
    it('should fetch user by id', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        roleId: 2,
        status: 'active',
      };

      mockApiClient.get.mockResolvedValue({ user });

      const result = await userService.getUserById(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/1');
      expect(result).toEqual(user);
    });

    it('should handle user not found', async () => {
      const error = new Error('Not found') as any;
      error.response = { status: 404 };

      mockApiClient.get.mockRejectedValue(error);

      await expect(userService.getUserById(999)).rejects.toThrow('Not found');
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'Password123!',
      };

      const createdUser = { id: 3, ...userData, roleId: 2 };
      mockApiClient.post.mockResolvedValue({ user: createdUser });

      const result = await userService.createUser(userData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/users', userData);
      expect(result.id).toBe(3);
      expect(result.username).toBe('newuser');
    });

    it('should handle duplicate email error', async () => {
      const error = new Error('Duplicate email') as any;
      error.response = { status: 409, data: { message: 'Email already exists' } };

      mockApiClient.post.mockRejectedValue(error);

      await expect(
        userService.createUser({
          username: 'user',
          email: 'existing@example.com',
          password: 'Pass123!',
        })
      ).rejects.toThrow('Duplicate email');
    });

    it('should handle validation errors', async () => {
      const error = new Error('Validation failed') as any;
      error.response = {
        status: 400,
        data: { errors: { password: ['Too weak'] } },
      };

      mockApiClient.post.mockRejectedValue(error);

      await expect(
        userService.createUser({
          username: 'user',
          email: 'new@example.com',
          password: '123',
        })
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status', async () => {
      const updated = { id: 1, username: 'user', status: 'inactive' };
      mockApiClient.patch.mockResolvedValue({ user: updated });

      const result = await userService.updateUserStatus(1, 'inactive');

      expect(mockApiClient.patch).toHaveBeenCalledWith('/users/1/status', { status: 'inactive' });
      expect(result.status).toBe('inactive');
    });

    it('should handle invalid status', async () => {
      const error = new Error('Invalid status') as any;
      error.response = { status: 400 };

      mockApiClient.patch.mockRejectedValue(error);

      await expect(userService.updateUserStatus(1, 'invalid')).rejects.toThrow('Invalid status');
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user by default', async () => {
      mockApiClient.delete.mockResolvedValue({});

      await userService.deleteUser(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/users/1?hardDelete=false');
    });

    it('should hard delete user when requested', async () => {
      mockApiClient.delete.mockResolvedValue({});

      await userService.deleteUser(1, true);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/users/1?hardDelete=true');
    });

    it('should handle user not found', async () => {
      const error = new Error('Not found') as any;
      error.response = { status: 404 };

      mockApiClient.delete.mockRejectedValue(error);

      await expect(userService.deleteUser(999)).rejects.toThrow('Not found');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const request = { userId: 1, newRole: 'admin' };
      const updated = { id: 1, username: 'user', roleId: 1 };

      mockApiClient.patch.mockResolvedValue({ user: updated });

      const result = await userService.updateUserRole(request);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/users/1/role', { role: 'admin' });
      expect(result).toEqual(updated);
    });

    it('should handle invalid role', async () => {
      const error = new Error('Invalid role') as any;
      error.response = { status: 400 };

      mockApiClient.patch.mockRejectedValue(error);

      await expect(
        userService.updateUserRole({ userId: 1, newRole: 'invalid' })
      ).rejects.toThrow('Invalid role');
    });
  });

  describe('kickOutUser', () => {
    it('should kick out user with reason', async () => {
      const request = { userId: 1, reason: 'Suspicious activity' };
      mockApiClient.post.mockResolvedValue({});

      await userService.kickOutUser(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/users/1/kick-out', {
        reason: request.reason,
      });
    });

    it('should handle user not found', async () => {
      const error = new Error('Not found') as any;
      error.response = { status: 404 };

      mockApiClient.post.mockRejectedValue(error);

      await expect(
        userService.kickOutUser({ userId: 999, reason: 'Test' })
      ).rejects.toThrow('Not found');
    });
  });

  describe('exportUsers', () => {
    it('should export users as CSV', async () => {
      const blob = new Blob(['csv data'], { type: 'application/csv' });
      mockApiClient.get.mockResolvedValue(blob);

      const result = await userService.exportUsers({ format: 'csv' });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result.type).toBe('application/csv');
    });

    it('should export users with field selection', async () => {
      const blob = new Blob(['data'], { type: 'text/csv' });
      mockApiClient.get.mockResolvedValue(blob);

      const result = await userService.exportUsers({
        format: 'csv',
        includedFields: ['username', 'email', 'status'],
      });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Blob);
    });

    it('should export users with filters', async () => {
      const blob = new Blob(['data'], { type: 'text/csv' });
      mockApiClient.get.mockResolvedValue(blob);

      const result = await userService.exportUsers({
        format: 'json',
        filters: { status: 'active', role: 'user' },
      });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle export errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Export failed'));

      await expect(userService.exportUsers({ format: 'csv' })).rejects.toThrow('Export failed');
    });
  });

  describe('bulkOperation', () => {
    it('should execute bulk user operation', async () => {
      const operation = {
        operation: 'update-role',
        userIds: [1, 2, 3],
        data: { newRole: 'moderator' },
      };

      const jobResult = { jobId: 'job-123', status: 'pending' };
      mockApiClient.post.mockResolvedValue({ job: jobResult });

      const result = await userService.bulkOperation(operation);

      expect(mockApiClient.post).toHaveBeenCalledWith('/users/bulk', operation);
      expect(result.jobId).toBe('job-123');
    });

    it('should handle bulk operation errors', async () => {
      const error = new Error('Invalid operation') as any;
      error.response = { status: 400 };

      mockApiClient.post.mockRejectedValue(error);

      await expect(
        userService.bulkOperation({
          operation: 'invalid',
          userIds: [1],
          data: {},
        })
      ).rejects.toThrow('Invalid operation');
    });
  });

  describe('getAsyncJob', () => {
    it('should fetch async job status', async () => {
      const job = {
        jobId: 'job-123',
        status: 'in-progress',
        progress: 50,
      };

      mockApiClient.get.mockResolvedValue({ job });

      const result = await userService.getAsyncJob('job-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/jobs/job-123');
      expect(result.jobId).toBe('job-123');
      expect(result.status).toBe('in-progress');
    });

    it('should handle job not found', async () => {
      const error = new Error('Not found') as any;
      error.response = { status: 404 };

      mockApiClient.get.mockRejectedValue(error);

      await expect(userService.getAsyncJob('invalid')).rejects.toThrow('Not found');
    });
  });

  describe('listAsyncJobs', () => {
    it('should list all async jobs', async () => {
      const jobs = [
        { jobId: 'job-1', status: 'completed' },
        { jobId: 'job-2', status: 'in-progress' },
      ];

      mockApiClient.get.mockResolvedValue({ data: jobs });

      const result = await userService.listAsyncJobs();

      expect(mockApiClient.get).toHaveBeenCalledWith('/jobs');
      expect(result).toHaveLength(2);
    });

    it('should filter jobs by status', async () => {
      const jobs = [{ jobId: 'job-1', status: 'pending' }];
      mockApiClient.get.mockResolvedValue({ data: jobs });

      const result = await userService.listAsyncJobs('pending');

      expect(mockApiClient.get).toHaveBeenCalledWith('/jobs?status=pending');
      expect(result).toHaveLength(1);
    });

    it('should handle empty job list', async () => {
      mockApiClient.get.mockResolvedValue({ data: [] });

      const result = await userService.listAsyncJobs();

      expect(result).toHaveLength(0);
    });
  });
});
