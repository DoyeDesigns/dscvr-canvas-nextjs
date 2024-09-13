import React, { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const StakingForm: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [stakingProgramId, setStakingProgramId] = useState('');
  const [stakingPeriod, setStakingPeriod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { connection } = useConnection();
  const wallet = useWallet();
  const { toast } = useToast();

  const handleStake = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!wallet.connected) {
      setError('Wallet not connected');
      setIsLoading(false);
      return;
    }

    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Wallet does not support signing');
      setIsLoading(false);
      return;
    }

    try {
      const lamports = LAMPORTS_PER_SOL * parseFloat(amount);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      const transaction = new Transaction({
        feePayer: wallet.publicKey,
        recentBlockhash: blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey(stakingProgramId),
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
        description: "Transaction confirmed",
        variant: "default",
      });
    } catch (err) {
      console.error('Staking error:', err);
      setError(`Staking failed: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [amount, stakingProgramId, stakingPeriod, connection, wallet, toast]);

  return (
    <form onSubmit={handleStake} className='w-full sm:max-w-[800px]'>
      <div className='flex flex-col sm:flex-row gap-5 mb-2'>
      <Input
        type="text"
        value={stakingProgramId}
        onChange={(e) => setStakingProgramId(e.target.value)}
        placeholder="Enter Staking Program ID"
        required
      />
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount to stake"
        required
      />
      <Input
        type="number"
        value={stakingPeriod}
        onChange={(e) => setStakingPeriod(e.target.value)}
        placeholder="Staking period in days"
        required
      />
      <Button type="submit" disabled={isLoading || !wallet.connected}>
        {isLoading ? 'Staking...' : 'Stake'}
      </Button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {!wallet.connected && 
        <p className="text-red-500">Wallet not connected</p>
      }
    </form>
  );
};