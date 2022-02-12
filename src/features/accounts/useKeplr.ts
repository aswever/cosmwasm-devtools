import { coin } from "@cosmjs/proto-signing";
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { AccountType, setKeplrAccount } from "../accounts/accountsSlice";
import { Keplr } from "@keplr-wallet/types";

const CosmosCoinType = 118;

let savedKeplr: Keplr;

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
  if (!savedKeplr) savedKeplr = keplr;

  return keplr;
}

export function useKeplr(): {
  connect: () => Promise<void>;
} {
  const config = useAppSelector((state) => state.connection.config);
  const dispatch = useAppDispatch();

  const getAccount = useCallback(async (): Promise<void> => {
    const keplr = await getKeplr();

    const { name: label, bech32Address: address } = await keplr.getKey(
      config["chainId"]
    );

    dispatch(
      setKeplrAccount({
        label,
        address,
        type: AccountType.Keplr,
        balance: coin(0, config["microDenom"]),
      })
    );
  }, [dispatch, config]);

  useEffect(() => {
    getKeplr();
  }, []);

  const suggestChain = useCallback(async (): Promise<void> => {
    const keplr = await getKeplr();

    const coin: string = config["coinName"];
    const coinDecimals = Number.parseInt(config["coinDecimals"]);
    const coinGeckoId: string = config["coinGeckoId"];
    const chainId: string = config["chainId"];
    const chainName: string = config["chainName"];
    const rpcEndpoint: string = config["rpcEndpoint"];
    const restEndpoint: string = config["restEndpoint"];
    const gasPrice = Number.parseFloat(config["gasPrice"]);
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
      gasPriceStep: {
        low: gasPrice / 2,
        average: gasPrice,
        high: gasPrice * 2,
      },
    });
  }, [config]);

  const connect = useCallback(async (): Promise<void> => {
    await getAccount();
    await suggestChain();
  }, [getAccount, suggestChain]);

  return { connect };
}
