import { SlCard, SlIcon, SlTooltip } from "@shoelace-style/shoelace/dist/react";
import React, { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  Account,
  AccountType,
  balanceString,
  checkBalance,
  hitFaucet,
  setSendCoinsOpen,
} from "../features/accounts/accountsSlice";
import styles from "./AccountCard.module.css";

interface AccountCardProps {
  icon?: JSX.Element;
  label: string;
  account?: Account;
  selected: boolean;
  onClick: () => void;
  onClickX: () => void;
  onClientChange?: () => void;
}

export const CHECK_BALANCE_INTERVAL = 30000;

export const AccountCard: FC<AccountCardProps> = ({
  icon,
  label,
  account,
  selected,
  onClick,
  onClickX,
  onClientChange,
}) => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.connection.config);
  const balance = useAppSelector(balanceString(account?.address));
  const [copyTooltip, setCopyTooltip] = useState("Copy to clipboard");

  const classes = [styles.accountCard];
  if (selected) {
    classes.push(styles.selected);
  }

  useEffect(() => {
    if (account?.address) {
      dispatch(checkBalance(account.address));
      const interval = setInterval(
        () => dispatch(checkBalance(account.address)),
        CHECK_BALANCE_INTERVAL
      );
      return () => clearInterval(interval);
    }
  }, [account?.address, dispatch]);

  function copyAddress() {
    if (account?.address) navigator.clipboard.writeText(account.address);
    setCopyTooltip("Copied!");
    setTimeout(() => setCopyTooltip("Copy to clipboard"), 2000);
  }

  return (
    <>
      <SlCard className={classes.join(" ")} onClick={onClick}>
        <div className={styles.main}>
          <div className={styles.left}>
            {icon}
            <div className={styles.label}>{label}</div>
          </div>
          {account && account.type !== AccountType.Contract && selected && (
            <>
              {config["faucetEndpoint"] && (
                <SlTooltip content="Hit faucet">
                  <SlIcon
                    name="coin"
                    className={styles.close}
                    onClick={() => dispatch(hitFaucet(account.address))}
                  />
                </SlTooltip>
              )}
              <SlTooltip content="Send coins">
                <SlIcon
                  name="send"
                  className={styles.close}
                  onClick={() => dispatch(setSendCoinsOpen(true))}
                />
              </SlTooltip>
            </>
          )}
          {account && (
            <SlTooltip
              placement="top"
              hoist={true}
              content={
                account.type === AccountType.Keplr
                  ? "Disconnect wallet"
                  : "Remove account"
              }
            >
              <SlIcon name="x-lg" className={styles.close} onClick={onClickX} />
            </SlTooltip>
          )}
        </div>
        {account && selected && (
          <div className={styles.details}>
            <SlTooltip content={copyTooltip} placement="bottom">
              <div className={styles.address} onClick={() => copyAddress()}>
                {account.address}
              </div>
            </SlTooltip>
            <div className={styles.balance}>{balance}</div>
          </div>
        )}
      </SlCard>
    </>
  );
};
