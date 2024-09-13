import React, { useState, useCallback, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const AirdropClaimForm: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { connection } = useConnection();
  const wallet = useWallet();
  const { toast } = useToast();

  const fetchBalance = useCallback(async () => {
    if (wallet.publicKey) {
      const balanceInLamports = await connection.getBalance(wallet.publicKey);
      setBalance(balanceInLamports / LAMPORTS_PER_SOL);
    }
  }, [connection, wallet]);

  useEffect(() => {
    if (wallet.publicKey) {
      fetchBalance();
    }
  }, [wallet.publicKey, fetchBalance]);

  const handleClaim = useCallback(async () => {
    if (!wallet.publicKey) {
      toast({
        title: "Error",
        description: "Wallet not connected",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const signature = await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature);
      toast({
        title: "Success",
        description: `Airdrop claimed: ${signature}`,
        variant: "default",
      });
      await fetchBalance();
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [connection, wallet, fetchBalance, toast]);

  return (
    <div>
      <Button onClick={handleClaim} disabled={!wallet.connected || isLoading}>
        {isLoading ? 'Claiming...' : 'Claim Airdrop'}
      </Button>
      {balance !== null && <p className='mt-2'>Balance: {balance.toFixed(2)} SOL</p>}
      {!wallet.connected && <p className="text-red-500">Wallet not connected</p>}
    </div>
  );
};