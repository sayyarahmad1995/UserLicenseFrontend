/// <reference types="jest" />

import { auditService } from '@/services/audit.service';
import { apiClient } from '@/lib/api-client';

jest.mock('@/lib/api-client');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Audit Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuditLogs', () => {
    it('should fetch audit logs with pagination', async () => {
      const mockResponse = {
        pageIndex: 1,
        pageSize: 10,
        total: 150,
        totalPages: 15,
        logs: [
          {
            id: 1,
            userId: 1,
            action: 'login',
            timestamp: '2025-01-15T10:30:00Z',
            ipAddress: '192.168.1.1',
          },
          {
            id: 2,
            userId: 2,
            action: 'license_created',
            timestamp: '2025-01-15T11:00:00Z',
            ipAddress: '192.168.1.2',
          },
        ],
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await auditService.getAuditLogs({ pageNumber: 1, pageSize: 10 });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.totalCount).toBe(150);
    });

    it('should filter audit logs by user', async () => {
      const mockResponse = {
        pageIndex: 1,
        pageSize: 10,
        total: 25,
        logs: [
          { id: 1, userId: 5, action: 'login', timestamp: '2025-01-15T10:30:00Z' },
        ],
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await auditService.getAuditLogs({ userId: 5 });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result.data[0].userId).toBe(5);
    });

    it('should filter audit logs by action', async () => {
      const mockResponse = {
        pageIndex: 1,
        pageSize: 10,
        total: 50,
        logs: [
          { id: 1, action: 'license_revoked', timestamp: '2025-01-15T10:30:00Z' },
        ],
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await auditService.getAuditLogs({ action: 'license_revoked' });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result.data[0].action).toBe('license_revoked');
    });

    it('should filter audit logs by date range', async () => {
      const mockResponse = {
        pageIndex: 1,
        pageSize: 10,
        total: 30,
        logs: [{ id: 1, timestamp: '2025-01-10T10:30:00Z' }],
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await auditService.getAuditLogs({
        startDate: '2025-01-01',
        endDate: '2025-01-15',
      });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
    });

    it('should handle empty audit logs', async () => {
      mockApiClient.get.mockResolvedValue({
        pageIndex: 1,
        pageSize: 10,
        total: 0,
        logs: [],
      });

      const result = await auditService.getAuditLogs();

      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('getAuditLogById', () => {
    it('should fetch audit log by id', async () => {
      const log = {
        id: 1,
        userId: 1,
        action: 'login',
        timestamp: '2025-01-15T10:30:00Z',
        ipAddress: '192.168.1.1',
        details: { browser: 'Chrome' },
      };

      mockApiClient.get.mockResolvedValue({ log });

      const result = await auditService.getAuditLogById(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/audit-logs/1');
      expect(result).toEqual(log);
    });

    it('should handle log not found', async () => {
      const error = new Error('Not found') as any;
      error.response = { status: 404 };

      mockApiClient.get.mockRejectedValue(error);

      await expect(auditService.getAuditLogById(999)).rejects.toThrow('Not found');
    });
  });

  describe('exportAuditLogs', () => {
    it('should export audit logs as CSV', async () => {
      const blob = new Blob(['csv data'], { type: 'text/csv' });
      mockApiClient.get.mockResolvedValue(blob);

      const result = await auditService.exportAuditLogs({
        format: 'csv',
      });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/csv');
    });

    it('should export audit logs as JSON', async () => {
      const blob = new Blob(['json data'], { type: 'application/json' });
      mockApiClient.get.mockResolvedValue(blob);

      const result = await auditService.exportAuditLogs({
        format: 'json',
      });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Blob);
    });

    it('should export with date range filter', async () => {
      const blob = new Blob(['data'], { type: 'text/csv' });
      mockApiClient.get.mockResolvedValue(blob);

      const result = await auditService.exportAuditLogs({
        format: 'csv',
        dateRange: {
          startDate: '2025-01-01',
          endDate: '2025-01-31',
        },
      });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Blob);
    });

    it('should export with action filter', async () => {
      const blob = new Blob(['data'], { type: 'text/csv' });
      mockApiClient.get.mockResolvedValue(blob);

      const result = await auditService.exportAuditLogs({
        format: 'csv',
        filters: {
          action: 'license_created',
        },
      });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Blob);
    });

    it('should export with user id filter', async () => {
      const blob = new Blob(['data'], { type: 'text/csv' });
      mockApiClient.get.mockResolvedValue(blob);

      const result = await auditService.exportAuditLogs({
        format: 'csv',
        filters: {
          userId: 5,
        },
      });

      expect(mockApiClient.get).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle export errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Export failed'));

      await expect(
        auditService.exportAuditLogs({ format: 'csv' })
      ).rejects.toThrow('Export failed');
    });
  });

  describe('getAuditLogStatistics', () => {
    it('should fetch audit log statistics', async () => {
      const stats = {
        totalLogs: 10000,
        logsThisMonth: 2500,
        logsThisWeek: 500,
        uniqueUsers: 150,
        uniqueActions: 25,
        mostCommonAction: 'login',
      };

      mockApiClient.get.mockResolvedValue({ data: stats });

      const result = await auditService.getAuditLogStatistics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/audit-logs/statistics');
      expect(result.totalLogs).toBe(10000);
      expect(result.uniqueUsers).toBe(150);
    });

    it('should handle missing statistics', async () => {
      mockApiClient.get.mockResolvedValue({});

      const result = await auditService.getAuditLogStatistics();

      expect(result).toEqual({});
    });
  });

  describe('getComplianceReport', () => {
    it('should fetch default 30-day compliance report', async () => {
      const report = {
        period: '30d',
        totalEvents: 5000,
        securityEvents: 150,
        failedLoginAttempts: 45,
        suspiciousActivities: 12,
        complianceScore: 95,
      };

      mockApiClient.get.mockResolvedValue({ data: report });

      const result = await auditService.getComplianceReport();

      expect(mockApiClient.get).toHaveBeenCalledWith('/audit-logs/compliance-report?period=30d');
      expect(result.complianceScore).toBe(95);
    });

    it('should fetch compliance report for custom period', async () => {
      const report = {
        period: '90d',
        totalEvents: 15000,
        securityEvents: 450,
        complianceScore: 92,
      };

      mockApiClient.get.mockResolvedValue({ data: report });

      const result = await auditService.getComplianceReport('90d');

      expect(mockApiClient.get).toHaveBeenCalledWith('/audit-logs/compliance-report?period=90d');
      expect(result.period).toBe('90d');
    });

    it('should fetch report for 7-day period', async () => {
      const report = {
        period: '7d',
        totalEvents: 1500,
        securityEvents: 100,
      };

      mockApiClient.get.mockResolvedValue({ data: report });

      const result = await auditService.getComplianceReport('7d');

      expect(mockApiClient.get).toHaveBeenCalledWith('/audit-logs/compliance-report?period=7d');
      expect(result).toEqual(report);
    });

    it('should handle report generation errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Report generation failed'));

      await expect(auditService.getComplianceReport()).rejects.toThrow(
        'Report generation failed'
      );
    });
  });
});
