import { PublicKey } from '@solana/web3.js';

export interface StakingAccount {
  pubkey: PublicKey;
  balance: number;
}

export interface AirdropClaim {
  amount: number;
  timestamp: number;
}

export interface NFTMetadata {
  name: string;
  symbol: string;
  uri: string;
}