import React, { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TipCreatorProps {
  creatorAddress: string;
}

export const TipCreator: React.FC<TipCreatorProps> = ({ creatorAddress }) => {
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { connection } = useConnection();
  const wallet = useWallet();
  const { toast } = useToast();

  const handleTip = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Error",
        description: "Wallet not connected or does not support signing",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const creatorPubkey = new PublicKey(creatorAddress);
      const lamports = LAMPORTS_PER_SOL * parseFloat(amount);

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      const transaction = new Transaction({
        feePayer: wallet.publicKey,
        recentBlockhash: blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: creatorPubkey,
          lamports,
        })
      );

      const signed = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      toast({
        title: "Success",
        description: `Tip sent successfully: ${signature}`,
        variant: "default",
      });
      setAmount('');
    } catch (err) {
      console.error('Error sending tip:', err);
      toast({
        title: "Error",
        description: `Error sending tip: ${(err as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [amount, connection, wallet, creatorAddress, toast]);

  return (
    <form onSubmit={handleTip} className='w-full sm:max-w-[500px]'>
      <div className='flex flex-col sm:flex-row gap-5 mb-2'>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Tip amount in SOL"
          required
        />
        <Button type="submit" disabled={!wallet.connected || isLoading}>
          {isLoading ? 'Sending...' : 'Send Tip'}
        </Button>
      </div>
      {!wallet.connected && <p className="text-red-500">Please connect your wallet to send a tip</p>}
    </form>
  );
};