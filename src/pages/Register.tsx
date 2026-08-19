import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getErrorMessage } from '../utils/errorHandling';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const targetEmail = email.trim().toLowerCase();

    try {
      // STEP 1: Supabase Authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: targetEmail,
        password: password,
        options: {
          data: {
            display_name: fullName.trim(),
          },
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('already registered')) {
          throw new Error('This email address is already registered in our system.');
        }
        throw authError;
      }

      // STEP 2: Upsert metadata into public.profiles (WITHOUT raw password!)
      if (authData?.user) {
        const { error: dbError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: authData.user.id,
              name: fullName.trim(),
              email: targetEmail,
            },
          ]);

        if (dbError) {
          console.error('Profile creation drop:', dbError.message);
        }
      }

      setSuccessMsg('Account registered successfully! Redirecting to home...');
      setFullName('');
      setEmail('');
      setPassword('');

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(getErrorMessage(err) || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-rose-50/30 font-sans antialiased">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-rose-100 rounded-3xl p-8 md:p-10 shadow-xl relative z-10">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-rose-900 rounded-2xl flex items-center justify-center text-amber-300 text-xl font-bold mx-auto mb-4 shadow-md">
              🌸
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-rose-950 tracking-tight">
              Create Account
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1.5 font-medium">
              Join Menakkhi Sarees for seamless checkout and order updates
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs font-semibold text-red-600">
              <span className="text-sm shrink-0">⚠️</span>
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs font-semibold text-emerald-700">
              <span className="text-sm shrink-0">🎉</span>
              <p className="leading-relaxed">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Nusrat Jahan"
                className="w-full text-xs md:text-sm border border-gray-200 bg-gray-50/50 px-4 py-3 rounded-xl focus:bg-white focus:outline-rose-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs md:text-sm border border-gray-200 bg-gray-50/50 px-4 py-3 rounded-xl focus:bg-white focus:outline-rose-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Secure Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs md:text-sm border border-gray-200 bg-gray-50/50 px-4 py-3 rounded-xl focus:bg-white focus:outline-rose-500 font-mono tracking-widest"
              />
            </div>

            <div className="pt-2 space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full text-xs md:text-sm font-black uppercase tracking-wider bg-rose-900 hover:bg-rose-800 disabled:bg-rose-400 text-white py-3.5 rounded-2xl shadow-md transition active:scale-[0.98] cursor-pointer text-center"
              >
                {loading ? 'Creating Account...' : 'Register Account'}
              </button>

              <div className="text-center pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-medium">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-rose-900 font-bold underline transition cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}