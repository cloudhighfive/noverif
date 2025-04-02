// src/components/auth/LoginForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginSchema } from '@/utils/validators';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

type LoginFormData = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  
  const { login } = useAuth();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.message || 'Failed to login. Please check your credentials and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <Input
          id="email"
          type="email"
          label="Email Address"
          placeholder="Enter your email address"
          error={errors.email?.message}
          {...register('email')}
        />
        
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <div className="text-right">
        <Link href="/forgot-password" className="text-sm text-primary-500 hover:underline">
          Forgot password?
        </Link>
      </div>

      <div className="pt-2">
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Log In
        </Button>
      </div>

      <p className="text-center text-gray-400 text-sm mt-4">
        Don't have an account?{' '}
        <Link href="/sign-up" className="text-primary-500 hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;