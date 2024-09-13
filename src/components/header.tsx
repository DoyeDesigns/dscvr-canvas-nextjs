import React from 'react';
import { WalletConnectButton } from "@/components/wallet-connect-button";
import RpcEndpointSelector from "@/components/rpc-endpoint-selector";

export default function Header() {
  return (
    <div className='flex py-3 px-5 justify-between items-center gap-5'>
        <WalletConnectButton />
        <RpcEndpointSelector />
    </div>
  )
}
