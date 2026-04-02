import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the auth callback - Supabase puts tokens in the URL hash
    // when user clicks email confirmation or OAuth redirect
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        navigate('/', { replace: true });
        return;
      }

      if (session) {
        navigate('/dashboard', { replace: true });
        return;
      }

      // If no session yet, listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') {
          navigate('/dashboard', { replace: true });
        } else if (event === 'PASSWORD_RECOVERY') {
          navigate('/set-new-password', { replace: true });
        }
      });

      return () => subscription.unsubscribe();
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center"
      style={{ background: 'linear-gradient(to bottom left, #FF1500 0%, #FF9604 100%)' }}>
      <div className="w-full max-w-[448px] bg-white rounded-xl border border-[#E5E7EB] p-8 text-center shadow-sm">
        <p className="text-[13.6px] text-[#6B7280]">Completing sign in...</p>
      </div>
    </div>
  );
}
