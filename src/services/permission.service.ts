import { apiClient } from '@/lib/api-client';
import type {
  Permission,
  UserPermissions,
  RolePermissions,
  GrantPermissionRequest,
  RevokePermissionRequest,
  SetRolePermissionsRequest,
  CheckPermissionRequest,
  CheckPermissionResponse,
  UserRole,
} from '@/types/api';

export const permissionService = {
  /**
   * Get all permissions for a specific user
   */
  async getUserPermissions(userId: number): Promise<UserPermissions> {
    const response = await apiClient.get<any>(`/permissions/users/${userId}`);
    return response.data || response;
  },

  /**
   * Get all permissions for a specific role
   */
  async getRolePermissions(role: UserRole): Promise<RolePermissions> {
    const response = await apiClient.get<any>(`/permissions/roles/${role}`);
    return response.data || response;
  },

  /**
   * Grant a permission to a user
   */
  async grantPermission(request: GrantPermissionRequest): Promise<UserPermissions> {
    const response = await apiClient.post<any>('/permissions/grant', request);
    return response.data || response;
  },

  /**
   * Revoke a permission from a user
   */
  async revokePermission(request: RevokePermissionRequest): Promise<UserPermissions> {
    const response = await apiClient.post<any>('/permissions/revoke', request);
    return response.data || response;
  },

  /**
   * Set all permissions for a specific role
   */
  async setRolePermissions(request: SetRolePermissionsRequest): Promise<RolePermissions> {
    const response = await apiClient.post<any>('/permissions/roles', request);
    return response.data || response;
  },

  /**
   * Reset a user's permissions to their role defaults
   */
  async resetUserPermissions(userId: number): Promise<UserPermissions> {
    const response = await apiClient.post<any>(`/permissions/users/${userId}/reset`, {});
    return response.data || response;
  },

  /**
   * Check if current user or specified user has a specific permission
   */
  async checkPermission(permissionId: string, userId?: number): Promise<CheckPermissionResponse> {
    const request: CheckPermissionRequest = { permissionId };
    if (userId) {
      request.userId = userId;
    }
    const response = await apiClient.post<any>('/permissions/check', request);
    return response.data || response;
  },

  /**
   * Check multiple permissions at once
   */
  async checkPermissions(permissionIds: string[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    for (const permissionId of permissionIds) {
      const result = await this.checkPermission(permissionId);
      results[permissionId] = result.hasPermission;
    }
    return results;
  },
};
