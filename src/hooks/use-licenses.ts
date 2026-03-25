'use client';

import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useCurrentUser } from './use-auth';
import { dashboardService } from '@/services/dashboard.service';
import { 
  licenseService, 
  type GetLicensesParams,
  type CreateLicenseRequest,
  type ActivateLicenseRequest,
  type ValidateLicenseRequest,
  type HeartbeatRequest,
  type DeactivateLicenseRequest,
} from '@/services/license.service';
import { 
  LicenseStatus,
  type GenerateLicenseRequest,
  type RevokeLicenseRequest,
  type ExportLicensesRequest,
  type BulkLicenseOperation,
} from '@/types/api';
import { toast } from 'sonner';

export const useLicenses = (params?: GetLicensesParams) => {
  return useQuery({
    queryKey: ['licenses', JSON.stringify(params)],
    queryFn: () => licenseService.getLicenses(params),
    placeholderData: keepPreviousData,
  });
};

export const useLicense = (id: number) => {
  return useQuery({
    queryKey: ['license', id],
    queryFn: () => licenseService.getLicenseById(id),
    enabled: !!id,
  });
};

export const useCreateLicense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateLicenseRequest) => licenseService.createLicense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('License created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.Message || 'Creation failed');
    },
  });
};

export const useUpdateLicenseStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: LicenseStatus }) => 
      licenseService.updateLicenseStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['license', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('License status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.Message || 'Update failed');
    },
  });
};

export const useRevokeLicense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => licenseService.revokeLicense(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['license', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('License revoked');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.Message || 'Revocation failed');
    },
  });
};

export const useActivateLicense = () => {
  return useMutation({
    mutationFn: (data: ActivateLicenseRequest) => licenseService.activateLicense(data),
    onSuccess: () => {
      toast.success('License activated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.Message || 'Activation failed');
    },
  });
};

export const useValidateLicense = () => {
  return useMutation({
    mutationFn: (data: ValidateLicenseRequest) => licenseService.validateLicense(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.Message || 'Validation failed');
    },
  });
};

export const useLicenseHeartbeat = () => {
  return useMutation({
    mutationFn: (data: HeartbeatRequest) => licenseService.heartbeat(data),
    onError: (error: any) => {
      console.error('Heartbeat failed:', error);
    },
  });
};

export const useDeactivateLicense = () => {
  return useMutation({
    mutationFn: (data: DeactivateLicenseRequest) => licenseService.deactivateLicense(data),
    onSuccess: () => {
      toast.success('License deactivated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.Message || 'Deactivation failed');
    },
  });
};

export const useLicenseActivations = (licenseId: number) => {
  return useQuery({
    queryKey: ['licenseActivations', licenseId],
    queryFn: () => licenseService.getActivations(licenseId),
    enabled: !!licenseId,
  });
};

export const useGenerateLicense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: GenerateLicenseRequest) => licenseService.generateLicense(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('License generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Generation failed');
    },
  });
};

export const useRevokeLicenseWithReason = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: RevokeLicenseRequest) => licenseService.revokeLicenseWithReason(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['license', variables.licenseId] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('License revoked');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Revocation failed');
    },
  });
};

export const useCheckLicense = () => {
  return useMutation({
    mutationFn: (licenseKey: string) => licenseService.checkLicense(licenseKey),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Check failed');
    },
  });
};

export const useExportLicenses = () => {
  return useMutation({
    mutationFn: (request: ExportLicensesRequest) => licenseService.exportLicenses(request),
    onSuccess: (blob, variables) => {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `licenses_export_${timestamp}.${variables.format}`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Licenses exported as ${variables.format.toUpperCase()}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Export failed');
    },
  });
};

export const useLicenseStatistics = () => {
  return useQuery({
    queryKey: ['licenseStatistics'],
    queryFn: () => licenseService.getLicenseStatistics(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useBulkLicenseOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (operation: BulkLicenseOperation) => licenseService.bulkLicenseOperation(operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success('Bulk operation started');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Operation failed');
    },
  });
};

export const useActivationLimit = (licenseId: number) => {
  return useQuery({
    queryKey: ['activationLimit', licenseId],
    queryFn: () => licenseService.getActivationLimit(licenseId),
    enabled: !!licenseId,
  });
};

export interface UserLicenseStats {
  activeLicenses: number;
  expiringLicenses: number;
  expiredLicenses: number;
  totalLicenses: number;
}

export const useUserLicenseStats = () => {
  const { data: user } = useCurrentUser();
  
  return useQuery({
    queryKey: ['userLicenseStats', user?.id],
    queryFn: async (): Promise<UserLicenseStats> => {
      if (!user?.id) {
        return { activeLicenses: 0, expiringLicenses: 0, expiredLicenses: 0, totalLicenses: 0 };
      }

      try {
        // Use dashboard endpoint which returns user's license stats
        // This endpoint is designed for regular users and returns their own stats
        const dashboardData = await dashboardService.getDashboardUser();
        
        return {
          activeLicenses: dashboardData.licensesActive || 0,
          expiringLicenses: dashboardData.licensesExpiring || 0,
          expiredLicenses: 0, // Not provided by dashboard endpoint, would need separate calculation
          totalLicenses: dashboardData.licensesOwned || 0,
        };
      } catch (error: any) {
        // If API call fails, return empty stats instead of crashing
        console.error('Failed to fetch user license stats:', error);
        return { activeLicenses: 0, expiringLicenses: 0, expiredLicenses: 0, totalLicenses: 0 };
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
