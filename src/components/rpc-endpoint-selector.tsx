import React from 'react';
import { useRPC } from '../contexts/useRpcEndpoint';
import { clusterApiUrl } from '@solana/web3.js';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const endpoints = [
  {
    value: "devnet",
    label: "Devnet",
  },
  {
    value: "testnet",
    label: "Testnet",
  },
  {
    value: "mainnet-beta",
    label: "Mainnet Beta",
  },
];

export default function RpcEndpointSelector() {
  const { endpoint, setEndpoint } = useRPC();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    // Set initial value based on current endpoint
    const currentEndpoint = endpoints.find(e => clusterApiUrl(e.value as any) === endpoint);
    if (currentEndpoint) {
      setValue(currentEndpoint.value);
    }
  }, [endpoint]);

  const handleSelect = (currentValue: string) => {
    setValue(currentValue);
    setOpen(false);
    if (currentValue === "custom") {
      const customEndpoint = prompt("Enter custom RPC endpoint:");
      if (customEndpoint) {
        setEndpoint(customEndpoint);
      }
    } else {
      setEndpoint(clusterApiUrl(currentValue as any));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? endpoints.find((e) => e.value === value)?.label
            : "Select RPC endpoint..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No endpoint found.</CommandEmpty>
            <CommandGroup>
              {endpoints.map((e) => (
                <CommandItem
                  key={e.value}
                  value={e.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === e.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {e.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}