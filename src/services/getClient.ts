import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { FaucetClient } from "@cosmjs/faucet-client";
import { DirectSecp256k1HdWallet, OfflineSigner } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { Keplr } from "@keplr-wallet/types";
import { Account, AccountType } from "../features/accounts/accountsSlice";

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

export async function getFaucet(endpoint: string): Promise<FaucetClient> {
  if (!savedFaucet) {
    savedFaucet = new FaucetClient(endpoint);
  }

  return savedFaucet;
}

export async function getClient(
  account: Account | null,
  config: (key: string) => string,
  forceRefresh = false
): Promise<ClientConnection> {
  if (
    forceRefresh ||
    !connection ||
    (account &&
      connection.clientType === ClientType.Signing &&
      connection.address !== account.address)
  ) {
    const rpcEndpoint: string = config("rpcEndpoint");

    if (account && account.type !== AccountType.Contract) {
      let signer: OfflineSigner | null = null;
      const address = account.address;
      if (account.type === AccountType.Basic) {
        const prefix: string = config("addressPrefix");
        signer = await DirectSecp256k1HdWallet.fromMnemonic(account.mnemonic, {
          prefix,
        });
      } else if (account.type === AccountType.Keplr) {
        const keplr = await getKeplr();
        const chainId: string = config("chainId");
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
              `${config("gasPrice")}${config("microDenom")}`
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
