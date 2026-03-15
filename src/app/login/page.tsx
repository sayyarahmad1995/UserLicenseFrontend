'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useLogin } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
  username: z.string().min(3, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const justRegistered = searchParams.get('registered') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    setError('');
    loginMutation.mutate(data, {
      onSuccess: () => {
        router.push('/dashboard');
      },
      onError: (err: any) => {
        const apiResponse = err.response?.data;
        
        // Get the error message from various possible fields (Go-Chi uses different structures)
        const errorMessage = 
          (typeof apiResponse === 'string' ? apiResponse : null) ||
          apiResponse?.error?.message ||  // Nested error structure
          apiResponse?.message ||
          apiResponse?.Message ||
          apiResponse?.error?.error ||
          apiResponse?.error ||
          apiResponse?.Error ||
          err.message ||
          'Login failed';
        
        const lowerMessage = errorMessage.toLowerCase();
        
        // Check for rate limiting error
        if (lowerMessage.includes('too many') || lowerMessage.includes('rate limit') || lowerMessage.includes('please try again in')) {
          // Extract seconds from message if available
          const match = errorMessage.match(/(\d+)\s*second/i);
          if (match) {
            setError(`Too many login attempts. Please wait ${match[1]} seconds before trying again.`);
          } else {
            setError(errorMessage);
          }
          return;
        }
        
        // Check for inactive account error
        if (lowerMessage.includes('not active')) {
          setError(
            'Your account is not active yet. Please check your email to verify your account before logging in.'
          );
          return;
        }
        
        // Check for rate limiting data
        if (apiResponse?.Data && apiResponse.Data.InPenalty) {
          const penaltySeconds = apiResponse.Data.PenaltyRemainingSeconds;
          const minutes = Math.ceil(penaltySeconds / 60);
          setError(
            `Too many login attempts. Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before trying again.`
          );
          return;
        }
        
        // Check for remaining attempts on invalid credentials
        if (apiResponse?.Data && 'RemainingAttempts' in apiResponse.Data) {
          const remaining = apiResponse.Data.RemainingAttempts;
          if (remaining === 0 && apiResponse.Data.NextAttemptInSeconds !== null) {
            const seconds = apiResponse.Data.NextAttemptInSeconds;
            setError(
              `${apiResponse.Message || 'Invalid credentials'}. Please wait ${seconds} second${seconds !== 1 ? 's' : ''} before trying again.`
            );
            return;
          }
        }
        
        // Server returns validation errors with structure: { errors: { fieldName: ["message"] } }
        if (apiResponse?.errors && typeof apiResponse.errors === 'object') {
          const errorMessages = Object.entries(apiResponse.errors)
            .map(([field, messages]: [string, any]) => {
              if (Array.isArray(messages)) {
                return messages.join(' ');
              }
              return String(messages);
            })
            .filter(Boolean)
            .join(' ');
          
          if (errorMessages) {
            setError(errorMessages);
            return;
          }
        }
        
        // Use the extracted error message
        setError(errorMessage);
      },
    });
  };

  // Show loading state while checking for existing session
  if (false) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 animate-fade-in overflow-hidden">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="space-y-1 animate-slide-in">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your username and password to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="space-y-4">
            {justRegistered && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                ✓ Account created successfully! Please sign in with your credentials.
              </div>
            )}
            
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            
            <div className="floating-label-group">
              <Input
                id="username"
                type="text"
                placeholder=" "
                autoComplete="username"
                className="floating-input"
                {...register('username')}
              />
              <Label htmlFor="username" className="floating-label">Username</Label>
              {errors.username && (
                <p className="text-sm text-red-600 pt-1">{errors.username.message}</p>
              )}
            </div>

            <div className="floating-label-group">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder=" "
                  autoComplete="current-password"
                  className="floating-input pr-10"
                  {...register('password')}
                />
                <Label htmlFor="password" className="floating-label">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 pt-1">{errors.password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
              <span>•</span>
              <p>
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
