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
  return (
    <div className="w-full max-w-[448px] bg-white rounded-xl border border-[#E5E7EB] p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-[#111827] leading-8 mb-1">
          Create Account
        </h1>
        <p className="text-sm text-[#6B7280] leading-6">
          Start learning Spanish today
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Field */}
        <div>
          <label
            htmlFor="username"
            className="block text-xs font-medium text-[#374151] leading-5 mb-2">

            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-[42px] px-3 rounded-lg border border-[#D1D5DB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent transition-shadow" />

        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-[#374151] leading-5 mb-2">

            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[42px] px-3 rounded-lg border border-[#D1D5DB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent transition-shadow" />

        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-[#374151] leading-5 mb-2">

            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[42px] px-3 rounded-lg border border-[#D1D5DB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent transition-shadow" />

        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-medium text-[#374151] leading-5 mb-2">

            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-[42px] px-3 rounded-lg border border-[#D1D5DB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent transition-shadow" />

        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full h-[44px] mt-2 bg-[#FF4D01] hover:bg-[#E64500] text-white font-semibold text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2">

          Sign Up
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <span className="text-xs text-[#4B5563] leading-5">
          Already have an account?
        </span>
        <button
          type="button"
          onClick={handleLoginClick}
          className="ml-1 text-xs font-semibold text-[#FF4D01] hover:text-[#E64500] leading-5 transition-colors focus:outline-none focus:underline">

          Log in
        </button>
      </div>
    </div>);

}