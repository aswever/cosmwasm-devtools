import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet, OfflineSigner } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { Keplr } from "@keplr-wallet/types";
import { Account } from "../features/accounts/accountsSlice";
import { configService } from "./Config";

export enum ClientType {
  Querying,
  Signing,
}

interface BaseClientConnection {
  clientType: ClientType;
  client: CosmWasmClient;
}

interface QueryingClientConnection extends BaseClientConnection {
  clientType: ClientType.Querying;
  client: CosmWasmClient;
}

interface SigningClientConnection extends BaseClientConnection {
  clientType: ClientType.Signing;
  client: SigningCosmWasmClient;
  address: string;
}

export type ClientConnection =
  | QueryingClientConnection
  | SigningClientConnection;

let connection: ClientConnection;

export async function getClient(
  account?: Account,
  keplr?: Keplr
): Promise<ClientConnection> {
  if (
    !connection ||
    (account &&
      connection.clientType === ClientType.Signing &&
      connection.address !== account.address)
  ) {
    const rpcEndpoint: string = configService.get("rpcEndpoint");

    if (account) {
      let signer: OfflineSigner | null = null;
      const address = account.address;
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
        clientType: ClientType.Signing,
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
    } else {
      connection = {
        clientType: ClientType.Querying,
        client: await CosmWasmClient.connect(rpcEndpoint),
      };
    }
  }

  return connection;
}
