import { Suspense } from 'react';
import LicensesContent from './licenses-content';

export const dynamic = 'force-dynamic';

function LicensesLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Loading licenses...</div>
    </div>
  );
}

export default function LicensesPage() {
  return (
    <Suspense fallback={<LicensesLoadingFallback />}>
      <LicensesContent />
    </Suspense>
  );
}
