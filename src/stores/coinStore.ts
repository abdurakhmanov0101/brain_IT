import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CoinTransaction {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
  reason: string;
  date: string;
}

interface CoinState {
  transactions: CoinTransaction[];
  balances: Record<string, number>;
  sendCoins: (fromId: string, fromName: string, toId: string, toName: string, amount: number, reason: string) => void;
  autoRefillTeacher: (teacherId: string, teacherName: string, requiredAmount: number) => void;
}

export const useCoinStore = create<CoinState>()(
  persist(
    (set, get) => ({
      transactions: [
        { id: 'tx_init', fromId: 'system', fromName: 'System', toId: 'u_superadmin', toName: 'Super Admin', amount: 1000000, reason: 'Initial Supply', date: new Date().toISOString() }
      ],
      balances: {
        'u_superadmin': 1000000,
      },
      sendCoins: (fromId, fromName, toId, toName, amount, reason) => set((state) => {
        const balances = { ...state.balances };
        
        // Auto-refill logic for Teachers if they don't have enough
        let newTransactions = [...state.transactions];
        if (fromId !== 'u_superadmin' && (balances[fromId] || 0) < amount) {
           const shortfall = amount - (balances[fromId] || 0);
           const refillAmount = Math.max(shortfall, 500); // Auto refill at least 500
           balances['u_superadmin'] = (balances['u_superadmin'] || 1000000) - refillAmount;
           balances[fromId] = (balances[fromId] || 0) + refillAmount;
           
           newTransactions = [
             {
               id: `tx_${Date.now()}_refill`,
               fromId: 'u_superadmin',
               fromName: 'Super Admin',
               toId: fromId,
               toName: fromName,
               amount: refillAmount,
               reason: 'Avtomatik tanga to\'ldirish (Auto-refill)',
               date: new Date().toISOString(),
             },
             ...newTransactions
           ];
        }

        balances[fromId] = (balances[fromId] || 0) - amount;
        balances[toId] = (balances[toId] || 0) + amount;

        const tx: CoinTransaction = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          fromId,
          fromName,
          toId,
          toName,
          amount,
          reason,
          date: new Date().toISOString(),
        };

        return {
          balances,
          transactions: [tx, ...newTransactions],
        };
      }),
      autoRefillTeacher: (teacherId, teacherName, requiredAmount) => set((state) => {
        const balances = { ...state.balances };
        if ((balances[teacherId] || 0) < requiredAmount) {
           const shortfall = requiredAmount - (balances[teacherId] || 0);
           const refillAmount = Math.max(shortfall, 500); 
           balances['u_superadmin'] = (balances['u_superadmin'] || 1000000) - refillAmount;
           balances[teacherId] = (balances[teacherId] || 0) + refillAmount;
           return {
             balances,
             transactions: [
               {
                 id: `tx_${Date.now()}_refill_manual`,
                 fromId: 'u_superadmin',
                 fromName: 'Super Admin',
                 toId: teacherId,
                 toName: teacherName,
                 amount: refillAmount,
                 reason: 'Avtomatik tanga to\'ldirish (Auto-refill)',
                 date: new Date().toISOString(),
               },
               ...state.transactions
             ]
           };
        }
        return state;
      })
    }),
    { name: 'brain-crm-coinstore-v2' }
  )
);
