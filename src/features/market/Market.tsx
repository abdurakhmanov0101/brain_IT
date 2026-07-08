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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between glass premium-inner-glow p-5 lg:p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-black text-2xl text-slate-800 dark:text-white">Brain IT Market</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">O'z tangalaringizga zo'r narsalar xarid qiling!</p>
          </div>
        </div>
        {isStudent && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-5 py-3 rounded-2xl">
            <Coins className="h-6 w-6 text-amber-500" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Balansingiz</span>
              <span className="font-black text-xl text-amber-500 leading-none">{myCoins}</span>
            </div>
          </div>
        )}
        {isAdmin && (
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/25">
            <Plus className="h-5 w-5" /> Mahsulot qo'shish
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(item => (
          <motion.div key={item.id} whileHover={{ y: -5 }} className="glass premium-card rounded-2xl overflow-hidden flex flex-col relative group">
            <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-amber-400" /> {item.price}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-2">{item.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex-1 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-bold text-slate-400">Qoldi: {item.stock} ta</span>
                {isStudent && (
                  <button onClick={() => handleBuy(item)} disabled={item.stock <= 0} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${item.stock > 0 ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/25' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
                    Sotib olish
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => deleteItem(item.id)} className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-colors">
                    <Trash className="h-4 w-4" />
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
