import { Coin } from "@cosmjs/proto-signing";
import { configService } from "../services/Config";

export function fromMicroCoin(coin: Coin): Coin {
  const coinDecimals = Number.parseInt(configService.get("coinDecimals"));
  return {
    amount: String(Number.parseInt(coin.amount) / Math.pow(10, coinDecimals)),
    denom: fromMicroDenom(coin.denom),
  };
}

export function fromMicroDenom(udenom: string): string {
  return udenom.replace("u", "");
}

export function toMicroDenom(denom: string): string {
  return `u${denom}`;
}
