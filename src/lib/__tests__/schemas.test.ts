/// <reference types="jest" />

import {
  // Auth Schemas
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,

  // User Schemas
  createUserSchema,
  updateUserSchema,
  bulkUserRoleUpdateSchema,
  updateProfileSchema,

  // License Schemas
  createLicenseSchema,
  generateLicenseSchema,
  revokeLicenseSchema,

  // Permission Schemas
  grantPermissionSchema,
  revokePermissionSchema,
  updateRolePermissionsSchema,

  // Email Schemas
  createEmailTemplateSchema,
  sendTestEmailSchema,
  sendBulkEmailSchema,

  // Role Schemas
  createRoleSchema,
  updateRoleSchema,

  // Session Schemas
  logoutSessionSchema,
  logoutAllSessionsSchema,

  // Device Schemas
  blockDeviceSchema,
  trustDeviceSchema,

  // Product Schemas
  createProductSchema,
  updateProductSchema,

  // Audit Schemas
  auditLogFiltersSchema,

  // Export Schemas
  exportDataSchema,

  // Settings Schemas
  updatePasswordSchema,
  update2FASchema,
  rotateTokenSchema,
} from '@/lib/schemas';

// Helper to create ISO datetime strings
const getFutureDate = (daysFromNow: number = 30): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

const getPastDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString();
};

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login credentials', () => {
      const data = { username: 'testuser', password: 'password123' };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing username', () => {
      const data = { password: 'password123' };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const data = { username: 'testuser' };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const data = { username: 'testuser', password: '123' };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short username', () => {
      const data = { username: 'ab', password: 'password123' };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const data = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'Password123',
        passwordConfirm: 'Password123',
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        username: 'user',
        email: 'invalid-email',
        password: 'Password123',
        passwordConfirm: 'Password123',
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject weak password (lowercase only)', () => {
      const data = {
        username: 'user',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const data = {
        username: 'user',
        email: 'test@example.com',
        password: 'Password123',
        passwordConfirm: 'Password456',
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short username', () => {
      const data = {
        username: 'ab',
        email: 'test@example.com',
        password: 'Password123',
        passwordConfirm: 'Password123',
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', () => {
      const data = { email: 'user@example.com' };
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const data = { email: 'not-an-email' };
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const data = {};
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate correct reset data', () => {
      const data = {
        password: 'NewPassword123',
        passwordConfirm: 'NewPassword123',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept password without regex requirements', () => {
      const data = {
        password: 'newpassword123',
        passwordConfirm: 'newpassword123',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const data = {
        password: 'NewPassword123',
        passwordConfirm: 'NewPassword456',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const data = {
        password: 'Pass1',
        passwordConfirm: 'Pass1',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('User Validation Schemas', () => {
  describe('createUserSchema', () => {
    it('should validate correct user creation data', () => {
      const data = {
        username: 'newuser',
        email: 'new@example.com',
        fullName: 'New User',
        roleId: 1,
      };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        username: 'user',
        email: 'invalid',
        roleId: 1,
      };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing roleId', () => {
      const data = {
        username: 'user',
        email: 'test@example.com',
      };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow optional fullName', () => {
      const data = {
        username: 'user',
        email: 'test@example.com',
        roleId: 2,
      };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('updateUserSchema', () => {
    it('should validate user updates', () => {
      const data = {
        email: 'newemail@example.com',
        roleId: 2,
      };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const data = { isActive: true };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow empty update', () => {
      const data = {};
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = { email: 'not-an-email' };
      const result = updateUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('bulkUserRoleUpdateSchema', () => {
    it('should validate bulk role update', () => {
      const data = {
        userIds: [1, 2, 3],
        roleId: 2,
      };
      const result = bulkUserRoleUpdateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty user list', () => {
      const data = {
        userIds: [],
        roleId: 2,
      };
      const result = bulkUserRoleUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject negative user IDs', () => {
      const data = {
        userIds: [-1, 2],
        roleId: 2,
      };
      const result = bulkUserRoleUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing roleId', () => {
      const data = { userIds: [1, 2] };
      const result = bulkUserRoleUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate profile update', () => {
      const data = {
        fullName: 'John Doe',
        email: 'john@example.com',
      };
      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow optional avatar', () => {
      const data = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        avatar: 'https://example.com/avatar.jpg',
      };
      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL for avatar', () => {
      const data = {
        fullName: 'Test User',
        email: 'test@example.com',
        avatar: 'not-a-url',
      };
      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty fullName', () => {
      const data = {
        fullName: '',
        email: 'test@example.com',
      };
      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const data = {
        fullName: 'Test User',
        email: 'invalid',
      };
      const result = updateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('License Validation Schemas', () => {
  describe('createLicenseSchema', () => {
    it('should validate license creation', () => {
      const data = {
        key: 'LICENSE-2024-001',
        userId: 1,
        productId: 2,
        type: 'standard',
        expiresAt: getFutureDate(90),
      };
      const result = createLicenseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject short license key', () => {
      const data = {
        key: 'SHORT',
        userId: 1,
        productId: 2,
        type: 'trial',
      };
      const result = createLicenseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid license type', () => {
      const data = {
        key: 'LICENSE-2024-001',
        userId: 1,
        productId: 2,
        type: 'invalid',
      };
      const result = createLicenseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow optional expiration date', () => {
      const data = {
        key: 'LICENSE-2024-002',
        userId: 1,
        productId: 2,
        type: 'perpetual',
      };
      const result = createLicenseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate all license types', () => {
      const types = ['trial', 'standard', 'enterprise', 'perpetual'];
      types.forEach((type) => {
        const data = {
          key: 'LICENSE-2024-001',
          userId: 1,
          productId: 2,
          type,
        };
        const result = createLicenseSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('generateLicenseSchema', () => {
    it('should validate license generation', () => {
      const data = {
        count: 10,
        type: 'standard',
        productId: 1,
        expiryDays: 365,
        maxActivations: 5,
      };
      const result = generateLicenseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject count of 0', () => {
      const data = {
        count: 0,
        type: 'trial',
        productId: 1,
      };
      const result = generateLicenseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject count exceeding 1000', () => {
      const data = {
        count: 1001,
        type: 'trial',
        productId: 1,
      };
      const result = generateLicenseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject negative maxActivations', () => {
      const data = {
        count: 10,
        type: 'standard',
        productId: 1,
        maxActivations: -1,
      };
      const result = generateLicenseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow optional fields', () => {
      const data = {
        count: 5,
        type: 'enterprise',
        productId: 1,
      };
      const result = generateLicenseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('revokeLicenseSchema', () => {
    it('should validate license revocation', () => {
      const data = {
        licenseId: 'lic-123',
        reason: 'Customer requested cancellation',
      };
      const result = revokeLicenseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject short reason', () => {
      const data = {
        licenseId: 'lic-123',
        reason: 'Bad',
      };
      const result = revokeLicenseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing reason', () => {
      const data = { licenseId: 'lic-123' };
      const result = revokeLicenseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing licenseId', () => {
      const data = { reason: 'Valid reason for revocation' };
      const result = revokeLicenseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('Permission Validation Schemas', () => {
  describe('grantPermissionSchema', () => {
    it('should validate permission grant', () => {
      const data = {
        userId: 1,
        resourceId: 'dashboard',
        action: 'read',
      };
      const result = grantPermissionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing resourceId', () => {
      const data = {
        userId: 1,
        action: 'write',
      };
      const result = grantPermissionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid action', () => {
      const data = {
        userId: 1,
        resourceId: 'dashboard',
        action: 'execute',
      };
      const result = grantPermissionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate all valid actions', () => {
      const actions = ['read', 'write', 'delete', 'admin'];
      actions.forEach((action) => {
        const data = {
          userId: 1,
          resourceId: 'dashboard',
          action,
        };
        const result = grantPermissionSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('revokePermissionSchema', () => {
    it('should validate permission revocation', () => {
      const data = {
        userId: 1,
        permissionId: 5,
      };
      const result = revokePermissionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject negative permissionId', () => {
      const data = {
        userId: 1,
        permissionId: -1,
      };
      const result = revokePermissionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing permissionId', () => {
      const data = { userId: 1 };
      const result = revokePermissionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('updateRolePermissionsSchema', () => {
    it('should validate role permissions update', () => {
      const data = {
        roleId: 1,
        permissions: [
          {
            resourceId: 'users',
            actions: ['read', 'write'],
          },
          {
            resourceId: 'licenses',
            actions: ['read'],
          },
        ],
      };
      const result = updateRolePermissionsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty permissions array', () => {
      const data = {
        roleId: 1,
        permissions: [],
      };
      const result = updateRolePermissionsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid action in permissions', () => {
      const data = {
        roleId: 1,
        permissions: [
          {
            resourceId: 'users',
            actions: ['read', 'invalid'],
          },
        ],
      };
      const result = updateRolePermissionsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing roleId', () => {
      const data = {
        permissions: [
          {
            resourceId: 'users',
            actions: ['read'],
          },
        ],
      };
      const result = updateRolePermissionsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('Email Validation Schemas', () => {
  describe('createEmailTemplateSchema', () => {
    it('should validate email template', () => {
      const data = {
        name: 'Welcome Email',
        subject: 'Welcome to our app',
        bodyHtml: '<p>Hello {{name}},</p><p>Welcome!</p>',
        bodyText: 'Hello {{name}}, Welcome!',
        variables: ['name', 'email'],
      };
      const result = createEmailTemplateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject short template name', () => {
      const data = {
        name: 'WE',
        subject: 'Subject',
        bodyHtml: '<p>Long enough content</p>',
      };
      const result = createEmailTemplateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept body with exactly 10 characters', () => {
      const data = {
        name: 'Template Name',
        subject: 'Subject',
        bodyHtml: '0123456789',
      };
      const result = createEmailTemplateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing subject', () => {
      const data = {
        name: 'Template Name',
        bodyHtml: '<p>This is long enough content</p>',
      };
      const result = createEmailTemplateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow optional bodyText and variables', () => {
      const data = {
        name: 'Simple Template',
        subject: 'Test Subject',
        bodyHtml: '<p>This is a proper email template</p>',
      };
      const result = createEmailTemplateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('sendTestEmailSchema', () => {
    it('should validate test email', () => {
      const data = {
        templateId: 1,
        recipientEmail: 'test@example.com',
        variables: { name: 'John', email: 'john@example.com' },
      };
      const result = sendTestEmailSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        templateId: 1,
        recipientEmail: 'not-an-email',
      };
      const result = sendTestEmailSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject negative templateId', () => {
      const data = {
        templateId: -1,
        recipientEmail: 'test@example.com',
      };
      const result = sendTestEmailSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow optional variables', () => {
      const data = {
        templateId: 1,
        recipientEmail: 'test@example.com',
      };
      const result = sendTestEmailSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('sendBulkEmailSchema', () => {
    it('should validate bulk email send', () => {
      const data = {
        templateId: 1,
        recipients: ['user1@example.com', 'user2@example.com'],
        variables: [{ name: 'John' }, { name: 'Jane' }],
      };
      const result = sendBulkEmailSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty recipients', () => {
      const data = {
        templateId: 1,
        recipients: [],
      };
      const result = sendBulkEmailSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email in recipients', () => {
      const data = {
        templateId: 1,
        recipients: ['valid@example.com', 'invalid-email'],
      };
      const result = sendBulkEmailSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow optional variables', () => {
      const data = {
        templateId: 1,
        recipients: ['user1@example.com', 'user2@example.com'],
      };
      const result = sendBulkEmailSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('Role Validation Schemas', () => {
  describe('createRoleSchema', () => {
    it('should validate role creation', () => {
      const data = {
        name: 'Moderator',
        description: 'Can moderate content',
        permissions: [1, 2, 3],
      };
      const result = createRoleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject short role name', () => {
      const data = {
        name: 'MO',
        description: 'Test',
      };
      const result = createRoleSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow optional description and permissions', () => {
      const data = {
        name: 'Editor',
      };
      const result = createRoleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject negative permission IDs', () => {
      const data = {
        name: 'Invalid Role',
        permissions: [-1, 2],
      };
      const result = createRoleSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('updateRoleSchema', () => {
    it('should validate role update', () => {
      const data = {
        name: 'Updated Role',
        description: 'Updated description',
      };
      const result = updateRoleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow all fields optional', () => {
      const data = {};
      const result = updateRoleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject short name', () => {
      const data = { name: 'UR' };
      const result = updateRoleSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow updating only permissions', () => {
      const data = { permissions: [1, 2, 3, 4] };
      const result = updateRoleSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('Session Validation Schemas', () => {
  describe('logoutSessionSchema', () => {
    it('should validate session logout', () => {
      const data = {
        sessionId: 'session-123',
        reason: 'User requested logout',
      };
      const result = logoutSessionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty session ID', () => {
      const data = { sessionId: '' };
      const result = logoutSessionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow optional reason', () => {
      const data = { sessionId: 'session-123' };
      const result = logoutSessionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing sessionId', () => {
      const data = { reason: 'Some reason' };
      const result = logoutSessionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('logoutAllSessionsSchema', () => {
    it('should validate logout all sessions', () => {
      const data = {
        reason: 'Security concern',
        excludeCurrentSession: false,
      };
      const result = logoutAllSessionsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate logout all with defaults', () => {
      const data = {};
      const result = logoutAllSessionsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow optional reason', () => {
      const data = { excludeCurrentSession: true };
      const result = logoutAllSessionsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate excludeCurrentSession flag', () => {
      const data = {
        reason: 'Test reason',
        excludeCurrentSession: false,
      };
      const result = logoutAllSessionsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('Device Validation Schemas', () => {
  describe('blockDeviceSchema', () => {
    it('should validate device block', () => {
      const data = {
        deviceFingerprint: 'fp-123abc',
        reason: 'Suspicious activity detected',
        duration: 'permanent',
      };
      const result = blockDeviceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate all duration options', () => {
      const durations = ['1hour', '24hours', 'permanent'];
      durations.forEach((duration) => {
        const data = {
          deviceFingerprint: 'fp-123',
          reason: 'Test block',
          duration,
        };
        const result = blockDeviceSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid duration', () => {
      const data = {
        deviceFingerprint: 'fp-123',
        reason: 'Test',
        duration: 'invalid',
      };
      const result = blockDeviceSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty device fingerprint', () => {
      const data = {
        deviceFingerprint: '',
        reason: 'Test',
        duration: 'permanent',
      };
      const result = blockDeviceSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow optional reason', () => {
      const data = {
        deviceFingerprint: 'fp-123',
        duration: '24hours',
      };
      const result = blockDeviceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('trustDeviceSchema', () => {
    it('should validate device trust', () => {
      const data = {
        deviceFingerprint: 'fp-123abc',
        trustDuration: 'permanent',
      };
      const result = trustDeviceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate all trust duration options', () => {
      const durations = ['session', '30days', 'permanent'];
      durations.forEach((duration) => {
        const data = {
          deviceFingerprint: 'fp-123',
          trustDuration: duration,
        };
        const result = trustDeviceSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid trust duration', () => {
      const data = {
        deviceFingerprint: 'fp-123',
        trustDuration: 'invalid',
      };
      const result = trustDeviceSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty device fingerprint', () => {
      const data = {
        deviceFingerprint: '',
        trustDuration: 'permanent',
      };
      const result = trustDeviceSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow default trust duration', () => {
      const data = {
        deviceFingerprint: 'fp-123abc',
      };
      const result = trustDeviceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('Product Validation Schemas', () => {
  describe('createProductSchema', () => {
    it('should validate product creation', () => {
      const data = {
        name: 'Product Name',
        sku: 'SKU-001',
        version: '1.0.0',
        description: 'A great product',
        category: 'Software',
        price: 99.99,
      };
      const result = createProductSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid version format', () => {
      const data = {
        name: 'Product',
        sku: 'SKU-001',
        version: '1.0',
      };
      const result = createProductSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short product name', () => {
      const data = {
        name: 'AB',
        sku: 'SKU-001',
        version: '1.0.0',
      };
      const result = createProductSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short SKU', () => {
      const data = {
        name: 'Product',
        sku: 'AB',
        version: '1.0.0',
      };
      const result = createProductSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const data = {
        name: 'Product',
        sku: 'SKU-001',
        version: '1.0.0',
        price: -10,
      };
      const result = createProductSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow optional fields', () => {
      const data = {
        name: 'Basic Product',
        sku: 'SKU-002',
        version: '2.0.0',
      };
      const result = createProductSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate version format with various numbers', () => {
      const validVersions = ['0.0.1', '1.2.3', '10.20.30', '255.255.255'];
      validVersions.forEach((version) => {
        const data = {
          name: 'Product',
          sku: 'SKU-001',
          version,
        };
        const result = createProductSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('updateProductSchema', () => {
    it('should validate product update', () => {
      const data = {
        name: 'Updated Product',
        version: '2.0.0',
      };
      const result = updateProductSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow empty update object', () => {
      const data = {};
      const result = updateProductSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid version format in update', () => {
      const data = {
        version: '2.0',
      };
      const result = updateProductSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow partial update with isActive', () => {
      const data = { isActive: false };
      const result = updateProductSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow updating category and price', () => {
      const data = {
        category: 'New Category',
        price: 49.99,
      };
      const result = updateProductSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('Audit and Export Validation Schemas', () => {
  describe('auditLogFiltersSchema', () => {
    it('should validate audit log filters', () => {
      const data = {
        userId: 1,
        actionType: 'login',
        resourceType: 'user',
        status: 'success',
      };
      const result = auditLogFiltersSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow date range filters', () => {
      const data = {
        startDate: getPastDate(),
        endDate: getFutureDate(),
      };
      const result = auditLogFiltersSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow empty filters', () => {
      const data = {};
      const result = auditLogFiltersSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate all status options', () => {
      const statuses = ['success', 'failure', 'all'];
      statuses.forEach((status) => {
        const data = { status };
        const result = auditLogFiltersSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const data = { status: 'invalid' };
      const result = auditLogFiltersSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject negative userId', () => {
      const data = { userId: -1 };
      const result = auditLogFiltersSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('exportDataSchema', () => {
    it('should validate export with CSV format', () => {
      const data = {
        format: 'csv',
      };
      const result = exportDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate export with JSON format', () => {
      const data = {
        format: 'json',
      };
      const result = exportDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate export with XLSX format', () => {
      const data = {
        format: 'xlsx',
      };
      const result = exportDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid format', () => {
      const data = { format: 'xml' };
      const result = exportDataSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow export with date range', () => {
      const data = {
        format: 'csv',
        startDate: getPastDate(),
        endDate: getFutureDate(),
      };
      const result = exportDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow export with column selection', () => {
      const data = {
        format: 'json',
        columns: ['id', 'name', 'email'],
      };
      const result = exportDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow export with all options', () => {
      const data = {
        format: 'xlsx',
        startDate: getPastDate(),
        endDate: getFutureDate(),
        columns: ['username', 'email', 'status'],
      };
      const result = exportDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('Settings Validation Schemas', () => {
  describe('updatePasswordSchema', () => {
    it('should validate password update', () => {
      const data = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword456',
        confirmPassword: 'NewPassword456',
      };
      const result = updatePasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject weak new password (no uppercase)', () => {
      const data = {
        currentPassword: 'OldPassword123',
        newPassword: 'newpassword456',
        confirmPassword: 'newpassword456',
      };
      const result = updatePasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const data = {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword456',
        confirmPassword: 'NewPassword789',
      };
      const result = updatePasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short current password', () => {
      const data = {
        currentPassword: 'Short1',
        newPassword: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      };
      const result = updatePasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate strong new password with numbers and uppercase', () => {
      const data = {
        currentPassword: 'CurrentPass123',
        newPassword: 'SuperSecurePass789',
        confirmPassword: 'SuperSecurePass789',
      };
      const result = updatePasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('update2FASchema', () => {
    it('should validate enabling 2FA with TOTP', () => {
      const data = {
        enabled: true,
        method: 'totp',
      };
      const result = update2FASchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate enabling 2FA with email', () => {
      const data = {
        enabled: true,
        method: 'email',
      };
      const result = update2FASchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate enabling 2FA with SMS', () => {
      const data = {
        enabled: true,
        method: 'sms',
      };
      const result = update2FASchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate disabling 2FA', () => {
      const data = {
        enabled: false,
      };
      const result = update2FASchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid 2FA method', () => {
      const data = {
        enabled: true,
        method: 'invalid',
      };
      const result = update2FASchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid verification code (too short)', () => {
      const data = {
        enabled: true,
        method: 'totp',
        verificationCode: '123',
      };
      const result = update2FASchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept valid 6-digit verification code', () => {
      const data = {
        enabled: true,
        method: 'totp',
        verificationCode: '123456',
      };
      const result = update2FASchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject 7-digit verification code', () => {
      const data = {
        enabled: true,
        method: 'email',
        verificationCode: '1234567',
      };
      const result = update2FASchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('rotateTokenSchema', () => {
    it('should validate token rotation with reason', () => {
      const data = {
        reason: 'Security update after incident',
      };
      const result = rotateTokenSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate token rotation with current token', () => {
      const data = {
        currentToken: 'old-token-value',
      };
      const result = rotateTokenSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow empty rotation (defaults)', () => {
      const data = {};
      const result = rotateTokenSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate with all options', () => {
      const data = {
        currentToken: 'token-123',
        reason: 'Scheduled rotation',
      };
      const result = rotateTokenSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
