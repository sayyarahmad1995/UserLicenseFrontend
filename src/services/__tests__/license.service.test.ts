/// <reference types="jest" />

import { licenseService } from '@/services/license.service';
import { apiClient } from '@/lib/api-client';

jest.mock('@/lib/api-client');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('License Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLicenses', () => {
    it('should fetch licenses with pagination', async () => {
      const mockResponse = {
        pageIndex: 1,
        pageSize: 10,
        total: 50,
        totalPages: 5,
        licenses: [
          { id: 1, key: 'LIC-001', status: 'active', expiresAt: '2025-12-31' },
          { id: 2, key: 'LIC-002', status: 'active', expiresAt: '2026-12-31' },
        ],
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await licenseService.getLicenses({ pageNumber: 1, pageSize: 10 });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.totalCount).toBe(50);
    });

    it('should filter licenses by status', async () => {
      const mockResponse = {
        pageIndex: 1,
        pageSize: 10,
        total: 20,
        licenses: [{ id: 1, key: 'LIC-001', status: 'expired' }],
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await licenseService.getLicenses({ status: 'expired' });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result.totalCount).toBe(20);
    });

    it('should filter licenses by user', async () => {
      const mockResponse = {
        pageIndex: 1,
        pageSize: 10,
        total: 3,
        licenses: [{ id: 1, userId: 5, key: 'LIC-001' }],
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await licenseService.getLicenses({ userId: 5 });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result.data[0].userId).toBe(5);
    });

    it('should handle empty license list', async () => {
      mockApiClient.get.mockResolvedValue({
        pageIndex: 1,
        pageSize: 10,
        total: 0,
        licenses: [],
      });

      const result = await licenseService.getLicenses();

      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('getLicenseById', () => {
    it('should fetch license by id', async () => {
      const license = {
        id: 1,
        key: 'LIC-001',
        status: 'active',
        expiresAt: '2025-12-31',
        userId: 1,
      };

      mockApiClient.get.mockResolvedValue({ license });

      const result = await licenseService.getLicenseById(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/licenses/1');
      expect(result).toEqual(license);
    });

    it('should handle license not found', async () => {
      const error = new Error('Not found') as any;
      error.response = { status: 404 };

      mockApiClient.get.mockRejectedValue(error);

      await expect(licenseService.getLicenseById(999)).rejects.toThrow('Not found');
    });
  });

  describe('createLicense', () => {
    it('should create a new license', async () => {
      const licenseData = {
        userId: 1,
        expiresAt: '2025-12-31',
        maxActivations: 5,
      };

      const createdLicense = { id: 1, ...licenseData, key: 'LIC-001', status: 'active' };
      mockApiClient.post.mockResolvedValue({ license: createdLicense });

      const result = await licenseService.createLicense(licenseData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/licenses', licenseData);
      expect(result.key).toBe('LIC-001');
    });

    it('should handle invalid input', async () => {
      const error = new Error('Validation failed') as any;
      error.response = { status: 400 };

      mockApiClient.post.mockRejectedValue(error);

      await expect(
        licenseService.createLicense({
          userId: -1,
          expiresAt: 'invalid',
        })
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('updateLicenseStatus', () => {
    it('should update license status', async () => {
      const updated = { id: 1, key: 'LIC-001', status: 'suspended' };
      mockApiClient.patch.mockResolvedValue({ license: updated });

      const result = await licenseService.updateLicenseStatus(1, 'suspended');

      expect(mockApiClient.patch).toHaveBeenCalledWith('/licenses/1/status', {
        status: 'suspended',
      });
      expect(result.status).toBe('suspended');
    });
  });

  describe('revokeLicense', () => {
    it('should revoke license', async () => {
      const revoked = { id: 1, key: 'LIC-001', status: 'revoked' };
      mockApiClient.delete.mockResolvedValue({ license: revoked });

      const result = await licenseService.revokeLicense(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/licenses/1');
      expect(result.status).toBe('revoked');
    });
  });

  describe('activateLicense', () => {
    it('should activate license', async () => {
      const activationData = {
        licenseKey: 'LIC-001',
        machineFingerprint: 'fingerprint-123',
        hostname: 'computer-1',
      };

      mockApiClient.post.mockResolvedValue({});

      await licenseService.activateLicense(activationData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/licenses/activate', activationData);
    });

    it('should handle activation errors', async () => {
      const error = new Error('License already activated') as any;
      error.response = { status: 409 };

      mockApiClient.post.mockRejectedValue(error);

      await expect(
        licenseService.activateLicense({
          licenseKey: 'LIC-001',
          machineFingerprint: 'fingerprint',
        })
      ).rejects.toThrow('License already activated');
    });
  });

  describe('validateLicense', () => {
    it('should validate license', async () => {
      mockApiClient.post.mockResolvedValue({
        isValid: true,
        message: 'License is valid',
      });

      const result = await licenseService.validateLicense({
        licenseKey: 'LIC-001',
        machineFingerprint: 'fingerprint-123',
      });

      expect(result.isValid).toBe(true);
      expect(result.message).toBe('License is valid');
    });

    it('should detect invalid license', async () => {
      mockApiClient.post.mockResolvedValue({
        isValid: false,
        message: 'License expired',
      });

      const result = await licenseService.validateLicense({
        licenseKey: 'LIC-INVALID',
        machineFingerprint: 'fingerprint',
      });

      expect(result.isValid).toBe(false);
    });
  });

  describe('heartbeat', () => {
    it('should send heartbeat', async () => {
      const heartbeatData = {
        licenseKey: 'LIC-001',
        machineFingerprint: 'fingerprint-123',
      };

      mockApiClient.post.mockResolvedValue({});

      await licenseService.heartbeat(heartbeatData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/licenses/heartbeat', heartbeatData);
    });
  });

  describe('deactivateLicense', () => {
    it('should deactivate license', async () => {
      const deactivationData = {
        licenseKey: 'LIC-001',
        machineFingerprint: 'fingerprint-123',
      };

      mockApiClient.post.mockResolvedValue({});

      await licenseService.deactivateLicense(deactivationData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/licenses/deactivate', deactivationData);
    });
  });

  describe('getActivations', () => {
    it('should fetch license activations', async () => {
      const activations = [
        { id: 1, machineFingerprint: 'fp-1', status: 'active' },
        { id: 2, machineFingerprint: 'fp-2', status: 'active' },
      ];

      mockApiClient.get.mockResolvedValue({ activations });

      const result = await licenseService.getActivations(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/licenses/1/activations');
      expect(result).toHaveLength(2);
    });

    it('should handle no activations', async () => {
      mockApiClient.get.mockResolvedValue({ activations: [] });

      const result = await licenseService.getActivations(1);

      expect(result).toHaveLength(0);
    });
  });

  describe('generateLicense', () => {
    it('should generate new license key', async () => {
      const request = {
        userId: 1,
        maxActivations: 3,
        expiresInDays: 365,
      };

      const generated = {
        id: 100,
        key: 'GEN-LIC-001',
        status: 'active',
      };

      mockApiClient.post.mockResolvedValue({ license: generated });

      const result = await licenseService.generateLicense(request);

      expect(mockApiClient.post).toHaveBeenCalled();
      expect(result.key).toBe('GEN-LIC-001');
    });
  });

  describe('revokeLicenseWithReason', () => {
    it('should revoke license with reason', async () => {
      const request = {
        licenseId: 1,
        reason: 'Customer request',
      };

      const revoked = { id: 1, key: 'LIC-001', status: 'revoked' };
      mockApiClient.post.mockResolvedValue({ license: revoked });

      const result = await licenseService.revokeLicenseWithReason(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/licenses/1/revoke', {
        reason: request.reason,
      });
      expect(result.status).toBe('revoked');
    });
  });

  describe('checkLicense', () => {
    it('should check license validity', async () => {
      const checkResponse = {
        valid: true,
        status: 'active',
        expiresAt: '2025-12-31',
      };

      mockApiClient.get.mockResolvedValue({ data: checkResponse });

      const result = await licenseService.checkLicense('LIC-001');

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result.valid).toBe(true);
    });
  });

  describe('exportLicenses', () => {
    it('should export licenses as CSV', async () => {
      const blob = new Blob(['csv data'], { type: 'text/csv' });
      mockApiClient.get.mockResolvedValue(blob);

      const result = await licenseService.exportLicenses({
        format: 'csv',
      });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Blob);
    });

    it('should export licenses with filters', async () => {
      const blob = new Blob(['data'], { type: 'application/json' });
      mockApiClient.get.mockResolvedValue(blob);

      const result = await licenseService.exportLicenses({
        format: 'json',
        filters: {
          status: 'active',
          createdAfter: '2025-01-01',
        },
      });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('getLicenseStatistics', () => {
    it('should fetch license statistics', async () => {
      const stats = {
        totalLicenses: 100,
        activeLicenses: 85,
        expiredLicenses: 10,
        totalActivations: 250,
      };

      mockApiClient.get.mockResolvedValue({ data: stats });

      const result = await licenseService.getLicenseStatistics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/licenses/statistics');
      expect(result.totalLicenses).toBe(100);
    });
  });

  describe('bulkLicenseOperation', () => {
    it('should perform bulk license operation', async () => {
      const operation = {
        operation: 'revoke',
        licenseIds: [1, 2, 3],
        data: { reason: 'Bulk revocation' },
      };

      const jobResult = { jobId: 'bulk-job-123', status: 'pending' };
      mockApiClient.post.mockResolvedValue({ job: jobResult });

      const result = await licenseService.bulkLicenseOperation(operation);

      expect(mockApiClient.post).toHaveBeenCalledWith('/licenses/bulk', operation);
      expect(result.jobId).toBe('bulk-job-123');
    });
  });

  describe('getActivationLimit', () => {
    it('should fetch activation limit', async () => {
      const limit = {
        maxActivations: 5,
        activeActivations: 3,
        canActivate: true,
      };

      mockApiClient.get.mockResolvedValue({ data: limit });

      const result = await licenseService.getActivationLimit(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/licenses/1/activation-limit');
      expect(result.maxActivations).toBe(5);
      expect(result.canActivate).toBe(true);
    });

    it('should detect when activation limit reached', async () => {
      const limit = {
        maxActivations: 3,
        activeActivations: 3,
        canActivate: false,
      };

      mockApiClient.get.mockResolvedValue({ data: limit });

      const result = await licenseService.getActivationLimit(1);

      expect(result.canActivate).toBe(false);
    });
  });
});
