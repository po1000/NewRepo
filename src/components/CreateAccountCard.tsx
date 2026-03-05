import React, { useState } from 'react';
export function CreateAccountCard() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic would go here
    console.log('Form submitted:', {
      username,
      email,
      password,
      confirmPassword
    });
  };
  const handleLoginClick = () => {
    // Navigation to login would go here
    console.log('Navigate to login');
  };
  const handleSocialLogin = (provider: string) => {
    console.log(`Continue with ${provider}`);
  };
  return (
    <div className="w-full max-w-[448px] bg-white rounded-xl border border-[#E5E7EB] p-8 flex flex-col gap-8 shadow-sm">
      {/* Header */}
      <div className="text-center flex flex-col gap-1">
        <h1 className="text-[20.4px] font-bold text-[#111827] leading-8">
          Create Account
        </h1>
        <p className="text-[13.6px] text-[#6B7280] leading-6">
          Start learning Spanish today
        </p>
      </div>

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
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[42px] px-3 rounded-lg border border-[#D1D5DB] bg-white text-[13.6px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent transition-shadow" />

        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-[11.9px] font-medium text-[#374151] leading-5 mb-2">

            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-[42px] px-3 rounded-lg border border-[#D1D5DB] bg-white text-[13.6px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent transition-shadow" />

        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full h-[44px] mt-2 bg-[#FF4D01] hover:bg-[#E64500] text-white font-semibold text-[13.6px] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2">

          Sign Up
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
              onClick={() => handleSocialLogin('Google')}
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2 rounded-full flex items-center justify-center"
              aria-label="Continue with Google">

              <img
                src="/313-292.svg"
                alt="Google"
                className="w-[29px] h-[30px]" />

            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('Apple')}
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2 rounded-full flex items-center justify-center"
              aria-label="Continue with Apple">

              <img
                src="/313-298.svg"
                alt="Apple"
                className="w-[30px] h-[30px]" />

            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('Facebook')}
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2 rounded-full flex items-center justify-center"
              aria-label="Continue with Facebook">

              <img
                src="/313-301.svg"
                alt="Facebook"
                className="w-[30px] h-[30px]" />

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
            onClick={handleLoginClick}
            className="ml-1 text-[11.9px] font-semibold text-[#FF4D01] hover:text-[#E64500] leading-5 transition-colors focus:outline-none focus:underline">

            Log in
          </button>
        </div>
      </div>
    </div>);

}