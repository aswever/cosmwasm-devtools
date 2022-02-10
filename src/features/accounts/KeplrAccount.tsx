import { SlIcon } from "@shoelace-style/shoelace/dist/react";
import React, { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { AddressBox } from "../../components/AddressBox";
import { useKeplr } from "../../hooks/useKeplr";
import { selectAccount, setKeplrAccount } from "./accountsSlice";
import styles from "./KeplrAccount.module.css";

export const KeplrAccount: FC = () => {
  const dispatch = useAppDispatch();
  const { connect, keplr } = useKeplr();
  const account = useAppSelector((state) => state.accounts.keplrAccount);
  const selected = useAppSelector(
    (state) => state.accounts.currentAccount === account?.address
  );

  return (
    <AddressBox
      icon={<SlIcon name="wallet2" className={styles.wallet} />}
      keplr={keplr}
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
