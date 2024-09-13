import React, { useState } from 'react';
import { TipCreator as TipCreatorForm } from '@/components/tip-creator-form';

export default function TipCreator() {
  const [creatorAddress, setCreatorAddress] = useState<string>('');

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatorAddress(e.target.value);
  };

  return (
    <div>
      <h1>Send Tip to Creator</h1>
      <form>
        <label htmlFor="creatorAddress">Creator Wallet Address:</label>
        <input
          type="text"
          id="creatorAddress"
          placeholder="Enter creator wallet address"
          value={creatorAddress}
          onChange={handleAddressChange}
          required
        />
      </form>

      <TipCreatorForm creatorAddress={creatorAddress} />
    </div>
  );
}
