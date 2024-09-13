import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TokenTransferForm } from './token-transfer-form';
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
  confirmTransaction: jest.fn(),
};

const mockSendTransaction = jest.fn();

type MockWallet = {
  publicKey: PublicKey | null;
  connected: boolean;
  sendTransaction: jest.Mock | null;
};

const mockWallet: MockWallet = {
  publicKey: null,
  connected: false,
  sendTransaction: mockSendTransaction,
};

describe('TokenTransferForm', () => {
  beforeEach(() => {
    (useConnection as jest.Mock).mockReturnValue({ connection: mockConnection });
    (useWallet as jest.Mock).mockReturnValue(mockWallet);
    mockToast.mockClear();
    // Reset wallet state before each test
    mockWallet.publicKey = null;
    mockWallet.connected = false;
    mockWallet.sendTransaction = jest.fn();
  });

  test('renders form inputs and button', () => {
    render(<TokenTransferForm />);
    expect(screen.getByPlaceholderText('Recipient address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amount in SOL')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  test('shows error when wallet is not connected', async () => {
    mockWallet.connected = false;

    render(<TokenTransferForm />);

    fireEvent.change(screen.getByPlaceholderText('Recipient address'), { target: { value: '11111111111111111111111111111111' } });
    fireEvent.change(screen.getByPlaceholderText('Amount in SOL'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Send'));

    const submitButton = screen.getByText('Send');

    // Check if the button is disabled
    expect(submitButton).toBeDisabled();

    // Try to click the button anyway
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Please connect your wallet to send a tip')).toBeInTheDocument();
  });

  test('handles successful transfer', async () => {
    mockWallet.connected = true;
    mockWallet.publicKey = new PublicKey('11111111111111111111111111111111');
    mockWallet.sendTransaction = jest.fn().mockResolvedValue('testSignature');
    mockConnection.confirmTransaction.mockResolvedValue({ value: { err: null } });

    render(<TokenTransferForm />);

    fireEvent.change(screen.getByPlaceholderText('Recipient address'), { target: { value: '22222222222222222222222222222222' } });
    fireEvent.change(screen.getByPlaceholderText('Amount in SOL'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Transfer successful!',
        variant: 'default',
      });
    });
  });

  test('handles error during transfer', async () => {
    mockWallet.connected = true;
    mockWallet.publicKey = new PublicKey('11111111111111111111111111111111');
    mockWallet.sendTransaction = jest.fn().mockRejectedValue(new Error('Transaction failed'));
    mockConnection.confirmTransaction.mockResolvedValue({ value: { err: null } });

    render(<TokenTransferForm />);

    fireEvent.change(screen.getByPlaceholderText('Recipient address'), { target: { value: '22222222222222222222222222222222' } });
    fireEvent.change(screen.getByPlaceholderText('Amount in SOL'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Transfer failed: Transaction failed',
        variant: 'destructive',
      });
    });
  });
});
