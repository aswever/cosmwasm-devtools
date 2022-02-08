import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { configService } from "./Config";

export class Querier {
  constructor(public client: CosmWasmClient) {}

  async getContract(address: string) {
    this.client.getContract(address);
  }
}

let querier: Querier;

export async function getQuerier(): Promise<Querier> {
  if (!querier) {
    querier = new Querier(
      await CosmWasmClient.connect(configService.get("rpcEndpoint"))
    );
  }

  return querier;
}
