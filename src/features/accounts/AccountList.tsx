import { SlCard } from "@shoelace-style/shoelace/dist/react";
import React, { FC } from "react";
import { useAppSelector } from "../../app/hooks";
import { Account } from "./accountsSlice";
import styles from "./AccountList.module.css";
import { AddAccount } from "./AddAccount";

interface AccountProps {
  account: Account;
}

export const AccountInfo: FC<AccountProps> = ({ account }) => {
  return <SlCard className={styles.address}>{account.address}</SlCard>;
};

export const AccountList: FC = () => {
  const accounts = useAppSelector((state) => state.accounts.accountList);
  return (
    <div className={styles.section}>
      <div className={styles.header}>Accounts</div>
      {accounts.map((account, idx) => (
        <AccountInfo key={idx} account={account} />
      ))}
      <AddAccount />
    </div>
  );
};
