'use client';

import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { userService, type GetUsersParams } from '@/services/user.service';
import { type UserStatus, type UpdateUserRoleRequest, type ExportUsersRequest, type BulkUserOperation, type KickOutUserRequest } from '@/types/api';
import { toast } from 'sonner';

export const useUsers = (params?: GetUsersParams) => {
  return useQuery({
    queryKey: ['users', JSON.stringify(params)],
    queryFn: () => userService.getUsers(params),
    placeholderData: keepPreviousData,
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: UserStatus }) => 
      userService.updateUserStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      toast.success('User status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.Message || 'Update failed');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, hardDelete }: { id: number; hardDelete?: boolean }) => 
      userService.deleteUser(id, hardDelete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.Message || 'Delete failed');
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { username: string; email: string; password: string }) => 
      userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.Message || 'Creation failed');
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: UpdateUserRoleRequest) => 
      userService.updateUserRole(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      toast.success('User role updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Update failed');
    },
  });
};

export const useKickOutUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: KickOutUserRequest) => 
      userService.kickOutUser(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      toast.success('User kicked out and logged out from all sessions');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Kick out failed');
    },
  });
};

export const useExportUsers = () => {
  return useMutation({
    mutationFn: (request: ExportUsersRequest) => 
      userService.exportUsers(request),
    onSuccess: (blob, variables) => {
      // Generate filename based on format and current date
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `users_export_${timestamp}.${variables.format}`;
      
      // Create blob URL and download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Users exported as ${variables.format.toUpperCase()}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Export failed');
    },
  });
};

export const useBulkUserOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (operation: BulkUserOperation) => 
      userService.bulkOperation(operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Bulk operation started');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Operation failed');
    },
  });
};

export const useAsyncJob = (jobId: string) => {
  return useQuery({
    queryKey: ['asyncJob', jobId],
    queryFn: () => userService.getAsyncJob(jobId),
    enabled: !!jobId,
    refetchInterval: (data: any) => {
      // Stop refetching when job is completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000; // Refetch every 2 seconds
    },
  });
};

export const useAsyncJobs = (status?: string) => {
  return useQuery({
    queryKey: ['asyncJobs', status],
    queryFn: () => userService.listAsyncJobs(status),
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};
