import React, { useState } from "react";
import CanvasClient from "@/components/canvas-client";
import { TokenTransferForm } from "../components/token-transfer-form";
import { StakingForm } from "@/components/staking-form";
import { OwnershipVerificationForm } from "@/components/ownership-verification-form";
import { AirdropClaimForm } from "@/components/airdrop-claim-form";
import { TipCreator } from "@/components/tip-creator-form";
import { Input } from "@/components/ui/input";
import CustomRpc from "@/components/custom-rpc";

export default function Home() {
  const [creatorAddress, setCreatorAddress] = useState<string>("");

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatorAddress(e.target.value);
  };

  return (
    <main className="py-5 px-5">
      <CanvasClient />
      <h1 className="font-bold text-2xl text-center">DSCVR Solana Tools Hub</h1>
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="mb-1 text-lg font-bold">Token Transfer</h2>
          <p className="mb-2">Transfer SOL tokens</p>
          <TokenTransferForm />
        </div>

        <div>
          <h2 className="mb-1 text-lg font-bold">Staking Form</h2>
          <p className="mb-2">Stake your SOL tokens for a period of time</p>
          <StakingForm />
        </div>

        <div>
          <h2 className="mb-1 text-lg font-bold">
            Digital Assets Verification Form
          </h2>
          <p className="mb-2">
            Verify digital assests on the solana blockchain
          </p>
          <OwnershipVerificationForm />
        </div>

        <div>
          <h2 className="mb-1 text-lg font-bold">Claim Airdrop</h2>
          <p className="mb-2">Connect a valid/eligible Wallet to claim your airdrop tokens</p>
          <AirdropClaimForm />
        </div>

        <div>
          <h2 className="mb-1 text-lg font-bold">Tip Creator Form</h2>
          <div>
            <p className="mb-2">Send a Tip to a Creator</p>
            <form className="w-full sm:max-w-[350px] mb-5">
              <Input
                type="text"
                id="creatorAddress"
                placeholder="Enter creator wallet address"
                value={creatorAddress}
                onChange={handleAddressChange}
                required
              />
            </form>

            <TipCreator creatorAddress={creatorAddress} />
          </div>
        </div>

        <CustomRpc />
      </div>
    </main>
  );
}
