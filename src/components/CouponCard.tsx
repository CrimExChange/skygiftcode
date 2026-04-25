'use client';

import React from 'react';
import Link from 'next/link';
import { PRICING, POLICIES } from '@/lib/policy';
import { motion } from 'framer-motion';
import { ArrowRight, Ticket } from 'lucide-react';

interface CouponCardProps {
  value: 300 | 500 | 1000;
  stock: number;
}

export const CouponCard: React.FC<CouponCardProps> = ({ value, stock }) => {
  const price = PRICING[value];

  return (
    <div className="group relative bg-white rounded-4xl p-8 border border-slate-100 shadow-premium transition-all duration-500 hover:shadow-premium-hover hover:-translate-y-2 flex flex-col h-full overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-grab/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-grab/10 transition-colors" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div className="w-12 h-12 bg-grab/10 rounded-2xl flex items-center justify-center">
            <Ticket className="text-grab w-6 h-6" />
          </div>
          {(price as any).bulk && (
            <div className="bg-yellow-50 text-yellow-700 text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-widest border border-yellow-100">
              Bulk Save
            </div>
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Denomination</h3>
        <div className="mb-8">
          <span className="text-5xl font-black text-slate-900 tracking-tighter">{value}</span>
          <span className="text-xl font-bold text-slate-400 ml-2">THB</span>
        </div>

        <div className="space-y-4 mb-10 flex-grow">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 font-medium">Sale Price</span>
            <span className="text-grab font-black text-xl">{price.sale} THB</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 font-medium">Stock Status</span>
            <span className={`font-bold ${stock > 0 ? "text-slate-900" : "text-red-400"}`}>
              {stock > 0 ? `${stock} codes` : "Sold Out"}
            </span>
          </div>
          {(price as any).bulk && (
            <div className="pt-4 mt-4 border-t border-slate-50">
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Best value: <span className="text-slate-900 font-bold">{(price as any).bulk.qty} pcs</span> for only <span className="text-grab font-bold">{(price as any).bulk.price.toLocaleString()} THB</span>.
              </p>
            </div>
          )}
        </div>

        <Link 
          href={stock > 0 ? `/checkout/${value}` : "#"}
          className={`group/btn w-full py-5 rounded-2xl font-black text-center transition-all flex items-center justify-center space-x-2 ${
            stock > 0 
              ? "bg-slate-900 text-white hover:bg-grab shadow-xl shadow-slate-200" 
              : "bg-slate-50 text-slate-300 cursor-not-allowed"
          }`}
        >
          <span>{stock > 0 ? "Get this code" : "Join waitlist"}</span>
          {stock > 0 && <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />}
        </Link>
      </div>
    </div>
  );
};
