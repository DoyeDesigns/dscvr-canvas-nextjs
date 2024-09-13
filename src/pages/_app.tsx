import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { Inter } from "next/font/google";
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { RPCProvider, useRPC } from '../contexts/useRpcEndpoint';
import { useMemo } from 'react';
import Header from '@/components/header';
import { Toaster } from "@/components/ui/toaster"
require('@solana/wallet-adapter-react-ui/styles.css');

const inter = Inter({ subsets: ["latin"] });

function WalletProviderWrapper({ children }: { children: React.ReactNode }) {
  const { endpoint } = useRPC();
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RPCProvider>
      <WalletProviderWrapper>
        <main className={inter.className}>
          <Header />
          <Component {...pageProps} />
          <Toaster />
        </main>
      </WalletProviderWrapper>
    </RPCProvider>
  );
}