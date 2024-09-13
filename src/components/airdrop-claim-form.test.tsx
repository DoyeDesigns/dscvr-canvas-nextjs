import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AirdropClaimForm } from './airdrop-claim-form';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import '@testing-library/jest-dom';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

// Mock the useConnection and useWallet hooks
jest.mock('@solana/wallet-adapter-react', () => ({
  useConnection: jest.fn(),
  useWallet: jest.fn(),
}));

// Mock toast
jest.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockConnection = {
  requestAirdrop: jest.fn(),
  getBalance: jest.fn(),
  confirmTransaction: jest.fn(),
};

describe('AirdropClaimForm', () => {
  const mockWallet = {
    publicKey: null,
    connected: false,
  };

  beforeEach(() => {
    (useConnection as jest.Mock).mockReturnValue({ connection: mockConnection });
    (useWallet as jest.Mock).mockReturnValue(mockWallet);
    jest.clearAllMocks();
  });

  test('shows error when wallet is not connected', async () => {
    render(<AirdropClaimForm />);

    fireEvent.click(screen.getByText('Claim Airdrop'));

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText('Wallet not connected')).toBeInTheDocument(); // Updated error message
    });
  });

  test('fetches and displays balance when the wallet is connected', async () => {
    const mockPublicKey = 'mock-public-key';
    const updatedMockWallet = {
      publicKey: mockPublicKey,
      connected: true,
    };
    (useWallet as jest.Mock).mockReturnValue(updatedMockWallet);
    mockConnection.getBalance.mockResolvedValue(LAMPORTS_PER_SOL * 2); // 2 SOL in lamports

    render(<AirdropClaimForm />);

    await waitFor(() => {
      expect(mockConnection.getBalance).toHaveBeenCalledWith(mockPublicKey);
      expect(screen.getByText('Balance: 2.00 SOL')).toBeInTheDocument();
    });
  });

  test('displays loading state when claiming airdrop and updates balance on success', async () => {
    const mockPublicKey = 'mock-public-key';
    const updatedMockWallet = {
      publicKey: mockPublicKey,
      connected: true,
    };
    (useWallet as jest.Mock).mockReturnValue(updatedMockWallet);

    const mockSignature = 'mock-signature';
    mockConnection.requestAirdrop.mockResolvedValue(mockSignature);
    mockConnection.confirmTransaction.mockResolvedValue(null);
    mockConnection.getBalance.mockResolvedValueOnce(LAMPORTS_PER_SOL * 2); // Initial balance
    mockConnection.getBalance.mockResolvedValueOnce(LAMPORTS_PER_SOL * 3); // Updated balance after airdrop

    render(<AirdropClaimForm />);

    fireEvent.click(screen.getByText('Claim Airdrop'));

    // Check that the button is disabled and shows loading state
    expect(screen.getByText('Claiming...')).toBeDisabled();

    await waitFor(() => {
      expect(mockConnection.requestAirdrop).toHaveBeenCalledWith(mockPublicKey, LAMPORTS_PER_SOL);
      expect(mockConnection.confirmTransaction).toHaveBeenCalledWith(mockSignature);
      expect(screen.getByText('Balance: 3.00 SOL')).toBeInTheDocument();
    });
  });

  test('displays error toast when airdrop fails', async () => {
    const mockPublicKey = 'mock-public-key';
    const updatedMockWallet = {
      publicKey: mockPublicKey,
      connected: true,
    };
    (useWallet as jest.Mock).mockReturnValue(updatedMockWallet);

    const errorMessage = 'Airdrop failed';
    mockConnection.requestAirdrop.mockRejectedValue(new Error(errorMessage));

    render(<AirdropClaimForm />);

    fireEvent.click(screen.getByText('Claim Airdrop'));

    await waitFor(() => {
      expect(mockConnection.requestAirdrop).toHaveBeenCalledWith(mockPublicKey, LAMPORTS_PER_SOL);
      expect(screen.getByText('Claim Airdrop')).not.toBeDisabled();
    });
  });

  test('disables the button while claiming airdrop', async () => {
    const mockPublicKey = 'mock-public-key';
    const updatedMockWallet = {
      publicKey: mockPublicKey,
      connected: true,
    };
    (useWallet as jest.Mock).mockReturnValue(updatedMockWallet);

    mockConnection.requestAirdrop.mockResolvedValue('mock-signature');
    mockConnection.confirmTransaction.mockResolvedValue(null);

    render(<AirdropClaimForm />);

    fireEvent.click(screen.getByText('Claim Airdrop'));

    expect(screen.getByText('Claiming...')).toBeDisabled();
    
    await waitFor(() => {
      expect(mockConnection.requestAirdrop).toHaveBeenCalled();
    });
  });
});
