import { SlCard, SlIcon } from "@shoelace-style/shoelace/dist/react";
import React, { FC, useCallback, useEffect, useState } from "react";
import { useAppSelector } from "../app/hooks";
import { Account, AccountType } from "../features/accounts/accountsSlice";
import { configSelector } from "../features/config/configSlice";
import { getClient, getFaucet } from "../services/getClient";
import { fromMicroCoin, fromMicroDenom } from "../util/coins";
import styles from "./AddressBox.module.css";
import { SendCoins } from "./SendCoins";

interface AddressBoxProps {
  icon?: JSX.Element;
  label: string;
  account?: Account;
  selected: boolean;
  onClick: () => void;
  onClickX: () => void;
}

export const CHECK_BALANCE_INTERVAL = 30000;

export const AddressBox: FC<AddressBoxProps> = ({
  icon,
  label,
  account,
  selected,
  onClick,
  onClickX,
}) => {
  const [balance, setBalance] = useState("");
  const [sendCoinsOpen, setSendCoinsOpen] = useState(false);
  const config = useAppSelector((state) => state.config.entries);

  const classes = [styles.addressBox];
  if (selected) {
    classes.push(styles.selected);
  }

  useEffect(() => {
    getBalance();
    const interval = setInterval(() => getBalance(), CHECK_BALANCE_INTERVAL);
    return () => clearInterval(interval);
  });

  const getBalance = useCallback(async () => {
    const denom: string = config["microDenom"];
    if (!account) return setBalance(`0${fromMicroDenom(denom)}`);
    const { client } = await getClient(account, (key) => config[key]);
    const balance = fromMicroCoin(
      await client.getBalance(account.address, denom),
      config["coinDecimals"]
    );
    setBalance(`${balance.amount}${balance.denom}`);
  }, [account, config]);

  const getCoins = useCallback(async () => {
    if (!account) throw new Error("no account selected");
    const faucet = await getFaucet(config["faucetEndpoint"]);
    faucet.credit(account.address, config["microDenom"]);
  }, [account, config]);

  return (
    <>
      <SlCard className={classes.join(" ")} onClick={onClick}>
        <div className={styles.main}>
          <div className={styles.left}>
            {icon}
            <div className={styles.label}>{label}</div>
          </div>
          {account?.type !== AccountType.Contract && selected && (
            <>
              {config["faucetEndpoint"] && (
                <SlIcon
                  name="coin"
                  className={styles.close}
                  onClick={() => getCoins()}
                />
              )}
              <SlIcon
                name="send"
                className={styles.close}
                onClick={() => setSendCoinsOpen(true)}
              />
            </>
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
      <SendCoins open={sendCoinsOpen} setOpen={setSendCoinsOpen} />
    </>
  );
};
