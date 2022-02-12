import { SlCard, SlIcon } from "@shoelace-style/shoelace/dist/react";
import React, { FC, useEffect } from "react";
import styles from "./Connection.module.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  checkConnection,
  ConnectionState,
  setConfigModalOpen,
} from "./configSlice";

export const Connection: FC = () => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.config.entries);
  const connection = useAppSelector((state) => state.config.connection);
  const chainName: string = config["chainName"];

  useEffect(() => {
    dispatch(checkConnection());
  }, [dispatch]);

  return (
    <SlCard className={styles.adder}>
      <SlIcon
        name={
          connection === ConnectionState.Connected
            ? "lightning-charge"
            : connection === ConnectionState.Error
            ? "exclamation-octagon"
            : "asterisk"
        }
        className={styles.connection}
      />
      <div className={styles.chainName}>{chainName}</div>
      <SlIcon
        name="gear"
        className={styles.settings}
        onClick={() => dispatch(setConfigModalOpen(true))}
      />
    </SlCard>
  );
};
