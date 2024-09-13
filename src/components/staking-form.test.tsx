import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StakingForm } from './staking-form';
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

describe('StakingForm', () => {
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
    render(<StakingForm />);
    expect(screen.getByPlaceholderText('Enter Staking Program ID')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amount to stake')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Staking period in days')).toBeInTheDocument();
    expect(screen.getByText('Stake')).toBeInTheDocument();
  });

  test('shows error when wallet is not connected', async () => {
    mockWallet.connected = false;

    render(<StakingForm />);

    const submitButton = screen.getByText('Stake');
    // Check if the button is disabled
    expect(submitButton).toBeDisabled();

    // Try to click the button anyway
    fireEvent.click(submitButton);

    // Check for the error message in the UI
    expect(screen.getByText('Wallet not connected')).toBeInTheDocument();
  });

  test('shows error if wallet does not support signing', async () => {
    mockWallet.connected = true;
    mockWallet.publicKey = new PublicKey('11111111111111111111111111111111');
    mockWallet.signTransaction = null;

    render(<StakingForm />);

    const submitButton = screen.getByText('Stake');
    fireEvent.click(submitButton);
  });

  test('handles staking successfully', async () => {
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

    render(<StakingForm />);

    fireEvent.change(screen.getByPlaceholderText('Enter Staking Program ID'), { target: { value: 'mocked-program-id' } });
    fireEvent.change(screen.getByPlaceholderText('Amount to stake'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('Staking period in days'), { target: { value: '30' } });
    fireEvent.click(screen.getByText('Stake'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Transaction confirmed',
        variant: 'default',
      });
    });
  });
});
