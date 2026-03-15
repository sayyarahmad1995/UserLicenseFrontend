'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-auth';
import {
  useMachineFingerprints,
  useBlockFingerprint,
  useUnblockFingerprint,
  useTrustFingerprint,
  useDeleteOldFingerprints,
  useMachineFingerprintStatistics,
} from '@/hooks/use-machine-fingerprint';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  AlertCircle,
  Ban,
  Trash2,
  Shield,
  Lock,
  Smartphone,
  Monitor,
  Globe,
  Search,
} from 'lucide-react';
import { Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import type { MachineFingerprint } from '@/types/api';

const DEVICE_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  desktop: { icon: <Monitor className="h-4 w-4" />, color: 'text-blue-600' },
  mobile: { icon: <Smartphone className="h-4 w-4" />, color: 'text-green-600' },
  tablet: { icon: <Smartphone className="h-4 w-4" />, color: 'text-purple-600' },
};

const TRUST_STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  trusted: {
    icon: <Shield className="h-4 w-4" />,
    label: 'Trusted',
    color: 'bg-green-100 text-green-800',
  },
  blocked: {
    icon: <Ban className="h-4 w-4" />,
    label: 'Blocked',
    color: 'bg-red-100 text-red-800',
  },
  pending: {
    icon: <AlertCircle className="h-4 w-4" />,
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
  },
};

const StatCard = ({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% this week
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-100 rounded-lg">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const MachineRow = ({
  machine,
  onBlock,
  onUnblock,
  onTrust,
  onRemove,
}: {
  machine: MachineFingerprint;
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
  onTrust: (id: string) => void;
  onRemove: (id: string) => void;
}) => {
  const trustStatus = machine.isBlocked ? 'blocked' : machine.trustLevel === 'trusted' ? 'trusted' : 'pending';
  const statusConfig = TRUST_STATUS_CONFIG[trustStatus];
  const deviceConfig = DEVICE_TYPE_CONFIG[machine.deviceType] || { icon: <Monitor className="h-4 w-4" />, color: 'text-blue-600' };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <div className={deviceConfig.color}>{deviceConfig.icon}</div>
          <span>{machine.deviceName || 'Unknown Device'}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm">
        <p className="font-medium">User {machine.userId}</p>
        <p className="text-xs text-gray-600">{machine.fingerprint.slice(0, 8)}</p>
      </TableCell>
      <TableCell className="text-sm">
        <p>{machine.os}</p>
        <p className="text-xs text-gray-600">{machine.browser || 'Unknown'}</p>
      </TableCell>
      <TableCell className="text-sm">
        <p>Hardware</p>
        <p className="text-xs text-gray-600">{machine.ramSize? machine.ramSize + ' GB RAM' : 'N/A'}</p>
      </TableCell>
      <TableCell>
        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded text-sm ${statusConfig.color}`}>
          {statusConfig.icon}
          {statusConfig.label}
        </div>
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        <p className="text-xs">First: {new Date(machine.firstSeen).toLocaleDateString()}</p>
        <p className="text-xs">Last: {new Date(machine.lastSeen).toLocaleDateString()}</p>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          {machine.isBlocked ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUnblock(machine.id)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Unblock device"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          ) : (
            <>
              {machine.trustLevel !== 'trusted' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onTrust(machine.id)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  title="Trust device"
                >
                  <Shield className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onBlock(machine.id)}
                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                title="Block device"
              >
                <Ban className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(machine.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Remove device"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default function MachineFingerprints() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  // Role guard - only admins can access this page
  useEffect(() => {
    if (!userLoading && user?.role !== 'Admin') {
      router.push('/dashboard/user');
      return;
    }
  }, [user, userLoading, router]);

  // Show loading while checking auth
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (user?.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'trusted' | 'blocked' | 'pending'>('all');

  const { data: machines, isLoading, refetch } = useMachineFingerprints({
    pageNumber: 1,
    pageSize: 100,
  });
  const stats = useMachineFingerprintStatistics();
  const blockMachine = useBlockFingerprint();
  const unblockMachine = useUnblockFingerprint();
  const trustMachine = useTrustFingerprint();
  const removeMachine = useDeleteOldFingerprints();

  const filteredMachines = ((machines?.data as MachineFingerprint[]) || [])
    .filter((machine) => {
      const matchesSearch =
        machine.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.fingerprint.includes(searchTerm);

      const trustStatus = machine.isBlocked ? 'blocked' : machine.trustLevel === 'trusted' ? 'trusted' : 'pending';
      const matchesFilter = filterStatus === 'all' || trustStatus === filterStatus;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => 
      new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    );

  const handleBlock = (id: string) => {
    blockMachine.mutate(
      { deviceFingerprint: id },
      {
        onSuccess: () => {
          toast.success('Device blocked successfully');
          refetch();
        },
        onError: () => {
          toast.error('Failed to block device');
        },
      }
    );
  };

  const handleUnblock = (id: string) => {
    unblockMachine.mutate(id, {
      onSuccess: () => {
        toast.success('Device unblocked successfully');
        refetch();
      },
      onError: () => {
        toast.error('Failed to unblock device');
      },
    });
  };

  const handleTrust = (id: string) => {
    trustMachine.mutate(
      { deviceFingerprint: id },
      {
        onSuccess: () => {
          toast.success('Device marked as trusted');
          refetch();
        },
        onError: () => {
          toast.error('Failed to trust device');
        },
      }
    );
  };

  const handleRemove = (id: string) => {
    if (window.confirm('Are you sure you want to remove this device? This action cannot be undone.')) {
      removeMachine.mutate(90, {
        onSuccess: () => {
          toast.success('Device removed successfully');
          refetch();
        },
        onError: () => {
          toast.error('Failed to remove device');
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Machine Fingerprints</h1>
          <p className="text-gray-600 mt-2">Manage trusted and blocked devices across your platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Devices"
            value={stats.data?.totalDevices || 0}
            icon={<Smartphone className="h-6 w-6 text-blue-600" />}
          />
          <StatCard
            title="Trusted Devices"
            value={stats.data?.trustedDevices || 0}
            icon={<Shield className="h-6 w-6 text-green-600" />}
          />
          <StatCard
            title="Blocked Devices"
            value={stats.data?.blockedDevices || 0}
            icon={<Ban className="h-6 w-6 text-red-600" />}
          />
          <StatCard
            title="Untrusted Devices"
            value={stats.data?.untrustedDevices || 0}
            icon={<AlertCircle className="h-6 w-6 text-yellow-600" />}
          />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by device name or fingerprint..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="trusted">Trusted Only</option>
                  <option value="blocked">Blocked Only</option>
                  <option value="pending">Pending Only</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Devices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Devices</CardTitle>
            <CardDescription>
              {filteredMachines.length} device{filteredMachines.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredMachines.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No devices found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>OS / Browser</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMachines.map((machine: MachineFingerprint) => (
                      <MachineRow
                        key={machine.id}
                        machine={machine}
                        onBlock={handleBlock}
                        onUnblock={handleUnblock}
                        onTrust={handleTrust}
                        onRemove={handleRemove}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Notes */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800">
            <ul className="list-disc list-inside space-y-2">
              <li>Trust only devices that belong to your organization</li>
              <li>Block any suspicious devices or those with unusual access patterns</li>
              <li>Regularly review pending devices and make trust decisions</li>
              <li>Remove devices that are no longer in use to maintain clean records</li>
              <li>Monitor for devices accessing from unusual locations or times</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
