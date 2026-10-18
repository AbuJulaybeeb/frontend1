'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthForm } from '@/components/auth/auth-form';
import { ErrorMessage } from '@/components/shared/error-message';
import { InlineFormError } from '@/components/shared/inline-form-error';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { getFieldErrorProps } from '@/lib/form-errors';

const signUpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpForm(): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    // Move focus to the first invalid control after a failed submit so keyboard
    // and screen reader users land on the field that needs fixing.
    shouldFocusError: true,
  });

  const nameError = getFieldErrorProps('name', errors.name?.message);
  const emailError = getFieldErrorProps('email', errors.email?.message);
  const passwordError = getFieldErrorProps('password', errors.password?.message);
  const confirmPasswordError = getFieldErrorProps(
    'confirmPassword',
    errors.confirmPassword?.message
  );

  const onSubmit = async (data: SignUpFormData): Promise<void> => {
    setError(null);
    try {
      console.log('Sign up:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    }
  };

  return (
    <AuthForm
      title="Create Account"
      description="Join thousands of creators and supporters"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-primary hover:underline font-semibold">
            Sign in
          </Link>
        </>
      }
    >
      {/* noValidate: the Zod messages rendered below are the single source of
          truth for validity. Without it the browser's own bubbles short-circuit
          submit and the inline errors never appear. */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="John Doe"
            {...register('name')}
            disabled={isSubmitting}
            {...nameError.aria}
          />
          <InlineFormError id={nameError.errorId} message={nameError.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            disabled={isSubmitting}
            {...emailError.aria}
          />
          <InlineFormError id={emailError.errorId} message={emailError.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('password')}
            disabled={isSubmitting}
            {...passwordError.aria}
          />
          <InlineFormError id={passwordError.errorId} message={passwordError.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            disabled={isSubmitting}
            {...confirmPasswordError.aria}
          />
          <InlineFormError
            id={confirmPasswordError.errorId}
            message={confirmPasswordError.message}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner size="sm" /> : 'Create Account'}
        </Button>
      </form>
    </AuthForm>
  );
}