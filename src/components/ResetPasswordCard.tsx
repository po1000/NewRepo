import React, { useState } from 'react';
interface ResetPasswordCardProps {
  onNavigate: (page: 'login' | 'create' | 'reset') => void;
}
export function ResetPasswordCard({ onNavigate }: ResetPasswordCardProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reset password requested for:', email);
    setIsSubmitted(true);
  };
  return (
    <section
      aria-labelledby="reset-title"
      className="w-full max-w-[448px] bg-white rounded-xl border border-[#E5E7EB] p-8 flex flex-col gap-8 shadow-sm">

      {/* Header */}
      <div className="text-center flex flex-col gap-1">
        <h1
          id="reset-title"
          className="text-[20.4px] font-bold text-[#111827] leading-8">

          Reset Password
        </h1>
        <p className="text-[13.6px] text-[#6B7280] leading-6">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      {/* Status Message */}
      <div aria-live="polite" className="sr-only">
        {isSubmitted ? `Password reset link sent to ${email}` : ''}
      </div>

      {isSubmitted ?
      <div className="flex flex-col items-center gap-6 py-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true">

              <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7" />

            </svg>
          </div>
          <p className="text-[13.6px] text-[#374151] text-center leading-6">
            We've sent a password reset link to <br />
            <span className="font-semibold text-[#111827]">{email}</span>
          </p>
          <button
          type="button"
          onClick={() => onNavigate('login')}
          className="w-full h-[44px] mt-2 bg-[#FF4D01] hover:bg-[#E64500] text-white font-semibold text-[13.6px] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2">

            Return to Log In
          </button>
        </div> :

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Field */}
          <div>
            <label
            htmlFor="reset-email"
            className="block text-[11.9px] font-medium text-[#374151] leading-5 mb-2">

              Email Address
            </label>
            <input
            type="email"
            id="reset-email"
            name="email"
            autoComplete="email"
            required
            aria-required="true"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[42px] px-3 rounded-lg border border-[#D1D5DB] bg-white text-[13.6px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent transition-shadow" />

          </div>

          {/* Submit Button */}
          <button
          type="submit"
          className="w-full h-[44px] mt-4 bg-[#FF4D01] hover:bg-[#E64500] text-white font-semibold text-[13.6px] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2">

            Send Reset Link
          </button>
        </form>
      }

      {/* Footer Section */}
      {!isSubmitted &&
      <div className="text-center pt-2">
          <button
          type="button"
          onClick={() => onNavigate('login')}
          className="text-[11.9px] font-semibold text-[#4B5563] hover:text-[#111827] leading-5 transition-colors focus:outline-none focus:underline rounded-sm focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2 flex items-center justify-center gap-1 mx-auto">

            <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true">

              <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18" />

            </svg>
            Back to log in
          </button>
        </div>
      }
    </section>);

}