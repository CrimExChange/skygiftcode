'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CouponCard } from '@/components/CouponCard';
import { PRICING, POLICIES } from '@/lib/policy';
import { ShieldCheck, Clock, RefreshCcw, Sparkles, X, ChevronRight, CreditCard, Ticket, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [stock, setStock] = useState({ 300: 0, 500: 0, 1000: 0 });
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showDenominations, setShowDenominations] = useState(false);

  useEffect(() => {
    async function fetchStock() {
      const { data } = await supabase
        .from('coupons')
        .select('value, status')
        .eq('status', 'available');
      
      if (data) {
        setStock({
          300: data.filter((c: any) => c.value === 300).length,
          500: data.filter((c: any) => c.value === 500).length,
          1000: data.filter((c: any) => c.value === 1000).length,
        });
      }
    }
    fetchStock();
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFDFD] selection:bg-grab/30">
      {/* Premium Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-grab rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">GrabShop</span>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-semibold text-slate-600">
            <a href="#" className="hover:text-grab transition-colors">Pricing</a>
            <a href="#" className="hover:text-grab transition-colors">Guarantee</a>
            <a href="#" className="hover:text-grab transition-colors">FAQ</a>
          </div>
          <button className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
            Support
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          {/* Abstract background blobs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-grab/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl" />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center relative z-10"
          >
            <div className="inline-flex items-center space-x-2 bg-grab/10 text-grab px-4 py-1.5 rounded-full text-sm font-bold mb-8 border border-grab/10">
              <Sparkles className="w-4 h-4" />
              <span>Available until July 2026</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight text-slate-900 leading-[0.9]">
              Gift Cards <br />
              <span className="text-grab">Redefined.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
              The most reliable way to get Grab coupons instantly. Secure, automated, and backed by our 100% satisfaction guarantee.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
              <button 
                onClick={() => setShowDenominations(true)}
                className="bg-grab text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-grab-dark transition-all hover:shadow-2xl hover:shadow-grab/20 active:scale-95"
              >
                Explore Denominations
              </button>
              <button 
                onClick={() => setShowHowItWorks(true)}
                className="bg-white border border-gray-200 text-slate-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all active:scale-95"
              >
                How it works
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Coupon Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <CouponCard value={300} stock={stock[300]} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <CouponCard value={500} stock={stock[500]} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <CouponCard value={1000} stock={stock[1000]} />
          </motion.div>
        </div>
      </section>

      {/* Features / Policy Section */}
      <section className="bg-slate-50 py-24 px-6 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-10 rounded-4xl shadow-premium border border-white">
              <div className="w-14 h-14 bg-grab/10 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="text-grab w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Instant Fulfillment</h3>
              <p className="text-slate-500 leading-relaxed">
                Our system confirms your payment and delivers the code {POLICIES.ADMIN_CONFIRMATION_TIME}. Zero waiting, zero hassle.
              </p>
            </div>
            
            <div className="bg-white p-10 rounded-4xl shadow-premium border border-white">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="text-blue-600 w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Purchase Protection</h3>
              <p className="text-slate-500 leading-relaxed">
                Codes are valid for {POLICIES.COLLECT_WINDOW_DAYS} days. We ensure every code you buy is fresh and redeemable.
              </p>
            </div>

            <div className="bg-white p-10 rounded-4xl shadow-premium border border-white">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <RefreshCcw className="text-purple-600 w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Worry-free Refunds</h3>
              <p className="text-slate-500 leading-relaxed">
                Platform error? Redemption bug? {POLICIES.REFUND_GUARANTEE}. Your trust is our priority.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <p className="text-slate-400 text-sm font-medium">
            © 2026 GrabShop. Platform Expiry: {POLICIES.PLATFORM_EXPIRY}
          </p>
        </div>
      </footer>

      {/* How it Works Modal */}
      <AnimatePresence>
        {showHowItWorks && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-start justify-center p-6 pt-10 md:items-center md:pt-6"
            onClick={() => setShowHowItWorks(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative max-h-[95vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowHowItWorks(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 md:p-12">
                <div className="inline-flex items-center space-x-2 bg-grab/10 text-grab px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
                  <Shield className="w-2.5 h-2.5" />
                  <span>Secure Protocol</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-8">How it works</h2>

                <div className="space-y-6">
                  {[
                    { icon: Ticket, title: "Select Value", desc: "Choose 300, 500, or 1000 THB." },
                    { icon: CreditCard, title: "Secure Payment", desc: "Scan QR and upload transfer slip." },
                    { icon: Clock, title: "Quick Verify", desc: "Automated confirmation in minutes." },
                    { icon: Sparkles, title: "Get Code", desc: "Unique code displayed instantly." }
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center space-x-4 group">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-grab group-hover:text-white transition-all">
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm">{step.title}</h3>
                        <p className="text-slate-400 text-xs">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <button 
                    onClick={() => setShowHowItWorks(false)}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-grab transition-all shadow-lg"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explore Denominations Modal */}
      <AnimatePresence>
        {showDenominations && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-start justify-center p-6 pt-10 md:items-center md:pt-6"
            onClick={() => setShowDenominations(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative max-h-[95vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowDenominations(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 md:p-10">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-8">Available Tiers</h2>

                <div className="space-y-3">
                  {[
                    { val: 300, color: "bg-blue-500", icon: Clock, feat: "Perfect for quick rides" },
                    { val: 500, color: "bg-grab", icon: Sparkles, feat: "Most popular choice" },
                    { val: 1000, color: "bg-purple-600", icon: ShieldCheck, feat: "Best value for heavy users" }
                  ].map((tier, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 ${tier.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
                          <tier.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-baseline space-x-1">
                            <span className="font-black text-slate-900">{tier.val}</span>
                            <span className="text-[10px] font-bold text-slate-400">THB</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">{tier.feat}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-grab">{(PRICING as any)[tier.val].sale} THB</p>
                        {(PRICING as any)[tier.val].bulk && (
                          <span className="text-[8px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Bulk Deal</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => setShowDenominations(false)}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-grab transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
