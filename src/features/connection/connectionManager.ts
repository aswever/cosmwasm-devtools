import {
    SigningCosmWasmClient,
    setupWasmExtension,
    WasmExtension,
} from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet, OfflineSigner } from "@cosmjs/proto-signing";
import {
    GasPrice,
    QueryClient,
    createProtobufRpcClient,
} from "@cosmjs/stargate";
import { Tendermint34Client, HttpBatchClient } from "@cosmjs/tendermint-rpc";
import { Account, AccountType } from "../accounts/accountsSlice";
import { getKeplr } from "../accounts/useKeplr";

import { QueryClientImpl as BankQueryClientImpl } from "cosmjs-types/cosmos/bank/v1beta1/query";

interface ClientConnection {
    client?: QueryClient & WasmExtension;
    bankQueryService?: BankQueryClientImpl;
    rpcEndpoint: string;
}

interface SigningClientConnection extends ClientConnection {
    signingClient: SigningCosmWasmClient;
    address: string;
}

class ConnectionManager {
    private queryingClientConnection: ClientConnection | undefined;
    private signingClientConnections: {
        [key: string]: SigningClientConnection;
    } = {};

    getQueryClient = async (
        config: {
            [key: string]: string;
        },
        forceRefresh = false
    ): Promise<ClientConnection | undefined> => {
        const rpcEndpoint: string = config["rpcEndpoint"];
        if (
            this.queryingClientConnection === undefined ||
            this.queryingClientConnection.rpcEndpoint !== rpcEndpoint ||
            forceRefresh
        ) {
            const httpClient = new HttpBatchClient(rpcEndpoint);

            const client = await Tendermint34Client.create(httpClient).then(
                (res) => {
                    const queryClient = QueryClient.withExtensions(
                        res,
                        setupWasmExtension
                    );

                    return queryClient;
                }
            );

            const rpcClient = createProtobufRpcClient(client);

            this.queryingClientConnection = {
                client,
                rpcEndpoint,
                bankQueryService: new BankQueryClientImpl(rpcClient),
            };
        }

        return this.queryingClientConnection;
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
                signer = await DirectSecp256k1HdWallet.fromMnemonic(
                    account.mnemonic,
                    {
                        prefix,
                    }
                );
            } else if (account.type === AccountType.Keplr) {
                const keplr = await getKeplr();
                const chainId: string = config["chainId"];
                await keplr.enable(chainId);
                signer = keplr.getOfflineSigner(chainId);
            } else {
                throw new Error("Invalid account type");
            }
            this.signingClientConnections[address] = {
                signingClient: await SigningCosmWasmClient.connectWithSigner(
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
        return this.signingClientConnections[address].signingClient;
    };
}

export default new ConnectionManager();
