import React, { useState } from 'react';
import { useMarketStore, type MarketItem } from '../../stores/marketStore';
import { useStudentStore } from '../../stores/studentStore';
import { useAuthStore } from '../../stores/authStore';
import { useCoinStore } from '../../stores/coinStore';
import { useUIStore } from '../../stores/uiStore';
import { ShoppingBag, Coins, Plus, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Market: React.FC = () => {
  const { items, addItem, updateItem, deleteItem, addPurchase } = useMarketStore();
  const { students, updateStudent } = useStudentStore();
  const { addTransaction } = useCoinStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useUIStore();

  const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'Academy Director';
  const isStudent = currentUser?.role === 'Student';
  
  const studentData = isStudent ? students.find(s => s.id === currentUser?.studentId) : null;
  const myCoins = studentData?.coins || 0;

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MarketItem>>({ name: '', description: '', price: 0, image: '', stock: 0 });

  const handleBuy = (item: MarketItem) => {
    if (!studentData) return;
    if (myCoins < item.price) {
      addToast({ type: 'error', message: "Kechirasiz, hisobingizda yetarli tanga yo'q!" });
      return;
    }
    if (item.stock <= 0) {
      addToast({ type: 'error', message: 'Bu mahsulot hozircha qolmagan!' });
      return;
    }

    // Deduct coin
    updateStudent(studentData.id, { coins: myCoins - item.price });
    updateItem(item.id, { stock: item.stock - 1 });
    
    // Log transaction
    addTransaction({
      fromId: studentData.id,
      fromName: studentData.fullName,
      toId: 'system',
      toName: 'Brain IT Market',
      amount: item.price,
      reason: `Sotib olindi: ${item.name}`,
    });

    // Log purchase
    addPurchase({
      studentId: studentData.id,
      studentName: studentData.fullName,
      itemId: item.id,
      itemName: item.name,
      price: item.price,
    });

    addToast({ type: 'success', message: `Tabriklaymiz! Siz "${item.name}" ni sotib oldingiz.` });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.image) return;
    addItem(newItem as Omit<MarketItem, 'id'>);
    setShowAddModal(false);
    setNewItem({ name: '', description: '', price: 0, image: '', stock: 0 });
    addToast({ type: 'success', message: "Mahsulot muvaffaqiyatli qo'shildi!" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 p-8 shadow-sm hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] transition-all duration-500 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between group">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-[0_0_20px_rgb(16,185,129,0.4)] border border-white/30 shrink-0">
            <ShoppingBag className="h-10 w-10 text-white drop-shadow-md" />
          </div>
          <div>
            <h1 className="font-heading font-black text-4xl text-slate-800 dark:text-white tracking-tight drop-shadow-sm">Brain IT Market</h1>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2 bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full w-fit backdrop-blur-md">O'z tangalaringizga zo'r narsalar xarid qiling!</p>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-wrap items-center gap-4">
          {isStudent && (
            <div className="flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 px-6 py-3.5 rounded-2xl shadow-inner">
              <Coins className="h-8 w-8 text-amber-500 drop-shadow-md animate-pulse-slow" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-amber-600/70 dark:text-amber-400/70 tracking-widest">Balansingiz</span>
                <span className="font-black text-2xl text-amber-500 leading-none drop-shadow-sm">{myCoins}</span>
              </div>
            </div>
          )}
          {isAdmin && (
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-6 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-emerald-500/25 border border-white/20 hover:scale-105 active:scale-95">
              <Plus className="h-5 w-5" /> Mahsulot qo'shish
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(item => (
          <motion.div key={item.id} whileHover={{ y: -8 }} className="group relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] overflow-hidden flex flex-col border border-white/40 dark:border-slate-700/50 hover:border-emerald-400/60 dark:hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
            
            <div className="h-56 w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg">
                <Coins className="h-4 w-4 text-amber-400 drop-shadow-md" /> {item.price}
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col relative z-20">
              <h3 className="font-heading font-black text-xl text-slate-800 dark:text-white leading-tight mb-2 drop-shadow-sm">{item.name}</h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6 flex-1 line-clamp-2 leading-relaxed">{item.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  Qoldi: {item.stock} ta
                </span>
                
                {isStudent && (
                  <button onClick={() => handleBuy(item)} disabled={item.stock <= 0} className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-sm ${
                    item.stock > 0 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}>
                    Sotib olish
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => deleteItem(item.id)} className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-colors shadow-sm">
                    <Trash className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass premium-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                <h2 className="font-black text-xl text-slate-800 dark:text-white">Yangi Mahsulot</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500">✕</button>
              </div>
              <form onSubmit={handleAddItem} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block">Nomi</label>
                  <input type="text" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block">Rasm URL</label>
                  <input type="url" required value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block">Narxi (Coin)</label>
                    <input type="number" required value={newItem.price} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block">Soni (Zaxira)</label>
                    <input type="number" required value={newItem.stock} onChange={e => setNewItem({...newItem, stock: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg mt-2">Saqlash</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
