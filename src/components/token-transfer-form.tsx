'use client'

import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function TokenTransferForm() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const wallet = useWallet();
  const { toast } = useToast();

  const handleTransfer = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsLoading(true);

    if (!publicKey) {
      toast({
        title: "Error",
        description: "Wallet not connected",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: LAMPORTS_PER_SOL * parseFloat(amount),
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'processed');
      
      toast({
        title: "Success",
        description: "Transfer successful!",
        variant: "default",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: `Transfer failed: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleTransfer} className='w-full sm:max-w-[500px]'>
      <div className='flex flex-col sm:flex-row gap-5 mb-2'>
        <Input
          type="text"
          value={recipient}
          className='text-black'
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Recipient address"
        />
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount in SOL"
          className='text-black'
        />
        <Button type="submit" disabled={!wallet.connected || isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
      {!wallet.connected && <p className="text-red-500">Please connect your wallet to send a tip</p>}
    </form>
  );
}