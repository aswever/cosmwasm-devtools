import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet, OfflineSigner } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { Account, AccountType } from "../accounts/accountsSlice";
import { getKeplr } from "../accounts/useKeplr";

interface ClientConnection {
  client: CosmWasmClient;
  rpcEndpoint: string;
}

interface SigningClientConnection extends ClientConnection {
  client: SigningCosmWasmClient;
  address: string;
}

class ConnectionManager {
  private queryingClientConnection: ClientConnection | undefined;
  private signingClientConnections: { [key: string]: SigningClientConnection } =
    {};

  getQueryClient = async (
    config: {
      [key: string]: string;
    },
    forceRefresh = false
  ): Promise<CosmWasmClient> => {
    const rpcEndpoint: string = config["rpcEndpoint"];
    if (
      this.queryingClientConnection === undefined ||
      this.queryingClientConnection.rpcEndpoint !== rpcEndpoint ||
      forceRefresh
    ) {
      this.queryingClientConnection = {
        client: await CosmWasmClient.connect(rpcEndpoint),
        rpcEndpoint,
      };
    }

    return this.queryingClientConnection.client;
  };

  getSigningClient = async (
    account: Account,
    config: { [key: string]: string }
  ): Promise<SigningCosmWasmClient> => {
    const rpcEndpoint: string = config["rpcEndpoint"];
    const { address } = account;
    if (
      this.signingClientConnections[address] === undefined ||
      this.signingClientConnections[address].rpcEndpoint !== rpcEndpoint
    ) {
      let signer: OfflineSigner;
      if (account.type === AccountType.Basic) {
        const prefix: string = config["addressPrefix"];
        signer = await DirectSecp256k1HdWallet.fromMnemonic(account.mnemonic, {
          prefix,
        });
      } else if (account.type === AccountType.Keplr) {
        const keplr = await getKeplr();
        const chainId: string = config["chainId"];
        await keplr.enable(chainId);
        signer = keplr.getOfflineSigner(chainId);
      } else {
        throw new Error("Invalid account type");
      }
      this.signingClientConnections[address] = {
        client: await SigningCosmWasmClient.connectWithSigner(
          rpcEndpoint,
          signer,
          {
            gasPrice: GasPrice.fromString(
              `${config["gasPrice"]}${config["microDenom"]}`
            ),
          }
        ),
        address,
        rpcEndpoint,
      };
    }
    return this.signingClientConnections[address].client;
  };
}

export default new ConnectionManager();
