'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { permissionService } from '@/services/permission.service';
import type { UserRole, GrantPermissionRequest, RevokePermissionRequest, SetRolePermissionsRequest } from '@/types/api';
import { toast } from 'sonner';

/**
 * Get all permissions for a specific user
 */
export const useUserPermissions = (userId: number) => {
  return useQuery({
    queryKey: ['userPermissions', userId],
    queryFn: () => permissionService.getUserPermissions(userId),
  });
};

/**
 * Get all permissions for a specific role
 */
export const useRolePermissions = (role: UserRole) => {
  return useQuery({
    queryKey: ['rolePermissions', role],
    queryFn: () => permissionService.getRolePermissions(role),
  });
};

/**
 * Grant a permission to a user
 */
export const useGrantPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GrantPermissionRequest) =>
      permissionService.grantPermission(request),
    onSuccess: (data, variables) => {
      // Invalidate the user's permissions query
      queryClient.invalidateQueries({
        queryKey: ['userPermissions', variables.userId],
      });
      toast.success('Permission granted successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          'Failed to grant permission'
      );
    },
  });
};

/**
 * Revoke a permission from a user
 */
export const useRevokePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RevokePermissionRequest) =>
      permissionService.revokePermission(request),
    onSuccess: (data, variables) => {
      // Invalidate the user's permissions query
      queryClient.invalidateQueries({
        queryKey: ['userPermissions', variables.userId],
      });
      toast.success('Permission revoked successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          'Failed to revoke permission'
      );
    },
  });
};

/**
 * Set all permissions for a specific role
 */
export const useSetRolePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SetRolePermissionsRequest) =>
      permissionService.setRolePermissions(request),
    onSuccess: (data, variables) => {
      // Invalidate the role's permissions query
      queryClient.invalidateQueries({
        queryKey: ['rolePermissions', variables.role],
      });
      toast.success('Role permissions updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          'Failed to update role permissions'
      );
    },
  });
};

/**
 * Reset a user's permissions to their role defaults
 */
export const useResetUserPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) =>
      permissionService.resetUserPermissions(userId),
    onSuccess: (data, userId) => {
      // Invalidate the user's permissions query
      queryClient.invalidateQueries({
        queryKey: ['userPermissions', userId],
      });
      toast.success('User permissions reset to role defaults');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          'Failed to reset user permissions'
      );
    },
  });
};

/**
 * Check if the current user has a specific permission
 */
export const useCheckPermission = (permissionId: string) => {
  return useQuery({
    queryKey: ['checkPermission', permissionId],
    queryFn: () => permissionService.checkPermission(permissionId),
  });
};

/**
 * Check multiple permissions at once
 */
export const useCheckPermissions = (permissionIds: string[]) => {
  return useQuery({
    queryKey: ['checkPermissions', permissionIds],
    queryFn: () => permissionService.checkPermissions(permissionIds),
  });
};

/**
 * Check if a specific user has a specific permission
 */
export const useCheckUserPermission = (userId: number, permissionId: string) => {
  return useQuery({
    queryKey: ['checkUserPermission', userId, permissionId],
    queryFn: async () => {
      const response = await permissionService.checkPermission(permissionId, userId);
      return response.hasPermission;
    },
  });
};

/**
 * Utility hook to check if current user has permission (with fallback)
 */
export const useHasPermission = (permissionId: string | null | undefined): boolean => {
  const { data } = useCheckPermission(permissionId || '');

  if (!permissionId) {
    return true; // No permission check needed
  }

  return (data as any)?.hasPermission ?? false;
};
