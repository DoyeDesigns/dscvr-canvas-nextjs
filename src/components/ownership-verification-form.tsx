import React, { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Metaplex } from "@metaplex-foundation/js";
import { useToast } from "@/hooks/use-toast";

export const OwnershipVerificationForm: React.FC = () => {
  const [nftAddress, setNftAddress] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { connection } = useConnection();
  const wallet = useWallet();
  const { toast } = useToast();

  const verifyOwnership = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationResult(null);
    setIsLoading(true);

    if (!wallet.publicKey) {
        toast({
            title: "Error",
            description: "Wallet not connected",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    try {
        const nftPubkey = new PublicKey(nftAddress);
        const metaplex = new Metaplex(connection);

        // Fetch the NFT data
        const nft = await metaplex.nfts().findByMint({ mintAddress: nftPubkey });

        if (!nft) {
            throw new Error('NFT not found');
        }

        // Check ownership using token accounts
        const tokenAccounts = await connection.getTokenAccountsByOwner(wallet.publicKey, {
            mint: nftPubkey,
        });

        if (tokenAccounts.value.length > 0) {
            setVerificationResult('Ownership verified!');
            toast({
                title: "Success",
                description: "NFT/SFT ownership verified!",
                variant: "default",
            });
        } else {
            setVerificationResult('Ownership not verified.');
            toast({
                title: "Result",
                description: "NFT/SFT ownership not verified.",
                variant: "default",
            });
        }
    } catch (err) {
        console.error(err);
        toast({
            title: "Error",
            description: (err as Error).message,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
}, [nftAddress, connection, wallet, toast]);

  return (
    <form onSubmit={verifyOwnership} className='w-full sm:max-w-[500px]'>
      <div className='flex flex-col sm:flex-row gap-5 mb-2'>
        <Input
          type="text"
          value={nftAddress}
          onChange={(e) => setNftAddress(e.target.value)}
          placeholder="NFT Address"
          required
        />
        <Button type="submit" disabled={!wallet.connected || isLoading}>
          {isLoading ? 'Verifying...' : 'Verify Ownership'}
        </Button>
      </div>
      {verificationResult && <p className={verificationResult.includes('verified') ? 'text-green-500' : 'text-yellow-500'}>{verificationResult}</p>}
      {!wallet.connected && <p className="text-red-500">Wallet not connected</p>}
    </form>
  );
};