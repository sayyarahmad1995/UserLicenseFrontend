'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';
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

  return (
    <div className="w-full max-w-md px-4 py-12">
        {/* Header section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-blue-100">Join us and get started in seconds</p>
        </div>

        {/* Card */}
        <Card className="backdrop-blur-md bg-white/95 border-0 shadow-2xl animate-scale-in">
          <form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardContent className="pt-6 space-y-5">
              {success && (
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200 flex gap-2">
                  <span className="text-lg">✓</span>
                  <div>
                    <p className="font-semibold">Registration successful!</p>
                    <p className="text-green-700">Please check your email to verify your account. Redirecting to login...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200 flex gap-2">
                  <span className="text-lg">⚠</span>
                  <p>{error}</p>
                </div>
              )}

              <div className="floating-label-group">
                <Input
                  id="username"
                  type="text"
                  placeholder=" "
                  autoComplete="username"
                  disabled={isPending}
                  className="floating-input border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-colors"
                  {...registerField('username')}
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
                <Input
                  id="email"
                  type="email"
                  placeholder=" "
                  autoComplete="email"
                  disabled={isPending}
                  className="floating-input border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-colors"
                  {...registerField('email')}
                />
                <Label htmlFor="email" className="floating-label">
                  Email Address
                </Label>
                {errors.email && (
                  <p className="text-sm text-red-600 pt-2 flex items-center gap-1">
                    <span>•</span> {errors.email.message}
                  </p>
                )}
              </div>

              <div className="floating-label-group">
                <Input
                  id="password"
                  type="password"
                  placeholder=" "
                  autoComplete="new-password"
                  disabled={isPending}
                  className="floating-input border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-colors"
                  {...registerField('password')}
                />
                <Label htmlFor="password" className="floating-label">
                  Password
                </Label>
                {errors.password && (
                  <p className="text-sm text-red-600 pt-2 flex items-center gap-1">
                    <span>•</span> {errors.password.message}
                  </p>
                )}
              </div>

              <div className="floating-label-group">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder=" "
                  autoComplete="new-password"
                  disabled={isPending}
                  className="floating-input border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-colors"
                  {...registerField('confirmPassword')}
                />
                <Label htmlFor="confirmPassword" className="floating-label">
                  Confirm Password
                </Label>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 pt-2 flex items-center gap-1">
                    <span>•</span> {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2 pb-6 px-6">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 h-auto rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-75 disabled:hover:scale-100 shadow-lg"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Create Account
                  </span>
                )}
              </Button>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-gray-400 text-xs">ALREADY HAVE AN ACCOUNT?</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <p className="text-center text-gray-600">
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                    Sign in here
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
