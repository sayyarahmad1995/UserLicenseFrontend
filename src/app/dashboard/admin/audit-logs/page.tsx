import { Suspense } from 'react';
import AuditLogsContent from './audit-logs-content';

export const dynamic = 'force-dynamic';

function AuditLogsLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Loading audit logs...</div>
    </div>
  );
}

export default function AuditLogsPage() {
  return (
    <Suspense fallback={<AuditLogsLoadingFallback />}>
      <AuditLogsContent />
    </Suspense>
  );
}
