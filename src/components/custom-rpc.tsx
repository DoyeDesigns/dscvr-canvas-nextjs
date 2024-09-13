import React, { useState } from 'react';
import { useRPC } from '../contexts/useRpcEndpoint';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CustomRpc() {
  const { endpoint, setEndpoint } = useRPC();
  const [customEndpoint, setCustomEndpoint] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomEndpoint(e.target.value);
  };

  const changeToCustomEndpoint = () => {
    if (customEndpoint) {
      setEndpoint(customEndpoint);
    }
  };

  return (
    <div className='space-y-4 text-center mt-5'>
      <h2 className="mb-1 text-lg font-bold">Custom RPC</h2>
      <p className='italic'><span className='font-semibold'>Current endpoint:</span> {endpoint}</p>
      <Input
        type="text"
        value={customEndpoint}
        onChange={handleInputChange}
        placeholder="Enter custom RPC endpoint"
      />
      <Button onClick={changeToCustomEndpoint}>Use Custom Endpoint</Button>
    </div>
  );
}
