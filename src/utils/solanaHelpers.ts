import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

export async function sendTransaction(
  connection: Connection,
  wallet: WalletContextState,
  transaction: Transaction
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  try {
    // Sign the transaction with the wallet
    const signedTransaction = await wallet.signTransaction(transaction);

    // Send and confirm the signed transaction
    const signature = await sendAndConfirmTransaction(connection, signedTransaction, []);

    return signature;
  } catch (error) {
    console.error('Transaction error:', error);
    throw new Error('Transaction failed. Please try again.');
  }
}
