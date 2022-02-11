import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { FaucetClient } from "@cosmjs/faucet-client";
import { DirectSecp256k1HdWallet, OfflineSigner } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { Keplr } from "@keplr-wallet/types";
import { Account, AccountType } from "../features/accounts/accountsSlice";
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
let savedKeplr: Keplr;
let savedFaucet: FaucetClient;

export async function getKeplr(): Promise<Keplr> {
  let keplr: Keplr | undefined;
  if (savedKeplr) {
    keplr = savedKeplr;
  } else if (window.keplr) {
    keplr = window.keplr;
  } else if (document.readyState === "complete") {
    keplr = window.keplr;
  } else {
    keplr = await new Promise((resolve) => {
      const documentStateChange = (event: Event) => {
        if (
          event.target &&
          (event.target as Document).readyState === "complete"
        ) {
          resolve(window.keplr);
          document.removeEventListener("readystatechange", documentStateChange);
        }
      };

      document.addEventListener("readystatechange", documentStateChange);
    });
  }

  if (!keplr) throw new Error("Keplr not found");
  savedKeplr = keplr;
  return keplr;
}

export async function getFaucet(): Promise<FaucetClient> {
  if (!savedFaucet) {
    savedFaucet = new FaucetClient(configService.get("faucetEndpoint"));
  }

  return savedFaucet;
}

export async function getClient(account?: Account): Promise<ClientConnection> {
  if (
    !connection ||
    (account &&
      connection.clientType === ClientType.Signing &&
      connection.address !== account.address)
  ) {
    const rpcEndpoint: string = configService.get("rpcEndpoint");

    if (account && account.type !== AccountType.Contract) {
      let signer: OfflineSigner | null = null;
      const address = account.address;
      if (account.type === AccountType.Basic) {
        const prefix: string = configService.get("addressPrefix");
        signer = await DirectSecp256k1HdWallet.fromMnemonic(account.mnemonic, {
          prefix,
        });
      } else if (account.type === AccountType.Keplr) {
        const keplr = await getKeplr();
        const chainId: string = configService.get("chainId");
        await keplr.enable(chainId);
        signer = keplr.getOfflineSigner(chainId);
      }

      if (!signer) {
        console.error({ account });
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
