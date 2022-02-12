import { coin } from "@cosmjs/proto-signing";
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  AccountType,
  setKeplrAccount,
} from "../features/accounts/accountsSlice";
import { getKeplr } from "../services/getClient";

const CosmosCoinType = 118;

export function useKeplr(): {
  connect: () => Promise<void>;
} {
  const config = useAppSelector((state) => state.config.entries);
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
