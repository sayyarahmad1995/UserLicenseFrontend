'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { useLogoutDialog } from '@/hooks/use-logout-dialog';
import { useDashboard, useDashboardStats, useHealth, useLicenseForecast } from '@/hooks/use-dashboard';
import { LogoutDialog } from '@/components/logout-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Calendar, Activity, Zap, RefreshCw } from 'lucide-react';

const StatCard = ({ title, value, subtitle, variant = 'default', index = 0 }: { title: string; value: string | number; subtitle?: string; variant?: 'default' | 'success' | 'warning' | 'danger'; index?: number }) => {
  const borderColor = {
    default: 'border-blue-200',
    success: 'border-green-200',
    warning: 'border-yellow-200',
    danger: 'border-red-200',
  }[variant];

  const bgColor = {
    default: 'bg-blue-50/50',
    success: 'bg-green-50/50',
    warning: 'bg-yellow-50/50',
    danger: 'bg-red-50/50',
  }[variant];

  const textColor = {
    default: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  }[variant];

  return (
    <div 
      className={`${bgColor} ${borderColor} backdrop-blur-sm border rounded-xl p-5 shadow hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <p className="text-xs font-medium text-gray-600">{title}</p>
      <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { open, setOpen, openLogoutDialog } = useLogoutDialog();
  const { data: user, isLoading: userLoading, error: userError } = useCurrentUser();
  const isAdmin = user?.role === 'Admin';
  
  // Only fetch admin data if user is confirmed admin
  const { data: dashboard, isLoading: dashboardLoading } = useDashboard();
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: health, isLoading: healthLoading } = useHealth();
  const { data: forecast, isLoading: forecastLoading } = useLicenseForecast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchStats();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check if user is admin
  useEffect(() => {
    if (!userLoading && user && user.role !== 'Admin') {
      router.push('/dashboard/user');
    }
  }, [user, userLoading, router]);

  if (userLoading || statsLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-scale-in">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (userError || !user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <p className="text-white font-medium mb-4">You don't have permission to access this page</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-100 font-semibold transition-all duration-200 transform hover:scale-105"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="backdrop-blur-md bg-white/80 border-b border-blue-100 shadow-lg animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="animate-slide-in">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome, {user?.username || 'Admin'} 
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {user?.role || 'Admin'}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isRefreshing}
              title="Refresh all statistics"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              onClick={openLogoutDialog}
              variant="outline"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* User Statistics */}
        <div className="mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 animate-slide-in">User Statistics</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard 
              title="Total Users" 
              value={stats?.total_users || 0}
              subtitle={`${stats?.verified_users || 0} verified`}
              variant="default"
              index={0}
            />
            <StatCard 
              title="Verified Users" 
              value={stats?.verified_users || 0}
              subtitle="Email verified"
              variant="success"
              index={1}
            />
            <StatCard 
              title="Unverified Users" 
              value={stats?.unverified_users || 0}
              subtitle="Pending verification"
              variant="warning"
              index={2}
            />
          </div>
        </div>

        {/* License Statistics */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 animate-slide-in">License Statistics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <StatCard 
              title="Total Licenses" 
              value={stats?.total_licenses || 0}
              subtitle={`${stats?.active_licenses || 0} active`}
              variant="default"
              index={0}
            />
            <StatCard 
              title="Active Licenses" 
              value={stats?.active_licenses || 0}
              subtitle="Currently active"
              variant="success"
              index={1}
            />
            <StatCard 
              title="Expired Licenses" 
              value={stats?.expired_licenses || 0}
              subtitle="Expired"
              variant="warning"
              index={2}
            />
            <StatCard 
              title="Revoked Licenses" 
              value={stats?.revoked_licenses || 0}
              subtitle="Revoked"
              variant="danger"
              index={3}
            />
          </div>
        </div>

        {/* Activations */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-3 animate-slide-in">
            <Zap className="w-4 h-4 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Activations</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-1">
            <StatCard 
              title="Total Activations" 
              value={dashboard?.activations?.total || 0}
              subtitle="Active device/instance activations"
              variant="default"
              index={0}
            />
          </div>
        </div>

        {/* System Health */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 animate-slide-in">System Health</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard 
              title="Database Status" 
              value={typeof health?.database === 'object' ? (health?.database?.status || 'Unknown') : (health?.database || 'Unknown')}
              subtitle="Connection status"
              variant={typeof health?.database === 'object' ? (health?.database?.status === 'up' ? 'success' : 'danger') : (health?.database === 'up' ? 'success' : 'danger')}
              index={0}
            />
            <StatCard 
              title="Redis Status"
              value={typeof health?.redis === 'object' ? (health?.redis?.status || 'Unknown') : (health?.redis || 'Unknown')}
              subtitle="Cache status"
              variant={typeof health?.redis === 'object' ? (health?.redis?.status === 'up' ? 'success' : 'danger') : (health?.redis === 'up' ? 'success' : 'danger')}
              index={1}
            />
            <StatCard 
              title="API Status" 
              value={health?.api_status === 'up' ? 'Up' : health?.api_status || 'Unknown'}
              subtitle="Server status"
              variant={health?.api_status === 'up' ? 'success' : 'danger'}
              index={2}
            />
          </div>
        </div>

        {/* License Expiration Forecast */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-2 mb-3 animate-slide-in">
            <Calendar className="w-4 h-4 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">License Expiration Forecast</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <StatCard 
              title="Next 7 Days" 
              value={forecast?.expiring_in_7_days || 0}
              subtitle="Licenses expiring"
              variant={forecast?.expiring_in_7_days && forecast.expiring_in_7_days > 0 ? 'warning' : 'default'}
              index={0}
            />
            <StatCard 
              title="Next 30 Days" 
              value={forecast?.expiring_in_30_days || 0}
              subtitle="Licenses expiring"
              variant={forecast?.expiring_in_30_days && forecast.expiring_in_30_days > 0 ? 'warning' : 'default'}
              index={1}
            />
            <StatCard 
              title="Next 90 Days" 
              value={forecast?.expiring_in_90_days || 0}
              subtitle="Licenses expiring"
              variant={forecast?.expiring_in_90_days && forecast.expiring_in_90_days > 0 ? 'warning' : 'default'}
              index={2}
            />
            <StatCard 
              title="Total Upcoming" 
              value={forecast?.total_upcoming || 0}
              subtitle="Total expirations"
              variant={forecast?.total_upcoming && forecast.total_upcoming > 0 ? 'warning' : 'default'}
              index={3}
            />
          </div>
        </div>

        {/* System Management */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 animate-slide-in">System Management</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div 
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer animate-scale-in"
              style={{ animationDelay: '450ms' }}
              onClick={() => router.push('/dashboard/admin/users')}
            >
              <h3 className="text-base font-semibold mb-2">Users</h3>
              <p className="text-gray-600 text-xs mb-3">Manage all user accounts</p>
              <Button className="w-full text-xs py-1.5" variant="outline">View Users</Button>
            </div>
            <div 
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer animate-scale-in"
              style={{ animationDelay: '500ms' }}
              onClick={() => router.push('/dashboard/admin/licenses')}
            >
              <h3 className="text-base font-semibold mb-2">Licenses</h3>
              <p className="text-gray-600 text-xs mb-3">Manage all software licenses</p>
              <Button className="w-full text-xs py-1.5" variant="outline">View Licenses</Button>
            </div>
            <div 
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer animate-scale-in"
              style={{ animationDelay: '550ms' }}
              onClick={() => router.push('/dashboard/admin/audit-logs')}
            >
              <h3 className="text-base font-semibold mb-2">Audit Logs</h3>
              <p className="text-gray-600 text-xs mb-3">{stats?.recent_audit_logs || 0} recent logs</p>
              <Button className="w-full text-xs py-1.5" variant="outline">View Logs</Button>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center gap-2 mb-3 animate-slide-in">
            <Activity className="w-4 h-4 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {dashboardLoading ? (
              <div className="p-6 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
              </div>
            ) : dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {dashboard.recentActivity.map((entry, index) => (
                  <div 
                    key={index} 
                    className="p-4 hover:bg-gray-50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{entry.action}</p>
                          {entry.username && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                              {entry.username}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-600">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Dialog */}
      <LogoutDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
