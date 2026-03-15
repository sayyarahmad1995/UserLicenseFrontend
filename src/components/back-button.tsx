'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  label?: string;
}

export function BackButton({ label = 'Back' }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className="gap-1 text-slate-600 hover:text-slate-900"
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
