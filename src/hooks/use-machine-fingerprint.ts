'use client';

import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  machineFingerprintService,
  type GetMachineFingerprintsParams,
} from '@/services/machine-fingerprint.service';
import {
  type MachineFingerprintRequest,
  type BlockMachineFingerprintRequest,
  type TrustMachineFingerprintRequest,
} from '@/types/api';
import { toast } from 'sonner';

export const useMachineFingerprints = (params?: GetMachineFingerprintsParams) => {
  return useQuery({
    queryKey: ['machineFingerprints', params],
    queryFn: () => machineFingerprintService.getMachineFingerprints(params),
    placeholderData: keepPreviousData,
  });
};

export const useMachineFingerprint = (id: string) => {
  return useQuery({
    queryKey: ['machineFingerprint', id],
    queryFn: () => machineFingerprintService.getMachineFingerprint(id),
    enabled: !!id,
  });
};

export const useRegisterFingerprint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: MachineFingerprintRequest) =>
      machineFingerprintService.registerFingerprint(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machineFingerprints'] });
      toast.success('Device registered successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to register device');
    },
  });
};

export const useUpdateFingerprint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: Partial<MachineFingerprintRequest> }) =>
      machineFingerprintService.updateFingerprint(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['machineFingerprints'] });
      queryClient.invalidateQueries({ queryKey: ['machineFingerprint', variables.id] });
      toast.success('Device updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update device');
    },
  });
};

export const useBlockFingerprint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: BlockMachineFingerprintRequest) =>
      machineFingerprintService.blockFingerprint(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machineFingerprints'] });
      toast.success('Device blocked successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to block device');
    },
  });
};

export const useUnblockFingerprint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (deviceFingerprint: string) =>
      machineFingerprintService.unblockFingerprint(deviceFingerprint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machineFingerprints'] });
      toast.success('Device unblocked successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unblock device');
    },
  });
};

export const useTrustFingerprint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: TrustMachineFingerprintRequest) =>
      machineFingerprintService.trustFingerprint(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machineFingerprints'] });
      toast.success('Device marked as trusted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to trust device');
    },
  });
};

export const useRemoveTrust = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (deviceFingerprint: string) =>
      machineFingerprintService.removeTrust(deviceFingerprint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machineFingerprints'] });
      toast.success('Device trust removed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove trust');
    },
  });
};

export const useMachineFingerprintStatistics = () => {
  return useQuery({
    queryKey: ['machineFingerprintStatistics'],
    queryFn: () => machineFingerprintService.getMachineFingerprintStatistics(),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

export const useUserDevices = (userId: number) => {
  return useQuery({
    queryKey: ['userDevices', userId],
    queryFn: () => machineFingerprintService.getUserDevices(userId),
    enabled: !!userId,
  });
};

export const useDeleteOldFingerprints = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (olderThanDays: number) =>
      machineFingerprintService.deleteOldFingerprints(olderThanDays),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['machineFingerprints'] });
      toast.success(`Deleted ${data.deletedCount} old devices`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cleanup devices');
    },
  });
};
