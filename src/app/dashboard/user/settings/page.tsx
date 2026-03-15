'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useCurrentUser,
  useChangePassword,
  useUpdateNotificationPreferences,
  useLogout,
  useUpdateProfile,
  useRotateToken,
  useEmailTemplates,
  useTestEmailSend,
} from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Copy, Check, Mail, Key, Shield, ExternalLink } from 'lucide-react';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function SettingsPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const changePasswordMutation = useChangePassword();
  const updateNotificationsMutation = useUpdateNotificationPreferences();
  const updateProfileMutation = useUpdateProfile();
  const rotateTokenMutation = useRotateToken();
  const { data: emailTemplates = [] } = useEmailTemplates();
  const testEmailMutation = useTestEmailSend();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    notifyLicenseExpiry: false,
    notifyAccountActivity: false,
    notifySystemAnnouncements: false,
  });

  // Profile update state
  const [profileData, setProfileData] = useState({
    email: '',
    username: '',
  });
  const [copyTooltip, setCopyTooltip] = useState<string | null>(null);
  const [testEmailInput, setTestEmailInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        email: user.email,
        username: user.username,
      });
      setNotifications({
        notifyLicenseExpiry: Boolean(user.notifyLicenseExpiry),
        notifyAccountActivity: Boolean(user.notifyAccountActivity),
        notifySystemAnnouncements: Boolean(user.notifySystemAnnouncements),
      });
    }
  }, [user]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/login');
      },
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return;
    }
    changePasswordMutation.mutate(
      {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      },
      {
        onSuccess: () => {
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        },
      }
    );
  };

  const handleNotificationsChange = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationsMutation.mutate(notifications);
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleRotateToken = () => {
    rotateTokenMutation.mutate(undefined, {
      onSuccess: () => {
        // Token rotated successfully
      },
    });
  };

  const handleTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailInput) return;
    testEmailMutation.mutate(testEmailInput, {
      onSuccess: () => {
        setTestEmailInput('');
      },
    });
  };

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopyTooltip(type);
    setTimeout(() => setCopyTooltip(null), 2000);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center animate-fade-in">
        <div className="text-center animate-scale-in">
          <p className="text-gray-600 mb-4">Not authorized</p>
          <Button onClick={() => router.push('/login')}>Back to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow animate-fade-in">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex justify-between items-center gap-4 animate-slide-in">
            <div>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
                className="mb-2"
              >
                ← Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account and preferences</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profile Information</h2>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-600">Username</Label>
              <p className="text-lg font-medium text-gray-900 mt-1">{user.username}</p>
            </div>

            <div>
              <Label className="text-gray-600">Email</Label>
              <p className="text-lg font-medium text-gray-900 mt-1">{user.email}</p>
            </div>

            <div>
              <Label className="text-gray-600">Role</Label>
              <p className="text-lg font-medium text-gray-900 mt-1">{user.role}</p>
            </div>

            <div>
              <Label className="text-gray-600">Status</Label>
              <div className="mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${user.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : user.status === 'Blocked'
                    ? 'bg-red-100 text-red-800'
                    : user.status === 'Verified'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {user.status}
                </span>
              </div>
            </div>

            <div>
              <Label className="text-gray-600">Account Created</Label>
              <p className="text-lg font-medium text-gray-900 mt-1">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Change Password</h2>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            {/* Hidden username field for accessibility and auto-fill */}
            <input
              type="text"
              name="username"
              defaultValue={user?.username || ''}
              style={{ display: 'none' }}
              aria-hidden="true"
            />

            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                disabled={changePasswordMutation.isPending}
                className="mt-1"
                autoComplete="current-password"
              />
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                disabled={changePasswordMutation.isPending}
                className="mt-1"
                autoComplete="new-password"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                disabled={changePasswordMutation.isPending}
                className="mt-1"
                autoComplete="new-password"
              />
              {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={
                changePasswordMutation.isPending ||
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword ||
                passwordData.newPassword !== passwordData.confirmPassword
              }
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </div>

        {/* Profile Update Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Update Profile</h2>

          <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                disabled={updateProfileMutation.isPending}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={profileData.username}
                onChange={(e) =>
                  setProfileData({ ...profileData, username: e.target.value })
                }
                disabled={updateProfileMutation.isPending}
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={
                updateProfileMutation.isPending ||
                (profileData.email === user?.email && profileData.username === user?.username)
              }
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </form>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security
          </h2>

          <div className="space-y-6">
            {/* Token Rotation */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Token Rotation</h3>
              <p className="text-gray-600 mb-4">
                Rotate your authentication token to enhance security. This invalidates your current token.
              </p>
              <Button
                onClick={handleRotateToken}
                disabled={rotateTokenMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {rotateTokenMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rotating...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Rotate Token
                  </>
                )}
              </Button>
            </div>

            {/* Session Management */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Session Management</h3>
              <p className="text-gray-600 mb-4">
                View and manage your active sessions across all devices.
              </p>
              <Button
                onClick={() => router.push('/dashboard/user/sessions')}
                variant="outline"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Sessions
              </Button>
            </div>
          </div>
        </div>

        {/* Email Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Email Management
          </h2>

          <div className="space-y-6">
            {/* Email Templates */}
            {emailTemplates.length > 0 && (
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Email Templates</h3>
                <p className="text-gray-600 mb-4">View available email templates</p>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {emailTemplates.map((template: any) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:bg-gray-50 transition"
                      onClick={() =>
                        setSelectedTemplate(
                          selectedTemplate === template.id ? null : template.id
                        )
                      }
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        {template.subject && (
                          <CardDescription>{template.subject}</CardDescription>
                        )}
                      </CardHeader>
                      {selectedTemplate === template.id && template.content && (
                        <CardContent className="bg-gray-50 text-sm text-gray-700 max-h-32 overflow-y-auto">
                          <p>{template.content}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Test Email */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Send Test Email</h3>
              <p className="text-gray-600 mb-4">
                Send a test email to verify your email configuration
              </p>

              <form onSubmit={handleTestEmail} className="flex gap-2 max-w-md">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  disabled={testEmailMutation.isPending}
                />
                <Button
                  type="submit"
                  disabled={testEmailMutation.isPending || !testEmailInput}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {testEmailMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Send Test'
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Notification Preferences Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>

          <form onSubmit={handleNotificationsChange} className="space-y-4">
            <div className="flex items-center">
              <input
                id="notifyLicenseExpiry"
                type="checkbox"
                checked={notifications.notifyLicenseExpiry}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    notifyLicenseExpiry: e.target.checked,
                  })
                }
                disabled={updateNotificationsMutation.isPending}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="notifyLicenseExpiry" className="ml-3 cursor-pointer">
                <span className="font-medium text-gray-900">License Expiry Notifications</span>
                <span className="block text-sm text-gray-500">Get notified when your licenses are about to expire</span>
              </Label>
            </div>

            <div className="flex items-center">
              <input
                id="notifyAccountActivity"
                type="checkbox"
                checked={notifications.notifyAccountActivity}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    notifyAccountActivity: e.target.checked,
                  })
                }
                disabled={updateNotificationsMutation.isPending}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="notifyAccountActivity" className="ml-3 cursor-pointer">
                <span className="font-medium text-gray-900">Account Activity</span>
                <span className="block text-sm text-gray-500">Get notified of important account events</span>
              </Label>
            </div>

            <div className="flex items-center">
              <input
                id="notifySystemAnnouncements"
                type="checkbox"
                checked={notifications.notifySystemAnnouncements}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    notifySystemAnnouncements: e.target.checked,
                  })
                }
                disabled={updateNotificationsMutation.isPending}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="notifySystemAnnouncements" className="ml-3 cursor-pointer">
                <span className="font-medium text-gray-900">System Announcements</span>
                <span className="block text-sm text-gray-500">Get notified of system updates and announcements</span>
              </Label>
            </div>

            <Button
              type="submit"
              disabled={updateNotificationsMutation.isPending}
            >
              {updateNotificationsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
