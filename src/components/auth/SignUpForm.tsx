import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signUpSchema } from '@/utils/validators';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

type SignUpFormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
};

const SignUpForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });
  
  const { register: registerUser } = useAuth();

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const { confirmPassword, ...userData } = data;
      await registerUser(data.email, data.password, userData);
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'Failed to register. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <Input
          id="name"
          label="Full Name"
          placeholder="Enter your full name"
          error={errors.name?.message}
          {...register('name')}
        />
        
        <Input
          id="email"
          type="email"
          label="Email Address"
          placeholder="Enter your email address"
          error={errors.email?.message}
          {...register('email')}
        />
        
        <Input
          id="phone"
          type="tel"
          label="Phone Number"
          placeholder="Enter your phone number"
          error={errors.phone?.message}
          {...register('phone')}
        />
        
        <Input
          id="address"
          label="Address"
          placeholder="Enter your address"
          error={errors.address?.message}
          {...register('address')}
        />
        
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="Create a secure password"
          error={errors.password?.message}
          {...register('password')}
        />
        
        <Input
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>

      <div className="pt-2">
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Create Account
        </Button>
      </div>

      <p className="text-center text-gray-400 text-sm mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-500 hover:underline">
          Log in
        </Link>
      </p>

      <div className="text-center text-xs text-gray-500 mt-6">
        <p>No documents. No waiting. Just your basic details, and you're in.</p>
        <p className="mt-1">We'll never share your data. Ever.</p>
      </div>
    </form>
  );
};

export default SignUpForm;