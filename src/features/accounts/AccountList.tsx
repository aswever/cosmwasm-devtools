import React, { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  Account,
  deleteAccount,
  selectAccount,
  standardAccounts,
} from "./accountsSlice";
import styles from "./AccountList.module.css";
import { AddAccount } from "./AddAccount";
import { KeplrAccount } from "./KeplrAccount";
import { AddressBox } from "../../components/AddressBox";

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
    <AddressBox
      label={account?.label ?? account?.address}
      account={account}
      selected={selected}
      onClick={() => dispatch(selectAccount(account.address))}
      onClickX={() => dispatch(deleteAccount(account.address))}
    />
  );
};

export const AccountList: FC = () => {
  const accounts = useAppSelector(standardAccounts);
  return (
    <div className={styles.section}>
      <div className={styles.header}>Accounts</div>
      <KeplrAccount />
      {Object.values(accounts).map((account) => (
        <AccountInfo key={account.address} account={account} />
      ))}
      <AddAccount />
    </div>
  );
};
