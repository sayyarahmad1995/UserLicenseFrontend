import { Suspense } from 'react';
import UsersContent from './users-content';

export const dynamic = 'force-dynamic';

function UsersLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Loading users...</div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersLoadingFallback />}>
      <UsersContent />
    </Suspense>
  );
}
