import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginCardProps {
  onNavigate: (page: 'login' | 'create' | 'reset') => void;
}

export function LoginCard({ onNavigate }: LoginCardProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithProvider } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError.message);
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

  return (
    <section
      aria-labelledby="login-title"
      className="w-full max-w-[448px] bg-white rounded-xl border border-[#E5E7EB] p-8 flex flex-col gap-8 shadow-sm">

      {/* Header */}
      <div className="text-center flex flex-col gap-1">
        <h1
          id="login-title"
          className="text-[20.4px] font-bold text-[#111827] leading-8">
          Welcome Back
        </h1>
        <p className="text-[13.6px] text-[#6B7280] leading-6">
          Log in to continue learning Spanish
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
        {/* Email Field */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-[11.9px] font-medium text-[#374151] leading-5 mb-2">
            Email
          </label>
          <input
            type="email"
            id="login-email"
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
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="login-password"
              className="block text-[11.9px] font-medium text-[#374151] leading-5">
              Password
            </label>
            <button
              type="button"
              onClick={() => onNavigate('reset')}
              className="text-[11.9px] font-medium text-[#FF4D01] hover:text-[#E64500] focus:outline-none focus:underline rounded-sm focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="login-password"
              name="password"
              autoComplete="current-password"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[44px] mt-2 bg-[#FF4D01] hover:bg-[#E64500] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[13.6px] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2">
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      {/* Footer Section */}
      <div className="flex flex-col gap-4">
        {/* Social Login */}
        <div className="flex flex-row items-center justify-center gap-4">
          <span className="text-[13.6px] text-[#374151] leading-6">
            Or log in with:
          </span>
          <div className="flex flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2 rounded-full flex items-center justify-center"
              aria-label="Log in with Google">
              <img src="/313-292.svg" alt="" aria-hidden="true" className="w-[29px] h-[30px]" />
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2 rounded-full flex items-center justify-center"
              aria-label="Log in with Apple">
              <img src="/313-298.svg" alt="" aria-hidden="true" className="w-[30px] h-[30px]" />
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2 rounded-full flex items-center justify-center"
              aria-label="Log in with Facebook">
              <img src="/313-301.svg" alt="" aria-hidden="true" className="w-[30px] h-[30px]" />
            </button>
          </div>
        </div>

        {/* Create Account Link */}
        <div className="text-center">
          <span className="text-[11.9px] text-[#4B5563] leading-5">
            Don't have an account?
          </span>
          <button
            type="button"
            onClick={() => onNavigate('create')}
            className="ml-1 text-[11.9px] font-semibold text-[#FF4D01] hover:text-[#E64500] leading-5 transition-colors focus:outline-none focus:underline rounded-sm focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2">
            Sign up
          </button>
        </div>
      </div>
    </section>
  );
}
