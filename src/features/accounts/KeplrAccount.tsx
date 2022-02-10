import { SlCard, SlIcon } from "@shoelace-style/shoelace/dist/react";
import React, { FC, useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useKeplr } from "../../hooks/useKeplr";
import { configService } from "../../services/Config";
import { getClient } from "../../services/getClient";
import { fromMicroCoin } from "../../util/coins";
import { selectAccount, setKeplrAccount } from "./accountsSlice";
import styles from "./KeplrAccount.module.css";

export const KeplrAccount: FC = () => {
  const dispatch = useAppDispatch();
  const { connect, keplr } = useKeplr();
  const account = useAppSelector((state) => state.accounts.keplrAccount);
  const [balance, setBalance] = useState("");

  const selected = useAppSelector(
    (state) => state.accounts.currentAccount === account?.address
  );

  const classes = [styles.keplr];
  if (selected) {
    classes.push(styles.selected);
  }

  const getBalance = useCallback(async () => {
    const denom: string = configService.get("defaultDenom");
    if (!account || !keplr) return `0${denom}`;
    const client = await getClient(account, keplr);
    const balance = fromMicroCoin(
      await client.getBalance(account.address, denom)
    );
    setBalance(`${balance.amount}${balance.denom}`);
  }, [account, keplr]);

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  return (
    <SlCard
      className={classes.join(" ")}
      onClick={() =>
        !account ? connect() : dispatch(selectAccount(account.address))
      }
    >
      <div className={styles.main}>
        <div className={styles.left}>
          <SlIcon name="wallet2" className={styles.wallet} />
          {account ? (
            <div className={styles.label}>{account.label}</div>
          ) : (
            "Connect wallet"
          )}
        </div>
        {account && (
          <SlIcon
            name="x-lg"
            className={styles.close}
            onClick={() => dispatch(setKeplrAccount())}
          />
        )}
      </div>
      {account && selected && (
        <div className={styles.details}>
          <div className={styles.address}>{account.address}</div>
          <div className={styles.balance}>{balance}</div>
        </div>
      )}
    </SlCard>
  );
};
