import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <section className="w-full max-w-[448px] bg-white rounded-xl border border-[#E5E7EB] p-8 flex flex-col gap-6 shadow-sm">
      <div className="text-center flex flex-col gap-1">
        <h1 className="text-[20.4px] font-bold text-[#111827] leading-8">
          Welcome!
        </h1>
        <p className="text-[13.6px] text-[#6B7280] leading-6">
          Signed in as <span className="font-semibold text-[#111827]">{user?.email}</span>
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 text-green-700 text-[13px] px-4 py-3 rounded-lg text-center">
        Authentication is working! You are logged in.
      </div>

      <button
        type="button"
        onClick={signOut}
        className="w-full h-[44px] bg-[#FF4D01] hover:bg-[#E64500] text-white font-semibold text-[13.6px] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:ring-offset-2">
        Sign Out
      </button>
    </section>
  );
}
