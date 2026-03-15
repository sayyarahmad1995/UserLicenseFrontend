'use client';

import { useState } from 'react';
import { useUserPermissions, useRolePermissions, useGrantPermission, useRevokePermission, useSetRolePermissions } from '@/hooks/use-permissions';
import { useUsers } from '@/hooks/use-users';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { UserRole } from '@/types/api';

const ROLES = [UserRole.Admin, UserRole.Manager, UserRole.User];

export default function PermissionsPage() {
  const [selectedTab, setSelectedTab] = useState<'users' | 'roles'>('users');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.User);
  const [selectedPermissionId, setSelectedPermissionId] = useState('');

  const { data: users = { data: [] as any[] }, isLoading: usersLoading } = useUsers({ pageNumber: 1, pageSize: 100 });
  const { data: userPermissions, isLoading: userPermLoading } = useUserPermissions(selectedUserId || 0);
  const { data: rolePermissions, isLoading: rolePermLoading } = useRolePermissions(selectedRole);

  const grantPermutation = useGrantPermission();
  const revokePermission = useRevokePermission();
  const setRolePermissions = useSetRolePermissions();

  const handleGrantPermission = () => {
    if (selectedUserId && selectedPermissionId) {
      grantPermutation.mutate({
        userId: selectedUserId,
        permissionId: selectedPermissionId,
      });
      setSelectedPermissionId('');
    }
  };

  const handleRevokePermission = (permissionId: string) => {
    if (selectedUserId) {
      revokePermission.mutate({
        userId: selectedUserId,
        permissionId,
      });
    }
  };

  const handleSetRolePermissions = () => {
    if (selectedRole && rolePermissions?.permissions) {
      const permissionIds = rolePermissions.permissions.map((p) => p.id);
      setRolePermissions.mutate({
        role: selectedRole,
        permissionIds,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Permissions Management</h1>
          <p className="text-gray-600 mt-2">Manage user and role permissions</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSelectedTab('users')}
            className={`px-4 py-2 font-medium rounded-lg transition ${
              selectedTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            User Permissions
          </button>
          <button
            onClick={() => setSelectedTab('roles')}
            className={`px-4 py-2 font-medium rounded-lg transition ${
              selectedTab === 'roles'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Role Permissions
          </button>
        </div>

        {/* User Permissions Tab */}
        {selectedTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select User</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-gray-400" />
                  </div>
                ) : (
                  users.data?.map((user: any) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${
                        selectedUserId === user.id
                          ? 'bg-blue-100 border-2 border-blue-600'
                          : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.role}</div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Permissions List */}
            {selectedUserId && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>User Permissions</CardTitle>
                  <CardDescription>
                    Manage permissions for selected user
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userPermLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      {/* Grant Permission */}
                      <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                        <Label htmlFor="permission-select">Grant New Permission</Label>
                        <div className="flex gap-2">
                          <Input
                            id="permission-select"
                            placeholder="Enter permission ID"
                            value={selectedPermissionId}
                            onChange={(e) => setSelectedPermissionId(e.target.value)}
                          />
                          <Button
                            onClick={handleGrantPermission}
                            disabled={!selectedPermissionId || grantPermutation.isPending}
                            className="whitespace-nowrap"
                          >
                            {grantPermutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                            Grant
                          </Button>
                        </div>
                      </div>

                      {/* Current Permissions */}
                      <div className="space-y-2">
                        <Label>Current Permissions</Label>
                        {(userPermissions?.permissions || []).length === 0 ? (
                          <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                            No permissions assigned
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {(userPermissions?.permissions || []).map((perm: any) => (
                              <div
                                key={perm.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <div className="font-medium text-gray-900">{perm.name}</div>
                                  <div className="text-xs text-gray-600">{perm.description}</div>
                                </div>
                                <button
                                  onClick={() => handleRevokePermission(perm.id)}
                                  disabled={revokePermission.isPending}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                  {revokePermission.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Role Permissions Tab */}
        {selectedTab === 'roles' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Role Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Role</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${
                      selectedRole === role
                        ? 'bg-blue-100 border-2 border-blue-600 text-blue-900'
                        : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Role Permissions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{selectedRole} Permissions</CardTitle>
                <CardDescription>
                  Configure permissions for the {selectedRole} role
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rolePermLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {(rolePermissions?.permissions || []).length === 0 ? (
                      <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                        No permissions configured for this role
                      </p>
                    ) : (
                      (rolePermissions?.permissions || []).map((perm: any) => (
                        <div
                          key={perm.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-gray-900">{perm.name}</div>
                            <div className="text-xs text-gray-600">{perm.description}</div>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {perm.category}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSetRolePermissions}
                  disabled={setRolePermissions.isPending}
                  className="w-full"
                >
                  {setRolePermissions.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Role Permissions'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
