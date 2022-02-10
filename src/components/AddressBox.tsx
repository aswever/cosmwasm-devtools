import { Keplr } from "@keplr-wallet/types";
import { SlCard, SlIcon } from "@shoelace-style/shoelace/dist/react";
import React, { FC, useCallback, useEffect, useState } from "react";
import { Account, AccountType } from "../features/accounts/accountsSlice";
import { configService } from "../services/Config";
import { getClient } from "../services/getClient";
import { fromMicroCoin, fromMicroDenom } from "../util/coins";
import styles from "./AddressBox.module.css";

interface AddressBoxProps {
  icon?: JSX.Element;
  label: string;
  account?: Account;
  keplr?: Keplr;
  selected: boolean;
  onClick: () => void;
  onClickX: () => void;
}

export const AddressBox: FC<AddressBoxProps> = ({
  icon,
  label,
  account,
  keplr,
  selected,
  onClick,
  onClickX,
}) => {
  const [balance, setBalance] = useState("");

  const classes = [styles.addressBox];
  if (selected) {
    classes.push(styles.selected);
  }

  const getBalance = useCallback(async () => {
    const denom: string = configService.get("defaultDenom");
    if (!account) return setBalance(`0${fromMicroDenom(denom)}`);
    const { client } = await getClient(account, keplr);
    const balance = fromMicroCoin(
      await client.getBalance(account.address, denom)
    );
    setBalance(`${balance.amount}${balance.denom}`);
  }, [account, keplr]);

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  return (
    <SlCard className={classes.join(" ")} onClick={onClick}>
      <div className={styles.main}>
        <div className={styles.left}>
          {icon}
          <div className={styles.label}>{label}</div>
        </div>
        {account?.type !== AccountType.Contract && selected && (
          <SlIcon name="send" className={styles.close} onClick={onClickX} />
        )}
        {account && (
          <SlIcon name="x-lg" className={styles.close} onClick={onClickX} />
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
