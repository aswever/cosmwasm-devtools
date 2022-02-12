import { SlIcon } from "@shoelace-style/shoelace/dist/react";
import React, { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { AccountCard } from "../../components/AccountCard";
import { useKeplr } from "../../hooks/useKeplr";
import { selectAccount, setKeplrAccount } from "./accountsSlice";
import styles from "./KeplrAccount.module.css";

export const KeplrAccount: FC = () => {
  const dispatch = useAppDispatch();
  const { connect } = useKeplr();
  const account = useAppSelector((state) => state.accounts.keplrAccount);
  const selected = useAppSelector(
    (state) => state.accounts.currentAccount === account?.address
  );

  return (
    <AccountCard
      onClientChange={() => connect()}
      icon={<SlIcon name="wallet2" className={styles.wallet} />}
      label={account?.label ?? "Connect wallet"}
      account={account}
      selected={selected}
      onClick={() =>
        !account ? connect() : dispatch(selectAccount(account.address))
      }
      onClickX={() => dispatch(setKeplrAccount())}
    />
  );
};
