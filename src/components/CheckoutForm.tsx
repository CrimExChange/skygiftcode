'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PRICING } from '@/lib/policy';
import { Upload, Loader2, QrCode, Phone, User, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutFormProps {
  value: 300 | 500 | 1000;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ value }) => {
  const router = useRouter();
  const priceInfo = PRICING[value];
  
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const calculatedTotal = (priceInfo.bulk && quantity >= priceInfo.bulk.qty)
    ? Math.floor((quantity / priceInfo.bulk.qty)) * priceInfo.bulk.price + (quantity % priceInfo.bulk.qty) * priceInfo.sale
    : priceInfo.sale * quantity;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !phone) {
      setError('Please complete all steps including slip upload.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const { data: coupons, error: couponError } = await supabase
        .from('coupons')
        .select('id')
        .eq('value', value)
        .eq('status', 'available')
        .limit(1);

      if (couponError || !coupons || coupons.length === 0) {
        throw new Error('This denomination just sold out. Please try another one.');
      }

      const couponId = coupons[0].id;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `slips/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-slips')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-slips')
        .getPublicUrl(filePath);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          coupon_id: couponId,
          buyer_name: name,
          buyer_phone: phone,
          price_paid: calculatedTotal,
          slip_url: publicUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      await supabase
        .from('coupons')
        .update({ status: 'reserved' })
        .eq('id', couponId);

      router.push(`/order/${order.id}`);
    } catch (err: any) {
      setError(err.message || 'Payment processing failed. Please check your connection.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 text-red-600 p-6 rounded-3xl text-sm font-bold border border-red-100 flex items-center"
          >
            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping mr-3" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 1: Summary */}
      <div className="bg-white p-10 rounded-4xl shadow-premium border border-slate-50">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Configure Order</h3>
        </div>
        
        <div className="flex items-center justify-between py-6 border-b border-slate-50">
          <div>
            <p className="font-bold text-slate-900">Quantity</p>
            <p className="text-xs text-slate-400">How many codes do you need?</p>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <span className="text-2xl font-light">-</span>
            </button>
            <span className="text-2xl font-black text-slate-900 w-8 text-center">{quantity}</span>
            <button 
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <span className="text-2xl font-light">+</span>
            </button>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between items-center">
          <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Investment</span>
          <span className="text-4xl font-black text-grab tracking-tighter">{calculatedTotal.toLocaleString()} <span className="text-lg">THB</span></span>
        </div>
      </div>

      {/* Step 2: Payment */}
      <div className="bg-white p-10 rounded-4xl shadow-premium border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-grab/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Payment Settlement</h3>
          </div>
          
          <div className="bg-slate-900 text-white p-8 rounded-3xl mb-8 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2">PromptPay Number</p>
                <p className="text-3xl font-mono font-black tracking-tight">
                  {process.env.NEXT_PUBLIC_PROMPTPAY_NUMBER || '081-234-5678'}
                </p>
              </div>
              <div className="bg-grab p-2 rounded-lg">
                <QrCode className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span>CrimExChange</span>
              <span>Shop Merchant</span>
            </div>
          </div>

          <label className={`block w-full border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${file ? "border-grab bg-grab/5" : "border-slate-100 bg-slate-50/50 hover:border-grab hover:bg-grab/5"}`}>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            {file ? (
              <div className="text-grab flex flex-col items-center">
                <CheckCircle className="w-10 h-10 mb-4 animate-bounce" />
                <p className="font-black truncate max-w-xs">{file.name}</p>
                <p className="text-xs opacity-60 mt-2 font-bold uppercase tracking-widest">Slip Received</p>
              </div>
            ) : (
              <div className="text-slate-400 flex flex-col items-center">
                <Upload className="w-10 h-10 mb-4 opacity-20" />
                <p className="font-bold text-slate-600">Upload Transfer Slip</p>
                <p className="text-xs mt-2 font-medium">JPG or PNG (max 5MB)</p>
              </div>
            )}
          </label>
          <button 
            type="button"
            onClick={() => setFile(new File([""], "mock-slip.png", { type: "image/png" }))}
            className="mt-4 text-[10px] text-slate-400 uppercase font-black tracking-widest hover:text-grab transition-colors"
          >
            [ Demo: Auto-fill Mock Slip ]
          </button>
        </div>
      </div>

      {/* Step 3: Delivery Info */}
      <div className="bg-white p-10 rounded-4xl shadow-premium border border-slate-50">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Delivery Details</h3>
        </div>

        <div className="space-y-6">
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-grab transition-colors" />
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-grab font-bold text-slate-900 placeholder:text-slate-300 transition-all"
              placeholder="Your full name"
            />
          </div>
          <div className="relative group">
            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-grab transition-colors" />
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-grab font-bold text-slate-900 placeholder:text-slate-300 transition-all"
              placeholder="Your phone number"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={uploading}
        className={`w-full py-6 rounded-3xl font-black text-xl flex items-center justify-center transition-all ${
          uploading 
            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
            : "bg-grab text-white hover:bg-grab-dark shadow-2xl shadow-grab/30 active:scale-[0.98]"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="mr-3 w-8 h-8 animate-spin" />
            Verifying Transaction...
          </>
        ) : (
          "Authorize & Order"
        )}
      </button>
    </form>
  );
};
