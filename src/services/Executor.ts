import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { configService } from "./Config";

export class Executor {
  constructor(public client: SigningCosmWasmClient) {}
}

let executor: Executor;

export async function getExecutor(mnemonic: string): Promise<Executor> {
  if (!executor) {
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: configService.get("addressPrefix"),
    });
    console.log(signer);
    executor = new Executor(
      await SigningCosmWasmClient.connectWithSigner(
        configService.get("rpcEndpoint"),
        signer,
        {
          gasPrice: GasPrice.fromString(
            `${configService.get("defaultGas")}${configService.get(
              "defaultDenom"
            )}`
          ),
        }
      )
    );
  }

  return executor;
}
