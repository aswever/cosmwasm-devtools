import { Keplr } from "@keplr-wallet/types";
import { useCallback, useEffect, useState } from "react";
import { configService } from "../services/Config";
import { useAppDispatch } from "../app/hooks";
import { setKeplrAccount } from "../features/accounts/accountsSlice";

const CosmosCoinType = 118;
const GasPrices = {
  low: 0.01,
  average: 0.025,
  high: 0.03,
};

export function useKeplr(): {
  connect: () => Promise<void>;
  keplr: Keplr | undefined;
} {
  const dispatch = useAppDispatch();
  const [keplr, setKeplr] = useState<Keplr>();

  useEffect(() => {
    connectKeplr();
  });

  const connectKeplr = useCallback(async (): Promise<void> => {
    setKeplr(await getKeplr());
  }, [setKeplr]);

  async function getKeplr(): Promise<Keplr | undefined> {
    if (window.keplr) {
      return window.keplr;
    }

    if (document.readyState === "complete") {
      return window.keplr;
    }

    return new Promise((resolve) => {
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

  const getAccount = useCallback(async (): Promise<void> => {
    if (!keplr) return;

    const { name: label, bech32Address: address } = await keplr.getKey(
      configService.get("chainId")
    );

    dispatch(setKeplrAccount({ label, address, type: "keplr" }));
  }, [keplr, dispatch]);

  const suggestChain = useCallback(async (): Promise<void> => {
    if (!keplr) return;

    const coin: string = configService.get("coinName");
    const coinDecimals = Number.parseInt(configService.get("coinDecimals"));
    const coinGeckoId: string = configService.get("coinGeckoId");
    const chainId: string = configService.get("chainId");
    const chainName: string = configService.get("chainName");
    const rpcEndpoint: string = configService.get("rpcEndpoint");
    const restEndpoint: string = configService.get("restEndpoint");
    const coinDenom = coin.toUpperCase();
    const coinMinimalDenom = `u${coin}`;

    await keplr.experimentalSuggestChain({
      chainId,
      chainName,
      rpc: rpcEndpoint,
      rest: restEndpoint,
      bip44: {
        coinType: CosmosCoinType,
      },
      bech32Config: {
        bech32PrefixAccAddr: coin,
        bech32PrefixAccPub: `${coin}pub`,
        bech32PrefixValAddr: `${coin}valoper`,
        bech32PrefixValPub: `${coin}valoperpub`,
        bech32PrefixConsAddr: `${coin}valcons`,
        bech32PrefixConsPub: `${coin}valconspub`,
      },
      currencies: [
        {
          coinDenom,
          coinMinimalDenom,
          coinDecimals,
          coinGeckoId,
        },
      ],
      feeCurrencies: [
        {
          coinDenom,
          coinMinimalDenom,
          coinDecimals,
          coinGeckoId,
        },
      ],
      stakeCurrency: {
        coinDenom,
        coinMinimalDenom,
        coinDecimals,
        coinGeckoId,
      },
      coinType: CosmosCoinType,
      gasPriceStep: GasPrices,
    });
  }, [keplr]);

  const connect = useCallback(async (): Promise<void> => {
    await getAccount();
    await suggestChain();
  }, [getAccount, suggestChain]);

  return { connect, keplr };
}
