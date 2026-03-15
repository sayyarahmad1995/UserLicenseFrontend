import { z } from 'zod';

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    'Password must contain uppercase, lowercase, and numbers'
  ),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ============================================================================
// USER MANAGEMENT SCHEMAS
// ============================================================================

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Invalid email address'),
  fullName: z.string().optional(),
  roleId: z.number().min(1, 'Role is required'),
  isActive: z.boolean().default(true),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50).optional(),
  email: z.string().email('Invalid email address').optional(),
  fullName: z.string().optional(),
  roleId: z.number().min(1, 'Role is required').optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const bulkUserRoleUpdateSchema = z.object({
  userIds: z.array(z.number().positive()).min(1, 'At least one user must be selected'),
  roleId: z.number().min(1, 'Role is required'),
});

export type BulkUserRoleUpdateInput = z.infer<typeof bulkUserRoleUpdateSchema>;

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email address'),
  avatar: z.string().url('Invalid URL').optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ============================================================================
// LICENSE SCHEMAS
// ============================================================================

export const createLicenseSchema = z.object({
  key: z.string().min(10, 'License key must be at least 10 characters'),
  userId: z.number().positive('User ID is required'),
  productId: z.number().positive('Product ID is required'),
  type: z.enum(['trial', 'standard', 'enterprise', 'perpetual']),
  expiresAt: z.string().datetime().optional(),
  maxActivations: z.number().min(1).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type CreateLicenseInput = z.infer<typeof createLicenseSchema>;

export const generateLicenseSchema = z.object({
  count: z.number().min(1).max(1000, 'Cannot generate more than 1000 licenses at once'),
  type: z.enum(['trial', 'standard', 'enterprise', 'perpetual']),
  productId: z.number().positive(),
  expiryDays: z.number().min(1).optional(),
  maxActivations: z.number().min(1).optional(),
  batchName: z.string().optional(),
});

export type GenerateLicenseInput = z.infer<typeof generateLicenseSchema>;

export const revokeLicenseSchema = z.object({
  licenseId: z.string(),
  reason: z.string().min(5, 'Revocation reason must be at least 5 characters'),
});

export type RevokeLicenseInput = z.infer<typeof revokeLicenseSchema>;

// ============================================================================
// PERMISSION SCHEMAS
// ============================================================================

export const grantPermissionSchema = z.object({
  userId: z.number().positive('User ID is required'),
  resourceId: z.string().min(1, 'Resource is required'),
  action: z.enum(['read', 'write', 'delete', 'admin']),
});

export type GrantPermissionInput = z.infer<typeof grantPermissionSchema>;

export const revokePermissionSchema = z.object({
  userId: z.number().positive(),
  permissionId: z.number().positive(),
});

export type RevokePermissionInput = z.infer<typeof revokePermissionSchema>;

export const updateRolePermissionsSchema = z.object({
  roleId: z.number().positive(),
  permissions: z.array(z.object({
    resourceId: z.string(),
    actions: z.array(z.enum(['read', 'write', 'delete', 'admin'])),
  })).min(1),
});

export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;

// ============================================================================
// EMAIL SCHEMAS
// ============================================================================

export const createEmailTemplateSchema = z.object({
  name: z.string().min(3, 'Template name must be at least 3 characters').max(100),
  subject: z.string().min(1, 'Subject is required'),
  bodyHtml: z.string().min(10, 'Template body must be at least 10 characters'),
  bodyText: z.string().optional(),
  variables: z.array(z.string()).optional(),
});

export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>;

export const sendTestEmailSchema = z.object({
  templateId: z.number().positive(),
  recipientEmail: z.string().email('Invalid email address'),
  variables: z.record(z.string(), z.string()).optional(),
});

export type SendTestEmailInput = z.infer<typeof sendTestEmailSchema>;

export const sendBulkEmailSchema = z.object({
  templateId: z.number().positive(),
  recipients: z.array(z.string().email()).min(1),
  variables: z.array(z.record(z.string(), z.string())).optional(),
});

export type SendBulkEmailInput = z.infer<typeof sendBulkEmailSchema>;

// ============================================================================
// ROLE SCHEMAS
// ============================================================================

export const createRoleSchema = z.object({
  name: z.string().min(3, 'Role name must be at least 3 characters').max(50),
  description: z.string().optional(),
  permissions: z.array(z.number().positive()).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().optional(),
  permissions: z.array(z.number().positive()).optional(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

// ============================================================================
// SESSION SCHEMAS
// ============================================================================

export const logoutSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  reason: z.string().optional(),
});

export type LogoutSessionInput = z.infer<typeof logoutSessionSchema>;

export const logoutAllSessionsSchema = z.object({
  reason: z.string().optional(),
  excludeCurrentSession: z.boolean().default(true),
});

export type LogoutAllSessionsInput = z.infer<typeof logoutAllSessionsSchema>;

// ============================================================================
// MACHINE FINGERPRINT SCHEMAS
// ============================================================================

export const blockDeviceSchema = z.object({
  deviceFingerprint: z.string().min(1, 'Device fingerprint is required'),
  reason: z.string().optional(),
  duration: z.enum(['1hour', '24hours', 'permanent']).default('permanent'),
});

export type BlockDeviceInput = z.infer<typeof blockDeviceSchema>;

export const trustDeviceSchema = z.object({
  deviceFingerprint: z.string().min(1, 'Device fingerprint is required'),
  trustDuration: z.enum(['session', '30days', 'permanent']).default('permanent'),
});

export type TrustDeviceInput = z.infer<typeof trustDeviceSchema>;

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

export const createProductSchema = z.object({
  name: z.string().min(3, 'Product name required').max(100),
  description: z.string().optional(),
  sku: z.string().min(3).max(50),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version format should be X.Y.Z'),
  category: z.string().optional(),
  price: z.number().min(0).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
  category: z.string().optional(),
  price: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ============================================================================
// AUDIT LOG FILTERS
// ============================================================================

export const auditLogFiltersSchema = z.object({
  userId: z.number().positive().optional(),
  actionType: z.string().optional(),
  resourceType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['success', 'failure', 'all']).default('all'),
});

export type AuditLogFiltersInput = z.infer<typeof auditLogFiltersSchema>;

// ============================================================================
// EXPORT SCHEMAS
// ============================================================================

export const exportDataSchema = z.object({
  format: z.enum(['csv', 'json', 'xlsx']).default('csv'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  columns: z.array(z.string()).optional(),
});

export type ExportDataInput = z.infer<typeof exportDataSchema>;

// ============================================================================
// SETTINGS SCHEMAS
// ============================================================================

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    'Password must contain uppercase, lowercase, and numbers'
  ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

export const update2FASchema = z.object({
  enabled: z.boolean(),
  method: z.enum(['totp', 'email', 'sms']).optional(),
  verificationCode: z.string().length(6).optional(),
});

export type Update2FAInput = z.infer<typeof update2FASchema>;

export const rotateTokenSchema = z.object({
  currentToken: z.string().optional(),
  reason: z.string().optional(),
});

export type RotateTokenInput = z.infer<typeof rotateTokenSchema>;
