import { StdFee } from "@cosmjs/amino";
import {
  ExecuteResult,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { coins, Coin, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { useEffect, useState } from "react";

export const useWallet = (
  mnemonic: string
): {
  execute: (
    contractAddress: string,
    message: Record<string, unknown>,
    price: number
  ) => Promise<ExecuteResult>;
  getBalance: (denom?: string) => Promise<Coin>;
} => {
  const [client, setClient] = useState<SigningCosmWasmClient>();
  const [address, setAddress] = useState<string>();

  useEffect(() => {
    initialize(mnemonic);
  }, [mnemonic]);

  async function initialize(mnemonic: string) {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: "juno",
    });

    const client = await SigningCosmWasmClient.connectWithSigner(
      process.env["RPC_ENDPOINT"]!,
      wallet
    );
    setClient(client);

    const [{ address }] = await wallet.getAccounts();
    setAddress(address);
  }

  async function getBalance(denom = "juno"): Promise<Coin> {
    if (!client || !address) throw new Error("Wallet not initialized");
    return client.getBalance(address, denom);
  }

  async function execute(
    contractAddress: string,
    message: Record<string, unknown>,
    price: number
  ): Promise<ExecuteResult> {
    if (!client || !address) throw new Error("Wallet not initialized");

    const coin = process.env["COIN_NAME"]!;
    const ucoin = `u${coin}`;

    const fee: StdFee = {
      amount: coins(price, ucoin),
      gas: `${price}`,
    };

    const memo = "DW: Create User";

    const cost = coins(price, ucoin);

    return client.execute(address, contractAddress, message, fee, memo, cost);
  }

  return { execute, getBalance };
};
