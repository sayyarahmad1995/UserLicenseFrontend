'use client';

import { useRouter } from 'next/navigation';
import { useLogout, useCurrentUser } from '@/hooks/use-auth';
import { useUserLicenseStats } from '@/hooks/use-licenses';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const StatCard = ({ title, value, subtitle, variant = 'default', index = 0 }: { title: string; value: string | number; subtitle?: string; variant?: 'default' | 'success' | 'warning' | 'danger'; index?: number }) => {
  const bgColor = {
    default: 'bg-blue-50',
    success: 'bg-green-50',
    warning: 'bg-yellow-50',
    danger: 'bg-red-50',
  }[variant];

  const textColor = {
    default: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  }[variant];

  return (
    <div className={`${bgColor} p-6 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export default function UserDashboardPage() {
  const router = useRouter();
  const logoutMutation = useLogout();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: licenseStats, isLoading: statsLoading } = useUserLicenseStats();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/login');
      },
    });
  };

  if (userLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center animate-fade-in">
        <div className="flex flex-col items-center gap-4 animate-scale-in">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="animate-slide-in">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome, {user?.username || 'User'} 
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                {user?.role || 'User'}
              </span>
            </p>
          </div>
          <Button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            variant="outline"
          >
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Your Licenses Overview */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 animate-slide-in">Your Licenses</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <StatCard 
              title="Active Licenses" 
              value={licenseStats?.activeLicenses || 0}
              subtitle="Ready to use"
              variant="success"
              index={0}
            />
            <StatCard 
              title="Expiring Soon" 
              value={licenseStats?.expiringLicenses || 0}
              subtitle="Within 30 days"
              variant="warning"
              index={1}
            />
            <StatCard
              title="Expired" 
              value={licenseStats?.expiredLicenses || 0}
              subtitle="Need renewal"
              variant="danger"
            />
            <StatCard 
              title="Total Licenses" 
              value={licenseStats?.totalLicenses || 0}
              subtitle="All your licenses"
              variant="default"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div 
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push('/dashboard/user/licenses')}
            >
              <h3 className="text-lg font-semibold mb-2">📋 My Licenses</h3>
              <p className="text-gray-600 text-sm mb-4">View and manage your software licenses</p>
              <Button className="w-full" variant="outline">View My Licenses</Button>
            </div>
            <div 
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push('/dashboard/user/settings')}
            >
              <h3 className="text-lg font-semibold mb-2">⚙️ Account Settings</h3>
              <p className="text-gray-600 text-sm mb-4">Update your profile and preferences</p>
              <Button className="w-full" variant="outline">Go to Settings</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
