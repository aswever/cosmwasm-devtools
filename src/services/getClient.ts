import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet, OfflineSigner } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { Keplr } from "@keplr-wallet/types";
import { Account } from "../features/accounts/accountsSlice";
import { configService } from "./Config";

let connection: { client: SigningCosmWasmClient; address: string };

export async function getClient(
  account: Account,
  keplr?: Keplr
): Promise<SigningCosmWasmClient> {
  if (!connection || connection.address !== account.address) {
    let signer: OfflineSigner | null = null;
    const address = account.address;
    const rpcEndpoint: string = configService.get("rpcEndpoint");

    if (account.type === "standard") {
      const prefix: string = configService.get("addressPrefix");
      signer = await DirectSecp256k1HdWallet.fromMnemonic(account.mnemonic, {
        prefix,
      });
    } else if (account.type === "keplr" && keplr) {
      const chainId: string = configService.get("chainId");
      await keplr.enable(chainId);
      signer = keplr.getOfflineSigner(chainId);
    }

    if (!signer) {
      throw new Error("Failed to get client from account");
    }

    connection = {
      address,
      client: await SigningCosmWasmClient.connectWithSigner(
        rpcEndpoint,
        signer,
        {
          gasPrice: GasPrice.fromString(
            `${configService.get("defaultGas")}${configService.get(
              "defaultDenom"
            )}`
          ),
        }
      ),
    };
  }

  return connection.client;
}
