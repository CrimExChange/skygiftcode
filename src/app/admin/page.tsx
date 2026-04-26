'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Eye, 
  RefreshCw, 
  Lock,
  LayoutDashboard,
  Ticket,
  ClipboardList,
  Search,
  MoreVertical,
  PlusCircle,
  TrendingUp,
  DollarSign,
  Package,
  Activity,
  UserCheck,
  ShieldAlert,
  Zap,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'codes' | 'stats'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [newCodes, setNewCodes] = useState('');
  const [selectedDenom, setSelectedDenom] = useState<number>(300);
  const [loading, setLoading] = useState(false);
  const [viewSlip, setViewSlip] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const { data } = await supabase
          .from('orders')
          .select('*, coupons(*)')
          .order('created_at', { ascending: false });
        setOrders(data || []);
      } else if (activeTab === 'codes') {
        const { data } = await supabase
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false });
        setCodes(data || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Security Breach Detected: Invalid Credentials');
    }
  };

  const handleApprove = async (orderId: string, couponId: string) => {
    setLoading(true);
    await supabase.from('orders').update({ status: 'confirmed' }).eq('id', orderId);
    await supabase.from('coupons').update({ status: 'sold' }).eq('id', couponId);
    fetchData();
    setLoading(false);
  };

  const handleAddCodes = async () => {
    if (!newCodes.trim()) return;
    setLoading(true);
    
    // 1. Clean and unique list from input
    const inputCodes = newCodes.split('\n')
      .map(c => c.trim())
      .filter(c => c);
    
    const uniqueInputCodes = Array.from(new Set(inputCodes));
    
    if (uniqueInputCodes.length < inputCodes.length) {
      console.log('Filtered out internal duplicates');
    }

    try {
      // 2. Check duplicates in Database
      const { data: existingData, error: fetchError } = await supabase
        .from('coupons')
        .select('code')
        .in('code', uniqueInputCodes);

      if (fetchError) throw fetchError;

      const existingCodes = new Set(existingData?.map((d: any) => d.code) || []);
      const finalCodes = uniqueInputCodes.filter(code => !existingCodes.has(code));

      if (finalCodes.length === 0) {
        alert('All codes already exist in the database!');
        setLoading(false);
        return;
      }

      if (finalCodes.length < uniqueInputCodes.length) {
        if (!confirm(`${uniqueInputCodes.length - finalCodes.length} codes already exist. Add only the ${finalCodes.length} new codes?`)) {
          setLoading(false);
          return;
        }
      }

      // 3. Insert
      const insertData = finalCodes.map(code => ({
        code,
        value: selectedDenom,
        status: 'available'
      }));

      const { error } = await supabase.from('coupons').insert(insertData);
      
      if (error) {
        alert('Error adding codes: ' + error.message);
      } else {
        alert(`Successfully injected ${finalCodes.length} keys!`);
        setNewCodes('');
        fetchData();
      }
    } catch (err: any) {
      alert('Operation failed: ' + err.message);
    }
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setNewCodes(content);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleReject = async (orderId: string, couponId: string) => {
    setLoading(true);
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
    await supabase.from('coupons').update({ status: 'available' }).eq('id', couponId);
    fetchData();
    setLoading(false);
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm('Delete this code?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    fetchData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-grab/20 rounded-full blur-[160px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" 
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/10 w-full max-w-md shadow-[0_0_100px_rgba(0,177,79,0.1)] relative z-10 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-tr from-grab to-green-300 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-grab/30 ring-8 ring-grab/10">
            <ShieldAlert className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">Secure Core</h1>
          <p className="text-slate-500 mb-12 text-sm font-bold uppercase tracking-[0.3em]">Administrator Identity</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-grab transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input 
                type="password" 
                placeholder="Access Token" 
                className="w-full bg-white/5 border border-white/10 px-14 py-5 rounded-[2rem] text-white placeholder:text-slate-600 focus:ring-4 focus:ring-grab/20 focus:border-grab focus:outline-none transition-all font-black tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="w-full bg-white text-black py-5 rounded-[2rem] font-black text-xl hover:bg-grab hover:text-white transition-all active:scale-[0.98] shadow-2xl hover:shadow-grab/30">
              Initialize System
            </button>
          </form>
          
          <div className="mt-12 flex items-center justify-center space-x-2 text-[10px] text-slate-600 font-black uppercase tracking-widest">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>Encrypted Session Active</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-grab/30">
      {/* Sidebar - Elevated Glassmorphism */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-100 p-10 flex flex-col relative z-20 shadow-[20px_0_40px_rgba(0,0,0,0.02)]">
        <div className="flex items-center space-x-4 mb-16">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl rotate-3">
            <Zap className="text-grab w-7 h-7 fill-grab" />
          </div>
          <div>
            <span className="font-black text-2xl tracking-tighter text-slate-900 block leading-tight">GrabShop</span>
            <span className="text-[10px] font-black text-grab uppercase tracking-widest">Enterprise v1.0</span>
          </div>
        </div>
        
        <nav className="space-y-3 flex-grow">
          {[
            { id: 'orders', icon: ClipboardList, label: 'Order Stream' },
            { id: 'codes', icon: Ticket, label: 'Asset Vault' },
            { id: 'stats', icon: Activity, label: 'Performance' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center space-x-4 px-6 py-5 rounded-[2rem] transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-slate-900 text-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] scale-[1.02]' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-grab' : ''}`} />
              <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-10 border-t border-slate-100">
          <div className="bg-slate-50 p-6 rounded-3xl flex items-center space-x-4 border border-slate-100">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full shadow-inner border-2 border-white" />
            <div>
              <p className="text-sm font-black text-slate-900">Chief Admin</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Active Level 1</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-16 overflow-x-auto relative">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 space-y-6 md:space-y-0">
          <div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 capitalize">{activeTab}</h2>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-grab rounded-full" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Cloud Infrastructure Status: Operational</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-grab transition-colors" />
              <input 
                placeholder="Global Search..." 
                className="pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-grab/10 focus:border-grab outline-none transition-all w-72 shadow-sm"
              />
            </div>
            <button onClick={fetchData} className="p-5 bg-white border border-slate-100 rounded-[2rem] hover:bg-slate-50 transition-all shadow-sm active:scale-95 group">
              <RefreshCw className={`w-5 h-5 text-slate-600 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.03)] border border-white overflow-hidden"
            >
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-8 text-[11px] uppercase font-black text-slate-400 tracking-[0.25em]">Transaction Source</th>
                    <th className="px-10 py-8 text-[11px] uppercase font-black text-slate-400 tracking-[0.25em]">Economic Value</th>
                    <th className="px-10 py-8 text-[11px] uppercase font-black text-slate-400 tracking-[0.25em]">Evidence</th>
                    <th className="px-10 py-8 text-[11px] uppercase font-black text-slate-400 tracking-[0.25em]">Internal Status</th>
                    <th className="px-10 py-8 text-[11px] uppercase font-black text-slate-400 tracking-[0.25em] text-right">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-10 py-32 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Package className="text-slate-200 w-10 h-10" />
                        </div>
                        <div className="text-slate-300 font-black uppercase tracking-widest text-sm">No incoming data streams</div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order: any) => (
                      <tr key={order.id} className="group hover:bg-grab/5 transition-colors duration-500">
                        <td className="px-10 py-8">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 text-xs">
                              {order.buyer_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-lg tracking-tight">{order.buyer_name}</p>
                              <p className="text-xs text-slate-400 font-bold tracking-widest">{order.buyer_phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black mb-1">{order.coupons?.value} THB</div>
                          <p className="text-xl font-black text-grab tracking-tight">{order.price_paid} <span className="text-xs font-bold">THB</span></p>
                        </td>
                        <td className="px-10 py-8">
                          <button 
                            onClick={() => setViewSlip(order.slip_url)}
                            className="group/slip relative px-6 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-black text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-2 group-hover/slip:scale-125 transition-transform" /> 
                            Audit Proof
                          </button>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
                            order.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-yellow-50 text-yellow-600 border-yellow-100 animate-pulse'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {order.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleApprove(order.id, order.coupon_id)}
                                  className="w-12 h-12 bg-grab text-white rounded-2xl flex items-center justify-center hover:bg-grab-dark shadow-xl shadow-grab/20 active:scale-90 transition-all"
                                >
                                  <UserCheck className="w-5 h-5" />
                                </button>
                                <button className="w-12 h-12 bg-white border border-slate-100 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-90 shadow-sm">
                                  <ShieldAlert className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            <button className="w-12 h-12 bg-white border border-slate-100 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'codes' && (
            <motion.div 
              key="codes"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              {/* Asset Injector */}
              <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-grab/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12">
                  <div className="md:col-span-1">
                    <h3 className="text-white text-2xl font-black tracking-tight mb-6 flex items-center">
                      <PlusCircle className="text-grab w-6 h-6 mr-3" />
                      Injector
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">Select denomination and inject bulk redemption keys into the encrypted vault.</p>
                    <select 
                      className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-[2rem] font-black text-white focus:ring-4 focus:ring-grab/20 transition-all outline-none appearance-none"
                      value={selectedDenom}
                      onChange={(e) => setSelectedDenom(parseInt(e.target.value))}
                    >
                      <option value={300} className="text-black">300 THB Tier</option>
                      <option value={500} className="text-black">500 THB Tier</option>
                      <option value={1000} className="text-black">1000 THB Tier</option>
                    </select>

                    <div className="mt-6">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".txt"
                        className="hidden"
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:bg-white/10 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Load Text File</span>
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <textarea 
                      className="w-full h-full px-8 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-mono text-sm text-grab placeholder:text-slate-700 focus:ring-4 focus:ring-grab/20 transition-all outline-none min-h-[200px]"
                      placeholder="PASTE_KEYS_HERE_LINE_BY_LINE"
                      value={newCodes}
                      onChange={(e) => setNewCodes(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-1 flex flex-col justify-end">
                    <button 
                      onClick={handleAddCodes}
                      className="w-full bg-grab text-white py-6 rounded-[2rem] font-black text-xl hover:bg-white hover:text-black transition-all shadow-2xl shadow-grab/20 active:scale-95"
                    >
                      Execute Import
                    </button>
                  </div>
                </div>
              </div>

              {/* Inventory Grid */}
              <div className="bg-white rounded-[3rem] shadow-premium border border-white overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-10 py-8 text-[11px] uppercase font-black text-slate-400 tracking-[0.25em]">Key Signature</th>
                      <th className="px-10 py-8 text-[11px] uppercase font-black text-slate-400 tracking-[0.25em]">Face Value</th>
                      <th className="px-10 py-8 text-[11px] uppercase font-black text-slate-400 tracking-[0.25em]">Vault Status</th>
                      <th className="px-10 py-8 text-[11px] uppercase font-black text-slate-400 tracking-[0.25em] text-right">Destruct</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {codes.map((code: any) => (
                      <tr key={code.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-10 py-8">
                          <code className="bg-slate-50 px-4 py-2 rounded-xl font-mono text-slate-600 font-bold">{code.code}</code>
                        </td>
                        <td className="px-10 py-8">
                          <span className="text-xl font-black text-slate-900 tracking-tighter">{code.value}</span>
                          <span className="text-xs font-bold text-slate-400 ml-1 uppercase">THB</span>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
                            code.status === 'available' ? 'bg-green-50 text-green-600 border-green-100' :
                            code.status === 'reserved' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                            'bg-slate-50 text-slate-400 border-slate-100'
                          }`}>
                            {code.status}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <button 
                            onClick={() => handleDeleteCode(code.id)}
                            className="text-slate-300 hover:text-red-500 transition-all p-3 hover:bg-red-50 rounded-2xl"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-10"
            >
              {[
                { label: 'Active Asset Liquidity', value: codes.filter((c: any) => c.status === 'available').length, icon: Package, color: 'grab' },
                { label: 'Validated Transactions', value: orders.filter((o: any) => o.status === 'confirmed').length, icon: TrendingUp, color: 'blue-500' },
                { label: 'Cumulative Revenue', value: orders.filter((o: any) => o.status === 'confirmed').reduce((acc: number, o: any) => acc + o.price_paid, 0).toLocaleString(), icon: DollarSign, color: 'purple-500' }
              ].map((stat: any, i: number) => (
                <div key={i} className="bg-white p-12 rounded-[3.5rem] shadow-premium border border-white relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-${stat.color}/10 transition-colors`} />
                  <div className="flex items-center space-x-4 mb-8">
                    <div className={`p-4 bg-slate-50 rounded-3xl text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all`}>
                      <stat.icon className="w-7 h-7" />
                    </div>
                    <h4 className="font-black text-slate-400 text-xs uppercase tracking-widest leading-tight max-w-[100px]">{stat.label}</h4>
                  </div>
                  <div className="text-6xl font-black text-slate-900 tracking-tighter mb-2">
                    {stat.value}
                  </div>
                  <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-grab">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>+12.5% vs Prev Period</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Slip Audit Viewer - High End */}
      <AnimatePresence>
        {viewSlip && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewSlip(null)}
            className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, rotateX: 10 }}
              animate={{ scale: 1, rotateX: 0 }}
              className="bg-white p-4 rounded-[3.5rem] max-w-xl w-full shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="relative group/image">
                <img src={viewSlip} alt="Transaction Evidence" className="w-full h-auto rounded-[2.5rem] shadow-inner" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2.5rem]">
                  <p className="text-white font-black uppercase tracking-widest text-xs">Evidence Audited</p>
                </div>
              </div>
              <div className="p-10 text-center">
                <button className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-grab transition-all shadow-xl">Confirm & Exit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
