'use client';

import { useRouter } from 'next/navigation';
import { useActiveSessions, useLogoutAllOtherSessions, useFormatSession } from '@/hooks/use-sessions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut, Shield, Smartphone, Monitor } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function getDeviceIcon(device: string) {
  switch (device.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    case 'tablet':
      return <Smartphone className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
}

export default function SessionsPage() {
  const router = useRouter();
  const { data: sessions = [], isLoading, error } = useActiveSessions();
  const logoutAllOthers = useLogoutAllOtherSessions();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Unable to Load Sessions</CardTitle>
              <CardDescription>
                We couldn't retrieve your active sessions. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700">
                {error instanceof Error ? error.message : 'An error occurred while loading your sessions'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Active Sessions</h1>
            <p className="text-gray-600 mt-2">
              Manage your active sessions and devices
            </p>
          </div>

        </div>

        {/* Current Session */}
        {currentSession && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <CardTitle>Current Session</CardTitle>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
              <CardDescription>This is your current active session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Device Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Browser</p>
                  <p className="text-base text-gray-900">
                    {useFormatSession(currentSession.userAgent).browser}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Operating System</p>
                  <p className="text-base text-gray-900">
                    {useFormatSession(currentSession.userAgent).os}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Device</p>
                  <p className="text-base text-gray-900">
                    {useFormatSession(currentSession.userAgent).device}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">IP Address</p>
                  <p className="text-base text-gray-900">{currentSession.ipAddress}</p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Signed in</span>
                  <span className="text-gray-900">
                    {formatDistanceToNow(new Date(currentSession.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last activity</span>
                  <span className="text-gray-900">
                    {formatDistanceToNow(new Date(currentSession.lastActivity), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other Sessions */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </CardContent>
          </Card>
        ) : otherSessions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">No other active sessions</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Other Active Sessions</h2>
              <Button
                variant="outline"
                onClick={() => logoutAllOthers.mutate()}
                disabled={logoutAllOthers.isPending}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {logoutAllOthers.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout All Others
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3">
              {otherSessions.map((session) => {
                const { browser, os, device } = useFormatSession(session.userAgent);
                return (
                  <Card key={session.id} className="hover:shadow-md transition">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Session Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getDeviceIcon(device)}
                            <div>
                              <p className="font-medium text-gray-900">
                                {browser} on {os}
                              </p>
                              <p className="text-sm text-gray-600">{device}</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            {device}
                          </span>
                        </div>

                        {/* Session Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
                          <div>
                            <p className="text-gray-600">IP Address</p>
                            <p className="text-gray-900 font-mono text-xs break-all">
                              {session.ipAddress}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Signed in</p>
                            <p className="text-gray-900">
                              {formatDistanceToNow(new Date(session.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-600">Last activity</p>
                            <p className="text-gray-900">
                              {formatDistanceToNow(new Date(session.lastActivity), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Session Footer - Logout Button (future enhancement) */}
                        <div className="border-t pt-3 flex justify-end">
                          <p className="text-xs text-gray-500">
                            Logout from this device in next update
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Info Box */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">Session Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p>
              ✓ Each session is tied to a specific device and IP address
            </p>
            <p>
              ✓ Sessions automatically expire after a period of inactivity
            </p>
            <p>
              ✓ Log out of other devices if you don't recognize a session
            </p>
            <p>
              ✓ You'll need to log in again if your session is terminated
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
