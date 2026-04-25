'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  ExternalLink,
  ChevronLeft,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [coupon, setCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrder();

    const channel = supabase
      .channel('order-status')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` },
        (payload) => {
          setOrder(payload.new);
          if (payload.new.status === 'confirmed') {
            fetchCoupon(payload.new.coupon_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data, error: orderError } = await supabase
        .from('orders')
        .select('*, coupons(*)')
        .eq('id', id)
        .single();

      if (orderError) throw orderError;
      setOrder(data);
      
      if (data.status === 'confirmed') {
        setCoupon(data.coupons);
      }
    } catch (err: any) {
      setError(err.message || 'We could not find that order.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupon = async (couponId: string) => {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', couponId)
      .single();
    setCoupon(data);
  };

  const handleCopy = () => {
    if (coupon?.code) {
      navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 bg-grab rounded-3xl mb-4"
        />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="bg-white p-12 rounded-4xl shadow-premium border border-slate-100 max-w-sm">
          <XCircle className="w-16 h-16 text-red-400 mb-6 mx-auto" />
          <h1 className="text-2xl font-black text-slate-900 mb-2">Order Not Found</h1>
          <p className="text-slate-500 mb-8">{error}</p>
          <Link href="/" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-slate-800 transition-all">
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-24">
      {/* Premium Header */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 hover:bg-slate-50 rounded-xl transition-colors group">
            <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Transaction ID</span>
            <span className="font-mono text-xs font-bold text-slate-900">{order.id.split('-')[0].toUpperCase()}</span>
          </div>
          <div className="w-10"></div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 mt-12">
        <AnimatePresence mode="wait">
          {order.status === 'pending' && (
            <motion.div 
              key="pending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-4xl p-12 shadow-premium border border-slate-100 text-center"
            >
              <div className="relative mb-10">
                <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-12 h-12 text-yellow-600 animate-pulse" />
                </div>
                <div className="absolute top-0 right-1/2 translate-x-12 bg-white p-2 rounded-full shadow-lg">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
                </div>
              </div>
              
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Under Review</h2>
              <p className="text-slate-500 mb-10 leading-relaxed max-w-sm mx-auto">
                Our team is currently verifying your payment slip. This typically takes <span className="text-slate-900 font-bold">15 minutes</span>.
              </p>

              <div className="bg-slate-50 rounded-3xl p-8 text-left space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Payment Summary</span>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-slate-900 font-bold">Amount Paid</span>
                  <span className="text-2xl font-black text-grab tracking-tight">{order.price_paid.toLocaleString()} THB</span>
                </div>
              </div>
              
              <p className="mt-10 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
                Page will auto-update upon confirmation
              </p>
            </motion.div>
          )}

          {order.status === 'confirmed' && (
            <motion.div 
              key="confirmed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-4xl p-2 shadow-premium border border-slate-100 overflow-hidden"
            >
              <div className="bg-grab p-12 rounded-[2.5rem] text-center text-white relative overflow-hidden">
                {/* Decorative sparkles */}
                <Sparkles className="absolute top-10 left-10 w-20 h-20 text-white/10" />
                <Sparkles className="absolute bottom-10 right-10 w-32 h-32 text-white/5" />
                
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-black tracking-tighter mb-4">Code Activated</h2>
                <p className="text-white/80 font-medium">Your Grab Gift Card is ready for use.</p>
              </div>

              <div className="p-10">
                <div className="bg-slate-50 border-2 border-slate-100 border-dashed rounded-[2rem] p-10 relative">
                  <div className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-6 text-center">Your Redemption Key</div>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-premium border border-white text-center mb-10">
                    <span className="text-3xl md:text-4xl font-mono font-black tracking-tighter text-slate-900 break-all">
                      {coupon?.code || '••••••••'}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-12">
                    <button 
                      onClick={handleCopy}
                      className="flex-1 bg-slate-900 text-white py-5 rounded-2xl flex items-center justify-center font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
                    >
                      {copied ? <CheckCircle2 className="w-5 h-5 mr-2 text-grab" /> : <Copy className="w-5 h-5 mr-2" />}
                      {copied ? "Key Copied" : "Copy to Clipboard"}
                    </button>
                    <a 
                      href="https://m.grab.com/pay" 
                      target="_blank" 
                      className="flex-1 bg-white border border-slate-200 text-slate-900 py-5 rounded-2xl flex items-center justify-center font-bold hover:bg-slate-50 transition-all active:scale-95"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Redeem Now
                    </a>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="p-6 bg-white rounded-3xl shadow-premium border border-white mb-6">
                      {coupon?.code && (
                        <QRCodeSVG value={coupon.code} size={200} level="H" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Scan to Apply Code</p>
                  </div>
                </div>

                <div className="mt-12 bg-grab/5 rounded-3xl p-8 border border-grab/10">
                  <h4 className="font-black text-grab text-xs uppercase tracking-widest mb-4">Post-Purchase Guarantee</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start text-xs text-slate-600 font-medium">
                      <ArrowRight className="w-4 h-4 mr-2 text-grab flex-shrink-0" />
                      Redeem this code within 72 hours for guaranteed validity.
                    </li>
                    <li className="flex items-start text-xs text-slate-600 font-medium">
                      <ArrowRight className="w-4 h-4 mr-2 text-grab flex-shrink-0" />
                      Full refund processed instantly if the code is invalid.
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {order.status === 'cancelled' && (
            <motion.div 
              key="cancelled"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-4xl p-12 shadow-premium border border-slate-100 text-center"
            >
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-10">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Verification Failed</h2>
              <p className="text-slate-500 mb-10 leading-relaxed">
                We couldn't verify your payment slip. Please check your bank statement and contact support.
              </p>
              <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-left">
                <p className="text-xs font-black text-red-700 uppercase tracking-widest mb-3">Refund Protocol</p>
                <p className="text-sm text-red-600 font-medium">
                  Your funds are safe. Please message our support with your Transaction ID to initiate a manual refund.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
