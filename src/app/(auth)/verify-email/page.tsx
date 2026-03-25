'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVerifyEmail, useResendVerification } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';

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
      <div className="w-full max-w-md px-4 py-12">
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Verification Error</h1>
            <p className="text-blue-100">No verification token provided</p>
          </div>

          <Card className="backdrop-blur-md bg-white/95 border-0 shadow-2xl animate-scale-in">
            <CardContent className="pt-6 pb-6 space-y-4">
              <p className="text-sm text-gray-600">
                Please use the verification link sent to your email to verify your account.
              </p>
              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 h-auto rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                <Link href="/login">
                  Go to Login
                </Link>
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-white/70 text-xs mt-6">
            Protected by industry-standard security
          </p>
        </div>
    );
  }

  return (
    <div className="w-full max-w-md px-4 py-12">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
              {status === 'loading' && <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />}
              {status === 'success' && <CheckCircle className="w-6 h-6 text-green-500" />}
              {status === 'error' && <XCircle className="w-6 h-6 text-red-500" />}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {status === 'loading' && 'Verifying Email'}
            {status === 'success' && 'Email Verified'}
            {status === 'error' && 'Verification Failed'}
          </h1>
          <p className="text-blue-100">
            {status === 'loading' && 'Please wait while we verify your email...'}
            {status === 'success' && 'Your email has been verified successfully!'}
            {status === 'error' && 'The verification token is invalid or expired.'}
          </p>
        </div>

        <Card className="backdrop-blur-md bg-white/95 border-0 shadow-2xl animate-scale-in">
          <CardContent className="pt-6 pb-6 space-y-4">
            {status === 'success' && (
              <p className="text-sm text-gray-600">
                Redirecting to login page...
              </p>
            )}
            
            {status === 'error' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  You can request a new verification email below.
                </p>
                
                {showResend && (
                  <div className="space-y-3">
                    <div className="floating-label-group">
                      <Input
                        type="email"
                        placeholder=" "
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="floating-input border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-colors"
                      />
                      <Label className="floating-label">Email Address</Label>
                    </div>
                    <Button
                      onClick={handleResendVerification}
                      disabled={!email || isResending}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 h-auto rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-75 disabled:hover:scale-100 shadow-lg"
                    >
                      {isResending ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          Resend Verification
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer text */}
        <p className="text-center text-white/70 text-xs mt-6">
          Protected by industry-standard security
        </p>
      </div>
  );
}
