import { SlCard, SlIcon } from "@shoelace-style/shoelace/dist/react";
import React, { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
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

  const classes = [styles.keplr];
  if (selected) {
    classes.push(styles.selected);
  }

  return (
    <SlCard
      className={classes.join(" ")}
      onClick={() =>
        !account ? connect() : dispatch(selectAccount(account.address))
      }
    >
      <SlIcon name="wallet2" className={styles.wallet} />
      {account ? (
        <>
          {account.label}
          <SlIcon
            name="x-lg"
            className={styles.close}
            onClick={() => dispatch(setKeplrAccount())}
          />
        </>
      ) : (
        "Connect wallet"
      )}
    </SlCard>
  );
};
