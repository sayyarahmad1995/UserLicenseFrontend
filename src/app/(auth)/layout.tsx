'use client';

import { AuthPageWrapper } from '@/components/auth-page-wrapper';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthPageWrapper>{children}</AuthPageWrapper>;
}
