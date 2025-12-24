import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type PlanType = 'free' | 'pro' | 'business';

interface UserContextType {
  plan: PlanType;
  setPlan: (plan: PlanType) => void;
  hasPurchased: boolean;
  setHasPurchased: (purchased: boolean) => void;
  canExportPDF: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'cv-user-data';

export function UserProvider({ children }: { children: ReactNode }) {
  // Başlangıçta free/false - veritabanından güncellenecek
  const [plan, setPlanState] = useState<PlanType>('free');
  const [hasPurchased, setHasPurchasedState] = useState(false);

  // localStorage'a kaydet (sadece yazma, okuma yok)
  useEffect(() => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ plan, hasPurchased }));
  }, [plan, hasPurchased]);

  const setPlan = (p: PlanType) => setPlanState(p);
  const setHasPurchased = (purchased: boolean) => setHasPurchasedState(purchased === true);

  // PDF export allowed if: pro/business plan OR one-time purchase
  const canExportPDF = plan === 'pro' || plan === 'business' || hasPurchased;

  return (
    <UserContext.Provider value={{ plan, setPlan, hasPurchased, setHasPurchased, canExportPDF }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
}
