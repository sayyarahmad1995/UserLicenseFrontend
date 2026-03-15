'use client';

import { useState } from 'react';
import {
  useUserGrowthAnalytics,
  useLicenseUsageAnalytics,
  useActivationAnalytics,
  useSystemHealthAnalytics,
  useRevenueAnalytics,
  usePredictiveLicenseChurn,
  usePredictiveRevenue,
  useAnomalyDetection,
} from '@/hooks/use-analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, AlertTriangle, TrendingUp, TrendingDown, Users, Zap, DollarSign } from 'lucide-react';

type Period = '7d' | '30d' | '90d';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-xs mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '+' : '-'}
              {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-100 rounded-lg">{Icon}</div>
      </div>
    </CardContent>
  </Card>
);

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');
  
  const userGrowth = useUserGrowthAnalytics(period);
  const licenseUsage = useLicenseUsageAnalytics(period);
  const activations = useActivationAnalytics(period);
  const systemHealth = useSystemHealthAnalytics('7d');
  const revenue = useRevenueAnalytics(period);
  const churn = usePredictiveLicenseChurn();
  const revenueForecast = usePredictiveRevenue(12);
  const anomalies = useAnomalyDetection();

  const isLoading =
    userGrowth.isLoading ||
    licenseUsage.isLoading ||
    activations.isLoading ||
    systemHealth.isLoading ||
    revenue.isLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive business intelligence and insights</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex gap-2">
          {(['7d', '30d', '90d'] as Period[]).map((p) => (
            <Button
              key={p}
              onClick={() => setPeriod(p)}
              variant={period === p ? 'default' : 'outline'}
            >
              Last {p === '7d' ? '7' : p === '30d' ? '30' : '90'} Days
            </Button>
          ))}
        </div>

        {/* Anomalies Alert */}
        {anomalies.data?.anomalies && anomalies.data.anomalies.length > 0 && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">Anomalies Detected</p>
                  <p className="text-sm text-red-700 mt-1">
                    {anomalies.data.anomalies.length} anomalies found. Review them immediately.
                  </p>
                  <div className="mt-3 space-y-1">
                    {anomalies.data.anomalies.slice(0, 3).map((anomaly, idx) => (
                      <p key={idx} className="text-xs text-red-600">
                        • {anomaly.type}: {anomaly.description}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Active Users"
                value={userGrowth.data?.activeUsersCount || 0}
                change={userGrowth.data?.growthRate}
                trend="up"
                icon={<Users className="h-6 w-6 text-blue-600" />}
              />
              <StatCard
                title="Active Licenses"
                value={licenseUsage.data?.activeLicensePercentage?.toFixed(1) + '%' || '0%'}
                change={licenseUsage.data?.activeLicensePercentage}
                trend="up"
                icon={<Zap className="h-6 w-6 text-blue-600" />}
              />
              <StatCard
                title="Monthly Revenue"
                value={`$${(revenue.data?.monthlyRecurringRevenue || 0).toLocaleString()}`}
                change={((revenue.data?.totalRevenue || 0) / 30)}
                trend={revenue.data && revenue.data.totalRevenue > 0 ? 'up' : 'down'}
                icon={<DollarSign className="h-6 w-6 text-green-600" />}
              />
              <StatCard
                title="System Uptime"
                value={`${(systemHealth.data?.apiUptime || 0).toFixed(2)}%`}
                trend="up"
                icon={<TrendingUp className="h-6 w-6 text-green-600" />}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* User Growth */}
              {userGrowth.data?.trend && (
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth Trend</CardTitle>
                    <CardDescription>Active users over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={userGrowth.data.trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke={COLORS[0]}
                          dot={false}
                          name="Active Users"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* License Usage */}
              {licenseUsage.data?.trend && (
                <Card>
                  <CardHeader>
                    <CardTitle>License Usage</CardTitle>
                    <CardDescription>License status distribution over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={licenseUsage.data.trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="active"
                          stackId="1"
                          stroke={COLORS[1]}
                          fill={COLORS[1]}
                          name="Active"
                        />
                        <Area
                          type="monotone"
                          dataKey="expired"
                          stackId="1"
                          stroke={COLORS[3]}
                          fill={COLORS[3]}
                          name="Expired"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Activation Analytics */}
              {activations.data?.topCountries && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Activation Countries</CardTitle>
                    <CardDescription>Activations by location</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={activations.data.topCountries.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="country" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill={COLORS[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Revenue Analytics */}
              {revenue.data?.topProductsByRevenue && (
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Product</CardTitle>
                    <CardDescription>Top products by revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={revenue.data.topProductsByRevenue.slice(0, 5)}
                          dataKey="revenue"
                          nameKey="product"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {revenue.data.topProductsByRevenue.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* System Health Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>Response time metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Average Response Time</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {systemHealth.data?.averageResponseTime?.toFixed(0)}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">P95 Response Time</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {systemHealth.data?.p95ResponseTime?.toFixed(0)}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">P99 Response Time</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {systemHealth.data?.p99ResponseTime?.toFixed(0)}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Error Rate</p>
                      <p className="text-2xl font-bold text-red-600">
                        {(systemHealth.data?.errorRate || 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Storage Usage</CardTitle>
                  <CardDescription>System resource utilization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Total Storage</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((systemHealth.data?.storageUsage?.totalGB || 0) /
                                (systemHealth.data?.storageUsage?.totalGB || 1)) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {systemHealth.data?.storageUsage?.totalGB || 0} GB
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Database</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {systemHealth.data?.storageUsage?.databaseGB || 0} GB
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Cache</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {systemHealth.data?.storageUsage?.cacheGB || 0} GB
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Logs</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {systemHealth.data?.storageUsage?.logsGB || 0} GB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Predictive Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Churn Risk */}
              {churn.data?.riskUsers && churn.data.riskUsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>High Churn Risk Users</CardTitle>
                    <CardDescription>Users at risk of churning</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {churn.data.riskUsers.slice(0, 5).map((user) => (
                        <div key={user.userId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-gray-900">{user.username}</p>
                            <p className="text-xs text-gray-600">Risk Score: {(user.riskScore * 100).toFixed(0)}%</p>
                          </div>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full"
                              style={{ width: `${user.riskScore * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Revenue Forecast */}
              {revenueForecast.data?.forecast && (
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Forecast (12 Months)</CardTitle>
                    <CardDescription>Predicted revenue trend</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueForecast.data.forecast}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke={COLORS[2]}
                          dot={false}
                          name="Predicted Revenue"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
