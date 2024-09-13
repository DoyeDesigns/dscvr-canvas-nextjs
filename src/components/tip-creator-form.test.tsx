import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TipCreator } from './tip-creator-form';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import '@testing-library/jest-dom';

// Mock the useConnection and useWallet hooks
jest.mock('@solana/wallet-adapter-react', () => ({
  useConnection: jest.fn(),
  useWallet: jest.fn(),
}));

// Mock the useToast hook
const mockToast = jest.fn();
jest.mock('../hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockConnection = {
  getLatestBlockhash: jest.fn(),
  sendRawTransaction: jest.fn(),
  confirmTransaction: jest.fn(),
};

type MockWallet = {
  publicKey: PublicKey | null;
  connected: boolean;
  signTransaction: jest.Mock | null;
};

const mockWallet: MockWallet = {
  publicKey: null,
  connected: false,
  signTransaction: jest.fn(),
};

describe('TipCreator', () => {
  beforeEach(() => {
    (useConnection as jest.Mock).mockReturnValue({ connection: mockConnection });
    (useWallet as jest.Mock).mockReturnValue(mockWallet);
    mockToast.mockClear();
    // Reset wallet state before each test
    mockWallet.publicKey = null;
    mockWallet.connected = false;
    mockWallet.signTransaction = jest.fn();
  });

  test('renders form inputs and button', () => {
    render(<TipCreator creatorAddress="11111111111111111111111111111111" />);
    expect(screen.getByPlaceholderText('Tip amount in SOL')).toBeInTheDocument();
    expect(screen.getByText('Send Tip')).toBeInTheDocument();
  });

  test('shows error when wallet is not connected', async () => {
    mockWallet.connected = false;

    render(<TipCreator creatorAddress="11111111111111111111111111111111" />);

    fireEvent.change(screen.getByPlaceholderText('Tip amount in SOL'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Send Tip'));

    expect(screen.getByText('Please connect your wallet to send a tip')).toBeInTheDocument();
  });

  test('shows error if wallet does not support signing', async () => {
    mockWallet.connected = true;
    mockWallet.publicKey = new PublicKey('11111111111111111111111111111111');
    mockWallet.signTransaction = null;

    render(<TipCreator creatorAddress="11111111111111111111111111111111" />);

    fireEvent.change(screen.getByPlaceholderText('Tip amount in SOL'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Send Tip'));
  });

  test('handles successful tip sending', async () => {
    mockWallet.connected = true;
    mockWallet.publicKey = new PublicKey('11111111111111111111111111111111');
    mockWallet.signTransaction = jest.fn().mockResolvedValue({
      serialize: jest.fn().mockReturnValue(new Uint8Array()),
    });
    mockConnection.getLatestBlockhash.mockResolvedValue({
      blockhash: 'testBlockhash',
      lastValidBlockHeight: 1,
    });
    mockConnection.sendRawTransaction.mockResolvedValue('testSignature');
    mockConnection.confirmTransaction.mockResolvedValue({ value: { err: null } });

    render(<TipCreator creatorAddress="11111111111111111111111111111111" />);

    fireEvent.change(screen.getByPlaceholderText('Tip amount in SOL'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Send Tip'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: `Tip sent successfully: testSignature`,
        variant: 'default',
      });
    });
  });

  test('handles error during tip sending', async () => {
    mockWallet.connected = true;
    mockWallet.publicKey = new PublicKey('11111111111111111111111111111111');
    mockWallet.signTransaction = jest.fn().mockResolvedValue({
      serialize: jest.fn().mockReturnValue(new Uint8Array()),
    });
    mockConnection.getLatestBlockhash.mockResolvedValue({
      blockhash: 'testBlockhash',
      lastValidBlockHeight: 1,
    });
    mockConnection.sendRawTransaction.mockRejectedValue(new Error('Transaction error'));

    render(<TipCreator creatorAddress="11111111111111111111111111111111" />);

    fireEvent.change(screen.getByPlaceholderText('Tip amount in SOL'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Send Tip'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Error sending tip: Transaction error',
        variant: 'destructive',
      });
    });
  });
});
