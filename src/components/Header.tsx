import { SlDivider } from "@shoelace-style/shoelace/dist/react";
import React from "react";
import { useAppDispatch } from "../app/hooks";
import { AccountList } from "../features/accounts/AccountList";
import { setDonationOpen } from "../features/accounts/accountsSlice";
import { ContractList } from "../features/accounts/ContractList";
import { Connection } from "../features/connection/Connection";
import styles from "./Header.module.css";

const GITHUB_URL = "https://github.com/aswever/cosmwasm-devtools";

export const Header = () => {
  const dispatch = useAppDispatch();
  return (
    <div className={styles.header}>
      <h3 className={styles.name}>cøsmwasm devtøøls</h3>
      <div className={styles.subhead}>
        <a
          className={styles.link}
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
        >
          github
        </a>{" "}
        |{" "}
        <button
          className={styles.link}
          onClick={() => dispatch(setDonationOpen(true))}
        >
          donate
        </button>
      </div>
    </div>
  );
};
