import { SlCard } from "@shoelace-style/shoelace/dist/react";
import React, { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Account, selectAccount } from "./accountsSlice";
import styles from "./AccountList.module.css";
import { AddAccount } from "./AddAccount";

interface AccountProps {
  account: Account;
}

export const AccountInfo: FC<AccountProps> = ({ account }) => {
  const dispatch = useAppDispatch();
  const selected = useAppSelector(
    (state) => state.accounts.currentAccount === account.address
  );

  const classes = [styles.address];
  if (selected) {
    classes.push(styles.selected);
  }
  return (
    <SlCard
      className={classes.join(" ")}
      onClick={() => dispatch(selectAccount(account.address))}
    >
      {account.address}
    </SlCard>
  );
};

export const AccountList: FC = () => {
  const accounts = useAppSelector((state) => state.accounts.accountList);
  return (
    <div className={styles.section}>
      <div className={styles.header}>Accounts</div>
      {Object.values(accounts).map((account) => (
        <AccountInfo key={account.address} account={account} />
      ))}
      <AddAccount />
    </div>
  );
};
