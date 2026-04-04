import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function SetNewPasswordCard() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error: authError } = await updatePassword(password);
    if (authError) {
      setError(authError.message);
    } else {
      navigate('/dashboard', { replace: true });
    }
    setLoading(false);
  };

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(to bottom left, #FF1500 0%, #FF9604 100%)' }}>
      <section className="w-full max-w-[448px] bg-white rounded-xl border border-[#E5E7EB] p-8 flex flex-col gap-8 shadow-sm">
        <div className="text-center flex flex-col gap-1">
          <h1 className="text-[20.4px] font-bold text-[#111827] leading-8">Set New Password</h1>
          <p className="text-[13.6px] text-[#6B7280] leading-6">Enter your new password below</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-lg" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="new-password" className="block text-[11.9px] font-medium text-[#374151] leading-5 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[42px] pl-3 pr-10 rounded-lg border border-[#D1D5DB] bg-white text-[13.6px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#374151]">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="block text-[11.9px] font-medium text-[#374151] leading-5 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-[42px] px-3 rounded-lg border border-[#D1D5DB] bg-white text-[13.6px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[44px] mt-2 bg-[#FF4D01] hover:bg-[#E64500] disabled:opacity-60 text-white font-semibold text-[13.6px] rounded-lg transition-colors">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </section>
    </main>
  );
}
