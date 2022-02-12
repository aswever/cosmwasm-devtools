import { SlCard, SlIcon } from "@shoelace-style/shoelace/dist/react";
import React, { FC, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  Account,
  AccountType,
  balanceString,
  checkBalance,
  hitFaucet,
  setSendCoinsOpen,
} from "../features/accounts/accountsSlice";
import styles from "./AddressBox.module.css";

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
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.config.entries);
  const balance = useAppSelector(balanceString(account?.address));

  const classes = [styles.addressBox];
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
                <SlIcon
                  name="coin"
                  className={styles.close}
                  onClick={() => dispatch(hitFaucet(account.address))}
                />
              )}
              <SlIcon
                name="send"
                className={styles.close}
                onClick={() => dispatch(setSendCoinsOpen(true))}
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
    </>
  );
};
