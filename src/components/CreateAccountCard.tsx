import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CreateAccountCardProps {
  onNavigate: (page: 'login' | 'create' | 'reset') => void;
}

export function CreateAccountCard({ onNavigate }: CreateAccountCardProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp, signInWithProvider } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error: authError } = await signUp(email, password, username);
    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    setError('');
    const { error: authError } = await signInWithProvider(provider);
    if (authError) {
      setError(authError.message);
    }
  };

  if (success) {
    return (
      <section className="w-full max-w-[448px] bg-white rounded-xl border border-[#E5E7EB] p-8 flex flex-col gap-8 shadow-sm">
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-[20.4px] font-bold text-[#111827] leading-8 mb-2">Check your email</h2>
            <p className="text-[13.6px] text-[#6B7280] leading-6">
              We sent a confirmation link to<br />
              <span className="font-semibold text-[#111827]">{email}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="w-full h-[44px] mt-2 bg-[#FF4D01] hover:bg-[#E64500] text-white font-semibold text-[13.6px] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2">
            Go to Log In
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="create-account-title"
      className="w-full max-w-[448px] bg-white rounded-xl border border-[#E5E7EB] p-8 flex flex-col gap-8 shadow-sm">

      {/* Header */}
      <div className="text-center flex flex-col gap-1">
        <h1
          id="create-account-title"
          className="text-[20.4px] font-bold text-[#111827] leading-8">
          Create Account
        </h1>
        <p className="text-[13.6px] text-[#6B7280] leading-6">
          Start learning Spanish today
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Username Field */}
        <div>
          <label
            htmlFor="username"
            className="block text-[11.9px] font-medium text-[#374151] leading-5 mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            autoComplete="username"
            required
            aria-required="true"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-[42px] px-3 rounded-lg border border-[#D1D5DB] bg-white text-[13.6px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent transition-shadow" />
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-[11.9px] font-medium text-[#374151] leading-5 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            required
            aria-required="true"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[42px] px-3 rounded-lg border border-[#D1D5DB] bg-white text-[13.6px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent transition-shadow" />
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-[11.9px] font-medium text-[#374151] leading-5 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              autoComplete="new-password"
              required
              aria-required="true"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[42px] pl-3 pr-10 rounded-lg border border-[#D1D5DB] bg-white text-[13.6px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent transition-shadow" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#374151] focus:outline-none focus:text-[#FF4D01]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-[11.9px] font-medium text-[#374151] leading-5 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              required
              aria-required="true"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-[42px] pl-3 pr-10 rounded-lg border border-[#D1D5DB] bg-white text-[13.6px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent transition-shadow" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#374151] focus:outline-none focus:text-[#FF4D01]"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[44px] mt-2 bg-[#FF4D01] hover:bg-[#E64500] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[13.6px] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2">
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      {/* Footer Section */}
      <div className="flex flex-col gap-4">
        {/* Social Login */}
        <div className="flex flex-row items-center justify-center gap-4">
          <span className="text-[13.6px] text-[#374151] leading-6">
            Or continue with:
          </span>
          <div className="flex flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2 rounded-full flex items-center justify-center"
              aria-label="Continue with Google">
              <img src="/313-292.svg" alt="" aria-hidden="true" className="w-[29px] h-[30px]" />
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2 rounded-full flex items-center justify-center"
              aria-label="Continue with Apple">
              <img src="/313-298.svg" alt="" aria-hidden="true" className="w-[30px] h-[30px]" />
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2 rounded-full flex items-center justify-center"
              aria-label="Continue with Facebook">
              <img src="/313-301.svg" alt="" aria-hidden="true" className="w-[30px] h-[30px]" />
            </button>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <span className="text-[11.9px] text-[#4B5563] leading-5">
            Already have an account?
          </span>
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="ml-1 text-[11.9px] font-semibold text-[#FF4D01] hover:text-[#E64500] leading-5 transition-colors focus:outline-none focus:underline rounded-sm focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2">
            Log in
          </button>
        </div>
      </div>
    </section>
  );
}
