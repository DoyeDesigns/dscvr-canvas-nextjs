import React, { createContext, useState, useContext, ReactNode } from 'react';
import { clusterApiUrl } from '@solana/web3.js';

type RPCContextType = {
  endpoint: string;
  setEndpoint: (endpoint: string) => void;
};

const RPCContext = createContext<RPCContextType | undefined>(undefined);

export const useRPC = () => {
  const context = useContext(RPCContext);
  if (!context) {
    throw new Error('useRPC must be used within an RPCProvider');
  }
  return context;
};

export const RPCProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [endpoint, setEndpoint] = useState(clusterApiUrl('testnet'));

  return (
    <RPCContext.Provider value={{ endpoint, setEndpoint }}>
      {children}
    </RPCContext.Provider>
  );
};