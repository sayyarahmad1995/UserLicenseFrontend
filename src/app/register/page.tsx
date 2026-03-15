'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegister } from '@/hooks/use-auth';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username cannot exceed 50 characters').regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const { mutate: register, isPending } = useRegister();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    setError('');
    setSuccess(false);
    register(
      {
        username: data.username,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        },
        onError: (err: any) => {
          const apiResponse = err.response?.data;
          
          // Check for rate limiting data
          if (apiResponse?.Data && apiResponse.Data.InPenalty) {
            const penaltySeconds = apiResponse.Data.PenaltyRemainingSeconds;
            const minutes = Math.ceil(penaltySeconds / 60);
            setError(
              `Too many registration attempts. Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before trying again.`
            );
            return;
          }
          
          // Check for remaining attempts on rate limit
          if (apiResponse?.Data && 'RemainingAttempts' in apiResponse.Data) {
            const remaining = apiResponse.Data.RemainingAttempts;
            if (remaining === 0 && apiResponse.Data.NextAttemptInSeconds !== null) {
              const seconds = apiResponse.Data.NextAttemptInSeconds;
              setError(
                `Too many registration attempts. Please wait ${seconds} second${seconds !== 1 ? 's' : ''} before trying again.`
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
          
          // Fallback to generic message
          setError(apiResponse?.Message || apiResponse?.message || 'Registration failed. Please try again.');
        },
      }
    );
  };

  // Show loading state while checking for existing session
  if (false) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 animate-fade-in overflow-hidden">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="animate-slide-in">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Choose a username and enter your email to get started</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="space-y-6">
            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                ✓ Registration successful! Please check your email to verify your account. Redirecting to login in 3 seconds...
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
                {...registerField('username')}
                disabled={isPending}
              />
              <Label htmlFor="username" className="floating-label">Username</Label>
              {errors.username && (
                <p className="text-sm text-red-600 pt-1">{errors.username.message}</p>
              )}
            </div>

            <div className="floating-label-group">
              <Input
                id="email"
                type="email"
                placeholder=" "
                autoComplete="email"
                className="floating-input"
                {...registerField('email')}
                disabled={isPending}
              />
              <Label htmlFor="email" className="floating-label">Email</Label>
              {errors.email && (
                <p className="text-sm text-red-600 pt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="floating-label-group">
              <Input
                id="password"
                type="password"
                placeholder=" "
                autoComplete="new-password"
                className="floating-input"
                {...registerField('password')}
                disabled={isPending}
              />
              <Label htmlFor="password" className="floating-label">Password</Label>
              {errors.password && (
                <p className="text-sm text-red-600 pt-1">{errors.password.message}</p>
              )}
            </div>
            <p className="text-xs text-gray-500 left-7 absolute -translate-y-5">
              Use 8+ characters with uppercase, lowercase, number, and symbol.
            </p>

            <div className="floating-label-group">
              <Input
                id="confirmPassword"
                type="password"
                placeholder=" "
                autoComplete="new-password"
                className="floating-input"
                {...registerField('confirmPassword')}
                disabled={isPending}
              />
              <Label htmlFor="confirmPassword" className="floating-label">Confirm Password</Label>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 pt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button type="submit" className="w-full" disabled={isPending || success}>
              {success ? 'Redirecting to login...' : isPending ? 'Creating account...' : 'Create account'}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
