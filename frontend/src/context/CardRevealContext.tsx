/**
 * CardRevealContext - Manage card reveal animation state
 *
 * Allows triggering the card reveal animation from anywhere in the app
 */

import { createContext, useContext, useState, ReactNode } from 'react';

interface CardRevealContextType {
  shouldTriggerReveal: boolean;
  triggerReveal: () => void;
  resetReveal: () => void;
}

const CardRevealContext = createContext<CardRevealContextType | undefined>(undefined);

export const CardRevealProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shouldTriggerReveal, setShouldTriggerReveal] = useState(false);

  const triggerReveal = () => {
    setShouldTriggerReveal(true);
  };

  const resetReveal = () => {
    setShouldTriggerReveal(false);
  };

  return (
    <CardRevealContext.Provider value={{ shouldTriggerReveal, triggerReveal, resetReveal }}>
      {children}
    </CardRevealContext.Provider>
  );
};

export const useCardReveal = () => {
  const context = useContext(CardRevealContext);
  if (context === undefined) {
    throw new Error('useCardReveal must be used within a CardRevealProvider');
  }
  return context;
};
