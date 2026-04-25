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
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      alert('Access Denied');
    }
  };

  const handleAddCodes = async () => {
    if (!newCodes.trim()) return;
    setLoading(true);
    const codesList = newCodes.split('\n').map(c => c.trim()).filter(c => c);
    
    const insertData = codesList.map(code => ({
      code,
      value: selectedDenom,
      status: 'available'
    }));

    const { error } = await supabase.from('coupons').insert(insertData);
    
    if (error) {
      alert('Error adding codes: ' + error.message);
    } else {
      setNewCodes('');
      fetchData();
    }
    setLoading(false);
  };

  const handleApprove = async (orderId: string, couponId: string) => {
    setLoading(true);
    await supabase.from('orders').update({ status: 'confirmed' }).eq('id', orderId);
    await supabase.from('coupons').update({ status: 'sold' }).eq('id', couponId);
    fetchData();
    setLoading(false);
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-grab/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-2xl p-12 rounded-[2.5rem] border border-white/10 w-full max-w-md shadow-2xl relative z-10"
        >
          <div className="w-16 h-16 bg-grab rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-grab/20">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white text-center mb-2 tracking-tighter">Command Center</h1>
          <p className="text-slate-400 text-center mb-10 text-sm font-medium">Authorized personnel only</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="System Password" 
              className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-grab focus:outline-none transition-all font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-lg hover:bg-grab hover:text-white transition-all active:scale-[0.98] shadow-xl">
              Initialize Session
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 p-8 flex flex-col">
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <Ticket className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900">GrabShop OS</span>
        </div>
        
        <nav className="space-y-2 flex-grow">
          {[
            { id: 'orders', icon: ClipboardList, label: 'Order Queue' },
            { id: 'codes', icon: Ticket, label: 'Inventory' },
            { id: 'stats', icon: LayoutDashboard, label: 'Analytics' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-black text-sm uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-200 rounded-full" />
            <div>
              <p className="text-xs font-black text-slate-900">Admin User</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold">System Root</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-x-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter capitalize">{activeTab}</h2>
            <p className="text-slate-400 text-sm font-medium">Real-time infrastructure management</p>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={fetchData} className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
              <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-4xl shadow-premium border border-slate-100 overflow-hidden"
            >
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-8 py-6 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Customer</th>
                    <th className="px-8 py-6 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Transaction</th>
                    <th className="px-8 py-6 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Verification</th>
                    <th className="px-8 py-6 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Status</th>
                    <th className="px-8 py-6 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="text-slate-300 font-bold">No active orders in queue</div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-black text-slate-900">{order.buyer_name}</p>
                          <p className="text-xs text-slate-400 font-medium">{order.buyer_phone}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-black text-slate-900">{order.coupons?.value} THB</p>
                          <p className="text-xs text-grab font-bold">Paid {order.price_paid} THB</p>
                        </td>
                        <td className="px-8 py-6">
                          <button 
                            onClick={() => setViewSlip(order.slip_url)}
                            className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-200 transition-colors flex items-center"
                          >
                            <Eye className="w-3 h-3 mr-2" /> Inspect Slip
                          </button>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            order.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                            'bg-yellow-100 text-yellow-600 animate-pulse'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end space-x-2">
                            {order.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleApprove(order.id, order.coupon_id)}
                                  className="w-10 h-10 bg-grab text-white rounded-xl flex items-center justify-center hover:bg-grab-dark shadow-lg shadow-grab/20"
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleReject(order.id, order.coupon_id)}
                                  className="w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            <button className="w-10 h-10 text-slate-300 hover:text-slate-900 transition-colors">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Add Codes Section */}
              <div className="bg-white p-10 rounded-4xl shadow-premium border border-slate-100">
                <div className="flex items-center space-x-3 mb-8">
                  <PlusCircle className="text-grab w-6 h-6" />
                  <h3 className="text-xl font-black tracking-tighter">Stock Replenishment</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">Denomination</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-grab transition-all outline-none"
                      value={selectedDenom}
                      onChange={(e) => setSelectedDenom(parseInt(e.target.value))}
                    >
                      <option value={300}>300 THB</option>
                      <option value={500}>500 THB</option>
                      <option value={1000}>1000 THB</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">Batch Entry (One code per line)</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-mono text-sm focus:ring-2 focus:ring-grab transition-all outline-none min-h-[120px]"
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      value={newCodes}
                      onChange={(e) => setNewCodes(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <button 
                      onClick={handleAddCodes}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-grab transition-all shadow-xl shadow-slate-100 active:scale-95"
                    >
                      Import Batch
                    </button>
                  </div>
                </div>
              </div>

              {/* Codes Table */}
              <div className="bg-white rounded-4xl shadow-premium border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-8 py-6 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Redemption Key</th>
                      <th className="px-8 py-6 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Face Value</th>
                      <th className="px-8 py-6 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Inventory Status</th>
                      <th className="px-8 py-6 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-right">Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {codes.map((code) => (
                      <tr key={code.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6 font-mono font-bold text-slate-900">{code.code}</td>
                        <td className="px-8 py-6 font-black text-slate-900">{code.value} THB</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            code.status === 'available' ? 'bg-green-100 text-green-600' :
                            code.status === 'reserved' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-slate-100 text-slate-400'
                          }`}>
                            {code.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => handleDeleteCode(code.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-2"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="bg-white p-10 rounded-4xl shadow-premium border border-slate-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-grab/10 rounded-2xl text-grab"><Package className="w-6 h-6" /></div>
                  <h4 className="font-black text-slate-400 text-xs uppercase tracking-widest">Active Stock</h4>
                </div>
                <div className="text-5xl font-black text-slate-900 tracking-tighter">
                  {codes.filter(c => c.status === 'available').length}
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium italic">Codes ready for instant purchase</p>
              </div>

              <div className="bg-white p-10 rounded-4xl shadow-premium border border-slate-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-2xl text-blue-600"><TrendingUp className="w-6 h-6" /></div>
                  <h4 className="font-black text-slate-400 text-xs uppercase tracking-widest">Orders (Total)</h4>
                </div>
                <div className="text-5xl font-black text-slate-900 tracking-tighter">
                  {orders.filter(o => o.status === 'confirmed').length}
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium italic">Validated transactions processed</p>
              </div>

              <div className="bg-white p-10 rounded-4xl shadow-premium border border-slate-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-purple-100 rounded-2xl text-purple-600"><DollarSign className="w-6 h-6" /></div>
                  <h4 className="font-black text-slate-400 text-xs uppercase tracking-widest">Gross Revenue</h4>
                </div>
                <div className="text-5xl font-black text-slate-900 tracking-tighter">
                  {orders.filter(o => o.status === 'confirmed').reduce((acc, o) => acc + o.price_paid, 0).toLocaleString()}
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium italic">THB — System wide total</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Slip Viewer Modal */}
      <AnimatePresence>
        {viewSlip && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewSlip(null)}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-3 rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden"
            >
              <img src={viewSlip} alt="Payment Slip" className="w-full h-auto rounded-[2rem] shadow-inner" />
              <div className="p-6 text-center">
                <button className="text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-slate-900 transition-colors">Close Viewer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
