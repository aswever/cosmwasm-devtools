import { Coin } from "@cosmjs/proto-signing";

export function fromMicroCoin(coin: Coin, coinDecimals: string): Coin {
  return {
    amount: fromMicroAmount(coin.amount, coinDecimals),
    denom: fromMicroDenom(coin.denom),
  };
}

export function toMicroCoin(coin: Coin, coinDecimals: string): Coin {
  return {
    amount: toMicroAmount(coin.amount, coinDecimals),
    denom: toMicroDenom(coin.denom),
  };
}

export function toMicroAmount(amount: string, coinDecimals: string) {
  return String(
    Number.parseFloat(amount) * Math.pow(10, Number.parseInt(coinDecimals))
  );
}

export function fromMicroAmount(amount: string, coinDecimals: string) {
  return String(
    Number.parseInt(amount) / Math.pow(10, Number.parseInt(coinDecimals))
  );
}

export function fromMicroDenom(udenom: string): string {
  return udenom.replace("u", "");
}

export function toMicroDenom(denom: string): string {
  return `u${denom}`;
}
