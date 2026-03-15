'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVerifyEmail, useResendVerification } from '@/hooks/use-auth';
import { BackButton } from '@/components/back-button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [showResend, setShowResend] = useState(false);
  const [email, setEmail] = useState('');
  
  const { mutate: verifyEmail } = useVerifyEmail();
  const { mutate: resendVerification, isPending: isResending } = useResendVerification();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    // Verify email with the token
    verifyEmail(token, {
      onSuccess: () => {
        setStatus('success');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      },
      onError: () => {
        setStatus('error');
        setShowResend(true);
      },
    });
  }, [token, verifyEmail, router]);

  const handleResendVerification = () => {
    if (!email) {
      return;
    }
    
    resendVerification(email, {
      onSuccess: () => {
        setShowResend(false);
        setEmail('');
      },
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4 animate-fade-in">
        <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="space-y-2 pb-2 animate-slide-in">
          <div className="flex items-center gap-2 -ml-2 mb-2">
            <BackButton label="" />
          </div>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Verification Error
          </CardTitle>
            <CardDescription>
              No verification token provided
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <p className="text-sm text-slate-600">
              Please use the verification link sent to your email to verify your account.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">
                Go to Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 -ml-2 mb-2">
            <BackButton label="" />
          </div>
          
          {status === 'loading' && (
            <>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                Verifying Email
              </CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Email Verified
              </CardTitle>
              <CardDescription>
                Your email has been verified successfully!
              </CardDescription>
            </>
          )}
          
          {status === 'error' && (
            <>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Verification Failed
              </CardTitle>
              <CardDescription>
                The verification token is invalid or has expired.
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'success' && (
            <p className="text-sm text-slate-600">
              Redirecting to login page...
            </p>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                You can request a new verification email below.
              </p>
              
              {showResend && (
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={handleResendVerification}
                    disabled={!email || isResending}
                    className="w-full"
                  >
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                </div>
              )}
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">
                  Go to Login
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
