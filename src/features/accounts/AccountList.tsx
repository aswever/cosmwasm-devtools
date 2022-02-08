import { SlCard } from "@shoelace-style/shoelace/dist/react";
import React, { FC } from "react";
import { useAppSelector } from "../../app/hooks";
import { Account } from "./accountsSlice";

interface AccountProps {
  account: Account;
}

export const AccountInfo: FC<AccountProps> = ({ account }) => {
  return (
    <SlCard>
      <div slot="header">Account</div>
      {account.address}
    </SlCard>
  );
};

export const AccountList: FC = () => {
  const accounts = useAppSelector((state) => state.accounts.accountList);
  return (
    <SlCard>
      <div slot="header">Accounts</div>
      {accounts.map((account, idx) => (
        <AccountInfo key={idx} account={account} />
      ))}
    </SlCard>
  );
};
