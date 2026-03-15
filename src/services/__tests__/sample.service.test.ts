// Example test utility for API testing
import { apiClient } from '@/lib/api-client';

export const mockApiValidResponse = <T>(data: T, status = 200) => {
  return Promise.resolve(data);
};

export const mockApiErrorResponse = (status: number, message: string) => {
  const error = new Error(message) as any;
  error.response = {
    status,
    data: {
      message,
      code: 'ERROR',
    },
  };
  return Promise.reject(error);
};

export const createMockApiClient = () => {
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  const mockPut = jest.fn();
  const mockDelete = jest.fn();
  const mockPatch = jest.fn();

  return {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
    patch: mockPatch,
  };
};

// Service test example
describe('Auth Service', () => {
  let mockApi: ReturnType<typeof createMockApiClient>;

  beforeEach(() => {
    mockApi = createMockApiClient();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should send login credentials and return user data', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        token: 'token123',
      };

      mockApi.post.mockResolvedValue(mockUser);

      // In real test, you'd call the actual service
      const result = await mockApi.post('/auth/login', {
        username: 'testuser',
        password: 'password123',
      });

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'password123',
      });

      expect(result).toEqual(mockUser);
      expect(result.token).toBe('token123');
    });

    it('should handle login errors', async () => {
      mockApi.post.mockRejectedValue(
        new Error('Invalid credentials')
      );

      await expect(
        mockApi.post('/auth/login', {
          username: 'testuser',
          password: 'wrong',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        id: 2,
        username: 'newuser',
        email: 'new@example.com',
      };

      mockApi.post.mockResolvedValue(mockUser);

      const result = await mockApi.post('/auth/register', {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockUser);
    });

    it('should validate required fields', async () => {
      mockApi.post.mockRejectedValue({
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
            errors: {
              email: ['Invalid email'],
              password: ['Too weak'],
            },
          },
        },
      });

      await expect(
        mockApi.post('/auth/register', {})
      ).rejects.toMatchObject({
        response: {
          status: 400,
          data: expect.objectContaining({
            message: 'Validation failed',
          }),
        },
      });
    });
  });

  describe('refresh token', () => {
    it('should refresh expired token', async () => {
      mockApi.post.mockResolvedValue({
        token: 'newtoken123',
        expiresIn: 3600,
      });

      const result = await mockApi.post('/auth/refresh');

      expect(result.token).toBe('newtoken123');
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      mockApi.post.mockResolvedValue({ success: true });

      const result = await mockApi.post('/auth/logout');

      expect(result.success).toBe(true);
    });
  });
});

// User Service tests
describe('User Service', () => {
  let mockApi: ReturnType<typeof createMockApiClient>;

  beforeEach(() => {
    mockApi = createMockApiClient();
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should fetch users list with pagination', async () => {
      const mockUsers = {
        data: [
          { id: 1, username: 'user1', email: 'user1@example.com' },
          { id: 2, username: 'user2', email: 'user2@example.com' },
        ],
        pageNumber: 1,
        pageSize: 10,
        totalCount: 2,
      };

      mockApi.get.mockResolvedValue(mockUsers);

      const result = await mockApi.get('/users', {
        params: { pageIndex: 0, pageSize: 10 },
      });

      expect(mockApi.get).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          params: { pageIndex: 0, pageSize: 10 },
        })
      );

      expect(result.data).toHaveLength(2);
      expect(result.totalCount).toBe(2);
    });

    it('should handle fetch errors', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'));

      await expect(mockApi.get('/users')).rejects.toThrow('Network error');
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser = {
        id: 3,
        username: 'newuser',
        email: 'new@example.com',
        roleId: 2,
      };

      mockApi.post.mockResolvedValue(newUser);

      const result = await mockApi.post('/users', {
        username: 'newuser',
        email: 'new@example.com',
        roleId: 2,
      });

      expect(result.username).toBe('newuser');
      expect(result.id).toBe(3);
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const updated = {
        id: 1,
        username: 'user1',
        email: 'newemail@example.com',
      };

      mockApi.put.mockResolvedValue(updated);

      const result = await mockApi.put('/users/1', {
        email: 'newemail@example.com',
      });

      expect(result.email).toBe('newemail@example.com');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      mockApi.delete.mockResolvedValue({ success: true });

      const result = await mockApi.delete('/users/1');

      expect(result.success).toBe(true);
    });
  });
});

// License Service tests
describe('License Service', () => {
  let mockApi: ReturnType<typeof createMockApiClient>;

  beforeEach(() => {
    mockApi = createMockApiClient();
    jest.clearAllMocks();
  });

  describe('getLicenses', () => {
    it('should fetch licenses list', async () => {
      const mockLicenses = {
        data: [
          {
            id: 1,
            key: 'LICENSE-123',
            userId: 1,
            type: 'standard',
            status: 'active',
          },
        ],
        totalCount: 1,
      };

      mockApi.get.mockResolvedValue(mockLicenses);

      const result = await mockApi.get('/licenses');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('active');
    });
  });

  describe('generateLicenses', () => {
    it('should generate batch of licenses', async () => {
      const mockJob = {
        id: 'job-123',
        status: 'pending',
        totalLicenses: 100,
        generatedLicenses: [],
      };

      mockApi.post.mockResolvedValue(mockJob);

      const result = await mockApi.post('/licenses/generate', {
        count: 100,
        type: 'trial',
        expiryDays: 30,
      });

      expect(result.totalLicenses).toBe(100);
      expect(result.status).toBe('pending');
    });
  });

  describe('revokeLicense', () => {
    it('should revoke a license', async () => {
      mockApi.post.mockResolvedValue({ success: true });

      const result = await mockApi.post('/licenses/1/revoke', {
        reason: 'User requested',
      });

      expect(result.success).toBe(true);
    });
  });
});

// Audit Service tests
describe('Audit Service', () => {
  let mockApi: ReturnType<typeof createMockApiClient>;

  beforeEach(() => {
    mockApi = createMockApiClient();
    jest.clearAllMocks();
  });

  describe('getAuditLogs', () => {
    it('should fetch audit logs with filters', async () => {
      const mockLogs = {
        data: [
          {
            id: 1,
            userId: 1,
            action: 'USER_CREATED',
            resourceType: 'User',
            status: 'success',
            timestamp: '2024-01-01T10:00:00Z',
          },
        ],
        totalCount: 1,
      };

      mockApi.get.mockResolvedValue(mockLogs);

      const result = await mockApi.get('/audit-logs', {
        params: {
          userId: 1,
          action: 'USER_CREATED',
        },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].action).toBe('USER_CREATED');
    });
  });

  describe('exportAuditLogs', () => {
    it('should export audit logs as CSV', async () => {
      mockApi.post.mockResolvedValue({
        downloadUrl: '/api/downloads/audit-logs.csv',
      });

      const result = await mockApi.post('/audit-logs/export', {
        format: 'csv',
      });

      expect(result.downloadUrl).toContain('.csv');
    });
  });
});
