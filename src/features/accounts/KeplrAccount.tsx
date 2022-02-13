import { SlIcon } from "@shoelace-style/shoelace/dist/react";
import React, { FC, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { AccountCard } from "./AccountCard";
import { selectAccount, setKeplrAccount } from "./accountsSlice";
import styles from "./KeplrAccount.module.css";
import { useKeplr } from "./useKeplr";

export const KeplrAccount: FC = () => {
  const dispatch = useAppDispatch();
  const { connect } = useKeplr();
  const account = useAppSelector((state) => state.accounts.keplrAccount);
  const selected = useAppSelector(
    (state) =>
      state.accounts.currentAccount !== undefined &&
      state.accounts.currentAccount === account?.address
  );

  const reconnect = useCallback(() => connect(), [connect]);

  return (
    <AccountCard
      onConfigChange={account ? reconnect : undefined}
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
