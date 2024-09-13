import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OwnershipVerificationForm } from './ownership-verification-form';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import '@testing-library/jest-dom';

// Mock the useConnection and useWallet hooks
jest.mock('@solana/wallet-adapter-react', () => ({
  useConnection: jest.fn(),
  useWallet: jest.fn(),
}));

jest.mock('@metaplex-foundation/js', () => ({
  Metaplex: jest.fn().mockImplementation(() => ({
    nfts: () => ({
      findByMint: jest.fn(),
    }),
    tokens: () => ({
      findTokenAccountsByMint: jest.fn(),
    }),
  })),
}));

const mockConnection = {
  requestAirdrop: jest.fn(),
  getBalance: jest.fn(),
  confirmTransaction: jest.fn(),
};

const mockWallet = {
  publicKey: null as PublicKey | null,
  connected: false,
};

// Mock toast
const mockToast = jest.fn();
jest.mock('../hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('OwnershipVerificationForm', () => {
  let mockNftsFindByMint: jest.Mock;
  let mockTokensFindTokenAccountsByMint: jest.Mock;

  beforeEach(() => {
    (useConnection as jest.Mock).mockReturnValue({ connection: mockConnection });
    (useWallet as jest.Mock).mockReturnValue(mockWallet);

    mockNftsFindByMint = jest.fn();
    mockTokensFindTokenAccountsByMint = jest.fn();

    (Metaplex as unknown as jest.Mock).mockImplementation(() => ({
      nfts: () => ({
        findByMint: mockNftsFindByMint,
      }),
      tokens: () => ({
        findTokenAccountsByMint: mockTokensFindTokenAccountsByMint,
      }),
    }));

    mockToast.mockClear();
  });

  test('shows error when wallet is not connected', async () => {
    mockWallet.connected = false;
    
    render(<OwnershipVerificationForm />);

    const input = screen.getByPlaceholderText('NFT Address');
    const submitButton = screen.getByText('Verify Ownership');

    fireEvent.change(input, { target: { value: 'some-nft-address' } });
    
    // Check if the button is disabled
    expect(submitButton).toBeDisabled();

    // Try to click the button anyway
    fireEvent.click(submitButton);

    // Check for the error message in the UI
    expect(screen.getByText('Wallet not connected')).toBeInTheDocument();
  });

  test('shows error if NFT is not found', async () => {
    mockNftsFindByMint.mockResolvedValue(null);
    mockWallet.publicKey = { toBase58: () => 'wallet-public-key' } as PublicKey;
    mockWallet.connected = true;

    render(<OwnershipVerificationForm />);

    fireEvent.change(screen.getByPlaceholderText('NFT Address'), { target: { value: 'some-nft-address' } });
    fireEvent.click(screen.getByText('Verify Ownership'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "NFT not found",
        variant: "destructive",
      });
    });
  });

  test('shows success message if NFT ownership is verified', async () => {
    mockNftsFindByMint.mockResolvedValue({ owner: { toBase58: () => 'wallet-public-key' } });
    mockWallet.publicKey = { toBase58: () => 'wallet-public-key' } as PublicKey;
    mockWallet.connected = true;

    render(<OwnershipVerificationForm />);

    fireEvent.change(screen.getByPlaceholderText('NFT Address'), { target: { value: 'some-nft-address' } });
    fireEvent.click(screen.getByText('Verify Ownership'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "NFT ownership verified!",
        variant: "default",
      });
    });
  });

  test('shows ownership not verified message if NFT ownership is not verified', async () => {
    mockNftsFindByMint.mockResolvedValue({ owner: { toBase58: () => 'other-public-key' } });
    mockWallet.publicKey = { toBase58: () => 'wallet-public-key' } as PublicKey;
    mockWallet.connected = true;

    render(<OwnershipVerificationForm />);

    fireEvent.change(screen.getByPlaceholderText('NFT Address'), { target: { value: 'some-nft-address' } });
    fireEvent.click(screen.getByText('Verify Ownership'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Result",
        description: "NFT ownership not verified.",
        variant: "default",
      });
    });
  });

  test('shows success message for SFT ownership verification', async () => {
    mockNftsFindByMint.mockResolvedValue({});
    mockTokensFindTokenAccountsByMint.mockResolvedValue([{ owner: { toBase58: () => 'wallet-public-key' } }]);
    mockWallet.publicKey = { toBase58: () => 'wallet-public-key' } as PublicKey;
    mockWallet.connected = true;

    render(<OwnershipVerificationForm />);

    fireEvent.change(screen.getByPlaceholderText('NFT Address'), { target: { value: 'some-nft-address' } });
    fireEvent.click(screen.getByText('Verify Ownership'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: "SFT ownership verified!",
        variant: "default",
      });
    });
  });

  test('shows ownership not verified message for SFT if not owned', async () => {
    mockNftsFindByMint.mockResolvedValue({});
    mockTokensFindTokenAccountsByMint.mockResolvedValue([]);
    mockWallet.publicKey = { toBase58: () => 'wallet-public-key' } as PublicKey;
    mockWallet.connected = true;

    render(<OwnershipVerificationForm />);

    fireEvent.change(screen.getByPlaceholderText('NFT Address'), { target: { value: 'some-nft-address' } });
    fireEvent.click(screen.getByText('Verify Ownership'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Result",
        description: "SFT ownership not verified.",
        variant: "default",
      });
    });
  });

  test('handles errors correctly', async () => {
    mockNftsFindByMint.mockRejectedValue(new Error('Network error'));
    mockWallet.publicKey = { toBase58: () => 'wallet-public-key' } as PublicKey;
    mockWallet.connected = true;

    render(<OwnershipVerificationForm />);

    fireEvent.change(screen.getByPlaceholderText('NFT Address'), { target: { value: 'some-nft-address' } });
    fireEvent.click(screen.getByText('Verify Ownership'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      });
    });
  });
});
