// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  notifyLicenseExpiry: boolean;
  notifyAccountActivity: boolean;
  notifySystemAnnouncements: boolean;
}

export enum UserRole {
  Admin = 'Admin',
  User = 'User',
  Manager = 'Manager',
}

export enum UserStatus {
  Unverified = 'Unverified',
  Verified = 'Verified',
  Active = 'Active',
  Blocked = 'Blocked',
}

// User management types
export interface UpdateUserRoleRequest {
  userId: number;
  newRole: UserRole;
}

export interface ExportUsersRequest {
  format: 'csv' | 'json';
  includedFields?: string[];
  filters?: {
    status?: UserStatus;
    role?: UserRole;
    createdAfter?: string;
    createdBefore?: string;
  };
}

export interface BulkUserOperation {
  operationType: 'suspend' | 'activate' | 'changeRole' | 'delete';
  userIds: number[];
  additionalData?: Record<string, any>;
}

export interface AsyncJobResult {
  jobId: string;
  operationType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  failedItems: number;
  createdAt: string;
  completedAt?: string;
  result?: {
    succeeded: number;
    failed: number;
    errors?: { itemId: number; error: string }[];
  };
}

export interface KickOutUserRequest {
  userId: number;
  reason?: string;
}

// License types
export interface License {
  id: number;
  key: string;
  userId: number;
  status: LicenseStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  maxActivations: number;
  activeActivations: number;
}

export enum LicenseStatus {
  Active = 'Active',
  Expired = 'Expired',
  Revoked = 'Revoked',
  Suspended = 'Suspended',
}

export interface LicenseActivation {
  id: number;
  licenseId: number;
  machineFingerprint: string;
  hostname: string | null;
  ipAddress: string | null;
  activatedAt: string;
  deactivatedAt: string | null;
  lastSeenAt: string;
}

// License operation types
export interface GenerateLicenseRequest {
  userId: number;
  maxActivations: number;
  expiresInDays: number;
}

export interface RevokeLicenseRequest {
  licenseId: number;
  reason?: string;
}

export interface ExportLicensesRequest {
  format: 'csv' | 'json';
  filters?: {
    status?: LicenseStatus;
    userId?: number;
    createdAfter?: string;
    createdBefore?: string;
  };
}

export interface LicenseCheckResponse {
  isValid: boolean;
  licenseId: number;
  key: string;
  status: LicenseStatus;
  expiresAt: string;
  maxActivations: number;
  activeActivations: number;
  canActivate: boolean;
}

export interface LicenseStatistics {
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  revokedLicenses: number;
  totalActivations: number;
  expiringInDaysCount: number;
  averageActivationsPerLicense: number;
}

export interface BulkLicenseOperation {
  operationType: 'revoke' | 'activate' | 'deactivate' | 'changeUser';
  licenseIds: number[];
  additionalData?: Record<string, any>;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
}

export interface NotificationPreferences {
  notifyLicenseExpiry: boolean;
  notifyAccountActivity: boolean;
  notifySystemAnnouncements: boolean;
}

// Dashboard stats
export interface DashboardStats {
  total_users: number;
  verified_users: number;
  unverified_users: number;
  total_licenses: number;
  active_licenses: number;
  expired_licenses: number;
  revoked_licenses: number;
  recent_audit_logs: number;
  system_health: string;
  timestamp: string;
}

// Dashboard user-specific stats
export interface DashboardUserStats {
  userId: number;
  username: string;
  licensesOwned: number;
  licensesActive: number;
  licensesExpiring: number;
  activationsTotal: number;
  lastLoginAt: string;
  createdAt: string;
}

// License forecast
export interface LicenseForecast {
  expiring_in_7_days: number;
  expiring_in_30_days: number;
  expiring_in_90_days: number;
  total_upcoming: number;
}

// Activity timeline entry
export interface ActivityTimelineEntry {
  id: number;
  action: string;
  description: string;
  timestamp: string;
}

// Dashboard snapshot (from /dashboard endpoint)
export interface DashboardSnapshot {
  userId: number;
  licenses: {
    total: number;
    active: number;
    expired: number;
    expiringSoon?: number;
    expiringLikewise?: number;
  };
  activations: {
    total: number;
  };
  recentActivity: ActivityTimelineEntry[];
}

// Analytics data
export interface AnalyticsData {
  period: string;
  startDate: string;
  endDate: string;
  totalEvents: number;
  uniqueUsers: number;
  activeLicensesCount: number;
  newLicensesCount: number;
  licenseExpirations: number;
  authenticatedSessions: number;
  failedLoginAttempts: number;
}

// Enhanced dashboard data (combination of all above)
export interface EnhancedDashboard {
  stats: DashboardStats;
  userStats: DashboardUserStats;
  forecast: LicenseForecast[];
  recentActivity: ActivityTimelineEntry[];
  analytics: AnalyticsData;
}

// Audit log
export interface AuditLog {
  id: number;
  userId: number | null;
  username: string | null;
  action: string;
  ipAddress: string | null;
  timestamp: string;
  metadata?: string | null;
  details?: string | null;
  entityType?: string;
  entityId?: number;
}

// Audit log operation types
export interface AuditLogExportRequest {
  format: 'csv' | 'json';
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: {
    userId?: number;
    action?: string;
    ipAddress?: string;
  };
}

export interface AuditLogStatistics {
  totalLogs: number;
  logsToday: number;
  logsThisWeek: number;
  logsThisMonth: number;
  distinctUsers: number;
  distinctActions: number;
  mostCommonAction: string;
  mostActiveUser?: string;
}

export interface ComplianceReport {
  period: string;
  startDate: string;
  endDate: string;
  totalAuditLogs: number;
  userCount: number;
  suspiciousActivities: number;
  dataAccessEvents: number;
  configurationChanges: number;
  systemEvents: number;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  success: boolean;
}

// Permission types
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface UserPermissions {
  userId: number;
  permissions: Permission[];
  role: UserRole;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

export interface GrantPermissionRequest {
  userId: number;
  permissionId: string;
}

export interface RevokePermissionRequest {
  userId: number;
  permissionId: string;
}

export interface SetRolePermissionsRequest {
  role: UserRole;
  permissionIds: string[];
}

export interface CheckPermissionRequest {
  userId?: number;
  permissionId: string;
}

export interface CheckPermissionResponse {
  hasPermission: boolean;
  userId?: number;
  permissionId: string;
}

// Session types
export interface UserSession {
  id: string;
  userId: number;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
  isCurrent: boolean;
}

// Email & Notification types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailQueue {
  id: string;
  userId: number;
  recipientEmail: string;
  templateId: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  sentAt?: string;
  error?: string;
  retryCount: number;
}

export interface QueueStatus {
  totalQueued: number;
  totalSent: number;
  totalFailed: number;
  averageProcessingTime: number;
  oldestQueuedItem?: string;
}

export interface SendEmailNotificationRequest {
  toEmail?: string;
  templateId?: string;
  templateName?: string;
  variables?: Record<string, string>;
  subject?: string;
  content?: string;
}

export interface EmailLog {
  id: number;
  userId: number;
  recipientEmail: string;
  subject: string;
  templateId?: string;
  status: 'sent' | 'failed' | 'bounced';
  sentAt: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  userId: number;
  emailNotifications: boolean;
  licenseExpiryNotification: boolean;
  accountActivityNotification: boolean;
  systemAnnouncementsNotification: boolean;
  weeklyDigest: boolean;
  digestDay?: string;
  notificationFrequency: 'immediate' | 'daily' | 'weekly' | 'none';
}

export interface CreateEmailTemplateRequest {
  name: string;
  subject: string;
  content: string;
  variables?: string[];
}

export interface UpdateEmailTemplateRequest {
  name?: string;
  subject?: string;
  content?: string;
  variables?: string[];
}

// Machine Fingerprint types
export interface MachineFingerprint {
  id: string;
  fingerprint: string;
  userId: number;
  deviceName: string;
  deviceType: string; // 'desktop', 'laptop', 'mobile', 'tablet'
  os: string;
  osVersion: string;
  browser?: string;
  hashedHwInfo: string;
  cpuInfo?: string;
  ramSize?: number;
  diskSize?: number;
  gpuInfo?: string;
  macAddress?: string;
  firstSeen: string;
  lastSeen: string;
  trustLevel: 'trusted' | 'untrusted' | 'unknown';
  isBlocked: boolean;
  metadata?: Record<string, any>;
}

export interface MachineFingerprintRequest {
  fingerprint: string;
  deviceName: string;
  deviceType: string;
  os: string;
  osVersion: string;
  browser?: string;
  cpuInfo?: string;
  ramSize?: number;
  diskSize?: number;
  gpuInfo?: string;
  macAddress?: string;
}

export interface BlockMachineFingerprintRequest {
  deviceFingerprint: string;
  reason?: string;
}

export interface TrustMachineFingerprintRequest {
  deviceFingerprint: string;
  trustDuration?: number; // in days
}

export interface MachineFingerprintStatistics {
  totalDevices: number;
  trustedDevices: number;
  untrustedDevices: number;
  blockedDevices: number;
  mostCommonOS: string;
  mostCommonBrowser: string;
  averageFirstSeenDaysAgo: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Advanced Analytics types
export interface UserGrowthAnalytics {
  period: string;
  newUsersCount: number;
  activeUsersCount: number;
  inactiveUsersCount: number;
  churnRate: number;
  growthRate: number;
  trend: { date: string; count: number }[];
}

export interface LicenseUsageAnalytics {
  period: string;
  totalLicensesIssued: number;
  activeLicensePercentage: number;
  expiredLicensePercentage: number;
  averageLicenseLifetime: number;
  licenseRenewalRate: number;
  licenseUtilizationCost: number;
  trend: { date: string; active: number; expired: number; total: number }[];
}

export interface ActivationAnalytics {
  period: string;
  totalActivations: number;
  uniqueDevices: number;
  avgActivationsPerLicense: number;
  peakActivationTime: string;
  topCountries: { country: string; count: number }[];
  topIPs: { ip: string; count: number; country: string }[];
  activationSuccessRate: number;
  failedActivationRate: number;
}

export interface SystemHealthAnalytics {
  period: string;
  apiUptime: number;
  databaseUptime: number;
  cacheHitRate: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  dailyActiveUsers: number;
  transactionsPerSecond: number;
  storageUsage: {
    totalGB: number;
    databaseGB: number;
    cacheGB: number;
    logsGB: number;
  };
}

export interface RevenueAnalytics {
  period: string;
  totalRevenue: number;
  licenseRevenue: number;
  renewalRevenue: number;
  averageRevenuePerUser: number;
  conversionRate: number;
  churnRateByValue: number;
  topProductsByRevenue: { product: string; revenue: number }[];
  monthlyRecurringRevenue: number;
  yearlyRecurringRevenue: number;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  reportType: string;
  metrics: string[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  generatedAt?: string;
  data?: Record<string, any>;
}

export interface CreateCustomReportRequest {
  name: string;
  description?: string;
  reportType: string;
  metrics: string[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters?: Record<string, any>;
}
