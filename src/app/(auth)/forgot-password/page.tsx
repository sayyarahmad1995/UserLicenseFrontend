'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail } from 'lucide-react';
import { useForgotPassword } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => {
        setSubmitted(true);
      },
    });
  };

  return (
    <div className="w-full max-w-md px-4 py-12">
        {/* Header section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-blue-100">Enter your email to receive a reset link</p>
        </div>

        {/* Card */}
        <Card className="backdrop-blur-md bg-white/95 border-0 shadow-2xl animate-scale-in">
          {submitted ? (
            <CardContent className="pt-6 pb-6 space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="rounded-lg bg-green-50 p-4 text-center border border-green-200 flex gap-2">
                <div className="w-full">
                  <h3 className="font-semibold text-green-900 mb-2">Check your email</h3>
                  <p className="text-sm text-green-800">
                    If an account exists with this email address, you will receive a password reset link shortly.
                  </p>
                </div>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <CardContent className="pt-6 space-y-5">
                <div className="floating-label-group">
                  <Input
                    id="email"
                    type="email"
                    placeholder=" "
                    autoComplete="email"
                    className="floating-input border-2 border-gray-200 focus:border-blue-500 hover:border-gray-300 transition-colors"
                    {...register('email')}
                    disabled={forgotPasswordMutation.isPending}
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
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-2 pb-6 px-6">
                <Button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 h-auto rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-75 disabled:hover:scale-100 shadow-lg"
                >
                  {forgotPasswordMutation.isPending ? (
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
                      Send Reset Link
                    </span>
                  )}
                </Button>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-gray-400 text-xs">REMEMBER PASSWORD?</span>
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
          )}
        </Card>

        {/* Footer text */}
        <p className="text-center text-white/70 text-xs mt-6">
          Protected by industry-standard security
        </p>
      </div>
  );
}
