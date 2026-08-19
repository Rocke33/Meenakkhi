import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getErrorMessage } from '../utils/errorHandling';

export default function Subscribe() {
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    async function checkSubscriptionStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          const { data, error } = await supabase
            .from('subscribers')
            .select('email')
            .eq('email', user.email.toLowerCase())
            .maybeSingle();

          if (!error && data) {
            setIsSubscribed(true);
          }
        }
      } catch (err) {
        console.error('Subscription check error:', getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    checkSubscriptionStatus();
  }, []);

  const handleSubscribeAction = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !user.email) {
        navigate('/login');
        return;
      }

      setActionLoading(true);

      const { error } = await supabase
        .from('subscribers')
        .insert([{ email: user.email.toLowerCase() }]);

      if (error) {
        if (error.code === '23505') {
          setIsSubscribed(true);
          return;
        }
        throw error;
      }

      setIsSubscribed(true);
    } catch (err) {
      console.error('Failed to subscribe:', getErrorMessage(err));
      alert('Could not update subscription settings.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsubscribeAction = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) return;

      setActionLoading(true);

      const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('email', user.email.toLowerCase());

      if (error) throw error;

      setIsSubscribed(false);
    } catch (err) {
      console.error('Failed to unsubscribe:', getErrorMessage(err));
      alert('Could not update subscription settings.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="my-12 bg-rose-900 rounded-3xl p-8 text-center text-white shadow-md animate-pulse">
        <div className="h-6 w-48 bg-rose-800 rounded mx-auto mb-3"></div>
        <div className="h-4 w-64 bg-rose-800 rounded mx-auto"></div>
      </section>
    );
  }

  return (
    <section className="my-12 bg-gradient-to-br from-rose-950 via-rose-900 to-red-950 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-rose-500/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="max-w-xl mx-auto relative z-10">
        <span className="inline-block text-3xl mb-2 select-none">
          {isSubscribed ? '🔔' : '💌'}
        </span>
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3 tracking-tight text-amber-100">
          {isSubscribed ? 'You are Subscribed!' : 'Menakkhi VIP Saree Club'}
        </h2>
        <p className="text-rose-100/80 text-xs md:text-sm mb-6 max-w-md mx-auto leading-relaxed">
          {isSubscribed
            ? 'You are currently registered for new saree weave drops, festival pre-orders, and VIP discount alerts.'
            : 'Subscribe to receive early notifications on exclusive Jamdani, Silk, and Katan drops, plus festive offers.'}
        </p>

        <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
          {!isSubscribed ? (
            <button
              disabled={actionLoading}
              onClick={handleSubscribeAction}
              className="w-full bg-amber-400 hover:bg-amber-300 text-rose-950 font-black text-xs uppercase tracking-wider py-3.5 px-8 rounded-2xl shadow-lg transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Subscribe to Saree Drops'}
            </button>
          ) : (
            <div className="w-full space-y-3">
              <div className="w-full bg-emerald-600 text-white font-black text-xs uppercase tracking-widest py-3.5 px-8 rounded-2xl shadow-md border border-emerald-500/30 select-none">
                ✓ VIP Member Subscribed
              </div>

              <button
                disabled={actionLoading}
                onClick={handleUnsubscribeAction}
                className="text-[11px] font-bold text-rose-200 hover:text-white transition underline cursor-pointer disabled:opacity-40"
              >
                {actionLoading ? 'Updating...' : 'Unsubscribe from notifications'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}