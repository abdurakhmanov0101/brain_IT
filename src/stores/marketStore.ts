import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MarketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

export interface PurchaseRecord {
  id: string;
  studentId: string;
  studentName: string;
  itemId: string;
  itemName: string;
  price: number;
  date: string;
  status: 'pending' | 'delivered';
}

interface MarketState {
  items: MarketItem[];
  purchases: PurchaseRecord[];
  addItem: (item: Omit<MarketItem, 'id'>) => void;
  updateItem: (id: string, item: Partial<MarketItem>) => void;
  deleteItem: (id: string) => void;
  addPurchase: (purchase: Omit<PurchaseRecord, 'id' | 'date' | 'status'>) => void;
  updatePurchaseStatus: (id: string, status: 'pending' | 'delivered') => void;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set) => ({
      items: [
        { id: 'm1', name: 'MacBook Pro M3', description: 'Oliy darajadagi dasturchilar uchun', price: 10000, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop', stock: 2 },
        { id: 'm2', name: 'iPhone 15 Pro', description: 'Ajoyib sovg\'a', price: 8000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop', stock: 5 },
        { id: 'm3', name: 'Logitech MX Master 3S', description: 'Professional sichqoncha', price: 500, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop', stock: 10 },
        { id: 'm4', name: 'Brain IT Bakal (Mug)', description: 'Kofe ichish uchun maxsus', price: 50, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&auto=format&fit=crop', stock: 50 },
        { id: 'm5', name: 'Brain IT Futbolka', description: 'Qulay va chiroyli', price: 150, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop', stock: 30 },
      ],
      purchases: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, id: `m_${Date.now()}` }],
      })),
      updateItem: (id, itemUpdate) => set((state) => ({
        items: state.items.map((i) => i.id === id ? { ...i, ...itemUpdate } : i),
      })),
      deleteItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      })),
      addPurchase: (purchase) => set((state) => ({
        purchases: [
          {
            ...purchase,
            id: `p_${Date.now()}`,
            date: new Date().toISOString(),
            status: 'pending',
          },
          ...state.purchases,
        ]
      })),
      updatePurchaseStatus: (id, status) => set((state) => ({
        purchases: state.purchases.map(p => p.id === id ? { ...p, status } : p)
      }))
    }),
    { name: 'brain-crm-marketstore' }
  )
);
