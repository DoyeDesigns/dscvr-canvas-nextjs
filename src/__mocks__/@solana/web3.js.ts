export const clusterApiUrl = jest.fn();
export const Connection = jest.fn().mockImplementation(() => ({
  confirmTransaction: jest.fn().mockResolvedValue(true),
}));
export const PublicKey = jest.fn().mockImplementation((key) => ({ 
  toBase58: () => key,
  toString: () => key,
}));
export const Transaction = jest.fn().mockImplementation(() => ({
  add: jest.fn(),
}));
export const SystemProgram = {
  transfer: jest.fn(),
};
export const LAMPORTS_PER_SOL = 1000000000;