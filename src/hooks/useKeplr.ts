import { useCallback } from "react";
import { configService } from "../services/Config";
import { useAppDispatch } from "../app/hooks";
import {
  AccountType,
  setKeplrAccount,
} from "../features/accounts/accountsSlice";
import { getKeplr } from "../services/getClient";

const CosmosCoinType = 118;

export function useKeplr(): {
  connect: () => Promise<void>;
} {
  const dispatch = useAppDispatch();

  const getAccount = useCallback(async (): Promise<void> => {
    const keplr = await getKeplr();

    const { name: label, bech32Address: address } = await keplr.getKey(
      configService.get("chainId")
    );

    dispatch(setKeplrAccount({ label, address, type: AccountType.Keplr }));
  }, [dispatch]);

  const suggestChain = useCallback(async (): Promise<void> => {
    const keplr = await getKeplr();

    const coin: string = configService.get("coinName");
    const coinDecimals = Number.parseInt(configService.get("coinDecimals"));
    const coinGeckoId: string = configService.get("coinGeckoId");
    const chainId: string = configService.get("chainId");
    const chainName: string = configService.get("chainName");
    const rpcEndpoint: string = configService.get("rpcEndpoint");
    const restEndpoint: string = configService.get("restEndpoint");
    const gasPrice = Number.parseFloat(configService.get("gasPrice"));
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
      gasPriceStep: {
        low: gasPrice / 2,
        average: gasPrice,
        high: gasPrice * 2,
      },
    });
  }, []);

  const connect = useCallback(async (): Promise<void> => {
    await getAccount();
    await suggestChain();
  }, [getAccount, suggestChain]);

  return { connect };
}
