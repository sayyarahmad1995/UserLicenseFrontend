'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
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
    <div className="w-full max-w-md px-4 py-12">
        {/* Header section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <LogIn className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-blue-100">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <Card className="backdrop-blur-md bg-white/95 border-0 shadow-2xl animate-scale-in">
          <form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardContent className="pt-6 space-y-5">
              {justRegistered && (
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200 flex gap-2">
                  <span className="text-lg">✓</span>
                  <div>
                    <p className="font-semibold">Account created successfully!</p>
                    <p className="text-green-700">Please sign in with your credentials.</p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200 flex gap-2">
                  <span className="text-lg">⚠</span>
                  <div>
                    <p className="font-semibold">Login failed</p>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}
              
              <div className="floating-label-group">
                <Input
                  id="username"
                  type="text"
                  placeholder=" "
                  autoComplete="username"
                  className="floating-input border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-colors"
                  {...register('username')}
                />
                <Label htmlFor="username" className="floating-label">
                  Username
                </Label>
                {errors.username && (
                  <p className="text-sm text-red-600 pt-2 flex items-center gap-1">
                    <span>•</span> {errors.username.message}
                  </p>
                )}
              </div>

              <div className="floating-label-group">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder=" "
                    autoComplete="current-password"
                    className="floating-input border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-colors pr-10"
                    {...register('password')}
                  />
                  <Label htmlFor="password" className="floating-label">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  <p className="text-sm text-red-600 pt-2 flex items-center gap-1">
                    <span>•</span> {errors.password.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2 pb-6 px-6">
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 h-auto rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-75 disabled:hover:scale-100 shadow-lg"
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Sign in
                  </span>
                )}
              </Button>

              <div className="flex flex-col gap-3 text-sm">
                <Link
                  href="/forgot-password"
                  className="text-center text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-gray-400 text-xs">OR</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <p className="text-center text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                    Sign up here
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer text */}
        <p className="text-center text-white/70 text-xs mt-6">
          Protected by industry-standard security
        </p>
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
